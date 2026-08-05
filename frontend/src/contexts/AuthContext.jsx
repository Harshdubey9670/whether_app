import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { login as loginApi, register as registerApi, logout as logoutApi, getProfile } from '../services/api';
import RecoveryService from '../services/RecoveryService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Persist user in localStorage so refresh doesn't log them out initially, but we'll verify it
    try {
      const stored = localStorage.getItem('wv_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Keep user in sync with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('wv_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wv_user');
    }
  }, [user]);

  // Check auth session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        // Only clear user if the error is a 401 Unauthorized or similar,
        // otherwise they might just be offline.
        if (err.response?.status === 401 || err.response?.status === 404) {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await loginApi(credentials);
      setUser(data);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials) => {
    setLoading(true);
    try {
      const data = await registerApi(credentials);
      setUser(data);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (_) {
      // ignore errors on logout
    }
    setUser(null);
  };

  const devLoginRecovery = async (email) => {
    setLoading(true);
    try {
      const data = await RecoveryService.devLoginRecovery(email);
      setUser(data);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Recovery failed' };
    } finally {
      setLoading(false);
    }
  };

  const forcePasswordChange = async (password) => {
    setLoading(true);
    try {
      const data = await RecoveryService.forcePasswordChange(password);
      setUser(data);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Password update failed' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, devLoginRecovery, forcePasswordChange }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

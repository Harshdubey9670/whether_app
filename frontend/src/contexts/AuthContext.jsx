import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { login as loginApi, register as registerApi, logout as logoutApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Persist user in localStorage so refresh doesn't log them out
    try {
      const stored = localStorage.getItem('wv_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Keep user in sync with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('wv_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('wv_user');
    }
  }, [user]);

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

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

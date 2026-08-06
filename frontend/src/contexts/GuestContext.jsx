import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
  const [isGuest, setIsGuest] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  // Attempt to load existing guest session
  useEffect(() => {
    const stored = localStorage.getItem('wv_guest');
    if (stored) {
      setIsGuest(true);
    }
  }, []);

  const continueAsGuest = async () => {
    setGuestLoading(true);
    try {
      const { data } = await api.post('/auth/guest');
      localStorage.setItem('wv_guest', JSON.stringify(data));
      setIsGuest(true);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Guest login failed' };
    } finally {
      setGuestLoading(false);
    }
  };

  const clearGuestSession = () => {
    localStorage.removeItem('wv_guest');
    setIsGuest(false);
  };

  return (
    <GuestContext.Provider value={{ isGuest, guestLoading, continueAsGuest, clearGuestSession }}>
      {children}
    </GuestContext.Provider>
  );
};

export const useGuest = () => useContext(GuestContext);

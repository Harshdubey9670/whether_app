import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { updateProfile } from '../services/api';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Default to metric, checking localStorage first
  const [units, setUnitsState] = useState(() => {
    const saved = localStorage.getItem('weatherverse_units');
    return saved || 'metric';
  });

  // Sync from user profile when logged in
  useEffect(() => {
    if (user?.preferences?.units) {
      setUnitsState(user.preferences.units);
      localStorage.setItem('weatherverse_units', user.preferences.units);
    }
  }, [user]);

  const setUnits = async (newUnits) => {
    setUnitsState(newUnits);
    localStorage.setItem('weatherverse_units', newUnits);
    
    // Sync to backend if logged in
    if (user) {
      try {
        await updateProfile({ preferences: { units: newUnits } });
      } catch (error) {
        console.error('Failed to sync settings to profile:', error);
      }
    }
  };

  const convertTemp = (tempC) => {
    if (units === 'imperial') {
      return Math.round((tempC * 9/5) + 32);
    }
    return tempC;
  };

  const convertWind = (speedKph) => {
    if (units === 'imperial') {
      return Math.round(speedKph / 1.609);
    }
    return speedKph;
  };

  const tempUnit = units === 'imperial' ? '°F' : '°C';
  const windUnit = units === 'imperial' ? 'mph' : 'km/h';

  return (
    <SettingsContext.Provider value={{ 
      units, 
      setUnits, 
      convertTemp, 
      convertWind,
      tempUnit,
      windUnit
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

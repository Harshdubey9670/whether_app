import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LocationContext = createContext(null);

export const LocationProvider = ({ children }) => {
  const [coords, setCoords] = useState(null);         // { lat, lng }
  const [locationName, setLocationName] = useState(''); // e.g. "Mumbai"
  const [locationQuery, setLocationQuery] = useState('New York'); // query string for API
  const [permissionStatus, setPermissionStatus] = useState('idle'); // idle | requesting | granted | denied
  const [error, setError] = useState(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setPermissionStatus('denied');
      return;
    }

    setPermissionStatus('requesting');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setLocationQuery(`${latitude},${longitude}`);
        setPermissionStatus('granted');
      },
      (err) => {
        console.warn('Location error:', err.message);
        setError(err.message);
        setPermissionStatus('denied');
        // Fall back to New York if permission denied
        setLocationQuery('New York');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Auto-request on app load
  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <LocationContext.Provider value={{
      coords,
      locationName,
      setLocationName,
      locationQuery,
      setLocationQuery,
      permissionStatus,
      error,
      requestLocation,
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
};

export default LocationContext;

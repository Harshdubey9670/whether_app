import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Thermometer, Droplets, Wind, Cloud, Navigation, Loader2, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation as useAppLocation } from '../contexts/LocationContext';
import { getCurrentWeather } from '../services/api';

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Pulsing blue dot for user's location
const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(14,165,233,0.3);animation:pulse-ring 1.5s ease-out infinite;"></div>
      <div style="position:absolute;width:14px;height:14px;border-radius:50%;background:#0ea5e9;border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>
    </div>
    <style>@keyframes pulse-ring{0%{transform:scale(0.5);opacity:1;}100%{transform:scale(2.2);opacity:0;}}</style>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Fly map to new center
const MapFlyTo = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.8, easeLinearity: 0.25 });
  }, [center[0], center[1]]);
  return null;
};

const OWM_KEY = import.meta.env.VITE_OWM_KEY || '';

const LAYERS = [
  {
    id: 'temp_new',
    label: 'Temperature',
    icon: <Thermometer className="w-4 h-4" />,
    emoji: '🌡️',
    color: 'from-blue-400 to-red-500',
    description: 'Surface air temperature',
  },
  {
    id: 'precipitation_new',
    label: 'Precipitation',
    icon: <Droplets className="w-4 h-4" />,
    emoji: '🌧️',
    color: 'from-sky-300 to-blue-700',
    description: 'Rainfall intensity',
  },
  {
    id: 'wind_new',
    label: 'Wind Speed',
    icon: <Wind className="w-4 h-4" />,
    emoji: '💨',
    color: 'from-green-300 to-teal-600',
    description: 'Wind speed at 10m',
  },
  {
    id: 'clouds_new',
    label: 'Cloud Cover',
    icon: <Cloud className="w-4 h-4" />,
    emoji: '☁️',
    color: 'from-slate-300 to-slate-600',
    description: 'Cloud coverage',
  },
];

const LiveMap = () => {
  const { coords, locationQuery, permissionStatus, requestLocation } = useAppLocation();
  const [activeLayerId, setActiveLayerId] = useState('temp_new');
  const [layerKey, setLayerKey] = useState(0); // force remount tile layer on switch
  const isLocating = permissionStatus === 'requesting';

  const mapCenter = coords ? [coords.lat, coords.lng] : [20.5937, 78.9629]; // Default: India center
  const mapZoom = coords ? 10 : 5;

  const { data: weatherData, isLoading } = useQuery({
    queryKey: ['weather', locationQuery],
    queryFn: () => getCurrentWeather(locationQuery),
    staleTime: 5 * 60 * 1000,
    enabled: !!locationQuery,
  });

  const handleLayerSwitch = (id) => {
    setActiveLayerId(id);
    setLayerKey(k => k + 1); // remount TileLayer to refresh tiles
  };

  const activeLayer = LAYERS.find(l => l.id === activeLayerId);
  const current = weatherData?.current;
  const location = weatherData?.location;

  return (
    <div className="flex flex-col h-full gap-4" style={{ minHeight: '75vh' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Live Weather Radar</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {location?.name ? `📍 ${location.name}, ${location.country}` : '📍 Loading location…'}
          </p>
        </div>
        <button
          onClick={requestLocation}
          disabled={isLocating}
          className="px-4 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors flex items-center gap-2 disabled:opacity-50 font-semibold text-sm shadow-sm shadow-sky-500/30"
        >
          {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          My Location
        </button>
      </div>

      {/* Layer Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {LAYERS.map(layer => (
          <button
            key={layer.id}
            onClick={() => handleLayerSwitch(layer.id)}
            className={`flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all ${
              activeLayerId === layer.id
                ? 'border-sky-500 bg-sky-500 text-white shadow-md shadow-sky-500/30'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-sky-300 hover:bg-sky-50 dark:hover:bg-slate-700'
            }`}
          >
            <span className="text-lg">{layer.emoji}</span>
            <div className="text-left">
              <p className="text-xs font-bold leading-tight">{layer.label}</p>
              <p className={`text-xs hidden sm:block ${activeLayerId === layer.id ? 'text-sky-100' : 'text-slate-400'}`}>{layer.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Weather Stats */}
      {current && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Temp', value: `${current.temp_c}°C`, color: 'text-orange-500' },
            { label: 'Humidity', value: `${current.humidity}%`, color: 'text-blue-500' },
            { label: 'Wind', value: `${current.wind_kph} km/h`, color: 'text-teal-500' },
            { label: 'Condition', value: current.condition?.text || '—', color: 'text-sky-500' },
          ].map(s => (
            <div key={s.label} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-3 border border-slate-200/50 dark:border-white/10 text-center">
              <p className="text-xs text-slate-500 font-medium">{s.label}</p>
              <p className={`text-sm font-bold ${s.color} mt-0.5`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Map */}
      <div className="flex-1 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-white/10 relative" style={{ minHeight: '420px' }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%', zIndex: 0, minHeight: '420px' }}
          zoomControl={true}
        >
          {/* Fly to user location */}
          <MapFlyTo center={mapCenter} zoom={mapZoom} />

          {/* Base OSM tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Weather overlay — uses unique key to force refresh when layer changes */}
          {OWM_KEY && (
            <TileLayer
              key={`owm-${activeLayerId}-${layerKey}`}
              url={`https://tile.openweathermap.org/map/${activeLayerId}/{z}/{x}/{y}.png?appid=${OWM_KEY}`}
              opacity={0.55}
              attribution='&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
            />
          )}

          {/* User location marker */}
          {coords && (
            <Marker position={[coords.lat, coords.lng]} icon={userIcon}>
              <Popup>
                <div className="text-center p-1 min-w-[140px]">
                  <p className="font-bold text-sky-600 text-sm">📍 Your Location</p>
                  {location?.name && <p className="text-slate-600 text-xs mt-1">{location.name}, {location.country}</p>}
                  {current && (
                    <div className="mt-2 space-y-0.5">
                      <p className="text-slate-700 font-semibold">🌡️ {current.temp_c}°C</p>
                      <p className="text-slate-500 text-xs">{current.condition?.text}</p>
                      <p className="text-slate-500 text-xs">💧 {current.humidity}% · 💨 {current.wind_kph} km/h</p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Active layer badge */}
        <div className="absolute bottom-5 left-5 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-lg border border-slate-200/50 dark:border-white/10 pointer-events-none">
          <div className="flex items-center gap-2 text-slate-700 dark:text-white font-semibold text-sm">
            <span className="text-lg">{activeLayer?.emoji}</span>
            {activeLayer?.label}
          </div>
          <div className={`h-2 w-40 rounded-full mt-2 bg-gradient-to-r ${activeLayer?.color}`} />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Low</span><span>High</span>
          </div>
        </div>

        {/* Locating overlay */}
        {isLocating && (
          <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white">
            <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
            Locating you…
          </div>
        )}

        {/* OWM Key missing notice */}
        {!OWM_KEY && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-amber-50 dark:bg-amber-900/80 border border-amber-200 text-amber-700 dark:text-amber-300 text-xs px-3 py-1.5 rounded-xl shadow">
            Set VITE_OWM_KEY for weather overlays
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMap;

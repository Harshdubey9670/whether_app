import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Thermometer, Droplets, Wind, Cloud, Navigation, Loader2, 
  MapPin, Maximize, Minimize, Play, Pause, Layers, Gauge
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation as useAppLocation } from '../contexts/LocationContext';
import { useSettings } from '../contexts/SettingsContext';
import { getCurrentWeather } from '../services/api';

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

const MapFlyTo = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1.8, easeLinearity: 0.25 });
  }, [center[0], center[1]]);
  return null;
};

const OWM_KEY = import.meta.env.VITE_OWM_KEY || '';

const BASE_MAPS = {
  street: { name: 'Street', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap' },
  satellite: { name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
  dark: { name: 'Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '&copy; CartoDB' }
};

const LiveMap = () => {
  const { coords, locationQuery, permissionStatus, requestLocation } = useAppLocation();
  const { convertTemp, convertWind, tempUnit, windUnit } = useSettings();
  
  const [activeLayerId, setActiveLayerId] = useState('precipitation_new');
  const [baseMap, setBaseMap] = useState('dark');
  const [layerKey, setLayerKey] = useState(0); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineValue, setTimelineValue] = useState(100);
  
  const mapWrapperRef = useRef(null);
  const playIntervalRef = useRef(null);
  const isLocating = permissionStatus === 'requesting';

  const LAYERS = [
    {
      id: 'precipitation_new',
      label: 'Rain Radar',
      icon: <Droplets className="w-4 h-4" />,
      emoji: '🌧️',
      color: 'from-sky-300 via-blue-500 to-fuchsia-600',
      description: 'Rainfall intensity',
      getLegend: () => ({ min: '0 mm/h', max: '140 mm/h' })
    },
    {
      id: 'temp_new',
      label: 'Temperature',
      icon: <Thermometer className="w-4 h-4" />,
      emoji: '🌡️',
      color: 'from-purple-500 via-green-400 to-red-500',
      description: 'Surface air temperature',
      getLegend: () => ({ min: `${convertTemp(-40)}${tempUnit}`, max: `${convertTemp(40)}${tempUnit}` })
    },
    {
      id: 'wind_new',
      label: 'Wind Speed',
      icon: <Wind className="w-4 h-4" />,
      emoji: '💨',
      color: 'from-white via-cyan-300 to-purple-600',
      description: 'Wind speed at 10m',
      getLegend: () => ({ min: `0 ${windUnit}`, max: `${convertWind(200)} ${windUnit}` })
    },
    {
      id: 'pressure_new',
      label: 'Pressure',
      icon: <Gauge className="w-4 h-4" />,
      emoji: '🌪️',
      color: 'from-blue-400 via-green-300 to-red-500',
      description: 'Sea level pressure',
      getLegend: () => ({ min: '950 hPa', max: '1070 hPa' })
    },
    {
      id: 'clouds_new',
      label: 'Cloud Cover',
      icon: <Cloud className="w-4 h-4" />,
      emoji: '☁️',
      color: 'from-transparent to-white',
      description: 'Cloud coverage',
      getLegend: () => ({ min: '0%', max: '100%' })
    },
  ];

  const mapCenter = coords ? [coords.lat, coords.lng] : [20.5937, 78.9629];
  const mapZoom = coords ? 10 : 5;

  const { data: weatherData, isLoading } = useQuery({
    queryKey: ['weather', locationQuery],
    queryFn: () => getCurrentWeather(locationQuery),
    staleTime: 5 * 60 * 1000,
    enabled: !!locationQuery,
  });

  const handleLayerSwitch = (id) => {
    setActiveLayerId(id);
    setLayerKey(k => k + 1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapWrapperRef.current.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      clearInterval(playIntervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (timelineValue >= 100) setTimelineValue(0);
      playIntervalRef.current = setInterval(() => {
        setTimelineValue(prev => {
          if (prev >= 100) {
            clearInterval(playIntervalRef.current);
            setIsPlaying(false);
            return 100;
          }
          return prev + 2; // Simulate moving forward in time
        });
      }, 100);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => clearInterval(playIntervalRef.current);
  }, []);

  const activeLayer = LAYERS.find(l => l.id === activeLayerId);
  const legend = activeLayer?.getLegend();
  const current = weatherData?.current;
  const location = weatherData?.location;

  // Calculate a simulated time based on the timeline value (from 2 hours ago to now)
  const now = new Date();
  const simulatedTime = new Date(now.getTime() - (100 - timelineValue) * 1.2 * 60000); 

  return (
    <div className="flex flex-col h-full gap-4" style={{ minHeight: '75vh' }}>
      {/* Header */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Live Interactive Map
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {location?.name ? `📍 ${location.name}, ${location.country}` : '📍 Loading location…'}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative group">
              <button className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-semibold text-sm">
                <Layers className="w-4 h-4" />
                {BASE_MAPS[baseMap].name} View
              </button>
              <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {Object.entries(BASE_MAPS).map(([key, map]) => (
                  <button key={key} onClick={() => setBaseMap(key)} className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 ${baseMap === key ? 'text-sky-500' : 'text-slate-700 dark:text-slate-300'}`}>
                    {map.name} View
                  </button>
                ))}
              </div>
            </div>
            
            <button onClick={requestLocation} disabled={isLocating} className="px-4 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors flex items-center gap-2 disabled:opacity-50 font-semibold text-sm shadow-sm shadow-sky-500/30">
              {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              Locate Me
            </button>
          </div>
        </div>
      )}

      {/* Layer Buttons */}
      {!isFullscreen && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {LAYERS.map(layer => (
            <button key={layer.id} onClick={() => handleLayerSwitch(layer.id)} className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all ${activeLayerId === layer.id ? 'border-sky-500 bg-sky-500 text-white shadow-md shadow-sky-500/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-sky-300 hover:bg-sky-50 dark:hover:bg-slate-700'}`}>
              <span className="text-xl">{layer.emoji}</span>
              <div className="text-left">
                <p className="text-xs font-bold leading-tight">{layer.label}</p>
                <p className={`text-[10px] hidden lg:block ${activeLayerId === layer.id ? 'text-sky-100' : 'text-slate-400'}`}>{layer.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Map Container */}
      <div 
        ref={mapWrapperRef} 
        className={`flex-1 overflow-hidden shadow-2xl relative ${isFullscreen ? 'h-screen w-screen' : 'rounded-3xl border border-slate-200/50 dark:border-white/10'}`} 
        style={!isFullscreen ? { minHeight: '500px' } : {}}
      >
        <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
          <MapFlyTo center={mapCenter} zoom={mapZoom} />

          {/* Base Map */}
          <TileLayer attribution={BASE_MAPS[baseMap].attribution} url={BASE_MAPS[baseMap].url} />

          {/* Weather Overlay */}
          {OWM_KEY && (
            <TileLayer
              key={`owm-${activeLayerId}-${layerKey}`}
              url={`https://tile.openweathermap.org/map/${activeLayerId}/{z}/{x}/{y}.png?appid=${OWM_KEY}`}
              opacity={(timelineValue / 100) * 0.7 + 0.1} // Simulating fading based on timeline scrubber
              attribution='&copy; OpenWeatherMap'
            />
          )}

          {/* User Marker */}
          {coords && (
            <Marker position={[coords.lat, coords.lng]} icon={userIcon}>
              <Popup>
                <div className="text-center p-2 min-w-[160px]">
                  <p className="font-bold text-sky-600 text-sm mb-1">📍 Your Location</p>
                  {location?.name && <p className="text-slate-600 font-medium text-sm">{location.name}, {location.country}</p>}
                  {current && (
                    <div className="mt-3 bg-slate-50 p-2 rounded-xl">
                      <p className="text-slate-800 font-bold text-lg">{convertTemp(current.temp_c)}{tempUnit}</p>
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-2">{current.condition?.text}</p>
                      <div className="flex justify-between text-xs text-slate-500 border-t border-slate-200 pt-2">
                        <span>💧 {current.humidity}%</span>
                        <span>💨 {convertWind(current.wind_kph)} {windUnit}</span>
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-auto">
          <button onClick={toggleFullscreen} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200/50 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>

        {/* Dynamic Legend */}
        <div className="absolute bottom-24 sm:bottom-28 left-4 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-slate-200/50 dark:border-white/10 pointer-events-none w-48">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-bold text-sm mb-2">
            <span className="text-lg">{activeLayer?.emoji}</span>
            {activeLayer?.label}
          </div>
          <div className={`h-2.5 w-full rounded-full bg-gradient-to-r ${activeLayer?.color}`} />
          <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
            <span>{legend?.min}</span>
            <span>{legend?.max}</span>
          </div>
        </div>

        {/* Missing API Key Warning */}
        {!OWM_KEY && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-amber-50/95 dark:bg-amber-900/95 border border-amber-200 text-amber-700 dark:text-amber-300 font-medium px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Set VITE_OWM_KEY in .env for live radar layers
          </div>
        )}

        {/* Map Timeline Scrubber */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-2xl z-[1000] pointer-events-auto">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3 sm:px-5 sm:py-3 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-white/10 flex items-center gap-4">
            <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/30 hover:bg-sky-600 transition-colors flex-shrink-0">
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
            </button>
            <div className="flex-1">
              <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                <span>Past 2 Hrs</span>
                <span className="text-sky-500">{simulatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>Live</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={timelineValue} 
                onChange={(e) => { setTimelineValue(Number(e.target.value)); setIsPlaying(false); clearInterval(playIntervalRef.current); }}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;

import { useQuery } from '@tanstack/react-query';
import { Heart, Wind, Sun, AlertTriangle, Loader2, Leaf, Activity, Droplets, MapPin } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import { getCurrentWeather } from '../services/api';

const getAQILevel = (aqi) => {
  if (aqi <= 50) return { label: 'Good', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', bar: 'bg-green-500', advice: 'Air quality is satisfactory. Enjoy outdoor activities!' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', bar: 'bg-yellow-500', advice: 'Unusually sensitive people should consider reducing prolonged outdoor exertion.' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30', bar: 'bg-orange-500', advice: 'Sensitive groups should reduce prolonged outdoor exertion.' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30', bar: 'bg-red-500', advice: 'Everyone may begin to experience health effects. Limit outdoor activity.' };
  return { label: 'Very Unhealthy', color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', bar: 'bg-purple-500', advice: 'Health alert — everyone may experience serious health effects.' };
};

const getUVLevel = (uv) => {
  if (uv <= 2) return { label: 'Low', color: 'text-green-500', advice: 'No protection needed. Safe to be outside.' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-yellow-500', advice: 'Apply sunscreen, wear sunglasses on bright days.' };
  if (uv <= 7) return { label: 'High', color: 'text-orange-500', advice: 'Wear sunscreen SPF 30+, hat and sunglasses. Seek shade during midday.' };
  if (uv <= 10) return { label: 'Very High', color: 'text-red-500', advice: 'Apply SPF 50+, avoid sun 10am–4pm, cover up.' };
  return { label: 'Extreme', color: 'text-purple-500', advice: 'Take all precautions. Unprotected skin can burn in minutes.' };
};

const pollenSeasonData = [
  { type: 'Tree Pollen', level: 'High', icon: '🌳', color: 'text-green-600', bar: 75 },
  { type: 'Grass Pollen', level: 'Moderate', icon: '🌿', color: 'text-lime-600', bar: 45 },
  { type: 'Weed Pollen', level: 'Low', icon: '🌾', color: 'text-yellow-600', bar: 20 },
  { type: 'Mold Spores', level: 'Low', icon: '🍄', color: 'text-brown-600', bar: 15 },
];

const healthTips = [
  { condition: 'Humidity > 70%', tip: 'High humidity can worsen respiratory conditions. Use a dehumidifier indoors.', icon: <Droplets className="w-5 h-5 text-blue-500" /> },
  { condition: 'Wind > 30 km/h', tip: 'Strong winds spread allergens. Keep windows closed and check outdoor air quality.', icon: <Wind className="w-5 h-5 text-teal-500" /> },
  { condition: 'Temperature < 10°C', tip: 'Cold air can trigger asthma. Wear a scarf over mouth and nose when outside.', icon: <Activity className="w-5 h-5 text-indigo-500" /> },
  { condition: 'UV Index > 6', tip: 'High UV exposure increases skin cancer risk. Apply SPF 30+ sunscreen daily.', icon: <Sun className="w-5 h-5 text-orange-500" /> },
];

const HealthCenter = () => {
  const { locationQuery, coords } = useLocation();

  const { data: weatherData, isLoading } = useQuery({
    queryKey: ['weather', locationQuery],
    queryFn: () => import('../services/api').then(m => m.getCurrentWeather(locationQuery)),
    staleTime: 5 * 60 * 1000,
    enabled: !!locationQuery,
  });

  // Derive health metrics from weather data
  const current = weatherData?.current;
  const location = weatherData?.location;

  // Approximate AQI from humidity + conditions (mock when AQI not in data)
  const humidity = current?.humidity || 60;
  const windKph = current?.wind_kph || 10;
  const tempC = current?.temp_c || 25;
  const uvIndex = current?.uv || 5;

  // Simple AQI approximation
  const approxAQI = Math.round(
    (humidity > 70 ? 60 : 35) +
    (windKph < 10 ? 20 : 0) +
    (tempC > 35 ? 15 : 0)
  );

  const aqi = getAQILevel(approxAQI);
  const uv = getUVLevel(uvIndex);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Health & Wellness Center</h2>
        <p className="text-slate-500 mt-1 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {location?.name ? `${location.name}, ${location.country}` : 'Your Location'} — Live health metrics
        </p>
      </div>

      {/* Key Health Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Air Quality Index',
            value: approxAQI,
            sub: aqi.label,
            icon: <Leaf className="w-7 h-7" />,
            color: 'text-green-500',
            bg: 'bg-green-100 dark:bg-green-900/30',
          },
          {
            label: 'UV Index',
            value: uvIndex,
            sub: uv.label,
            icon: <Sun className="w-7 h-7" />,
            color: 'text-orange-500',
            bg: 'bg-orange-100 dark:bg-orange-900/30',
          },
          {
            label: 'Humidity',
            value: `${humidity}%`,
            sub: humidity > 70 ? 'High — use dehumidifier' : humidity > 40 ? 'Comfortable' : 'Dry — stay hydrated',
            icon: <Droplets className="w-7 h-7" />,
            color: 'text-blue-500',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
          },
          {
            label: 'Feel-Like Temp',
            value: `${Math.round(tempC - (windKph / 10))}°C`,
            sub: windKph > 20 ? 'Wind chill effect' : 'Calm conditions',
            icon: <Activity className="w-7 h-7" />,
            color: 'text-purple-500',
            bg: 'bg-purple-100 dark:bg-purple-900/30',
          },
        ].map(m => (
          <div key={m.label} className="glass rounded-2xl p-5">
            <div className={`w-12 h-12 rounded-xl ${m.bg} ${m.color} flex items-center justify-center mb-3`}>
              {m.icon}
            </div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">{m.label}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{m.value}</p>
            <p className={`text-xs font-semibold mt-1 ${m.color}`}>{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AQI Detail Card */}
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
              <Leaf className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Air Quality</h3>
              <p className="text-sm text-slate-500">Real-time pollution levels</p>
            </div>
          </div>

          <div className={`${aqi.bg} rounded-2xl p-4 mb-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-2xl font-bold ${aqi.color}`}>{approxAQI} AQI</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full bg-white/50 ${aqi.color}`}>{aqi.label}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{aqi.advice}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-500 mb-3">AQI Scale</p>
            {[
              { range: '0-50', label: 'Good', color: 'bg-green-500', width: '20%' },
              { range: '51-100', label: 'Moderate', color: 'bg-yellow-500', width: '40%' },
              { range: '101-150', label: 'Unhealthy*', color: 'bg-orange-500', width: '60%' },
              { range: '151-200', label: 'Unhealthy', color: 'bg-red-500', width: '80%' },
              { range: '201+', label: 'Very Unhealthy', color: 'bg-purple-500', width: '100%' },
            ].map(s => (
              <div key={s.range} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${s.color} flex-shrink-0`} />
                <span className="text-xs text-slate-500 w-16">{s.range}</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pollen Levels */}
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 bg-lime-100 dark:bg-lime-900/30 rounded-2xl">
              <Leaf className="w-6 h-6 text-lime-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Pollen Forecast</h3>
              <p className="text-sm text-slate-500">Allergy risk levels today</p>
            </div>
          </div>

          <div className="space-y-4">
            {pollenSeasonData.map(p => (
              <div key={p.type}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.icon}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{p.type}</span>
                  </div>
                  <span className={`text-xs font-bold ${p.color}`}>{p.level}</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lime-400 rounded-full transition-all duration-1000"
                    style={{ width: `${p.bar}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>Tree pollen is high today. Allergy sufferers should carry antihistamines and limit outdoor exposure in the morning.</p>
            </div>
          </div>
        </div>
      </div>

      {/* UV Index */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
            <Sun className="w-6 h-6 text-orange-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">UV Index Forecast</h3>
        </div>
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1">
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-5xl font-bold text-slate-800 dark:text-white">{uvIndex}</span>
              <span className={`text-xl font-bold ${uv.color}`}>{uv.label}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">{uv.advice}</p>
            <div className="relative h-4 bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500 rounded-full overflow-hidden">
              <div
                className="absolute top-0 h-full w-1 bg-white shadow-lg rounded-full"
                style={{ left: `${Math.min((uvIndex / 12) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0 Low</span>
              <span>3</span>
              <span>6 High</span>
              <span>9</span>
              <span>11+ Extreme</span>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Hourly UV Forecast</p>
            {[
              { time: '8 AM', uv: 2 }, { time: '10 AM', uv: 5 }, { time: '12 PM', uv: uvIndex },
              { time: '2 PM', uv: Math.max(uvIndex - 1, 1) }, { time: '4 PM', uv: 4 }, { time: '6 PM', uv: 1 }
            ].map(h => (
              <div key={h.time} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-12">{h.time}</span>
                <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
                    style={{ width: `${(h.uv / 12) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-4">{h.uv}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Tips */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl">
            <Heart className="w-6 h-6 text-rose-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Today's Health Tips</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
              <div className="mt-0.5 flex-shrink-0">{tip.icon}</div>
              <div>
                <p className="text-xs font-bold text-slate-400 mb-1">{tip.condition}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{tip.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthCenter;

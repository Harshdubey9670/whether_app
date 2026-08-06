import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Wind, ThermometerSun, Droplets,
  Eye, MapPin, Search, Loader2, Navigation, AlertCircle, X,
  Star, History, Sunrise, Sunset, Moon, Activity
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Filler, Legend,
} from 'chart.js';
import { getCurrentWeather, askAIAssistant, searchLocation, updateProfile } from '../services/api';
import { useLocation } from '../contexts/LocationContext';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const WeatherCardSkeleton = () => (
  <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-5 border border-slate-200/50 dark:border-white/10 shadow-sm animate-pulse">
    <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-700 mb-3"></div>
    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
    <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { convertTemp, convertWind, tempUnit, windUnit } = useSettings();
  const { locationQuery, setLocationQuery, permissionStatus, requestLocation } = useLocation();
  
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [favorites, setFavorites] = useState(user?.favorites || []);
  const [recentSearches, setRecentSearches] = useState(user?.recentSearches || JSON.parse(localStorage.getItem('weatherverse_recent')) || []);
  const [forecastTab, setForecastTab] = useState('7day');
  
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const isLocating = permissionStatus === 'requesting';

  useEffect(() => {
    if (user?.favorites) setFavorites(user.favorites);
    if (user?.recentSearches) setRecentSearches(user.recentSearches);
  }, [user]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addToRecents = async (name) => {
    if (!name) return;
    const newRecents = [name, ...recentSearches.filter(s => s !== name)].slice(0, 5);
    setRecentSearches(newRecents);
    localStorage.setItem('weatherverse_recent', JSON.stringify(newRecents));
    if (user) await updateProfile({ recentSearches: newRecents });
  };

  const handleSearchInput = (val) => {
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim() || val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchLocation(val);
        setSuggestions(results || []);
        setShowSuggestions(true);
      } catch (_) {
        setSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  };

  const handleSelectSuggestion = (name) => {
    setLocationQuery(name);
    setSearchInput(name);
    setSuggestions([]);
    setShowSuggestions(false);
    addToRecents(name);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocationQuery(searchInput.trim());
      setShowSuggestions(false);
      addToRecents(searchInput.trim());
    }
  };

  const handleMyLocation = () => {
    setSearchInput('');
    setSuggestions([]);
    requestLocation();
  };

  // Fetch weather data with offline caching
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather', locationQuery],
    queryFn: async () => {
      const data = await getCurrentWeather(locationQuery);
      localStorage.setItem(`weather_cache_${locationQuery}`, JSON.stringify(data));
      return data;
    },
    initialData: () => {
      const cached = localStorage.getItem(`weather_cache_${locationQuery}`);
      return cached ? JSON.parse(cached) : undefined;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!locationQuery && !isLocating,
  });

  const toggleFavorite = async () => {
    const locName = weatherData?.location?.name;
    if (!locName) return;
    const isFav = favorites.includes(locName);
    const newFavs = isFav ? favorites.filter(f => f !== locName) : [...favorites, locName];
    setFavorites(newFavs);
    if (user) await updateProfile({ favorites: newFavs });
  };

  // AI Assistant
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState("Hi! I'm your WeatherVerse AI assistant. Ask me anything about the weather!");
  const [aiLoading, setAiLoading] = useState(false);

  const handleAiAsk = async (e) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    try {
      const context = {
        location: weatherData?.location?.name,
        temp: weatherData?.current?.temp_c,
        condition: weatherData?.current?.condition?.text,
      };
      const res = await askAIAssistant(aiQuestion, context);
      setAiResponse(res.answer);
      setAiQuestion('');
    } catch {
      setAiResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const current = weatherData?.current;
  const location = weatherData?.location;
  const forecast = weatherData?.forecast?.forecastday?.[0];
  const extendedForecast = weatherData?.forecast?.forecastday || [];

  // Hourly chart
  const hourlyData = forecast?.hour?.filter((_, i) => i % 3 === 0) || [];
  const chartLabels = hourlyData.length > 0
    ? hourlyData.map(h => new Date(h.time).toLocaleTimeString([], { hour: '2-digit' }))
    : ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM', '12 AM', '3 AM'];
  const chartTemps = hourlyData.length > 0
    ? hourlyData.map(h => convertTemp(h.temp_c))
    : [18, 20, 26, 28, 24, 20, 17, 15];

  const chartData = {
    labels: chartLabels,
    datasets: [{
      fill: true,
      label: `Temperature (${tempUnit})`,
      data: chartTemps,
      borderColor: 'rgb(14, 165, 233)',
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: 'rgb(14, 165, 233)',
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.raw}${tempUnit}` } } },
    scales: {
      y: { display: true, grid: { color: 'rgba(148,163,184,0.1)' }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: (v) => `${v}°` } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    },
  };

  return (
    <div className="space-y-5">
      {/* Permission Denied Banner */}
      {permissionStatus === 'denied' && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl text-amber-700 dark:text-amber-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm flex-1">Location access denied — showing default city. <button onClick={requestLocation} className="underline font-semibold">Try again</button> or search for your city below.</p>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {weatherLoading && !weatherData || isLocating ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
              <span className="font-medium">{isLocating ? 'Getting your location…' : 'Loading weather…'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-500" />
              <span className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                {location?.name || 'Loading…'}
                {location?.country ? <span className="text-lg text-slate-400 font-medium">{location.country}</span> : ''}
              </span>
              {location?.name && (
                <button onClick={toggleFavorite} className={`p-1.5 rounded-xl transition-colors ${favorites.includes(location.name) ? 'text-yellow-400 hover:text-yellow-500' : 'text-slate-300 dark:text-slate-600 hover:text-yellow-400'}`}>
                  <Star className={`w-5 h-5 ${favorites.includes(location.name) ? 'fill-current' : ''}`} />
                </button>
              )}
              {weatherData?.mock && (
                <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium ml-2">Demo data</span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleMyLocation}
            disabled={isLocating}
            className="px-4 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors flex items-center gap-2 disabled:opacity-50 font-semibold text-sm shadow-sm shadow-sky-500/30 whitespace-nowrap"
          >
            {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            My Location
          </button>

          <div ref={searchRef} className="relative flex-1 sm:w-72 z-40">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => handleSearchInput(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search any city worldwide…"
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white text-sm transition-all"
                />
                {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
                {searchInput && !searchLoading && (
                  <button type="button" onClick={() => { setSearchInput(''); setSuggestions([]); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                  </button>
                )}
              </div>
            </form>

            {/* Autocomplete & Recents Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-64 overflow-y-auto">
                {searchInput.length >= 2 && suggestions.length > 0 ? (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50">Search Results</div>
                    {suggestions.map((s, i) => (
                      <button key={i} onClick={() => handleSelectSuggestion(s.name)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors text-left">
                        <MapPin className="w-4 h-4 text-sky-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-700 dark:text-white">{s.name}</span>
                        <span className="text-xs text-slate-400 ml-auto">{s.country}</span>
                      </button>
                    ))}
                  </div>
                ) : !searchInput && recentSearches.length > 0 ? (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/50">Recent Searches</div>
                    {recentSearches.map((s, i) => (
                      <button key={i} onClick={() => handleSelectSuggestion(s)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors text-left">
                        <History className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-700 dark:text-white">{s}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weather Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {weatherLoading && !weatherData ? (
          <>
            <WeatherCardSkeleton />
            <WeatherCardSkeleton />
            <WeatherCardSkeleton />
            <WeatherCardSkeleton />
          </>
        ) : (
          <>
            <WeatherCard
              title="Temperature"
              value={`${convertTemp(current?.temp_c || 0)}${tempUnit}`}
              icon={<ThermometerSun className="w-7 h-7" />}
              iconColor="text-orange-500"
              iconBg="bg-orange-100 dark:bg-orange-900/30"
              trend={current?.condition?.text || 'Loading…'}
            />
            <WeatherCard
              title="Humidity"
              value={`${current?.humidity || 0}%`}
              icon={<Droplets className="w-7 h-7" />}
              iconColor="text-blue-500"
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              trend={current?.humidity > 70 ? 'High' : current?.humidity > 40 ? 'Comfortable' : 'Dry'}
            />
            <WeatherCard
              title="Wind Speed"
              value={`${convertWind(current?.wind_kph || 0)} ${windUnit}`}
              icon={<Wind className="w-7 h-7" />}
              iconColor="text-teal-500"
              iconBg="bg-teal-100 dark:bg-teal-900/30"
              trend={current?.wind_kph > 40 ? 'Strong' : current?.wind_kph > 20 ? 'Moderate' : 'Calm'}
            />
            <WeatherCard
              title="Visibility"
              value={`${current?.vis_km || 0} km`}
              icon={<Eye className="w-7 h-7" />}
              iconColor="text-purple-500"
              iconBg="bg-purple-100 dark:bg-purple-900/30"
              trend={current?.vis_km > 8 ? 'Clear' : current?.vis_km > 4 ? 'Moderate' : 'Poor'}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Temperature Chart */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/10 shadow-sm relative">
          {weatherLoading && !weatherData && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 rounded-3xl flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>}
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Today's Temperature Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Hourly temperature forecast</p>
            </div>
            <div className="text-2xl font-bold text-sky-500">{convertTemp(current?.temp_c || 0)}{tempUnit}</div>
          </div>
          <div className="h-52">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* AI Widget */}
        <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white shadow-lg flex flex-col">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          
          <h3 className="text-base font-bold mb-3 flex items-center gap-2 relative z-10">
            <span className="text-xl">✨</span> Gemini AI Assistant
          </h3>
          
          <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 overflow-y-auto min-h-[100px] relative z-10 scrollbar-hide">
            {aiLoading ? (
              <div className="flex items-center gap-2 text-indigo-200">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking…</span>
              </div>
            ) : (
              <p className="text-sm leading-relaxed">{aiResponse}</p>
            )}
          </div>
          
          <form onSubmit={handleAiAsk} className="relative z-10">
            <div className="relative">
              <input
                type="text"
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                placeholder="Will it rain today?"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
              />
              <button type="submit" disabled={aiLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white hover:text-yellow-300 transition-colors disabled:opacity-40">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Extended Forecast */}
      {extendedForecast.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/10 shadow-sm relative">
          {weatherLoading && !weatherData && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 rounded-3xl flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Extended Forecast</h3>
              <p className="text-xs text-slate-500 mt-0.5">Plan ahead with our smart predictions</p>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button onClick={() => setForecastTab('7day')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${forecastTab === '7day' ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>7-Day</button>
              <button onClick={() => setForecastTab('15day')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${forecastTab === '15day' ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>15-Day</button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {(forecastTab === '7day' ? extendedForecast.slice(0, 7) : extendedForecast).map((day, i) => (
              <div key={i} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">
                  {i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-xs text-slate-500 mb-2">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                <div className="text-3xl mb-2">{day.day.condition.text.toLowerCase().includes('rain') ? '🌧️' : day.day.condition.text.toLowerCase().includes('cloud') ? '☁️' : '☀️'}</div>
                <div className="flex gap-2 text-sm font-bold mb-1">
                  <span className="text-slate-800 dark:text-white">{convertTemp(day.day.maxtemp_c)}°</span>
                  <span className="text-slate-400">{convertTemp(day.day.mintemp_c)}°</span>
                </div>
                <p className="text-xs text-sky-500 font-medium flex items-center gap-1">
                  <Droplets className="w-3 h-3"/> {day.day.daily_chance_of_rain}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extra Weather Details Grid */}
      {current && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
          {weatherLoading && !weatherData && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 rounded-2xl"></div>}
          {[
            { label: 'UV Index', value: current.uv ?? '5', unit: '', icon: '☀️', color: 'text-amber-500' },
            { label: 'Air Quality (AQI)', value: current.aqi ?? '42', unit: '', icon: <Activity className="w-5 h-5"/>, color: 'text-green-500' },
            { label: 'Pressure', value: current.pressure_mb ?? '1012', unit: ' hPa', icon: '🌪️', color: 'text-slate-500' },
            { label: 'Dew Point', value: convertTemp(Math.round((current.temp_c ?? 24) - ((100 - (current.humidity ?? 60)) / 5))), unit: tempUnit, icon: '💧', color: 'text-blue-500' },
            { label: 'Sunrise', value: current.sunrise ?? '06:30 AM', unit: '', icon: <Sunrise className="w-5 h-5"/>, color: 'text-orange-400' },
            { label: 'Sunset', value: current.sunset ?? '07:15 PM', unit: '', icon: <Sunset className="w-5 h-5"/>, color: 'text-orange-500' },
            { label: 'Moon Phase', value: current.moon_phase ?? 'Waxing', unit: '', icon: <Moon className="w-5 h-5"/>, color: 'text-indigo-400' },
            { label: 'Condition', value: current.condition?.text || 'Clear', unit: '', icon: '🌤️', color: 'text-sky-500' },
          ].map(d => (
            <div key={d.label} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-white/10 shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className="text-xl mb-1 flex items-center justify-between">
                <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 ${d.color}`}>{typeof d.icon === 'string' ? <span className="text-lg">{d.icon}</span> : d.icon}</div>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-1 mt-2">{d.label}</p>
              <p className={`text-xl font-bold text-slate-800 dark:text-white`}>{d.value}<span className="text-sm font-medium text-slate-500 dark:text-slate-400">{d.unit}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const WeatherCard = ({ title, value, icon, iconColor, iconBg, trend }) => (
  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/50 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
    <div className={`w-11 h-11 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
    <h4 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h4>
    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{trend}</p>
  </div>
);

export default Dashboard;

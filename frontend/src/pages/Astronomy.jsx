import { useMemo } from 'react';
import { Moon, Sun, Sunrise, Sunset, Star, Compass, MapPin } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';

// Compute approximate moon phase based on date
function getMoonPhase(date = new Date()) {
  const knownNewMoon = new Date('2024-01-11');
  const lunationMs = 29.53059 * 24 * 60 * 60 * 1000;
  const elapsed = (date - knownNewMoon + lunationMs * 100) % lunationMs;
  const phase = elapsed / lunationMs;

  if (phase < 0.034) return { name: 'New Moon', icon: '🌑', illumination: 0 };
  if (phase < 0.25)  return { name: 'Waxing Crescent', icon: '🌒', illumination: Math.round(phase / 0.25 * 50) };
  if (phase < 0.284) return { name: 'First Quarter', icon: '🌓', illumination: 50 };
  if (phase < 0.5)   return { name: 'Waxing Gibbous', icon: '🌔', illumination: Math.round(50 + (phase - 0.25) / 0.25 * 50) };
  if (phase < 0.534) return { name: 'Full Moon', icon: '🌕', illumination: 100 };
  if (phase < 0.75)  return { name: 'Waning Gibbous', icon: '🌖', illumination: Math.round(100 - (phase - 0.5) / 0.25 * 50) };
  if (phase < 0.784) return { name: 'Last Quarter', icon: '🌗', illumination: 50 };
  return { name: 'Waning Crescent', icon: '🌘', illumination: Math.round((1 - phase) / 0.25 * 50) };
}

// Compute solar times based on lat/lng (simplified formula)
function getSolarTimes(lat, lng) {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const solarDeclination = -23.45 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
  const latRad = (lat * Math.PI) / 180;
  const declRad = (solarDeclination * Math.PI) / 180;

  const hourAngle = (180 / Math.PI) * Math.acos(-Math.tan(latRad) * Math.tan(declRad));
  const sunriseDec = (720 - 4 * (lng + hourAngle) - (new Date().getTimezoneOffset())) / 60;
  const sunsetDec = (720 - 4 * (lng - hourAngle) - (new Date().getTimezoneOffset())) / 60;

  const format = (h) => {
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    return `${hours % 12 || 12}:${String(mins).padStart(2, '0')} ${period}`;
  };

  return { sunrise: format(sunriseDec), sunset: format(sunsetDec) };
}

const MoonPhaseVisual = ({ phase }) => {
  const size = 120;
  return (
    <div className="relative flex items-center justify-center">
      <div className="text-8xl select-none">{phase.icon}</div>
    </div>
  );
};

const Astronomy = () => {
  const { coords } = useLocation();
  const today = new Date();

  const moon = useMemo(() => getMoonPhase(today), []);
  const solar = useMemo(() => {
    if (coords) return getSolarTimes(coords.lat, coords.lng);
    // Default to approx New Delhi times
    return { sunrise: '5:58 AM', sunset: '7:14 PM' };
  }, [coords]);

  // Next events
  const planetaryEvents = [
    { date: 'Jul 25, 2026', event: 'Mars at Opposition', icon: '🔴', description: 'Mars will be at its closest approach to Earth' },
    { date: 'Aug 12, 2026', event: 'Perseid Meteor Shower Peak', icon: '☄️', description: 'Up to 100 meteors per hour expected' },
    { date: 'Aug 28, 2026', event: 'Saturn at Opposition', icon: '🪐', description: 'Saturn visible all night, rings fully illuminated' },
    { date: 'Sep 7, 2026', event: 'Total Lunar Eclipse', icon: '🌑', description: 'Visible across Asia, Europe and Africa' },
    { date: 'Oct 2, 2026', event: 'Annular Solar Eclipse', icon: '🌞', description: 'Path visible across South America' },
  ];

  // Day length
  const dayLengthHours = (() => {
    try {
      const [srH, srM] = solar.sunrise.replace(' AM','').replace(' PM','').split(':').map(Number);
      const [ssH, ssM] = solar.sunset.replace(' AM','').replace(' PM','').split(':').map(Number);
      const sunriseTotal = (solar.sunrise.includes('PM') && srH !== 12 ? srH + 12 : srH) * 60 + srM;
      const sunsetTotal = (solar.sunset.includes('PM') && ssH !== 12 ? ssH + 12 : ssH) * 60 + ssM;
      const diff = sunsetTotal - sunriseTotal;
      return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    } catch {
      return '13h 16m';
    }
  })();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Astronomy Center</h2>
          <p className="text-slate-500 mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {coords ? `Based on your location (${coords.lat.toFixed(2)}°, ${coords.lng.toFixed(2)}°)` : 'Default location — allow GPS for accurate data'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">{today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Solar Card */}
        <div className="glass rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sun className="w-40 h-40 text-orange-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl">
                <Sun className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Solar Cycle</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Sunrise className="w-5 h-5 text-orange-400" />
                  <span className="font-medium text-slate-600 dark:text-slate-300">Sunrise</span>
                </div>
                <span className="text-xl font-bold text-slate-800 dark:text-white">{solar.sunrise}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Sunset className="w-5 h-5 text-rose-400" />
                  <span className="font-medium text-slate-600 dark:text-slate-300">Sunset</span>
                </div>
                <span className="text-xl font-bold text-slate-800 dark:text-white">{solar.sunset}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <Compass className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-slate-600 dark:text-slate-300">Day Length</span>
                </div>
                <span className="text-xl font-bold text-slate-800 dark:text-white">{dayLengthHours}</span>
              </div>

              {/* Solar arc visual */}
              <div className="mt-4 pt-2">
                <div className="relative h-24 flex items-end">
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-visible">
                    {/* Horizon line */}
                  </div>
                  {/* Arc */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 80">
                    <path d="M 10 75 Q 100 5 190 75" stroke="#f97316" strokeWidth="2.5" fill="none" strokeDasharray="4 2" />
                    <circle cx="100" cy="25" r="8" fill="#f97316" opacity="0.9" />
                    <text x="104" y="18" fontSize="10" fill="#f97316" fontWeight="bold">☀️</text>
                    <text x="2" y="78" fontSize="9" fill="#94a3b8">{solar.sunrise}</text>
                    <text x="145" y="78" fontSize="9" fill="#94a3b8">{solar.sunset}</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lunar Card */}
        <div className="glass rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute -top-6 -right-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Moon className="w-40 h-40 text-indigo-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                <Moon className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Lunar Cycle</h3>
            </div>
            
            <div className="flex items-center gap-6 mb-6">
              <MoonPhaseVisual phase={moon} />
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Current Phase</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{moon.name}</p>
                <p className="text-slate-500 mt-1">{moon.icon} {moon.illumination}% illuminated</p>
              </div>
            </div>
            
            {/* Illumination bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Illumination</span>
                <span>{moon.illumination}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-300 to-indigo-500 rounded-full transition-all"
                  style={{ width: `${moon.illumination}%` }}
                />
              </div>
            </div>

            {/* All 8 phases */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'].map((p, i) => (
                <div key={i} className={`text-center text-2xl p-2 rounded-xl transition-all ${p === moon.icon ? 'bg-indigo-100 dark:bg-indigo-900/40 scale-110 shadow' : 'opacity-40'}`}>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Celestial Events */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
            <Star className="w-6 h-6 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Upcoming Celestial Events</h3>
        </div>
        
        <div className="space-y-3">
          {planetaryEvents.map((event, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span className="text-3xl">{event.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800 dark:text-white">{event.event}</h4>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{event.description}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">{event.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Astronomy;

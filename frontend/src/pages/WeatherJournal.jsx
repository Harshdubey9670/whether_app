import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, ImageIcon, MapPin, Smile, Frown, Meh, Plus, Loader2, BookOpen, X } from 'lucide-react';
import { getJournalEntries, createJournalEntry, getCurrentWeather } from '../services/api';
import { useLocation } from '../contexts/LocationContext';
import RequireAuth from '../components/Auth/RequireAuth';

const MOODS = [
  { value: 'Excellent', emoji: '😄', color: 'text-green-500 border-green-400 bg-green-50 dark:bg-green-900/20' },
  { value: 'Good', emoji: '😊', color: 'text-emerald-500 border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
  { value: 'Neutral', emoji: '😐', color: 'text-yellow-500 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' },
  { value: 'Bad', emoji: '😔', color: 'text-orange-500 border-orange-400 bg-orange-50 dark:bg-orange-900/20' },
  { value: 'Terrible', emoji: '😞', color: 'text-red-500 border-red-400 bg-red-50 dark:bg-red-900/20' },
];

const getMoodStyle = (moodValue) => MOODS.find(m => m.value === moodValue) || MOODS[2];

const CONDITION_EMOJIS = {
  Sunny: '☀️', Clear: '☀️', Cloudy: '☁️', Rainy: '🌧️',
  Stormy: '⛈️', Foggy: '🌫️', 'Partly Cloudy': '⛅', Windy: '💨', Snowy: '❄️',
};

const WeatherJournal = () => {
  const queryClient = useQueryClient();
  const { locationQuery } = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState('Good');
  const [notes, setNotes] = useState('');
  const [activities, setActivities] = useState('');
  const [file, setFile] = useState(null);

  const { data: entries, isLoading } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: getJournalEntries,
  });

  const { data: weatherData } = useQuery({
    queryKey: ['weather', locationQuery],
    queryFn: () => getCurrentWeather(locationQuery),
    enabled: !!locationQuery,
    staleTime: 5 * 60 * 1000,
  });

  const createEntryMutation = useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries(['journalEntries']);
      setShowForm(false);
      setNotes('');
      setActivities('');
      setFile(null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!notes.trim()) return;
    const formData = new FormData();
    formData.append('mood', mood);
    formData.append('notes', notes);
    formData.append('activities', JSON.stringify(activities.split(',').map(a => a.trim()).filter(Boolean)));
    
    if (file) formData.append('photos', file);

    // Get exact location and current weather for this specific exact location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const exactWeather = await getCurrentWeather(`${lat},${lon}`);
          const locName = exactWeather?.location?.name || weatherData?.location?.name || 'Unknown Location';
          const temp = exactWeather?.current?.temp_c || weatherData?.current?.temp_c || 0;
          const cond = exactWeather?.current?.condition?.text || weatherData?.current?.condition?.text || 'Unknown';
          
          formData.append('weather', JSON.stringify({ temperature: temp, condition: cond }));
          formData.append('location', JSON.stringify({ name: locName, lat, lng: lon }));
          createEntryMutation.mutate(formData);
        } catch {
          // Fallback to current weatherData if API fails
          const locName = weatherData?.location?.name || 'Unknown Location';
          const temp = weatherData?.current?.temp_c || 0;
          const cond = weatherData?.current?.condition?.text || 'Unknown';
          formData.append('weather', JSON.stringify({ temperature: temp, condition: cond }));
          formData.append('location', JSON.stringify({ name: locName, lat, lng: lon }));
          createEntryMutation.mutate(formData);
        }
      }, () => {
        // Fallback if geolocation permission is denied
        const locName = weatherData?.location?.name || 'Unknown Location';
        const temp = weatherData?.current?.temp_c || 0;
        const cond = weatherData?.current?.condition?.text || 'Unknown';
        formData.append('weather', JSON.stringify({ temperature: temp, condition: cond }));
        formData.append('location', JSON.stringify({ name: locName }));
        createEntryMutation.mutate(formData);
      }, { enableHighAccuracy: true });
    } else {
      const locName = weatherData?.location?.name || 'Unknown Location';
      const temp = weatherData?.current?.temp_c || 0;
      const cond = weatherData?.current?.condition?.text || 'Unknown';
      formData.append('weather', JSON.stringify({ temperature: temp, condition: cond }));
      formData.append('location', JSON.stringify({ name: locName }));
      createEntryMutation.mutate(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-sky-500" />
            Weather Journal
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">Document how weather affects your daily life</p>
        </div>
        <RequireAuth onClick={() => setShowForm(!showForm)}>
          <button
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${showForm ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white' : 'bg-sky-500 text-white hover:bg-sky-600 shadow-sm shadow-sky-500/30'}`}
          >
            {showForm ? <><X className="w-4 h-4" />Cancel</> : <><Plus className="w-4 h-4" />New Entry</>}
          </button>
        </RequireAuth>
      </div>

      {/* New Entry Form */}
      {showForm && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-sky-500/30 shadow-lg">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-5">Today's Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mood Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">How did the weather make you feel today?</label>
              <div className="flex gap-2 flex-wrap">
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all font-medium text-sm ${mood === m.value ? m.color + ' border-current' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}
                  >
                    <span className="text-2xl mb-1">{m.emoji}</span>
                    {m.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Journal Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                required
                rows="4"
                placeholder="What did you do today? How did the weather affect it?"
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Activities */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Activities (comma separated)</label>
                <input
                  type="text"
                  value={activities}
                  onChange={e => setActivities(e.target.value)}
                  placeholder="Running, Reading, Cooking…"
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white text-sm"
                />
              </div>

              {/* Photo */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Add Photo</label>
                <label className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-3 cursor-pointer hover:bg-sky-50 dark:hover:bg-sky-900/10 hover:border-sky-400 transition-colors text-slate-500 text-sm">
                  <ImageIcon className="w-4 h-4" />
                  <span>{file ? file.name : 'Click to upload photo'}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={e => setFile(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={createEntryMutation.isPending} className="px-6 py-2.5 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center gap-2">
                {createEntryMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Journal Entries */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="text-center py-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-white/10">
            <BookOpen className="w-14 h-14 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">No journal entries yet</h3>
            <p className="text-slate-400 mt-1 text-sm">Click "New Entry" to start documenting your weather experiences!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {entries.map((entry) => {
              const moodStyle = getMoodStyle(entry.mood);
              const condEmoji = CONDITION_EMOJIS[entry.weather?.condition] || '🌤️';
              const entryDate = entry.date || entry.createdAt;

              return (
                <div key={entry._id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  {/* Date + Mood */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {entryDate
                        ? new Date(entryDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                        : 'Today'}
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${moodStyle.color}`}>
                      {moodStyle.emoji} {entry.mood}
                    </span>
                  </div>

                  {/* Weather context */}
                  {(entry.weather?.temperature || entry.location?.name) && (
                    <div className="flex items-center gap-3 mb-4 p-3 bg-sky-50/80 dark:bg-slate-800/80 rounded-2xl">
                      <span className="text-2xl">{condEmoji}</span>
                      <div>
                        {entry.weather?.temperature && (
                          <span className="text-lg font-bold text-slate-800 dark:text-white">{entry.weather.temperature}°C</span>
                        )}
                        {entry.weather?.condition && (
                          <span className="text-sm text-slate-500 ml-2">{entry.weather.condition}</span>
                        )}
                        {entry.location?.name && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3" /> {entry.location.name}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4 line-clamp-4">
                    {entry.notes}
                  </p>

                  {/* Activities */}
                  {entry.activities?.length > 0 && entry.activities[0] !== '' && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {entry.activities.map((act, i) => (
                        <span key={i} className="text-xs font-medium px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                          {act}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Photo */}
                  {entry.photos?.length > 0 && (
                    <div className="rounded-2xl overflow-hidden h-36 mt-3">
                      <img src={entry.photos[0]} alt="journal" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherJournal;

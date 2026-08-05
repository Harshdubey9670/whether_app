import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLocation } from '../contexts/LocationContext';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { updateNotificationPreferences, getVapidPublicKey, subscribePush, triggerTestNotification } from '../services/api';
import { User, Bell, Shield, Palette, MapPin, ChevronRight, Save, LogOut, Sun, Moon, Navigation } from 'lucide-react';

const SettingsSection = ({ title, icon, children }) => (
  <div className="glass rounded-3xl p-6">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
    </div>
    {children}
  </div>
);

const ToggleSwitch = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="font-medium text-slate-700 dark:text-slate-300">{label}</p>
      {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${enabled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);

const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { requestLocation, permissionStatus } = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    weatherAlerts: user?.preferences?.notifications?.weatherAlerts || false,
    dailyForecast: user?.preferences?.notifications?.dailyForecast || false,
    communityUpdates: user?.preferences?.notifications?.communityUpdates || false,
    severeWeather: user?.preferences?.notifications?.severeWarnings || false,
    pushAlerts: user?.preferences?.notifications?.pushAlerts || false,
    emailAlerts: user?.preferences?.notifications?.emailAlerts || false,
  });

  const { units, setUnits } = useSettings();
  const [saved, setSaved] = useState(false);
  const [pushStatus, setPushStatus] = useState('');

  const handleSave = async () => {
    try {
      await updateNotificationPreferences({
        weatherAlerts: notifications.weatherAlerts,
        dailyForecast: notifications.dailyForecast,
        severeWarnings: notifications.severeWeather,
        communityUpdates: notifications.communityUpdates,
        pushAlerts: notifications.pushAlerts,
        emailAlerts: notifications.emailAlerts,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      alert('Failed to save preferences');
    }
  };

  const handleEnablePush = async () => {
    setPushStatus('Requesting...');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPushStatus('Denied');
        return;
      }
      const registration = await navigator.serviceWorker.register('/sw.js');
      const publicKey = await getVapidPublicKey();
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      await subscribePush(subscription);
      setNotifications(prev => ({ ...prev, pushAlerts: true }));
      setPushStatus('Enabled!');
      setTimeout(() => setPushStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setPushStatus('Failed');
    }
  };

  const handleTestNotification = async (type) => {
    try {
      await triggerTestNotification(type);
      alert(`Test ${type} notification queued!`);
    } catch (e) {
      console.error(e);
      alert('Failed to queue test notification');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Settings</h2>
        <p className="text-slate-500 mt-1">Manage your WeatherVerse AI preferences</p>
      </div>

      {/* Profile */}
      <SettingsSection title="Profile" icon={<User className="w-5 h-5" />}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl">
            {user?.name?.charAt(0)?.toUpperCase() || 'G'}
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-800 dark:text-white">{user?.name || 'Guest User'}</h4>
            <p className="text-slate-500">{user?.email || 'Not logged in'}</p>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 mt-1 inline-block">
              {user?.role === 'admin' ? '⭐ Admin' : '🌤️ Pro Member'}
            </span>
          </div>
        </div>

        {!user ? (
          <div className="flex gap-3">
            <button onClick={() => navigate('/login')} className="px-5 py-2 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="px-5 py-2 border border-primary-500 text-primary-500 rounded-xl font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
              Register
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-500 mb-1 block">Display Name</label>
                <input defaultValue={user?.name} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 mb-1 block">Email</label>
                <input defaultValue={user?.email} disabled className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 text-sm cursor-not-allowed" />
              </div>
            </div>
          </div>
        )}
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection title="Appearance" icon={<Palette className="w-5 h-5" />}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => theme === 'dark' && toggleTheme()}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}
          >
            <Sun className="w-5 h-5 text-orange-400" />
            <div className="text-left">
              <p className="font-semibold text-slate-800 dark:text-white text-sm">Light Mode</p>
              <p className="text-xs text-slate-500">Bright weather theme</p>
            </div>
          </button>
          <button
            onClick={() => theme === 'light' && toggleTheme()}
            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <div className="text-left">
              <p className="font-semibold text-slate-800 dark:text-white text-sm">Dark Mode</p>
              <p className="text-xs text-slate-500">Night sky theme</p>
            </div>
          </button>
        </div>

        <div>
          <p className="font-medium text-slate-700 dark:text-slate-300 mb-3">Temperature Units</p>
          <div className="flex gap-2">
            {['metric', 'imperial'].map(u => (
              <button
                key={u}
                onClick={() => setUnits(u)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${units === u ? 'bg-primary-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                {u === 'metric' ? '°C — Metric' : '°F — Imperial'}
              </button>
            ))}
          </div>
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications" icon={<Bell className="w-5 h-5" />}>
        <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="font-bold text-slate-800 dark:text-white">Delivery Methods</p>
            <p className="text-sm text-slate-500">Enable how you want to receive alerts.</p>
          </div>
          <div className="flex gap-2">
             <button onClick={handleEnablePush} className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-colors">
               {pushStatus || (notifications.pushAlerts ? 'Push Enabled' : 'Enable Web Push')}
             </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 mb-6">
          <ToggleSwitch enabled={notifications.emailAlerts} onChange={v => setNotifications(n => ({...n, emailAlerts: v}))} label="Email Alerts" description="Receive alerts via email" />
          <ToggleSwitch enabled={notifications.weatherAlerts} onChange={v => setNotifications(n => ({...n, weatherAlerts: v}))} label="Weather Alerts" description="Get notified about severe weather in your area" />
          <ToggleSwitch enabled={notifications.dailyForecast} onChange={v => setNotifications(n => ({...n, dailyForecast: v}))} label="Daily Forecast" description="Morning summary of the day's weather" />
          <ToggleSwitch enabled={notifications.severeWeather} onChange={v => setNotifications(n => ({...n, severeWeather: v}))} label="Severe Weather Warnings" description="Immediate alerts for dangerous conditions" />
          <ToggleSwitch enabled={notifications.communityUpdates} onChange={v => setNotifications(n => ({...n, communityUpdates: v}))} label="Community Updates" description="Likes and comments on your reports" />
        </div>

        <div className="flex gap-2 border-t border-slate-200 dark:border-slate-700 pt-4">
          <button onClick={() => handleTestNotification('push')} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             Test Push
          </button>
          <button onClick={() => handleTestNotification('email')} className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
             Test Email
          </button>
        </div>
      </SettingsSection>

      {/* Location */}
      <SettingsSection title="Location" icon={<MapPin className="w-5 h-5" />}>
        <p className="text-sm text-slate-500 mb-4">WeatherVerse uses your location to show hyper-local weather data, real-time radar, and accurate forecasts.</p>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-3">
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">GPS Location Access</p>
            <p className={`text-sm font-medium mt-0.5 ${
              permissionStatus === 'granted' ? 'text-green-500' 
              : permissionStatus === 'denied' ? 'text-red-500' 
              : 'text-slate-400'
            }`}>
              {permissionStatus === 'granted' ? '✅ Access Granted' 
               : permissionStatus === 'denied' ? '❌ Access Denied' 
               : permissionStatus === 'requesting' ? '⏳ Requesting...'
               : '⚪ Not Requested'}
            </p>
          </div>
          <button
            onClick={requestLocation}
            disabled={permissionStatus === 'requesting'}
            className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Navigation className="w-4 h-4" />
            {permissionStatus === 'granted' ? 'Refresh' : 'Enable GPS'}
          </button>
        </div>
      </SettingsSection>

      {/* Privacy & Security */}
      <SettingsSection title="Privacy & Security" icon={<Shield className="w-5 h-5" />}>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer">
            <p className="font-medium text-slate-700 dark:text-slate-300">Privacy Policy</p>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer">
            <p className="font-medium text-slate-700 dark:text-slate-300">Terms of Service</p>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer">
            <p className="font-medium text-slate-700 dark:text-slate-300">Data & Storage</p>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </SettingsSection>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={handleSave} className={`flex-1 py-3 rounded-2xl font-semibold transition-all ${saved ? 'bg-green-500 text-white' : 'bg-primary-500 text-white hover:bg-primary-600'}`}>
          {saved ? '✅ Saved!' : <span className="flex items-center justify-center gap-2"><Save className="w-4 h-4" />Save Settings</span>}
        </button>
        {user && (
          <button onClick={handleLogout} className="flex-1 py-3 rounded-2xl font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 border border-red-200 dark:border-red-800">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Settings;

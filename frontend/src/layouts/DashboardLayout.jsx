import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';
import { 
  CloudSun, LayoutDashboard, Map, Activity, Compass, 
  Calendar, Users, Settings, LogOut, Bell, Sun, Moon,
  ChevronRight, User, Shield, X, Menu, Loader2
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', end: true },
    { to: '/dashboard/map', icon: <Map className="w-5 h-5" />, label: 'Live Radar' },
    { to: '/dashboard/health', icon: <Activity className="w-5 h-5" />, label: 'Health Center' },
    { to: '/dashboard/astronomy', icon: <Compass className="w-5 h-5" />, label: 'Astronomy' },
    { to: '/dashboard/journal', icon: <Calendar className="w-5 h-5" />, label: 'Weather Journal' },
    { to: '/dashboard/community', icon: <Users className="w-5 h-5" />, label: 'Community' },
  ];

  const Sidebar = ({ onClose }) => (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-slate-300 flex flex-col h-full z-20 flex-shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
        <NavLink to="/" className="flex items-center gap-2" onClick={onClose}>
          <CloudSun className="w-8 h-8 text-sky-400" />
          <span className="text-xl font-bold text-white">WeatherVerse</span>
        </NavLink>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Profile Panel */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Guest User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || 'Not logged in'}</p>
          </div>
          {user?.role === 'admin' && (
            <Shield className="w-4 h-4 text-amber-400 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Main Menu</p>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                isActive
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 font-semibold'
                  : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <NavLink
          to="/dashboard/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              isActive
                ? 'bg-sky-500 text-white'
                : 'text-slate-400 hover:bg-white/10 hover:text-white'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-indigo-950 overflow-hidden transition-colors duration-300">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64">
            <Sidebar onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/10 flex items-center justify-between px-4 md:px-6 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white leading-none">WeatherVerse AI</h2>
              <p className="text-xs text-slate-500 hidden sm:block">Real-time Weather Intelligence Platform</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* Profile */}
            <div className="flex items-center gap-3 ml-1 pl-3 border-l border-slate-200 dark:border-slate-700">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'G'}
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-slate-800 dark:text-white leading-none">{user?.name || 'Guest'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user?.role === 'admin' ? '⭐ Admin' : '🌤️ Pro Member'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-transparent">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Activity, AlertTriangle, ShieldCheck, Database, Settings, TrendingUp, Cloud, MessageCircle, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

// ── Demo Data ────────────────────────────────────────────────────────────────
const demoStats = {
  totalUsers: 1250,
  activeSessions: 142,
  communityReports: 890,
  journalEntries: 3200,
  systemHealth: '100%',
  apiLatency: '48ms',
  uptime: '99.97%',
};

const demoUsers = [
  { name: 'Alex Storm', email: 'alex@weatherverse.ai', role: 'admin', joined: '2026-01-12', avatar: 'https://i.pravatar.cc/40?img=1', status: 'Active' },
  { name: 'Maya Raindrop', email: 'maya@weatherverse.ai', role: 'user', joined: '2026-02-04', avatar: 'https://i.pravatar.cc/40?img=47', status: 'Active' },
  { name: 'Carlos Viento', email: 'carlos@weatherverse.ai', role: 'user', joined: '2026-03-18', avatar: 'https://i.pravatar.cc/40?img=12', status: 'Active' },
  { name: 'Priya Sunshin', email: 'priya@weatherverse.ai', role: 'user', joined: '2026-04-22', avatar: 'https://i.pravatar.cc/40?img=45', status: 'Active' },
  { name: 'James Cloudy', email: 'james@weatherverse.ai', role: 'user', joined: '2026-05-09', avatar: 'https://i.pravatar.cc/40?img=33', status: 'Inactive' },
];

const demoReports = [
  { id: 1, user: 'Maya Raindrop', type: 'Rain', location: 'Mumbai, IN', status: 'Approved', created: '2026-07-20' },
  { id: 2, user: 'Carlos Viento', type: 'Storm', location: 'Chicago, US', status: 'Approved', created: '2026-07-20' },
  { id: 3, user: 'James Cloudy', type: 'Fog', location: 'London, UK', status: 'Pending', created: '2026-07-19' },
  { id: 4, user: 'Priya Sunshin', type: 'Clear', location: 'Sydney, AU', status: 'Approved', created: '2026-07-19' },
  { id: 5, user: 'Alex Storm', type: 'Wildfire', location: 'Los Angeles, US', status: 'Flagged', created: '2026-07-18' },
];

const ActivityItem = ({ icon, text, time }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div className="mt-0.5 text-lg">{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-slate-700 dark:text-slate-300">{text}</p>
      <p className="text-xs text-slate-400 mt-0.5">{time}</p>
    </div>
  </div>
);

// ── Component ────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Admin Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 p-6 flex flex-col hidden md:flex flex-shrink-0">
        <div className="flex items-center gap-2 mb-10 text-white">
          <ShieldCheck className="w-8 h-8 text-indigo-500" />
          <span className="text-xl font-bold">Admin Console</span>
        </div>
        
        <nav className="space-y-1 flex-1">
          {[
            { id: 'overview', label: 'Overview', icon: <Activity className="w-5 h-5" /> },
            { id: 'users', label: 'User Management', icon: <Users className="w-5 h-5" /> },
            { id: 'reports', label: 'Moderation', icon: <AlertTriangle className="w-5 h-5" /> },
            { id: 'system', label: 'System Status', icon: <Database className="w-5 h-5" /> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                activeTab === item.id ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-800 pt-4 mt-auto space-y-1">
          <Link
            to="/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-sm"
          >
            <Cloud className="w-5 h-5" /> Back to App
          </Link>
        </div>
      </div>

      {/* Admin Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Admin Dashboard</h2>
              <p className="text-slate-500 mt-1">WeatherVerse AI Platform Management</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-600">All Systems Operational</span>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={demoStats.totalUsers.toLocaleString()} icon={<Users />} color="bg-blue-500" change="+12.5%" />
                <StatCard title="Active Sessions" value={demoStats.activeSessions} icon={<Activity />} color="bg-green-500" change="+3.2%" />
                <StatCard title="Community Reports" value={demoStats.communityReports.toLocaleString()} icon={<MessageCircle />} color="bg-purple-500" change="+8.1%" />
                <StatCard title="System Uptime" value={demoStats.uptime} icon={<ShieldCheck />} color="bg-indigo-500" change="Excellent" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Recent Activity</h3>
                  <ActivityItem icon="👤" text="New user registered: james@weatherverse.ai" time="2 minutes ago" />
                  <ActivityItem icon="🌧️" text="New community report: Heavy Rain in Mumbai" time="15 minutes ago" />
                  <ActivityItem icon="⚡" text="Storm alert posted for Chicago" time="32 minutes ago" />
                  <ActivityItem icon="📖" text="Journal entry created by Maya Raindrop" time="1 hour ago" />
                  <ActivityItem icon="✅" text="System backup completed successfully" time="3 hours ago" />
                  <ActivityItem icon="🔐" text="Admin login from alex@weatherverse.ai" time="5 hours ago" />
                </div>

                {/* Quick Stats */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Platform Metrics</h3>
                  {[
                    { label: 'Weather API Calls Today', value: '24,891', bar: 82 },
                    { label: 'Gemini AI Requests', value: '1,234', bar: 45 },
                    { label: 'Community Reports', value: '890', bar: 70 },
                    { label: 'Journal Entries', value: '3,200', bar: 60 },
                    { label: 'Map Views', value: '12,450', bar: 90 },
                  ].map(m => (
                    <div key={m.label} className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">{m.label}</span>
                        <span className="font-bold text-slate-800 dark:text-white">{m.value}</span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${m.bar}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">User Management</h3>
                <span className="text-sm text-slate-500">{demoUsers.length} users total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      {['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {demoUsers.map((user, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                            <span className="font-medium text-slate-800 dark:text-white">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{user.joined}</td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-xs font-semibold ${user.status === 'Active' ? 'text-green-600' : 'text-slate-400'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`} />
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-xs text-red-500 hover:underline">Suspend</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports / Moderation Tab */}
          {activeTab === 'reports' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Community Moderation</h3>
                <span className="text-sm text-red-500 font-semibold">1 Flagged Post</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      {['Report', 'User', 'Location', 'Status', 'Date', 'Actions'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {demoReports.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-full text-xs font-bold">{r.type}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{r.user}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{r.location}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            r.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : r.status === 'Flagged' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>{r.status}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{r.created}</td>
                        <td className="px-6 py-4 flex gap-3">
                          {r.status === 'Pending' && <button className="text-xs text-green-600 hover:underline font-semibold">Approve</button>}
                          {r.status === 'Flagged' && <button className="text-xs text-red-600 hover:underline font-semibold">Remove</button>}
                          <button className="text-xs text-slate-400 hover:underline">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'API Response Time', value: demoStats.apiLatency, status: 'Healthy', color: 'text-green-500 bg-green-100 dark:bg-green-900/30' },
                  { label: 'System Uptime', value: demoStats.uptime, status: 'Excellent', color: 'text-green-500 bg-green-100 dark:bg-green-900/30' },
                  { label: 'System Health', value: demoStats.systemHealth, status: 'All Green', color: 'text-green-500 bg-green-100 dark:bg-green-900/30' },
                ].map(s => (
                  <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-500 mb-1">{s.label}</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{s.value}</p>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.color}`}>{s.status}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Service Status</h3>
                {[
                  { name: 'Backend API', status: 'Operational' },
                  { name: 'MongoDB Database', status: 'Operational' },
                  { name: 'OpenWeatherMap API', status: 'Operational' },
                  { name: 'Gemini AI Service', status: 'Operational' },
                  { name: 'Cloudinary CDN', status: 'Operational' },
                  { name: 'Socket.io Real-time', status: 'Operational' },
                ].map(s => (
                  <div key={s.name} className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-semibold">{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, change }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 flex items-center justify-between shadow-sm border border-slate-100 dark:border-slate-800">
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h4 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h4>
      <p className="text-xs font-semibold text-green-600 mt-1 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" /> {change}
      </p>
    </div>
    <div className={`w-14 h-14 rounded-full ${color} text-white flex items-center justify-center shadow-lg`}>
      {icon}
    </div>
  </div>
);

export default AdminDashboard;

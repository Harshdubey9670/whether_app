import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import { Loader2 } from 'lucide-react';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LiveMap = lazy(() => import('./pages/LiveMap'));
const Community = lazy(() => import('./pages/Community'));
const WeatherJournal = lazy(() => import('./pages/WeatherJournal'));
const Astronomy = lazy(() => import('./pages/Astronomy'));
const HealthCenter = lazy(() => import('./pages/HealthCenter'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const Settings = lazy(() => import('./pages/Settings'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
    <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<LiveMap />} />
          <Route path="ai" element={<AIAssistant />} />
          <Route path="community" element={<Community />} />
          <Route path="journal" element={<WeatherJournal />} />
          <Route path="astronomy" element={<Astronomy />} />
          <Route path="health" element={<HealthCenter />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/admin" element={<AdminDashboard />} />

        {/* Catch-all Route for unknown paths like /features */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;

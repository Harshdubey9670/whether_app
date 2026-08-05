import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Community from './pages/Community';
import WeatherJournal from './pages/WeatherJournal';
import Astronomy from './pages/Astronomy';
import HealthCenter from './pages/HealthCenter';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';

import ForgotPassword from './pages/ForgotPassword';

function App() {
  return (
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
        <Route path="community" element={<Community />} />
        <Route path="journal" element={<WeatherJournal />} />
        <Route path="astronomy" element={<Astronomy />} />
        <Route path="health" element={<HealthCenter />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;

import axios from 'axios';

// In production, fallback to relative '/api' if not explicitly set (assumes same domain).
// In development, fallback to 'http://localhost:5001/api' (the port the backend runs on).
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // For sending cookies
});

// Auth Services
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

// Weather Services
export const getCurrentWeather = async (query) => {
  const response = await api.get(`/weather/current?q=${query}`);
  return response.data;
};

export const searchLocation = async (query) => {
  const response = await api.get(`/weather/search?q=${query}`);
  return response.data;
};

// AI Services
export const askAIAssistant = async (question, contextData, history = []) => {
  const response = await api.post('/ai/ask', { question, contextData, history });
  return response.data;
};

// Community Services
export const getCommunityReports = async () => {
  const response = await api.get('/community/reports');
  return response.data;
};

export const createCommunityReport = async (formData) => {
  const response = await api.post('/community/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const toggleLikeReport = async (reportId) => {
  const response = await api.post(`/community/reports/${reportId}/like`);
  return response.data;
};

export const addCommentToReport = async (reportId, text) => {
  const response = await api.post(`/community/reports/${reportId}/comments`, { text });
  return response.data;
};

// Journal Services
export const getJournalEntries = async () => {
  const response = await api.get('/journal');
  return response.data;
};

export const createJournalEntry = async (formData) => {
  const response = await api.post('/journal', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Notification Services
export const getVapidPublicKey = async () => {
  const response = await api.get('/notifications/vapid-public-key');
  return response.data.publicKey;
};

export const subscribePush = async (subscription) => {
  const response = await api.post('/notifications/subscribe', { subscription });
  return response.data;
};

export const updateNotificationPreferences = async (notifications) => {
  const response = await api.put('/notifications/preferences', { notifications });
  return response.data;
};

export const triggerTestNotification = async (type) => {
  const response = await api.post('/notifications/test', { type });
  return response.data;
};

export default api;

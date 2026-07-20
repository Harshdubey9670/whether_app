import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
export const askAIAssistant = async (question, contextData) => {
  const response = await api.post('/ai/ask', { question, contextData });
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

export default api;

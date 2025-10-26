// src/utils/api.js
// Purpose: Axios instance for all API calls with authentication

import axios from 'axios';

// API Configuration with fallback
const getApiUrl = () => {
  if (window.location.hostname !== 'localhost') {
    return process.env.REACT_APP_API_URL || 'https://conserve-backend.vercel.app/api';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API URL:', getApiUrl());
}

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or invalid, logout user
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
// src/utils/api.js - FIXED VERSION
import axios from 'axios';

// API Configuration
const getApiUrl = () => {
  // Production: Use environment variable
  if (window.location.hostname !== 'localhost') {
    return process.env.REACT_APP_API_URL || 'https://conserve-backend.vercel.app/api';
  }
  // Development: Use localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 seconds
  withCredentials: false // Set to false for Vercel
});

console.log('🔗 API URL:', getApiUrl());

// Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`📡 Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response || error);
    
    // If token expired or invalid, logout user
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized - clearing auth');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network Error - Backend might be down');
      // toast.error('Cannot connect to server. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
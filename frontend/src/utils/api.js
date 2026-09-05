import axios from 'axios';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (isLocalhost ? 'http://localhost:5000/api' : 'https://weathersense-628u.onrender.com/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('weathersense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration or global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear stale token (unless on login page)
      if (!window.location.pathname.includes('/login')) {
        // localStorage.removeItem('weathersense_token');
        // localStorage.removeItem('weathersense_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

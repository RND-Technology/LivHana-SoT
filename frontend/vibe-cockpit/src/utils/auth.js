// Tier-1 JWT Auth Helper for Voice Mode
import axios from 'axios';

// Get or generate a session JWT token
export const getSessionToken = () => {
  // In production, this would fetch from your auth service
  // For local dev, we'll use a placeholder that backend accepts
  const token = localStorage.getItem('livhana_session_token');
  if (token) return token;
  
  // Generate a temporary dev token (backend should validate properly in production)
  const devToken = 'dev_token_' + Date.now();
  localStorage.setItem('livhana_session_token', devToken);
  return devToken;
};

// Configure axios defaults
export const configureAxiosAuth = () => {
  const token = getSessionToken();
  
  // Set default auth header
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  // Add request interceptor to ensure auth on all requests
  axios.interceptors.request.use(
    (config) => {
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${getSessionToken()}`;
      }
      // Add request ID for tracing
      config.headers['x-request-id'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Add response interceptor for auth errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear invalid token
        localStorage.removeItem('livhana_session_token');
        // In production, redirect to login
        console.error('Authentication failed - please refresh');
      }
      return Promise.reject(error);
    }
  );
};

// Initialize auth on app load
configureAxiosAuth();

/**
 * Autonomous Agent API Client
 * Handles all API calls to the reasoning-gateway's autonomous endpoints
 */

import axios from 'axios';
import { getSessionToken } from './auth';

const AUTONOMOUS_API_BASE = import.meta.env.VITE_AUTONOMOUS_API_BASE || 'http://localhost:4002/api/autonomous';

// Create axios instance with default config
const autonomousApi = axios.create({
  baseURL: AUTONOMOUS_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Add auth token to all requests
autonomousApi.interceptors.request.use(
  (config) => {
    const token = getSessionToken();
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['x-request-id'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
autonomousApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed - clearing token');
      localStorage.removeItem('livhana_session_token');
    }
    return Promise.reject(error);
  }
);

// API Methods
export const autonomousAPI = {
  // Execute a new autonomous task
  executeTask: async (task, context = {}, requireApproval = true) => {
    const response = await autonomousApi.post('/execute', {
      task,
      context,
      requireApproval,
    });
    return response.data;
  },

  // Get task status and results
  getTask: async (taskId) => {
    const response = await autonomousApi.get(`/tasks/${taskId}`);
    return response.data;
  },

  // Get all tasks (with optional filters)
  getTasks: async (params = {}) => {
    const response = await autonomousApi.get('/tasks', { params });
    return response.data;
  },

  // Cancel a task
  cancelTask: async (taskId) => {
    const response = await autonomousApi.delete(`/tasks/${taskId}`);
    return response.data;
  },

  // Approve a task
  approveTask: async (taskId, reason = '') => {
    const response = await autonomousApi.post(`/approve/${taskId}`, {
      approved: true,
      reason,
    });
    return response.data;
  },

  // Reject a task
  rejectTask: async (taskId, reason = '') => {
    const response = await autonomousApi.post(`/approve/${taskId}`, {
      approved: false,
      reason,
    });
    return response.data;
  },

  // Rollback a completed task
  rollbackTask: async (taskId, reason = '') => {
    const response = await autonomousApi.post(`/rollback/${taskId}`, { reason });
    return response.data;
  },

  // Get agent capabilities
  getCapabilities: async () => {
    const response = await autonomousApi.get('/capabilities');
    return response.data;
  },

  // Get learnings
  getLearnings: async (params = {}) => {
    const response = await autonomousApi.get('/learnings', { params });
    return response.data;
  },

  // Get agent health
  getHealth: async () => {
    const response = await autonomousApi.get('/health');
    return response.data;
  },

  // Create SSE connection for real-time updates
  createEventSource: (taskId) => {
    const token = getSessionToken();
    // Note: EventSource doesn't support custom headers, so we need to use a query param
    // or rely on cookies. For now, we'll document this limitation.
    const url = `${AUTONOMOUS_API_BASE}/stream/${taskId}`;
    console.warn('EventSource does not support Authorization headers. Ensure backend accepts token via alternative method.');
    return new EventSource(url);
  },
};

export default autonomousAPI;
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02

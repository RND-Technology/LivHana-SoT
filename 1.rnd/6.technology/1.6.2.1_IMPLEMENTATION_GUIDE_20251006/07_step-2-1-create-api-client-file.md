### Step 2.1: Create API Client File

**File:** `src/api/livhanaApiClient.js`

```javascript
/**
 * Unified LivHana API Client
 * Single source of truth for ALL backend communication
 */
import axios from 'axios';
import { getSessionToken } from '../utils/auth';

// Service endpoints
const SERVICES = {
  integration: import.meta.env.VITE_INTEGRATION_API || 'http://localhost:3005',
  cannabis: import.meta.env.VITE_CANNABIS_API || 'http://localhost:3003',
  payment: import.meta.env.VITE_PAYMENT_API || 'http://localhost:3004',
  voice: import.meta.env.VITE_VOICE_API || 'http://localhost:4001',
  reasoning: import.meta.env.VITE_REASONING_API || 'http://localhost:4002',
  product: import.meta.env.VITE_PRODUCT_API || 'http://localhost:3002',
};

// Create axios instance
const client = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
client.interceptors.request.use(
  (config) => {
    const token = getSessionToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['x-request-id'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Authentication failed - clearing token');
      localStorage.removeItem('livhana_session_token');
    }

    const errorMessage = error.response?.data?.error || error.message;
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Helper to build URL with service
const buildUrl = (service, path) => {
  const baseUrl = SERVICES[service];
  return `${baseUrl}${path}`;
};

// Unified API methods
export const api = {
  // BigQuery endpoints (integration-service)
  bigquery: {
    dashboard: () => client.get(buildUrl('integration', '/api/bigquery/dashboard')),
    historical: () => client.get(buildUrl('integration', '/api/bigquery/historical')),
    products: () => client.get(buildUrl('integration', '/api/bigquery/products')),
    compliance: () => client.get(buildUrl('integration', '/api/compliance/metrics')),
  },

  // Health checks
  health: {
    integration: () => client.get(buildUrl('integration', '/health')),
    cannabis: () => client.get(buildUrl('cannabis', '/health')),
    payment: () => client.get(buildUrl('payment', '/health')),
    voice: () => client.get(buildUrl('voice', '/health')),
    reasoning: () => client.get(buildUrl('reasoning', '/health')),
    product: () => client.get(buildUrl('product', '/health')),

    // Get all health statuses in parallel
    all: async () => {
      const services = ['integration', 'cannabis', 'payment', 'voice', 'reasoning', 'product'];
      const results = await Promise.allSettled(
        services.map(service => api.health[service]())
      );

      return services.reduce((acc, service, idx) => {
        acc[service] = results[idx].status === 'fulfilled'
          ? { status: 'healthy', ...results[idx].value }
          : { status: 'unhealthy', error: results[idx].reason.message };
        return acc;
      }, {});
    },
  },

  // Reasoning endpoints
  reasoning: {
    enqueue: (data) => client.post(buildUrl('reasoning', '/api/reasoning/enqueue'), data),
    result: (jobId) => client.get(buildUrl('reasoning', `/api/reasoning/result/${jobId}`)),
    stream: (jobId) => {
      // EventSource for SSE
      const url = buildUrl('reasoning', `/api/reasoning/stream/${jobId}`);
      return new EventSource(url);
    },
  },

  // Voice endpoints
  voice: {
    synthesize: (data) => client.post(buildUrl('voice', '/api/elevenlabs/synthesize'), data, {
      responseType: 'blob',
      headers: { Accept: 'audio/mpeg' }
    }),
    healthVoiceMode: () => client.get(buildUrl('voice', '/health/voice-mode')),
  },

  // Autonomous agent endpoints
  autonomous: {
    execute: (task, context, requireApproval) =>
      client.post(buildUrl('reasoning', '/api/autonomous/execute'), {
        task, context, requireApproval
      }),
    getTask: (taskId) => client.get(buildUrl('reasoning', `/api/autonomous/tasks/${taskId}`)),
    getTasks: (params) => client.get(buildUrl('reasoning', '/api/autonomous/tasks'), { params }),
    cancelTask: (taskId) => client.delete(buildUrl('reasoning', `/api/autonomous/tasks/${taskId}`)),
    approve: (taskId, reason) =>
      client.post(buildUrl('reasoning', `/api/autonomous/approve/${taskId}`), {
        approved: true, reason
      }),
    reject: (taskId, reason) =>
      client.post(buildUrl('reasoning', `/api/autonomous/approve/${taskId}`), {
        approved: false, reason
      }),
  },
};

export default api;
```

### PHASE 2: UNIFY API CLIENT (HIGH PRIORITY)

**Create:** `src/api/livhanaApiClient.js`

**Consolidate:**

```javascript
// ONE axios instance for ALL services
// ONE error handling pattern
// ONE authentication interceptor
// ONE request/response logging

const services = {
  integration: 'http://localhost:3005',
  cannabis: 'http://localhost:3003',
  payment: 'http://localhost:3004',
  voice: 'http://localhost:4001',
  reasoning: 'http://localhost:4002',
  product: 'http://localhost:3002',
};

// Unified methods
export const api = {
  bigquery: {
    dashboard: () => get('/api/bigquery/dashboard'),
    historical: () => get('/api/bigquery/historical'),
    products: () => get('/api/bigquery/products'),
  },
  health: {
    service: (name) => get('/health', { service: services[name] }),
    all: () => Promise.all(...)
  },
  reasoning: {
    enqueue: (data) => post('/api/reasoning/enqueue', data),
    stream: (jobId) => eventSource(`/api/reasoning/stream/${jobId}`),
  },
  // ... etc
};
```

**Refactor These Files:**

- `ExecutiveDashboard.jsx` - Replace 6 fetch functions with api calls
- `SquareLiveCockpit.jsx` - Replace 3 fetch functions
- `UltimateCockpit.jsx` - Replace inline fetch
- `Dashboard.jsx` - Replace fetch calls
- Delete `autonomousApi.js` or merge into unified client

**Impact:**

- Code reduction: ~400 lines across components
- Bundle: -15KB (deduplication)
- Error handling: Consistent across app
- Testing: ONE place to mock API calls

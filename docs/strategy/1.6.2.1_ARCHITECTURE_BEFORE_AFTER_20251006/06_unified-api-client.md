### Unified API Client

```
┌──────────────────────────────────────────────────────────────────┐
│              src/api/livhanaApiClient.js                          │
│                  ONE CLIENT FOR ALL                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Axios Instance:                                                  │
│  ├─ Request interceptor (auth token)                             │
│  ├─ Response interceptor (error handling)                        │
│  └─ Timeout: 30s                                                 │
│                                                                   │
│  Service Endpoints:                                               │
│  ├─ integration: http://localhost:3005                           │
│  ├─ cannabis: http://localhost:3003                              │
│  ├─ payment: http://localhost:3004                               │
│  ├─ voice: http://localhost:4001                                 │
│  ├─ reasoning: http://localhost:4002                             │
│  └─ product: http://localhost:3002                               │
│                                                                   │
│  Unified Methods:                                                 │
│  ├─ api.bigquery.dashboard()  → Single call                      │
│  ├─ api.bigquery.historical() → Single call                      │
│  ├─ api.bigquery.products()   → Single call                      │
│  ├─ api.health.all()          → Parallel health checks           │
│  ├─ api.reasoning.enqueue()   → Job submission                   │
│  ├─ api.voice.synthesize()    → Voice TTS                        │
│  └─ api.autonomous.*          → Agent operations                 │
│                                                                   │
│  RESULT: ALL components use same API                             │
│          Unified error handling                                   │
│          Consistent authentication                                │
│          Easy to mock for testing                                │
└──────────────────────────────────────────────────────────────────┘
```

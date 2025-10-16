### Request Flow Analysis

**Integration Service** (`/backend/integration-service/src/index.js`)

```
Client Request
  ↓
CORS Middleware (line 18-21)
  ↓
Body Parsing (lines 23-24)
  ↓
[Auth Middleware - BYPASSED in dev] (lines 42-44)
  ↓
Route Handler
  ↓
BigQuery Cache Check (line 242)
  ↓
[CACHE MISS] → BigQuery Query (2-5s) ← BOTTLENECK
  ↓
[CACHE HIT] → Return cached (< 10ms)
  ↓
Response
```

**Measured Bottlenecks:**

1. **BigQuery cold start**: 2-5 seconds (lines 209-238)
2. **No request coalescing**: Multiple clients hit cache miss simultaneously
3. **Synchronous sync jobs**: Square/Lightspeed sync blocks worker (300s timeout, line 20)

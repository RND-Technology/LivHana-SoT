#### Critical Issue #2: Cache Strategy

**File**: `/backend/integration-service/src/bigquery_live.js` (Lines 31-39)

```javascript
const cache = {
  dashboard: null,
  historical: null,
  products: null,
  expiresAt: 0,
  lastError: null,
  lastRefresh: null,
  mode: bigQueryEnabled ? 'live' : 'mock'
};
```

**Problem**: In-memory cache, not shared across instances

**Fix**: Move to Redis with smarter TTL

```javascript
// Redis cache with stale-while-revalidate pattern
const CACHE_TTL_MS = 30_000;      // 30s fresh
const STALE_TTL_MS = 300_000;     // 5min stale-ok
const BACKGROUND_REFRESH_MS = 20_000; // Refresh at 20s
```

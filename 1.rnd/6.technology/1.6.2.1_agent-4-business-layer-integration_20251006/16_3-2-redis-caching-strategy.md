### 3.2 Redis Caching Strategy

**Redis Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    REDIS CACHING LAYER                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Application │         │     Redis    │         │   BigQuery   │
│   Services   │◀───────▶│    Cache     │◀───────▶│   Database   │
│              │         │              │         │              │
└──────────────┘         └──────────────┘         └──────────────┘
       │                         │                         │
       │ Read request           │ Check cache             │
       │                        │ Hit → return            │ Full scan
       │                        │ Miss → query DB         │ Aggregate
       │                        │ Cache result (TTL)      │
       ▼                        ▼                         ▼
┌─────────────────────────────────────────────────────────────┐
│  CACHE KEYS:                                                  │
│  - bigquery:dashboard (TTL: 30s)                             │
│  - bigquery:historical (TTL: 30s)                            │
│  - bigquery:products (TTL: 30s)                              │
│  - age_verification:{customerId} (TTL: 365 days)             │
│  - customer_profile:{customerId} (TTL: 5 minutes)            │
│  - reasoning_job:{jobId} (TTL: 24 hours)                     │
└─────────────────────────────────────────────────────────────┘
```

**Redis Configuration:**

**File:** `/backend/common/queue/index.js`

```javascript
export const createRedisConfig = (overrides = {}) => {
  const baseConfig = {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_USE_TLS === 'true' ? {} : undefined,
    db: Number.isFinite(Number(process.env.REDIS_DB)) ? Number(process.env.REDIS_DB) : undefined,
  };

  return {
    connection: {
      ...baseConfig,
      ...overrides,
    },
  };
};
```

**Environment Variables:**

```bash
REDIS_HOST=127.0.0.1 # or Redis Cloud host
REDIS_PORT=6379
REDIS_USERNAME= # optional, for Redis ACLs
REDIS_PASSWORD= # optional, for auth
REDIS_USE_TLS=false # true for production Redis Cloud
REDIS_DB=0 # database number (0-15)
```

**Cache Usage Patterns:**

**1. BigQuery Data Cache:**

```javascript
// integration-service/src/bigquery_live.js:31-39
const cache = {
  dashboard: null,
  historical: null,
  products: null,
  expiresAt: 0,
  lastError: null,
  lastRefresh: null,
  mode: bigQueryEnabled ? 'live' : 'mock'
};

// TTL: 30 seconds (configurable via BQ_CACHE_TTL_MS)
const CACHE_TTL_MS = Number(process.env.BQ_CACHE_TTL_MS || 30_000);

async function ensureFreshCache() {
  if (!cache.lastRefresh || Date.now() > cache.expiresAt) {
    await refreshCache(); // Re-query BigQuery
  }
}
```

**2. Age Verification Cache:**

```javascript
// age_verification_store.js:65-72
await this.redis.setex(
  `age_verification:${customerId}`,
  365 * 24 * 60 * 60, // 1 year in seconds
  JSON.stringify(verification)
);

// On subsequent request:
const cached = await this.redis.get(`age_verification:${customerId}`);
if (cached) {
  return JSON.parse(cached); // Instant response
}
```

**3. Queue Job Cache (BullMQ):**

```javascript
// reasoning-gateway/src/index.js:27-32
const reasoningQueue = new Queue(queueName, queueOptions);
const queueEvents = new QueueEvents(queueName, queueOptions);

// Jobs stored in Redis with metadata:
// - Job ID
// - Job data (prompt, context)
// - Status (waiting, active, completed, failed)
// - Result (stored for removeOnComplete count)
// - Timestamps (added, started, finished)

// Config:
const REDIS_REMOVE_ON_COMPLETE = Number(process.env.REDIS_REMOVE_ON_COMPLETE ?? 100);
const REDIS_REMOVE_ON_FAIL = Number(process.env.REDIS_REMOVE_ON_FAIL ?? 1000);
```

**Cache Invalidation Strategies:**

| Cache Type | TTL | Invalidation Trigger |
|------------|-----|---------------------|
| BigQuery dashboard | 30s | Time-based expiry |
| BigQuery products | 30s | Time-based expiry |
| Age verification | 365 days | Manual delete (GDPR) |
| Customer profile | 5 min | Profile update event |
| Reasoning jobs | 24h | Job completion + removeOnComplete |

**Cache Key Patterns:**

```
bigquery:dashboard -> Dashboard metrics (revenue, transactions, customers)
bigquery:historical -> Historical charts (daily, monthly aggregates)
bigquery:products -> Product catalog
age_verification:{customerId} -> Age verification record
customer_profile:{customerId} -> Customer memory profile
reasoning_job:{jobId} -> Job status + result
bull:{queueName}:{jobId} -> BullMQ job data (internal)
```

**Performance Benefits:**

1. **BigQuery Cost Reduction:** 30s cache = 2 queries/min instead of 100s/min
2. **Response Time:** Cached dashboard: ~10ms vs uncached: ~800ms
3. **Age Verification:** Instant validation for returning customers
4. **Job Status Polling:** Frontend can poll job status without DB hits

**Redis Cluster Considerations:**

```
Production: Use Redis Cloud with replication + persistence
- Enable RDB snapshots (backup)
- Enable AOF (append-only file) for durability
- Multi-AZ replication for HA
- TLS encryption (REDIS_USE_TLS=true)
- ACLs for access control (REDIS_USERNAME + REDIS_PASSWORD)
```

---

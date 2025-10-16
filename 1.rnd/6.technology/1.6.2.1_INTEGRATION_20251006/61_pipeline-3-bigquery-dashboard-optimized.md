#### Pipeline 3: BigQuery → Dashboard (Optimized)

```
BigQuery
  ↓ (optimized SQL)
  - Dashboard: Single aggregation query (1 row)
  - Historical: Daily/monthly with GROUP BY
  - Products: Filter available items only
  - All queries: <500ms target
  ↓ (cache check)
Redis Cache (30s TTL)
  ↓ (hit: serve immediately)
  ↓ (miss: fetch and cache)
Integration Service API
  ↓ (JSON response)
Frontend Dashboard / Mobile App / API Consumers
```

**Performance:**

- Cache hit: <10ms
- Cache miss: 200-400ms
- Background revalidation: Stale-while-revalidate pattern
- Error rate: 0%

---

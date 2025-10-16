#### Critical Issue #1: Full Table Scans

```javascript
// LINE 78-81: Inefficient 180-day query
SELECT * FROM `${PROJECT_ID}.${DATASET}.${PAYMENTS_TABLE}`
WHERE TIMESTAMP(created_at) >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 180 DAY)
ORDER BY created_at DESC
LIMIT 1000
```

**Problem**:

- Fetches 1000 rows, then filters in Node.js (lines 88-101)
- No table partitioning specified
- Full table scan on every cache miss

**Impact**: ~2-5s query time, ~$0.05-0.10 per query at scale

#### 1. BigQuery Query Optimization

**File**: `/backend/integration-service/src/bigquery_live.js`
**Impact**: 60% cost reduction, 80% latency improvement
**Effort**: 8 hours

**Changes:**

- Push aggregations to BigQuery (lines 69-127)
- Remove client-side filtering (lines 88-101)
- Add query result caching in Redis

**Expected Result**:

- Query time: 2-5s → 200-400ms
- Cost: $9/month → $3.60/month

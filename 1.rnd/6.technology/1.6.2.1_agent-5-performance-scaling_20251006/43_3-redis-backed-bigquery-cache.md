#### 3. Redis-Backed BigQuery Cache

**File**: `/backend/integration-service/src/bigquery_live.js`
**Impact**: Horizontal scaling enabled
**Effort**: 6 hours

**Changes:**

- Replace in-memory cache (lines 31-39)
- Implement stale-while-revalidate pattern
- Add cache warming on startup

**Expected Result**:

- Cache hit rate: 60% → 90%
- Multi-instance ready

#### 4. Async Sync Jobs

**File**: `/backend/integration-service/src/square-sync-scheduler.js`
**Impact**: Remove 5-minute event loop blocking
**Effort**: 2 hours

**Changes:**

- Replace execSync with spawn (lines 17-21)
- Add job status tracking in Redis
- Implement failure retry logic

**Expected Result**:

- No more request timeouts during sync
- Worker can handle 100+ req/s

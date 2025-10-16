#### 7. CDN for Static Assets

**Infrastructure**
**Impact**: 50-80% bandwidth cost reduction
**Effort**: 3 days

**Implementation:**

- Configure CloudFlare or Fastly
- Update frontend build to output versioned assets
- Set aggressive cache headers (1 year TTL)
- Implement cache invalidation on deploy

**Expected Result**:

- Global latency: 500ms → 50ms
- Origin traffic: -70%

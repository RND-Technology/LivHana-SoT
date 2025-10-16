### 1. API Client Pattern (HIGH PRIORITY)

**Problem:**

- 3 different API patterns (fetch, axios, autonomousApi)
- 12+ separate data fetching functions across components
- No unified error handling
- No unified authentication

**Solution:**
Create `src/api/livhanaApiClient.js` - ONE client for ALL services

**Impact:**

- Code reduction: ~400 lines
- Bundle reduction: 15KB (deduplication)
- Maintenance: ONE place to update API calls
- Testing: ONE place to mock

### Integration Tests

**Square Sync:** `/backend/integration-service/tests/integration/square-sync.test.js`

- ✅ API connection & authentication
- ✅ Payment data fetch with pagination
- ✅ Catalog sync with variations
- ✅ BigQuery insertion
- ✅ Error handling (401, 429, network errors)
- ✅ Idempotency (duplicate handling)
- ✅ Large dataset handling (>1000 records)

**Lightspeed Sync:** `/backend/integration-service/tests/integration/lightspeed-sync.test.js`

- ✅ OAuth2 refresh token flow
- ✅ Transaction history fetch
- ✅ Product catalog sync
- ✅ BigQuery insertion
- ✅ Error handling (expired token, rate limit)
- ✅ Mock mode fallback
- ✅ Incremental sync (not full refresh)

**Test Coverage:** ~80% (comprehensive integration coverage)

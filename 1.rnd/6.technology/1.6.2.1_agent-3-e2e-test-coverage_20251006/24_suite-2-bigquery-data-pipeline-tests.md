#### Suite 2: BigQuery Data Pipeline Tests

**File:** `tests/e2e/integration/bigquery-pipeline.spec.ts`

**Purpose:** Verify BigQuery cache, data integrity, and fallback mechanisms

**Test Cases:**

```typescript
test.describe('BigQuery Data Pipeline', () => {

  test('Cache initializes on first request', async ({ page, request }) => {
    // Setup: Restart integration service
    // Action: Make first /api/bigquery/dashboard request
    // Assert: Request completes within 60 seconds
    // Assert: Response contains valid metrics
    // Assert: Cache timestamp is recent
  });

  test('Cache serves data on subsequent requests (< 100ms)', async ({ page, request }) => {
    // Setup: Warm up cache
    // Action: Make 10 rapid /api/bigquery/dashboard requests
    // Assert: All complete in < 100ms each
    // Assert: Data is consistent across requests
    // Assert: No BigQuery quota consumed (cached)
  });

  test('Cache expires after TTL and refreshes', async ({ page, request }) => {
    // Setup: Set cache TTL to 5 seconds (test config)
    // Action: Wait 6 seconds
    // Action: Make request
    // Assert: Cache refresh triggered
    // Assert: New data returned
    // Assert: lastRefresh timestamp updated
  });

  test('Degraded mode when BigQuery errors', async ({ page, request }) => {
    // Setup: Mock BigQuery API error
    // Action: Request dashboard data
    // Assert: Returns last cached data
    // Assert: mode = "degraded" in response
    // Assert: Error logged but not thrown
  });

  test('Mock mode when BigQuery not configured', async ({ page, request }) => {
    // Setup: Unset GOOGLE_APPLICATION_CREDENTIALS
    // Action: Request dashboard data
    // Assert: Returns mock data (zeros)
    // Assert: mode = "mock" in response
    // Assert: UI shows disclaimer
  });

  test('Historical data query performance', async ({ page, request }) => {
    // Setup: Request 180 days of historical data
    // Action: Call /api/bigquery/historical
    // Assert: Completes within 10 seconds
    // Assert: Returns daily and monthly aggregates
    // Assert: Data sorted by date
  });
});
```

---

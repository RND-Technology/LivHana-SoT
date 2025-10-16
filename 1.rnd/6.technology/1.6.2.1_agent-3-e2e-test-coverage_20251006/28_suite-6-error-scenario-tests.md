#### Suite 6: Error Scenario Tests

**File:** `tests/e2e/error-scenarios/network-failures.spec.ts`

**Purpose:** Verify graceful degradation when network or APIs fail

**Test Cases:**

```typescript
test.describe('Network Failure Resilience', () => {

  test('Handle API timeout gracefully', async ({ page, context }) => {
    // Setup: Mock slow API (60+ second response)
    // Action: Load dashboard
    // Assert: Shows loading state
    // Assert: Timeout after 30 seconds
    // Assert: Error message: "Request timed out"
    // Assert: Retry button available
  });

  test('Handle connection refused (service down)', async ({ page, context }) => {
    // Setup: Block all requests to reasoning-gateway
    // Action: Load Autonomous Dashboard
    // Assert: Error banner displayed
    // Assert: "Service unavailable" message
    // Assert: Page doesn't crash
    // Assert: Other features still work
  });

  test('Handle partial response (truncated JSON)', async ({ page, context }) => {
    // Setup: Mock incomplete API response
    // Action: Load Square Products
    // Assert: Error caught and logged
    // Assert: Fallback to empty state
    // Assert: User can retry
  });

  test('Handle intermittent network (offline/online)', async ({ page, context }) => {
    // Action: Load page while online
    // Action: Simulate offline mode
    // Assert: Offline banner appears
    // Action: Restore connection
    // Assert: Data refreshes automatically
    // Assert: Offline banner disappears
  });
});
```

---

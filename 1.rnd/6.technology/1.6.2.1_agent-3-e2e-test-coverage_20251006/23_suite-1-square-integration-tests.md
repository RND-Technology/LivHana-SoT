#### Suite 1: Square Integration Tests

**File:** `tests/e2e/integration/square-integration.spec.ts`

**Purpose:** Verify complete Square API integration lifecycle

**Test Cases:**

```typescript
test.describe('Square API Integration - Full Lifecycle', () => {

  test('Fetch product catalog from Square API (Live Mode)', async ({ page, request }) => {
    // Setup: Ensure Square API credentials are configured
    // Action: Call /api/square/catalog
    // Assert: Returns real products with valid schema
    // Assert: Products have prices, SKUs, categories
    // Assert: Response time < 2 seconds
  });

  test('Handle Square API rate limiting gracefully', async ({ page, request }) => {
    // Setup: Mock rate limit response (429)
    // Action: Make multiple rapid requests
    // Assert: Frontend shows rate limit error
    // Assert: Retry logic activates after delay
    // Assert: Eventually succeeds
  });

  test('Fallback to mock data when Square API is down', async ({ page, request }) => {
    // Setup: Block requests to Square API
    // Action: Load Square Products page
    // Assert: Shows mock data instead of error
    // Assert: UI indicates "Demo Mode" or "Limited Data"
    // Assert: No crash or blank screen
  });

  test('Sync Square inventory updates in real-time', async ({ page, request }) => {
    // Setup: Load Square Live Cockpit
    // Action: Trigger manual sync via API
    // Assert: Loading indicator appears
    // Assert: Data refreshes after sync completes
    // Assert: New products appear in catalog
  });

  test('Display Square transaction history with filtering', async ({ page }) => {
    // Setup: Load Square Live Cockpit
    // Action: Navigate to transactions tab
    // Action: Apply date range filter
    // Assert: Transactions filtered correctly
    // Assert: Total revenue recalculates
    // Assert: Pagination works for 100+ transactions
  });
});
```

---

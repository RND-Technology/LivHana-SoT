#### Suite 3: Membership System Flow Tests

**File:** `tests/e2e/integration/membership-flow.spec.ts`

**Purpose:** Verify complete membership lifecycle from signup to cancellation

**Test Cases:**

```typescript
test.describe('Membership System - Complete User Journey', () => {

  test('Create Bronze membership subscription', async ({ page, request }) => {
    // Setup: Test customer with payment method
    // Action: POST /api/memberships/subscribe (Bronze tier)
    // Assert: Subscription created in BigQuery
    // Assert: KAJA payment gateway charged $47
    // Assert: Welcome email sent
    // Assert: Returns membership ID and details
  });

  test('Upgrade Bronze to Silver membership', async ({ page, request }) => {
    // Setup: Customer with active Bronze membership
    // Action: PUT /api/memberships/:customerId/upgrade (Silver)
    // Assert: Prorated charge calculated correctly
    // Assert: Discount percent updated to 20%
    // Assert: Benefits list updated in UI
  });

  test('Apply membership discount at checkout', async ({ page, request }) => {
    // Setup: Customer with Gold membership (30% discount)
    // Action: Add $100 worth of products to cart
    // Action: GET /api/memberships/discount/:customerId?subtotal=100
    // Assert: Returns $30 discount
    // Assert: Final total = $70
  });

  test('Cancel membership and stop billing', async ({ page, request }) => {
    // Setup: Customer with active membership
    // Action: PUT /api/memberships/:customerId/cancel
    // Assert: KAJA subscription cancelled
    // Assert: Status changed to "cancelled"
    // Assert: Cancel date recorded
    // Assert: No future charges processed
  });

  test('Membership stats dashboard for admin', async ({ page, request }) => {
    // Setup: Admin user logged in
    // Action: GET /api/memberships/stats
    // Assert: Returns MRR (Monthly Recurring Revenue)
    // Assert: Shows active member count by tier
    // Assert: Calculates churn rate
    // Assert: Displays lifetime value by tier
  });
});
```

---

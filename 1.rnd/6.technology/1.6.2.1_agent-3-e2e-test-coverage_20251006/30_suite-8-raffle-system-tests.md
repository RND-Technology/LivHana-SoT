#### Suite 8: Raffle System Tests

**File:** `tests/e2e/integration/raffle-system.spec.ts`

**Purpose:** Verify raffle creation, ticket purchase, and drawing execution

**Test Cases:**

```typescript
test.describe('Raffle System - Complete Flow', () => {

  test('Create new raffle (admin)', async ({ page, request }) => {
    // Setup: Admin user
    // Action: POST /api/raffles
    // Payload: { name: "Gold Nug Raffle", prize: "1oz Gold", ticketPrice: 10, maxTickets: 100 }
    // Assert: Raffle created with unique ID
    // Assert: Status = "active"
  });

  test('Purchase raffle tickets', async ({ page, request }) => {
    // Setup: Active raffle
    // Action: POST /api/raffles/:raffleId/purchase
    // Payload: { customerId, quantity: 5 }
    // Assert: Payment processed ($50)
    // Assert: 5 tickets assigned to customer
    // Assert: Remaining tickets updated
  });

  test('Conduct raffle drawing', async ({ page, request }) => {
    // Setup: Raffle with sold tickets
    // Action: POST /api/raffles/:raffleId/draw
    // Assert: Winner selected randomly
    // Assert: Winner notification sent
    // Assert: Raffle status = "completed"
  });

  test('Cancel raffle and process refunds', async ({ page, request }) => {
    // Setup: Active raffle with purchased tickets
    // Action: DELETE /api/raffles/:raffleId/cancel
    // Assert: All customers refunded
    // Assert: Raffle status = "cancelled"
  });
});
```

---

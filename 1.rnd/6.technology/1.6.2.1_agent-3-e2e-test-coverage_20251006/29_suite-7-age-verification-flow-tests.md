#### Suite 7: Age Verification Flow Tests

**File:** `tests/e2e/integration/age-verification.spec.ts`

**Purpose:** Verify age verification submission and compliance workflow

**Test Cases:**

```typescript
test.describe('Age Verification System (Compliance Critical)', () => {

  test('Submit age verification with valid ID', async ({ page, request }) => {
    // Setup: Customer without verification
    // Action: POST /api/age-verification/verify
    // Payload: { customerId, idType: "drivers_license", idNumber: "...", dob: "1990-01-01" }
    // Assert: Verification created with status "pending"
    // Assert: Returns verification ID
  });

  test('Check verification status', async ({ page, request }) => {
    // Setup: Pending verification
    // Action: GET /api/age-verification/status/:customerId
    // Assert: Returns current status
    // Assert: Shows estimated review time
  });

  test('Resubmit verification after rejection', async ({ page, request }) => {
    // Setup: Rejected verification
    // Action: POST /api/age-verification/resubmit
    // Payload: Updated ID information
    // Assert: New verification created
    // Assert: Previous rejection reason cleared
  });

  test('Block checkout if verification pending', async ({ page }) => {
    // Setup: Customer with pending verification
    // Action: Attempt to checkout
    // Assert: Checkout blocked
    // Assert: Message: "Age verification required"
  });
});
```

---

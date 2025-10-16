### 2. Check Verification Status

Check if a customer has been verified.

**Endpoint:** `GET /api/age-verification/status/:customerId`

**URL Parameters:**

- `customerId`: Customer identifier (string, required)

**Success Response (200):**

```json
{
  "success": true,
  "verified": true,
  "verificationId": "av_1704067200000_a1b2c3d4e5f6g7h8",
  "verifiedAt": "2025-01-01T00:00:00.000Z",
  "expiresAt": "2026-01-01T00:00:00.000Z",
  "expired": false,
  "age": 33,
  "state": "TX",
  "method": "full_verification"
}
```

**Not Found Response (404):**

```json
{
  "success": false,
  "verified": false,
  "message": "No verification found for this customer",
  "customerId": "customer-123"
}
```

**Expired Verification:**

```json
{
  "success": true,
  "verified": false,
  "verificationId": "av_1704067200000_a1b2c3d4e5f6g7h8",
  "verifiedAt": "2023-01-01T00:00:00.000Z",
  "expiresAt": "2024-01-01T00:00:00.000Z",
  "expired": true,
  "age": 33,
  "state": "TX",
  "method": "full_verification"
}
```

---

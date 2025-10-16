### 1. Verify Age

Verify a customer's age and identity.

**Endpoint:** `POST /api/age-verification/verify`

**Request Body:**

```json
{
  "customerId": "unique-customer-id",
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-15",
  "idNumberLast4": "1234",
  "state": "TX"
}
```

**Field Requirements:**

- `customerId`: Unique identifier for the customer (string, required)
- `fullName`: First and last name, minimum 2 words (string, required)
- `dateOfBirth`: Format YYYY-MM-DD, must be 21+ years old (string, required)
- `idNumberLast4`: Exactly 4 digits (last 4 of government ID) (string, required)
- `state`: Valid 2-letter US state code (string, required)

**Success Response (200):**

```json
{
  "success": true,
  "verificationId": "av_1704067200000_a1b2c3d4e5f6g7h8",
  "verified": true,
  "method": "full_verification",
  "reason": "All checks passed",
  "age": 33,
  "verifiedAt": "2025-01-01T00:00:00.000Z",
  "expiresAt": "2026-01-01T00:00:00.000Z",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "processingTime": 45
}
```

**Failure Response (400):**

```json
{
  "success": false,
  "verificationId": "av_1704067200000_a1b2c3d4e5f6g7h8",
  "verified": false,
  "method": "age_check",
  "reason": "Must be at least 21 years old",
  "field": "dateOfBirth",
  "age": 18,
  "timestamp": "2025-01-01T00:00:00.000Z",
  "processingTime": 32
}
```

**Rate Limit Response (429):**

```json
{
  "success": false,
  "error": "Too many verification attempts",
  "message": "You have exceeded the maximum number of verification attempts (3 per 24 hours). Please try again later.",
  "attempts": 3,
  "maxAttempts": 3,
  "resetAt": "2025-01-02T00:00:00.000Z"
}
```

**Missing Fields Response (400):**

```json
{
  "success": false,
  "error": "Missing required fields: dateOfBirth, state",
  "missing": ["dateOfBirth", "state"]
}
```

---

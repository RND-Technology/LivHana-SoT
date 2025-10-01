# Age Verification API Documentation

## Overview

Internal age verification system that replaces Veriff for $80K/month revenue recovery.

**Base URL:** `http://localhost:3005` (development) or your production URL

**Authentication:** All endpoints require JWT authentication via `Authorization: Bearer <token>` header

## Endpoints

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

### 3. Resubmit Verification

Resubmit verification for a customer (clears cache and performs new verification).

**Endpoint:** `POST /api/age-verification/resubmit`

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

**Response:** Same as `/verify` endpoint

**Use Case:** When customer data changes or they need to reverify

---

### 4. Get Statistics (Admin)

Get age verification statistics for the admin dashboard.

**Endpoint:** `GET /api/age-verification/statistics?days=30`

**Query Parameters:**
- `days`: Number of days to include in statistics (integer, optional, default: 30)

**Success Response (200):**
```json
{
  "success": true,
  "statistics": {
    "totalAttempts": 1247,
    "successfulVerifications": 1089,
    "failedVerifications": 158,
    "successRate": "87.33",
    "period": "30 days"
  },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### 5. Health Check

Check if the age verification service is healthy.

**Endpoint:** `GET /health/age-verification`

**Authentication:** None required (public endpoint)

**Success Response (200):**
```json
{
  "status": "healthy",
  "service": "age-verification",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "storage": "bigquery"
}
```

---

## Verification Methods

The system uses different verification methods depending on the scenario:

1. **`cache`** - Customer was previously verified and cache is still valid (fast, < 10ms)
2. **`full_verification`** - All validation checks passed (typical, 30-100ms)
3. **`input_validation`** - Failed basic input validation (name, state, ID format)
4. **`age_check`** - Failed age requirement (under 21)
5. **`id_validation`** - Failed ID number format validation
6. **`rate_limit`** - Too many attempts (blocked)

---

## Rate Limiting

**Limit:** 3 verification attempts per customer per 24 hours

**Scope:** Per `customerId`

**Reset:** 24 hours from first attempt

**Bypass:** Successful verifications do not count against the limit

---

## Verification Expiration

**Duration:** 1 year from verification date

**Auto-renewal:** No - customer must reverify after expiration

**Grace period:** None - expired verifications are immediately invalid

---

## Security Features

### 1. Data Encryption
- Sensitive data (ID numbers) encrypted with AES-256-GCM
- 32-byte encryption key required
- Per-record initialization vectors (IV)

### 2. Privacy
- Only last 4 digits of government ID collected
- Customer ID hashed for database lookups
- Personal data encrypted at rest

### 3. Audit Logging
- All verification attempts logged
- IP address and user agent captured
- 7-year retention for compliance

### 4. Authentication
- JWT required for all API endpoints
- Token validation on every request
- User information logged for audit trail

---

## Compliance

### TX DSHS CHP #690
- 7-year record retention (automatic)
- Audit trail for all verifications
- Age verification before product sale

### CDFA PDP
- Customer identity verification
- Transaction monitoring
- Record keeping requirements

---

## Integration Examples

### Example 1: Checkout Flow

```javascript
// Check if customer is verified before checkout
async function checkoutFlow(customerId) {
  try {
    const response = await fetch(
      `http://localhost:3005/api/age-verification/status/${customerId}`,
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (data.verified && !data.expired) {
      // Proceed with checkout
      return proceedToCheckout();
    } else {
      // Redirect to age verification
      return redirectToAgeVerification();
    }
  } catch (error) {
    console.error('Verification check failed:', error);
    return showError();
  }
}
```

### Example 2: Age Verification Form

```javascript
// Submit age verification form
async function submitAgeVerification(formData) {
  try {
    const response = await fetch(
      'http://localhost:3005/api/age-verification/verify',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: formData.customerId,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth, // YYYY-MM-DD
          idNumberLast4: formData.idLast4,
          state: formData.state
        })
      }
    );

    const data = await response.json();

    if (data.success && data.verified) {
      // Success - redirect to checkout
      showSuccessMessage('Age verified successfully!');
      return redirectToCheckout();
    } else if (response.status === 429) {
      // Rate limited
      showError(`Too many attempts. Try again after ${new Date(data.resetAt).toLocaleString()}`);
    } else {
      // Failed verification
      showError(data.reason || 'Verification failed');
    }
  } catch (error) {
    console.error('Verification failed:', error);
    showError('Unable to verify age. Please try again.');
  }
}
```

### Example 3: Admin Dashboard

```javascript
// Get verification statistics for admin dashboard
async function loadVerificationStats() {
  try {
    const response = await fetch(
      'http://localhost:3005/api/age-verification/statistics?days=30',
      {
        headers: {
          'Authorization': `Bearer ${adminJwtToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (data.success) {
      updateDashboard({
        totalAttempts: data.statistics.totalAttempts,
        successRate: data.statistics.successRate + '%',
        failed: data.statistics.failedVerifications
      });
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}
```

---

## Error Handling

### Common Error Codes

- **400 Bad Request** - Invalid input data or validation failure
- **401 Unauthorized** - Missing or invalid JWT token
- **404 Not Found** - Customer verification not found
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server-side error

### Retry Strategy

For transient errors (500, network issues):
1. Wait 1 second
2. Retry up to 3 times
3. Use exponential backoff

For client errors (400, 401, 404):
- Do not retry
- Fix the request and try again

For rate limits (429):
- Wait until `resetAt` timestamp
- Or wait 24 hours from first attempt

---

## Testing

### Mock Mode

For development/testing, set `BIGQUERY_ENABLED=false` to use in-memory mock storage.

### Test Customer Data

**Valid Test Customer:**
```json
{
  "customerId": "test-customer-001",
  "fullName": "Jane Test",
  "dateOfBirth": "1990-01-01",
  "idNumberLast4": "1234",
  "state": "TX"
}
```

**Underage Test Customer:**
```json
{
  "customerId": "test-customer-002",
  "fullName": "Young User",
  "dateOfBirth": "2010-01-01",
  "idNumberLast4": "5678",
  "state": "CA"
}
```

---

## Monitoring

### Key Metrics

1. **Success Rate** - Target: > 95%
2. **Processing Time** - Target: < 100ms (p95)
3. **Cache Hit Rate** - Target: > 80%
4. **Rate Limit Hits** - Monitor for abuse

### Alerts

- Success rate drops below 90%
- Processing time > 500ms for 5+ consecutive requests
- > 10 rate limit hits per hour (possible abuse)

---

## Support

For issues or questions:
- Check service health: `GET /health/age-verification`
- Review logs: Integration service logs tagged with `age-verification`
- Contact: System administrator

---

## Revenue Impact

**CRITICAL:** This system directly enables $80K/month in revenue by replacing the failed Veriff integration.

**Expected Recovery:**
- Week 1: 25% ($20K)
- Week 2: 50% ($40K)
- Week 3: 75% ($60K)
- Week 4: 100% ($80K)

**Success Criteria:**
- Zero customer-facing errors
- < 100ms average response time
- 95%+ verification success rate for valid customers

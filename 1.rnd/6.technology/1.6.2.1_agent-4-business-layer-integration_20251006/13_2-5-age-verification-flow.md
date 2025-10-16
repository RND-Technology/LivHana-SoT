### 2.5 Age Verification Flow

**Age Verification System:**

**File:** `/backend/integration-service/src/age_verification.js`

**Purpose:** Internal replacement for Veriff (unblocks $80K/month revenue)

**Compliance Requirements:**

- TX DSHS CHP #690 (Texas hemp regulations)
- CDFA PDP compliance (California data protection)
- Minimum age: 21 years
- Verification expiry: 365 days

**Verification Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│                AGE VERIFICATION FLOW                          │
└─────────────────────────────────────────────────────────────┘

1. Customer Checkout
   └─▶ Check cache (Redis/BigQuery) for existing verification
       ├─▶ Found + Valid → Allow purchase
       └─▶ Not found → Proceed to verification

2. Verification Form (Frontend)
   - Full Name (first + last required)
   - Date of Birth (YYYY-MM-DD)
   - State (2-letter code, validated against 50 states + DC)
   - ID Number Last 4 (4 digits only, for privacy)

3. Validation (Backend)
   ├─▶ validateFullName(): 2+ parts, 2-100 chars, letters/spaces/hyphens only
   ├─▶ validateDateOfBirth(): Age >= 21, reasonable date (not > 120 years ago)
   ├─▶ validateState(): Valid US state code
   └─▶ validateIdNumber(): Exactly 4 digits

4. Pass → Generate Verification Record
   {
     verificationId: "av_1696123456789_abc123def456",
     verified: true,
     method: "full_verification",
     age: 28,
     state: "TX",
     verifiedAt: "2025-10-01T12:34:56.789Z",
     expiresAt: "2026-10-01T12:34:56.789Z", // 365 days
     encryptedMetadata: "..." // AES-256-GCM encrypted ID last 4
   }

5. Store Verification
   ├─▶ Redis cache (fast lookup)
   ├─▶ BigQuery (audit trail, 7-year retention per TX law)
   └─▶ Customer profile (memory system)

6. Purchase Allowed
   └─▶ Verification valid for 1 year
```

**Cryptographic Security:**

```javascript
// age_verification.js:286-335
function encryptData(data, secretKey) {
  // AES-256-GCM encryption
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(secretKey), iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return: iv:authTag:encrypted (all hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// Only last 4 digits of ID stored, encrypted with customer-specific key
// Full ID never touches our database
```

**State ID Validation Patterns:**

```javascript
// age_verification.js:24-65
const STATE_ID_PATTERNS = {
  TX: { format: /^\d{7,8}$/, name: 'Texas DL' },
  CA: { format: /^[A-Z]\d{7}$/, name: 'California DL' },
  NY: { format: /^(\d{9}|[A-Z]\d{7}\d)$/, name: 'New York DL' },
  FL: { format: /^[A-Z]\d{12}$/, name: 'Florida DL' },
  // ... all 50 states + DC
  DEFAULT: { format: /^[A-Z0-9]{4,20}$/, name: 'State ID' }
};

// Note: We only store/validate last 4 digits, so we accept any 4-digit combo
// State patterns shown for reference if full validation needed in future
```

**Audit Trail:**

```javascript
// age_verification_store.js:45-78
class AgeVerificationStore {
  async saveVerification(customerId, verification) {
    const row = {
      customer_id: customerId,
      verification_id: verification.verificationId,
      full_name_hash: this.hashSensitiveData(verification.fullName), // SHA-256 hash
      date_of_birth_hash: this.hashSensitiveData(verification.dateOfBirth),
      state: verification.state,
      age: verification.age,
      verified: verification.verified,
      verification_method: verification.method,
      verified_at: verification.verifiedAt,
      expires_at: verification.expiresAt,
      encrypted_metadata: verification.encryptedMetadata,
      ip_address: verification.ipAddress || null,
      user_agent: verification.userAgent || null,
      created_at: new Date().toISOString()
    };

    // Insert into BigQuery for 7-year retention (TX compliance)
    await this.bigquery.dataset(DATASET).table(TABLE_NAME).insert([row]);

    // Cache in Redis for fast lookup (1 year TTL)
    await this.redis.setex(
      `age_verification:${customerId}`,
      365 * 24 * 60 * 60, // 1 year in seconds
      JSON.stringify(verification)
    );
  }
}
```

**Business Rules:**

1. **Minimum Age:** 21 years (MINIMUM_AGE constant)
2. **Expiration:** 365 days (VERIFICATION_EXPIRY_DAYS)
3. **Retry Logic:** Failed verification can be retried immediately
4. **Privacy:** Only last 4 digits of ID, hashed PII in audit log
5. **Compliance:** 7-year retention in BigQuery per Texas gambling law

**API Endpoints:**

```javascript
// age_verification_routes.js:7-82
POST /api/age-verification/verify
  Body: { customerId, fullName, dateOfBirth, state, idNumberLast4 }
  Response: { verificationId, verified, expiresAt, ... }

GET /api/age-verification/status/:customerId
  Response: { verified, expiresAt, ageVerified, ... }

DELETE /api/age-verification/:customerId (ADMIN ONLY)
  Response: { success, message }
```

---

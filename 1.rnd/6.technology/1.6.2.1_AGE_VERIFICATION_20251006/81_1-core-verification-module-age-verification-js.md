### 1. Core Verification Module (`age_verification.js`)

**Responsibilities:**

- Validate customer age (21+ requirement)
- Validate ID number format (state-specific patterns)
- Validate full name (first + last required)
- Validate state code (50 states + DC)
- Encrypt sensitive data (AES-256-GCM)
- Hash customer IDs (SHA-256)
- Generate verification IDs
- Calculate expiration dates

**Key Functions:**

- `performVerification()` - Main verification logic
- `validateDateOfBirth()` - Age validation
- `validateIdNumber()` - ID format validation
- `validateFullName()` - Name validation
- `validateState()` - State code validation
- `encryptData()` / `decryptData()` - Data encryption
- `hashCustomerId()` - Customer ID hashing

**Performance:**

- Age calculation: < 1ms
- Validation checks: < 5ms total
- Encryption: < 10ms
- Full verification: < 30ms (without cache)

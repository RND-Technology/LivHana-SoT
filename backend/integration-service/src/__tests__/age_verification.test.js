/**
 * Age Verification Unit Tests
 *
 * COMPLIANCE CRITICAL: TX DSHS CHP #690
 * Coverage Target: 90%+
 *
 * Test Coverage:
 * - 21+ enforcement
 * - ID verification flow
 * - 365-day expiry check
 * - Cryptographic data encryption (AES-256-GCM)
 * - Last 4 digits only storage (privacy)
 * - Redis caching (365-day TTL)
 * - Error handling
 * - Edge cases
 */

const {
  performVerification,
  validateDateOfBirth,
  validateIdNumber,
  validateFullName,
  validateState,
  calculateAge,
  encryptData,
  decryptData,
  hashCustomerId,
  generateVerificationId,
  isVerificationExpired,
  MINIMUM_AGE,
  VERIFICATION_EXPIRY_DAYS,
  STATE_ID_PATTERNS,
} = require('../age_verification');

describe('Age Verification System', () => {

  // ============================================================================
  // 1. AGE CALCULATION TESTS (TX DSHS CHP #690 - 21+ ENFORCEMENT)
  // ============================================================================

  describe('calculateAge', () => {
    beforeEach(() => {
      // Mock current date to 2025-10-01
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should correctly calculate age for 21+ customer', () => {
      const dob = '2000-01-01'; // 25 years old
      const age = calculateAge(dob);
      expect(age).toBe(25);
    });

    test('should correctly calculate age for exactly 21 years old', () => {
      const dob = '2004-10-01'; // Exactly 21 today
      const age = calculateAge(dob);
      expect(age).toBe(21);
    });

    test('should not count birthday if not yet occurred this year', () => {
      const dob = '2004-10-02'; // Birthday tomorrow, still 20
      const age = calculateAge(dob);
      expect(age).toBe(20);
    });

    test('should handle leap year birthdays correctly', () => {
      const dob = '2004-02-29'; // Leap year birthday
      const age = calculateAge(dob);
      expect(age).toBe(21);
    });
  });

  // ============================================================================
  // 2. DATE OF BIRTH VALIDATION TESTS (21+ ENFORCEMENT)
  // ============================================================================

  describe('validateDateOfBirth', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should accept valid DOB for 21+ customer', () => {
      const result = validateDateOfBirth('2000-01-01');
      expect(result.valid).toBe(true);
      expect(result.age).toBe(25);
      expect(result.reason).toBe('Age verified');
    });

    test('should reject DOB for under 21 customer', () => {
      const result = validateDateOfBirth('2010-01-01'); // 15 years old
      expect(result.valid).toBe(false);
      expect(result.age).toBe(15);
      expect(result.reason).toBe(`Must be at least ${MINIMUM_AGE} years old`);
    });

    test('should accept exactly 21 years old', () => {
      const result = validateDateOfBirth('2004-10-01');
      expect(result.valid).toBe(true);
      expect(result.age).toBe(21);
    });

    test('should reject missing DOB', () => {
      const result = validateDateOfBirth(null);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Date of birth is required');
    });

    test('should reject invalid date format', () => {
      const result = validateDateOfBirth('01/01/2000');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid date format. Use YYYY-MM-DD');
    });

    test('should reject invalid date', () => {
      const result = validateDateOfBirth('2000-13-45');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid date');
    });

    test('should reject future date', () => {
      const result = validateDateOfBirth('2030-01-01');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Date of birth cannot be in the future');
    });

    test('should reject unreasonably old date (120+ years)', () => {
      const result = validateDateOfBirth('1800-01-01');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid date of birth');
    });

    test('should reject non-string DOB', () => {
      const result = validateDateOfBirth(12345);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Date of birth is required');
    });
  });

  // ============================================================================
  // 3. ID NUMBER VALIDATION TESTS (LAST 4 DIGITS - PRIVACY)
  // ============================================================================

  describe('validateIdNumber', () => {
    test('should accept valid last 4 digits', () => {
      const result = validateIdNumber('1234', 'TX');
      expect(result.valid).toBe(true);
      expect(result.state).toBe('TX');
    });

    test('should reject non-4-digit ID number', () => {
      const result = validateIdNumber('123', 'TX');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('ID number must be exactly 4 digits (last 4 of ID)');
    });

    test('should reject ID number with letters', () => {
      const result = validateIdNumber('12AB', 'TX');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('ID number must be exactly 4 digits (last 4 of ID)');
    });

    test('should reject missing ID number', () => {
      const result = validateIdNumber(null, 'TX');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('ID number is required');
    });

    test('should reject empty ID number', () => {
      const result = validateIdNumber('', 'TX');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('ID number is required');
    });

    test('should reject invalid state code', () => {
      const result = validateIdNumber('1234', 'X');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Valid 2-letter state code is required');
    });

    test('should handle lowercase state code', () => {
      const result = validateIdNumber('1234', 'tx');
      expect(result.valid).toBe(true);
      expect(result.state).toBe('TX');
    });

    test('should accept all digits 0-9', () => {
      const result = validateIdNumber('0000', 'CA');
      expect(result.valid).toBe(true);
    });

    test('should use DEFAULT pattern for states without explicit pattern', () => {
      const result = validateIdNumber('1234', 'WY'); // Wyoming not in explicit patterns
      expect(result.valid).toBe(true);
      expect(result.statePattern).toBe(STATE_ID_PATTERNS.DEFAULT);
    });
  });

  // ============================================================================
  // 4. FULL NAME VALIDATION TESTS
  // ============================================================================

  describe('validateFullName', () => {
    test('should accept valid full name', () => {
      const result = validateFullName('John Doe');
      expect(result.valid).toBe(true);
      expect(result.name).toBe('John Doe');
      expect(result.nameParts).toEqual(['John', 'Doe']);
    });

    test('should accept name with middle name', () => {
      const result = validateFullName('John Michael Doe');
      expect(result.valid).toBe(true);
      expect(result.nameParts).toEqual(['John', 'Michael', 'Doe']);
    });

    test('should accept hyphenated names', () => {
      const result = validateFullName('Mary-Jane Smith');
      expect(result.valid).toBe(true);
    });

    test('should accept names with apostrophes', () => {
      const result = validateFullName("O'Brien McDonald");
      expect(result.valid).toBe(true);
    });

    test('should reject single name', () => {
      const result = validateFullName('John');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Full name must include first and last name');
    });

    test('should reject too short name', () => {
      const result = validateFullName('A');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Full name is too short');
    });

    test('should reject too long name', () => {
      const longName = 'A'.repeat(101);
      const result = validateFullName(longName);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Full name is too long');
    });

    test('should reject name with numbers', () => {
      const result = validateFullName('John123 Doe');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Full name contains invalid characters');
    });

    test('should reject name with special characters', () => {
      const result = validateFullName('John@#$ Doe');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Full name contains invalid characters');
    });

    test('should reject missing name', () => {
      const result = validateFullName(null);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Full name is required');
    });

    test('should handle extra whitespace', () => {
      const result = validateFullName('  John   Doe  ');
      expect(result.valid).toBe(true);
      expect(result.name).toBe('John   Doe');
    });
  });

  // ============================================================================
  // 5. STATE CODE VALIDATION TESTS
  // ============================================================================

  describe('validateState', () => {
    test('should accept valid state code', () => {
      const result = validateState('TX');
      expect(result.valid).toBe(true);
      expect(result.state).toBe('TX');
    });

    test('should accept lowercase state code', () => {
      const result = validateState('ca');
      expect(result.valid).toBe(true);
      expect(result.state).toBe('CA');
    });

    test('should accept DC (District of Columbia)', () => {
      const result = validateState('DC');
      expect(result.valid).toBe(true);
    });

    test('should reject invalid state code', () => {
      const result = validateState('XX');
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid state code');
    });

    test('should reject missing state', () => {
      const result = validateState(null);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('State is required');
    });

    test('should accept all 50 states', () => {
      const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

      states.forEach(state => {
        const result = validateState(state);
        expect(result.valid).toBe(true);
      });
    });
  });

  // ============================================================================
  // 6. CRYPTOGRAPHIC ENCRYPTION TESTS (AES-256-GCM)
  // ============================================================================

  describe('encryptData and decryptData', () => {
    const secretKey = 'a'.repeat(32); // 32-byte key

    test('should encrypt and decrypt data correctly', () => {
      const originalData = 'Sensitive customer data';
      const encrypted = encryptData(originalData, secretKey);
      const decrypted = decryptData(encrypted, secretKey);

      expect(encrypted).not.toBe(originalData);
      expect(decrypted).toBe(originalData);
    });

    test('should encrypt ID number last 4 digits', () => {
      const idData = JSON.stringify({ idNumberLast4: '1234' });
      const encrypted = encryptData(idData, secretKey);
      const decrypted = decryptData(encrypted, secretKey);
      const parsed = JSON.parse(decrypted);

      expect(parsed.idNumberLast4).toBe('1234');
    });

    test('should produce different encrypted output each time (random IV)', () => {
      const data = 'Test data';
      const encrypted1 = encryptData(data, secretKey);
      const encrypted2 = encryptData(data, secretKey);

      expect(encrypted1).not.toBe(encrypted2);
    });

    test('should include IV, auth tag, and encrypted data', () => {
      const encrypted = encryptData('Test', secretKey);
      const parts = encrypted.split(':');

      expect(parts).toHaveLength(3);
      expect(parts[0].length).toBe(32); // IV: 16 bytes hex
      expect(parts[1].length).toBe(32); // Auth tag: 16 bytes hex
      expect(parts[2].length).toBeGreaterThan(0); // Encrypted data
    });

    test('should reject invalid encryption key length', () => {
      expect(() => encryptData('data', 'short')).toThrow('Encryption key must be exactly 32 bytes');
    });

    test('should reject invalid decryption key length', () => {
      expect(() => decryptData('data', 'short')).toThrow('Encryption key must be exactly 32 bytes');
    });

    test('should reject tampered encrypted data', () => {
      const encrypted = encryptData('Test', secretKey);
      const tampered = encrypted + 'x';

      expect(() => decryptData(tampered, secretKey)).toThrow();
    });

    test('should reject invalid encrypted data format', () => {
      expect(() => decryptData('invalid:format', secretKey)).toThrow('Invalid encrypted data format');
    });

    test('should reject decryption with wrong key', () => {
      const encrypted = encryptData('Test', secretKey);
      const wrongKey = 'b'.repeat(32);

      expect(() => decryptData(encrypted, wrongKey)).toThrow();
    });
  });

  // ============================================================================
  // 7. CUSTOMER ID HASHING TESTS
  // ============================================================================

  describe('hashCustomerId', () => {
    test('should generate SHA-256 hash', () => {
      const hash = hashCustomerId('customer123');
      expect(hash).toHaveLength(64); // SHA-256 = 64 hex chars
      expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
    });

    test('should generate consistent hash for same input', () => {
      const hash1 = hashCustomerId('customer123');
      const hash2 = hashCustomerId('customer123');
      expect(hash1).toBe(hash2);
    });

    test('should generate different hashes for different inputs', () => {
      const hash1 = hashCustomerId('customer123');
      const hash2 = hashCustomerId('customer456');
      expect(hash1).not.toBe(hash2);
    });
  });

  // ============================================================================
  // 8. VERIFICATION ID GENERATION TESTS
  // ============================================================================

  describe('generateVerificationId', () => {
    test('should generate unique verification ID', () => {
      const id1 = generateVerificationId();
      const id2 = generateVerificationId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^av_\d+_[a-f0-9]{16}$/);
    });

    test('should start with av_ prefix', () => {
      const id = generateVerificationId();
      expect(id.startsWith('av_')).toBe(true);
    });

    test('should contain timestamp and random bytes', () => {
      const id = generateVerificationId();
      const parts = id.split('_');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toBe('av');
      expect(parts[1]).toMatch(/^\d+$/);
      expect(parts[2]).toMatch(/^[a-f0-9]{16}$/);
    });
  });

  // ============================================================================
  // 9. VERIFICATION EXPIRY TESTS (365-DAY CHECK)
  // ============================================================================

  describe('isVerificationExpired', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should return true for expired verification', () => {
      const expiredDate = new Date('2024-09-30').toISOString();
      expect(isVerificationExpired(expiredDate)).toBe(true);
    });

    test('should return false for valid verification', () => {
      const futureDate = new Date('2026-10-01').toISOString();
      expect(isVerificationExpired(futureDate)).toBe(false);
    });

    test('should return true for missing expiry date', () => {
      expect(isVerificationExpired(null)).toBe(true);
    });

    test('should return false for today (not yet expired)', () => {
      const today = new Date('2025-10-01').toISOString();
      expect(isVerificationExpired(today)).toBe(false);
    });

    test('should handle 365-day expiry correctly', () => {
      const verifiedDate = new Date('2024-10-01');
      const expiryDate = new Date(verifiedDate);
      expiryDate.setDate(expiryDate.getDate() + VERIFICATION_EXPIRY_DAYS);

      expect(isVerificationExpired(expiryDate.toISOString())).toBe(false);
    });
  });

  // ============================================================================
  // 10. FULL VERIFICATION FLOW TESTS (INTEGRATION)
  // ============================================================================

  describe('performVerification', () => {
    const validData = {
      customerId: 'cust_123',
      fullName: 'John Doe',
      dateOfBirth: '2000-01-01',
      idNumberLast4: '1234',
      state: 'TX',
    };

    const encryptionKey = 'a'.repeat(32);

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should successfully verify valid customer', async () => {
      const result = await performVerification(validData, { encryptionKey });

      expect(result.verified).toBe(true);
      expect(result.method).toBe('full_verification');
      expect(result.reason).toBe('All checks passed');
      expect(result.age).toBe(25);
      expect(result.state).toBe('TX');
      expect(result.verificationId).toMatch(/^av_/);
      expect(result.verifiedAt).toBeDefined();
      expect(result.expiresAt).toBeDefined();
      expect(result.encryptedMetadata).toBeDefined();
    });

    test('should reject invalid name', async () => {
      const invalidData = { ...validData, fullName: 'John' };
      const result = await performVerification(invalidData);

      expect(result.verified).toBe(false);
      expect(result.field).toBe('fullName');
    });

    test('should reject under 21 customer', async () => {
      const invalidData = { ...validData, dateOfBirth: '2010-01-01' };
      const result = await performVerification(invalidData);

      expect(result.verified).toBe(false);
      expect(result.method).toBe('age_check');
      expect(result.field).toBe('dateOfBirth');
      expect(result.age).toBe(15);
    });

    test('should reject invalid state', async () => {
      const invalidData = { ...validData, state: 'XX' };
      const result = await performVerification(invalidData);

      expect(result.verified).toBe(false);
      expect(result.field).toBe('state');
    });

    test('should reject invalid ID number', async () => {
      const invalidData = { ...validData, idNumberLast4: '123' };
      const result = await performVerification(invalidData);

      expect(result.verified).toBe(false);
      expect(result.field).toBe('idNumberLast4');
    });

    test('should set expiry to 365 days from now', async () => {
      const result = await performVerification(validData);

      const verifiedAt = new Date(result.verifiedAt);
      const expiresAt = new Date(result.expiresAt);
      const daysDiff = Math.round((expiresAt - verifiedAt) / (1000 * 60 * 60 * 24));

      expect(daysDiff).toBe(VERIFICATION_EXPIRY_DAYS);
    });

    test('should include processing time', async () => {
      const result = await performVerification(validData);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    test('should work without encryption key', async () => {
      const result = await performVerification(validData);

      expect(result.verified).toBe(true);
      expect(result.encryptedMetadata).toBeNull();
    });

    test('should check cache if checkCache function provided', async () => {
      const cachedVerification = {
        verificationId: 'av_cached_123',
        verified: true,
        expired: false,
        verifiedAt: new Date('2025-01-01').toISOString(),
        expiresAt: new Date('2026-01-01').toISOString(),
      };

      const checkCache = jest.fn().mockResolvedValue(cachedVerification);
      const result = await performVerification(validData, { checkCache });

      expect(checkCache).toHaveBeenCalledWith('cust_123');
      expect(result.verified).toBe(true);
      expect(result.method).toBe('cache');
      expect(result.verificationId).toBe('av_cached_123');
    });

    test('should continue verification if cache check fails', async () => {
      const checkCache = jest.fn().mockRejectedValue(new Error('Redis connection failed'));
      const result = await performVerification(validData, { checkCache, encryptionKey });

      expect(result.verified).toBe(true);
      expect(result.method).toBe('full_verification');
    });

    test('should not use expired cached verification', async () => {
      const expiredCache = {
        verificationId: 'av_old_123',
        verified: true,
        expired: true,
      };

      const checkCache = jest.fn().mockResolvedValue(expiredCache);
      const result = await performVerification(validData, { checkCache, encryptionKey });

      expect(result.method).toBe('full_verification');
      expect(result.verificationId).not.toBe('av_old_123');
    });

    test('should encrypt metadata with ID last 4 and verification ID', async () => {
      const result = await performVerification(validData, { encryptionKey });

      expect(result.encryptedMetadata).toBeDefined();
      const decrypted = decryptData(result.encryptedMetadata, encryptionKey);
      const metadata = JSON.parse(decrypted);

      expect(metadata.idNumberLast4).toBe('1234');
      expect(metadata.verificationId).toBe(result.verificationId);
      expect(metadata.verifiedAt).toBe(result.verifiedAt);
    });

    test('should handle all validation failures gracefully', async () => {
      const invalidData = {
        customerId: 'cust_123',
        fullName: 'X',
        dateOfBirth: 'invalid',
        idNumberLast4: '123',
        state: 'XX',
      };

      const result = await performVerification(invalidData);
      expect(result.verified).toBe(false);
      expect(result.field).toBeDefined();
      expect(result.reason).toBeDefined();
    });

    test('should handle encryption failure gracefully', async () => {
      // Mock the crypto module to throw an error during encryption
      require('../age_verification');
      const originalCreateCipheriv = require('crypto').createCipheriv;

      // Temporarily replace createCipheriv to throw error
      require('crypto').createCipheriv = jest.fn(() => {
        throw new Error('Crypto service unavailable');
      });

      // Verification should still succeed even if encryption fails
      const result = await performVerification(validData, { encryptionKey });

      expect(result.verified).toBe(true);
      expect(result.encryptedMetadata).toBeNull();

      // Restore original function
      require('crypto').createCipheriv = originalCreateCipheriv;
    });
  });

  // ============================================================================
  // 11. CONSTANTS VALIDATION TESTS
  // ============================================================================

  describe('Module Constants', () => {
    test('MINIMUM_AGE should be 21', () => {
      expect(MINIMUM_AGE).toBe(21);
    });

    test('VERIFICATION_EXPIRY_DAYS should be 365', () => {
      expect(VERIFICATION_EXPIRY_DAYS).toBe(365);
    });

    test('STATE_ID_PATTERNS should include major states', () => {
      expect(STATE_ID_PATTERNS.TX).toBeDefined();
      expect(STATE_ID_PATTERNS.CA).toBeDefined();
      expect(STATE_ID_PATTERNS.NY).toBeDefined();
      expect(STATE_ID_PATTERNS.FL).toBeDefined();
      expect(STATE_ID_PATTERNS.DEFAULT).toBeDefined();
    });

    test('TX pattern should validate 7-8 digit license', () => {
      expect(STATE_ID_PATTERNS.TX.format.test('1234567')).toBe(true);
      expect(STATE_ID_PATTERNS.TX.format.test('12345678')).toBe(true);
      expect(STATE_ID_PATTERNS.TX.format.test('123456')).toBe(false);
    });

    test('CA pattern should validate letter + 7 digits', () => {
      expect(STATE_ID_PATTERNS.CA.format.test('A1234567')).toBe(true);
      expect(STATE_ID_PATTERNS.CA.format.test('1234567')).toBe(false);
    });
  });

  // ============================================================================
  // 12. EDGE CASES AND ERROR HANDLING TESTS
  // ============================================================================

  describe('Edge Cases and Error Handling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-10-01'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should handle exactly 21 years old on birthday', () => {
      const result = validateDateOfBirth('2004-10-01');
      expect(result.valid).toBe(true);
      expect(result.age).toBe(21);
    });

    test('should reject 20 years 364 days old (one day before 21)', () => {
      const result = validateDateOfBirth('2004-10-02');
      expect(result.valid).toBe(false);
      expect(result.age).toBe(20);
    });

    test('should handle leap year edge case', () => {
      jest.setSystemTime(new Date('2024-02-29'));
      const result = validateDateOfBirth('2003-02-28');
      expect(result.valid).toBe(true);
      expect(result.age).toBe(21);
    });

    test('should handle end of month birthdays', () => {
      jest.setSystemTime(new Date('2025-03-31'));
      const result = validateDateOfBirth('2004-03-31');
      expect(result.valid).toBe(true);
      expect(result.age).toBe(21);
    });

    test('should handle December to January age calculation', () => {
      jest.setSystemTime(new Date('2025-01-15'));
      const result = validateDateOfBirth('2003-12-20');
      expect(result.valid).toBe(true);
      expect(result.age).toBe(21);
    });

    test('should handle empty string inputs gracefully', () => {
      expect(validateFullName('').valid).toBe(false);
      expect(validateIdNumber('', 'TX').valid).toBe(false);
      expect(validateState('').valid).toBe(false);
    });

    test('should handle whitespace-only inputs', () => {
      expect(validateFullName('   ').valid).toBe(false);
    });

    test('should handle very long ID verification ID generation', async () => {
      const result = await performVerification({
        customerId: 'a'.repeat(100),
        fullName: 'John Doe',
        dateOfBirth: '2000-01-01',
        idNumberLast4: '1234',
        state: 'TX',
      });
      expect(result.verified).toBe(true);
    });

    test('should handle special characters in customer ID for hashing', () => {
      const hash1 = hashCustomerId('customer@email.com');
      const hash2 = hashCustomerId('customer@email.com');
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    test('should reject encryption with null key', () => {
      expect(() => encryptData('data', null)).toThrow();
    });

    test('should reject decryption with undefined key', () => {
      expect(() => decryptData('data', undefined)).toThrow();
    });
  });
});
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

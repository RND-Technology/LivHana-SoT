/**
 * Age Verification System - Comprehensive Test Suite
 *
 * Tests for:
 * - Age calculation and validation
 * - ID number format validation
 * - Full name validation
 * - State validation
 * - Verification logic
 * - Encryption/decryption
 * - Rate limiting
 * - API endpoints
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
  isVerificationExpired,
  MINIMUM_AGE,
} = require('../src/age_verification');

const AgeVerificationStore = require('../src/age_verification_store');

describe('Age Verification System', () => {
  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 25;
      const dob = `${birthYear}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const age = calculateAge(dob);
      expect(age).toBe(25);
    });

    it('should handle birthday not yet occurred this year', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 25;
      const futureMonth = today.getMonth() + 2; // Future month
      const dob = `${birthYear}-${String(futureMonth > 12 ? 1 : futureMonth).padStart(2, '0')}-15`;

      const age = calculateAge(dob);
      expect(age).toBeLessThanOrEqual(25);
    });
  });

  describe('validateDateOfBirth', () => {
    it('should validate valid DOB for 21+ customer', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 25;
      const dob = `${birthYear}-01-15`;

      const result = validateDateOfBirth(dob);
      expect(result.valid).toBe(true);
      expect(result.age).toBeGreaterThanOrEqual(MINIMUM_AGE);
    });

    it('should reject DOB for underage customer', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 18;
      const dob = `${birthYear}-01-15`;

      const result = validateDateOfBirth(dob);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Must be at least');
    });

    it('should reject invalid date format', () => {
      const result = validateDateOfBirth('01/15/1990');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Invalid date format');
    });

    it('should reject future dates', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const dob = future.toISOString().split('T')[0];

      const result = validateDateOfBirth(dob);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('future');
    });

    it('should reject missing DOB', () => {
      const result = validateDateOfBirth(null);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('required');
    });

    it('should reject invalid dates', () => {
      const result = validateDateOfBirth('2020-02-30'); // Feb 30 doesn't exist
      expect(result.valid).toBe(false);
    });
  });

  describe('validateIdNumber', () => {
    it('should validate last 4 digits of ID', () => {
      const result = validateIdNumber('1234', 'TX');
      expect(result.valid).toBe(true);
      expect(result.state).toBe('TX');
    });

    it('should reject non-numeric ID', () => {
      const result = validateIdNumber('ABCD', 'TX');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('4 digits');
    });

    it('should reject ID with wrong length', () => {
      const result = validateIdNumber('123', 'TX');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('4 digits');
    });

    it('should reject missing ID number', () => {
      const result = validateIdNumber(null, 'TX');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('required');
    });

    it('should handle various state codes', () => {
      const states = ['CA', 'NY', 'FL', 'TX', 'IL'];
      states.forEach(state => {
        const result = validateIdNumber('5678', state);
        expect(result.valid).toBe(true);
        expect(result.state).toBe(state);
      });
    });
  });

  describe('validateFullName', () => {
    it('should validate valid full name', () => {
      const result = validateFullName('John Doe');
      expect(result.valid).toBe(true);
      expect(result.name).toBe('John Doe');
      expect(result.nameParts).toHaveLength(2);
    });

    it('should validate name with middle name', () => {
      const result = validateFullName('John Michael Doe');
      expect(result.valid).toBe(true);
      expect(result.nameParts).toHaveLength(3);
    });

    it('should validate name with hyphens', () => {
      const result = validateFullName('Mary-Jane Smith');
      expect(result.valid).toBe(true);
    });

    it('should validate name with apostrophes', () => {
      const result = validateFullName("O'Brien");
      expect(result.valid).toBe(false); // Need first and last name
    });

    it('should reject single name', () => {
      const result = validateFullName('John');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('first and last name');
    });

    it('should reject name that is too short', () => {
      const result = validateFullName('J');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('too short');
    });

    it('should reject missing name', () => {
      const result = validateFullName(null);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('required');
    });

    it('should reject name with invalid characters', () => {
      const result = validateFullName('John Doe123');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('invalid characters');
    });
  });

  describe('validateState', () => {
    it('should validate valid state codes', () => {
      const validStates = ['TX', 'CA', 'NY', 'FL', 'IL', 'PA'];
      validStates.forEach(state => {
        const result = validateState(state);
        expect(result.valid).toBe(true);
        expect(result.state).toBe(state);
      });
    });

    it('should handle lowercase state codes', () => {
      const result = validateState('tx');
      expect(result.valid).toBe(true);
      expect(result.state).toBe('TX');
    });

    it('should reject invalid state codes', () => {
      const result = validateState('ZZ');
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Invalid state');
    });

    it('should reject missing state', () => {
      const result = validateState(null);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('required');
    });
  });

  describe('encryptData and decryptData', () => {
    const secretKey = '12345678901234567890123456789012'; // 32 bytes

    it('should encrypt and decrypt data correctly', () => {
      const originalData = 'Sensitive ID: 1234';
      const encrypted = encryptData(originalData, secretKey);

      expect(encrypted).toBeTruthy();
      expect(encrypted).not.toBe(originalData);
      expect(encrypted.split(':').length).toBe(3); // iv:authTag:encrypted

      const decrypted = decryptData(encrypted, secretKey);
      expect(decrypted).toBe(originalData);
    });

    it('should fail to decrypt with wrong key', () => {
      const originalData = 'Sensitive ID: 1234';
      const encrypted = encryptData(originalData, secretKey);

      const wrongKey = '98765432109876543210987654321098';
      expect(() => {
        decryptData(encrypted, wrongKey);
      }).toThrow();
    });

    it('should reject invalid key length', () => {
      expect(() => {
        encryptData('data', 'short-key');
      }).toThrow('32 bytes');
    });

    it('should handle JSON data', () => {
      const originalData = JSON.stringify({ id: '1234', verified: true });
      const encrypted = encryptData(originalData, secretKey);
      const decrypted = decryptData(encrypted, secretKey);

      const parsed = JSON.parse(decrypted);
      expect(parsed.id).toBe('1234');
      expect(parsed.verified).toBe(true);
    });
  });

  describe('hashCustomerId', () => {
    it('should generate consistent hash for same customer ID', () => {
      const customerId = 'customer-123';
      const hash1 = hashCustomerId(customerId);
      const hash2 = hashCustomerId(customerId);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    });

    it('should generate different hashes for different customer IDs', () => {
      const hash1 = hashCustomerId('customer-123');
      const hash2 = hashCustomerId('customer-456');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('isVerificationExpired', () => {
    it('should return false for future expiration', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);

      const expired = isVerificationExpired(future.toISOString());
      expect(expired).toBe(false);
    });

    it('should return true for past expiration', () => {
      const past = new Date();
      past.setFullYear(past.getFullYear() - 1);

      const expired = isVerificationExpired(past.toISOString());
      expect(expired).toBe(true);
    });

    it('should return true for missing expiration', () => {
      const expired = isVerificationExpired(null);
      expect(expired).toBe(true);
    });
  });

  describe('performVerification', () => {
    const validCustomerData = {
      customerId: 'cust-123',
      fullName: 'John Doe',
      dateOfBirth: '1990-01-15',
      idNumberLast4: '1234',
      state: 'TX',
    };

    const encryptionKey = '12345678901234567890123456789012';

    it('should successfully verify valid customer', async () => {
      const result = await performVerification(validCustomerData, { encryptionKey });

      expect(result.verified).toBe(true);
      expect(result.verificationId).toBeTruthy();
      expect(result.method).toBe('full_verification');
      expect(result.age).toBeGreaterThanOrEqual(MINIMUM_AGE);
      expect(result.state).toBe('TX');
      expect(result.verifiedAt).toBeTruthy();
      expect(result.expiresAt).toBeTruthy();
      expect(result.encryptedMetadata).toBeTruthy();
    });

    it('should reject customer with invalid name', async () => {
      const invalidData = { ...validCustomerData, fullName: 'X' };
      const result = await performVerification(invalidData, { encryptionKey });

      expect(result.verified).toBe(false);
      expect(result.field).toBe('fullName');
    });

    it('should reject underage customer', async () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 18;
      const underageData = {
        ...validCustomerData,
        dateOfBirth: `${birthYear}-01-15`,
      };

      const result = await performVerification(underageData, { encryptionKey });

      expect(result.verified).toBe(false);
      expect(result.method).toBe('age_check');
      expect(result.field).toBe('dateOfBirth');
    });

    it('should reject customer with invalid state', async () => {
      const invalidData = { ...validCustomerData, state: 'ZZ' };
      const result = await performVerification(invalidData, { encryptionKey });

      expect(result.verified).toBe(false);
      expect(result.field).toBe('state');
    });

    it('should reject customer with invalid ID format', async () => {
      const invalidData = { ...validCustomerData, idNumberLast4: 'ABCD' };
      const result = await performVerification(invalidData, { encryptionKey });

      expect(result.verified).toBe(false);
      expect(result.field).toBe('idNumberLast4');
    });

    it('should use cache when available', async () => {
      const cachedVerification = {
        verificationId: 'cached-123',
        verified: true,
        verifiedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        expired: false,
      };

      const checkCache = async () => cachedVerification;

      const result = await performVerification(validCustomerData, {
        checkCache,
        encryptionKey,
      });

      expect(result.verified).toBe(true);
      expect(result.method).toBe('cache');
      expect(result.verificationId).toBe('cached-123');
    });

    it('should not use expired cache', async () => {
      const expiredCached = {
        verificationId: 'expired-123',
        verified: true,
        verifiedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expired: true,
      };

      const checkCache = async () => expiredCached;

      const result = await performVerification(validCustomerData, {
        checkCache,
        encryptionKey,
      });

      expect(result.method).toBe('full_verification'); // Not cache
    });

    it('should include processing time', async () => {
      const result = await performVerification(validCustomerData, { encryptionKey });

      expect(result.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.processingTime).toBeLessThan(1000); // Should be fast
    });
  });

  describe('AgeVerificationStore', () => {
    let store;

    beforeEach(() => {
      store = new AgeVerificationStore({ mockMode: true });
    });

    describe('saveVerification', () => {
      it('should save verification record', async () => {
        const verification = {
          verificationId: 'ver-123',
          verified: true,
          method: 'full_verification',
          age: 25,
          state: 'TX',
          verifiedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          encryptedMetadata: 'encrypted-data',
        };

        const customerData = {
          customerId: 'cust-123',
          fullName: 'John Doe',
          dateOfBirth: '1998-01-15',
          state: 'TX',
        };

        const record = await store.saveVerification(verification, customerData);

        expect(record.verification_id).toBe('ver-123');
        expect(record.customer_id).toBe('cust-123');
        expect(record.verified).toBe(true);
      });
    });

    describe('getVerification', () => {
      it('should retrieve saved verification', async () => {
        const verification = {
          verificationId: 'ver-456',
          verified: true,
          method: 'full_verification',
          age: 30,
          state: 'CA',
          verifiedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const customerData = {
          customerId: 'cust-456',
          fullName: 'Jane Smith',
          dateOfBirth: '1993-05-20',
          state: 'CA',
        };

        await store.saveVerification(verification, customerData);

        const retrieved = await store.getVerification('cust-456');
        expect(retrieved).toBeTruthy();
        expect(retrieved.customer_id).toBe('cust-456');
        expect(retrieved.verified).toBe(true);
      });

      it('should return null for non-existent customer', async () => {
        const retrieved = await store.getVerification('non-existent');
        expect(retrieved).toBeNull();
      });
    });

    describe('checkRateLimit', () => {
      it('should allow attempts within limit', async () => {
        const rateLimit = await store.checkRateLimit('cust-123');
        expect(rateLimit.allowed).toBe(true);
        expect(rateLimit.attempts).toBe(0);
        expect(rateLimit.maxAttempts).toBe(3);
      });

      it('should block after max attempts', async () => {
        const customerId = 'cust-789';

        // Record 3 attempts
        for (let i = 0; i < 3; i++) {
          await store.logAttempt({
            customerId,
            verified: false,
            method: 'test',
            reason: 'test attempt',
          });
        }

        const rateLimit = await store.checkRateLimit(customerId);
        expect(rateLimit.allowed).toBe(false);
        expect(rateLimit.attempts).toBe(3);
      });
    });

    describe('cache', () => {
      it('should cache verification results', async () => {
        const verification = {
          verificationId: 'ver-cache-1',
          verified: true,
          method: 'full_verification',
          age: 28,
          state: 'NY',
          verifiedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const customerData = {
          customerId: 'cust-cache-1',
          fullName: 'Bob Johnson',
          dateOfBirth: '1995-03-10',
          state: 'NY',
        };

        await store.saveVerification(verification, customerData);

        // First call - should hit database
        const first = await store.getVerification('cust-cache-1');

        // Second call - should hit cache
        const second = await store.getVerification('cust-cache-1');

        expect(first).toEqual(second);
      });

      it('should clear cache when requested', () => {
        const customerId = 'cust-clear-cache';
        const testData = {
          customer_id: customerId,
          verified: true,
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        };

        store.setCachedVerification(customerId, testData);
        const cached = store.getCachedVerification(customerId);
        expect(cached).toBeTruthy();
        expect(cached.customer_id).toBe(customerId);

        store.clearCache(customerId);
        expect(store.getCachedVerification(customerId)).toBe(null);
      });
    });

    describe('statistics', () => {
      it('should return verification statistics', async () => {
        // Add some test data
        for (let i = 0; i < 5; i++) {
          await store.logAttempt({
            customerId: `cust-${i}`,
            verified: i % 2 === 0, // 3 successful, 2 failed
            method: 'test',
            reason: 'test',
          });
        }

        const stats = await store.getStatistics({ days: 30 });

        expect(stats.totalAttempts).toBe(5);
        expect(stats.period).toContain('30 days');
      });
    });
  });
});
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

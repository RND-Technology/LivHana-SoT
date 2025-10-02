/**
 * Age Verification Storage Layer - BigQuery Integration
 *
 * Handles persistence of age verification records to BigQuery
 * Table: commerce.age_verifications
 *
 * Compliance:
 * - TX DSHS CHP #690: 7-year record retention
 * - CDFA PDP: Audit trail requirements
 * - Privacy: Encrypted sensitive data
 */

import { BigQuery } from '@google-cloud/bigquery';
import { createLogger } from '../../common/logging/index.js';
import { hashCustomerId, isVerificationExpired } from './age_verification.js';

const logger = createLogger('age-verification-store');

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET = process.env.BQ_DATASET || 'commerce';
const TABLE_NAME = 'age_verifications';
const TABLE_ATTEMPTS = 'age_verification_attempts';
const LOCATION = process.env.BQ_LOCATION || 'US';

// In-memory cache for verification results (TTL: 1 hour)
const verificationCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// In-memory rate limit tracking (customer ID -> attempts)
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_ATTEMPTS_PER_DAY = 3;

class AgeVerificationStore {
  constructor(options = {}) {
    this.enabled = Boolean(
      PROJECT_ID &&
      process.env.GOOGLE_APPLICATION_CREDENTIALS &&
      process.env.BIGQUERY_ENABLED !== 'false'
    );

    this.mockMode = options.mockMode || !this.enabled;

    if (this.enabled && !this.mockMode) {
      try {
        this.client = new BigQuery({ projectId: PROJECT_ID });
        logger.info({ projectId: PROJECT_ID, dataset: DATASET }, 'BigQuery age verification store initialized');
      } catch (error) {
        logger.error({ error: error.message }, 'Failed to initialize BigQuery client');
        this.mockMode = true;
      }
    }

    // Mock storage for development/testing
    this.mockStorage = {
      verifications: [],
      attempts: [],
    };
  }

  /**
   * Get BigQuery table reference
   * @param {string} table - Table name
   * @returns {string} Fully qualified table reference
   */
  getTableRef(table) {
    return `\`${PROJECT_ID}.${DATASET}.${table}\``;
  }

  /**
   * Ensure tables exist with proper schema
   * @returns {Promise<void>}
   */
  async ensureTables() {
    if (this.mockMode) {
      logger.info('Mock mode: Skipping table creation');
      return;
    }

    try {
      const dataset = this.client.dataset(DATASET);

      // Create age_verifications table
      await dataset.table(TABLE_NAME).get({ autoCreate: true });
      logger.info({ table: TABLE_NAME }, 'Verifications table ready');

      // Create age_verification_attempts table (audit log)
      await dataset.table(TABLE_ATTEMPTS).get({ autoCreate: true });
      logger.info({ table: TABLE_ATTEMPTS }, 'Attempts table ready');

    } catch (error) {
      logger.error({ error: error.message }, 'Failed to ensure tables exist');
      throw error;
    }
  }

  /**
   * Save verification result to BigQuery
   * @param {Object} verification - Verification result
   * @param {Object} customerData - Original customer data
   * @returns {Promise<Object>} Saved record
   */
  async saveVerification(verification, customerData) {
    const record = {
      verification_id: verification.verificationId,
      customer_id: customerData.customerId,
      customer_id_hash: hashCustomerId(customerData.customerId),
      full_name: customerData.fullName,
      date_of_birth: customerData.dateOfBirth,
      age: verification.age || 0,
      state: verification.state || customerData.state,
      verified: verification.verified,
      verification_method: verification.method,
      verified_at: verification.verifiedAt || new Date().toISOString(),
      expires_at: verification.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: verification.encryptedMetadata || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.mockMode) {
      this.mockStorage.verifications.push(record);
      logger.info({ verificationId: record.verification_id }, 'Mock: Verification saved');

      // Update cache
      if (verification.verified) {
        this.setCachedVerification(customerData.customerId, record);
      }

      return record;
    }

    try {
      await this.client
        .dataset(DATASET)
        .table(TABLE_NAME)
        .insert([record], { location: LOCATION });

      logger.info({ verificationId: record.verification_id, customerId: record.customer_id }, 'Verification saved to BigQuery');

      // Update cache
      if (verification.verified) {
        this.setCachedVerification(customerData.customerId, record);
      }

      return record;
    } catch (error) {
      logger.error({ error: error.message, verificationId: record.verification_id }, 'Failed to save verification');
      throw error;
    }
  }

  /**
   * Log verification attempt (audit trail)
   * @param {Object} attempt - Attempt details
   * @param {Object} req - Express request object (optional)
   * @returns {Promise<void>}
   */
  async logAttempt(attempt, req = null) {
    const attemptId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const record = {
      attempt_id: attemptId,
      verification_id: attempt.verificationId || null,
      customer_id: attempt.customerId,
      customer_id_hash: hashCustomerId(attempt.customerId),
      verified: attempt.verified,
      method: attempt.method,
      reason: attempt.reason || null,
      failed_field: attempt.field || null,
      ip_address: req?.ip || req?.headers?.['x-forwarded-for'] || null,
      user_agent: req?.headers?.['user-agent'] || null,
      created_at: new Date().toISOString(),
    };

    if (this.mockMode) {
      this.mockStorage.attempts.push(record);
      logger.info({ attemptId }, 'Mock: Attempt logged');
      return;
    }

    try {
      await this.client
        .dataset(DATASET)
        .table(TABLE_ATTEMPTS)
        .insert([record], { location: LOCATION });

      logger.info({ attemptId, customerId: record.customer_id, verified: record.verified }, 'Attempt logged');
    } catch (error) {
      logger.error({ error: error.message, attemptId }, 'Failed to log attempt');
      // Don't throw - logging failures shouldn't block verification
    }
  }

  /**
   * Get verification status for a customer
   * @param {string} customerId - Customer identifier
   * @returns {Promise<Object|null>} Verification record or null
   */
  async getVerification(customerId) {
    // Check cache first
    const cached = this.getCachedVerification(customerId);
    if (cached) {
      return cached;
    }

    if (this.mockMode) {
      const record = this.mockStorage.verifications
        .filter(v => v.customer_id === customerId && v.verified)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

      if (record) {
        this.setCachedVerification(customerId, record);
      }

      return record || null;
    }

    try {
      const customerIdHash = hashCustomerId(customerId);
      const query = `
        SELECT *
        FROM ${this.getTableRef(TABLE_NAME)}
        WHERE customer_id_hash = @customerIdHash
          AND verified = true
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const [rows] = await this.client.query({
        query,
        params: { customerIdHash },
        location: LOCATION,
      });

      const record = rows.length > 0 ? rows[0] : null;

      if (record) {
        this.setCachedVerification(customerId, record);
      }

      return record;
    } catch (error) {
      logger.error({ error: error.message, customerId }, 'Failed to get verification');
      return null;
    }
  }

  /**
   * Check if customer can attempt verification (rate limiting)
   * @param {string} customerId - Customer identifier
   * @returns {Promise<Object>} Rate limit status
   */
  async checkRateLimit(customerId) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    // Check in-memory rate limit cache first
    const cachedAttempts = rateLimitCache.get(customerId);
    if (cachedAttempts) {
      const recentAttempts = cachedAttempts.filter(timestamp => timestamp > windowStart);
      rateLimitCache.set(customerId, recentAttempts);

      if (recentAttempts.length >= MAX_ATTEMPTS_PER_DAY) {
        return {
          allowed: false,
          attempts: recentAttempts.length,
          maxAttempts: MAX_ATTEMPTS_PER_DAY,
          resetAt: new Date(Math.min(...recentAttempts) + RATE_LIMIT_WINDOW_MS).toISOString(),
        };
      }
    }

    if (this.mockMode) {
      const attempts = this.mockStorage.attempts
        .filter(a => a.customer_id === customerId)
        .filter(a => new Date(a.created_at).getTime() > windowStart);

      const allowed = attempts.length < MAX_ATTEMPTS_PER_DAY;

      return {
        allowed,
        attempts: attempts.length,
        maxAttempts: MAX_ATTEMPTS_PER_DAY,
        resetAt: attempts.length > 0
          ? new Date(Math.min(...attempts.map(a => new Date(a.created_at).getTime())) + RATE_LIMIT_WINDOW_MS).toISOString()
          : new Date(now + RATE_LIMIT_WINDOW_MS).toISOString(),
      };
    }

    try {
      const customerIdHash = hashCustomerId(customerId);
      const query = `
        SELECT COUNT(*) as attempt_count
        FROM ${this.getTableRef(TABLE_ATTEMPTS)}
        WHERE customer_id_hash = @customerIdHash
          AND created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
      `;

      const [rows] = await this.client.query({
        query,
        params: { customerIdHash },
        location: LOCATION,
      });

      const attemptCount = rows[0]?.attempt_count || 0;
      const allowed = attemptCount < MAX_ATTEMPTS_PER_DAY;

      return {
        allowed,
        attempts: attemptCount,
        maxAttempts: MAX_ATTEMPTS_PER_DAY,
        resetAt: new Date(now + RATE_LIMIT_WINDOW_MS).toISOString(),
      };
    } catch (error) {
      logger.error({ error: error.message, customerId }, 'Failed to check rate limit');
      // Default to allowing attempt if rate limit check fails
      return {
        allowed: true,
        attempts: 0,
        maxAttempts: MAX_ATTEMPTS_PER_DAY,
        resetAt: new Date(now + RATE_LIMIT_WINDOW_MS).toISOString(),
      };
    }
  }

  /**
   * Record attempt timestamp for rate limiting
   * @param {string} customerId - Customer identifier
   */
  recordAttemptTimestamp(customerId) {
    const attempts = rateLimitCache.get(customerId) || [];
    attempts.push(Date.now());
    rateLimitCache.set(customerId, attempts);
  }

  /**
   * Get cached verification
   * @param {string} customerId - Customer identifier
   * @returns {Object|null} Cached verification or null
   */
  getCachedVerification(customerId) {
    const cached = verificationCache.get(customerId);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() > cached.cacheExpiresAt) {
      verificationCache.delete(customerId);
      return null;
    }

    // Check if verification is expired
    if (isVerificationExpired(cached.data.expires_at)) {
      verificationCache.delete(customerId);
      return null;
    }

    logger.debug({ customerId }, 'Cache hit for verification');
    return cached.data;
  }

  /**
   * Set cached verification
   * @param {string} customerId - Customer identifier
   * @param {Object} data - Verification data
   */
  setCachedVerification(customerId, data) {
    verificationCache.set(customerId, {
      data,
      cacheExpiresAt: Date.now() + CACHE_TTL_MS,
    });
  }

  /**
   * Clear verification cache for a customer
   * @param {string} customerId - Customer identifier
   */
  clearCache(customerId) {
    verificationCache.delete(customerId);
    logger.debug({ customerId }, 'Cache cleared for customer');
  }

  /**
   * Get verification statistics (admin dashboard)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Statistics
   */
  async getStatistics(options = {}) {
    const days = options.days || 30;

    if (this.mockMode) {
      const total = this.mockStorage.verifications.length;
      const verified = this.mockStorage.verifications.filter(v => v.verified).length;

      return {
        totalAttempts: this.mockStorage.attempts.length,
        totalVerifications: total,
        successfulVerifications: verified,
        failedVerifications: total - verified,
        successRate: total > 0 ? (verified / total * 100).toFixed(2) : 0,
        period: `${days} days (mock data)`,
      };
    }

    try {
      const query = `
        SELECT
          COUNT(DISTINCT attempt_id) as total_attempts,
          COUNT(DISTINCT CASE WHEN verified = true THEN verification_id END) as successful,
          COUNT(DISTINCT CASE WHEN verified = false THEN attempt_id END) as failed
        FROM ${this.getTableRef(TABLE_ATTEMPTS)}
        WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @days DAY)
      `;

      const [rows] = await this.client.query({
        query,
        params: { days },
        location: LOCATION,
      });

      const stats = rows[0] || { total_attempts: 0, successful: 0, failed: 0 };

      return {
        totalAttempts: parseInt(stats.total_attempts) || 0,
        successfulVerifications: parseInt(stats.successful) || 0,
        failedVerifications: parseInt(stats.failed) || 0,
        successRate: stats.total_attempts > 0
          ? ((stats.successful / stats.total_attempts) * 100).toFixed(2)
          : 0,
        period: `${days} days`,
      };
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to get statistics');
      throw error;
    }
  }
}

export default AgeVerificationStore;
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02

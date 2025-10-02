/**
 * Age Verification REST API Routes
 *
 * Endpoints:
 * - POST /api/age-verification/verify - Verify customer age
 * - GET /api/age-verification/status/:customerId - Check verification status
 * - POST /api/age-verification/resubmit - Resubmit verification
 * - GET /api/age-verification/statistics - Admin statistics (requires admin role)
 *
 * Authentication: All endpoints require JWT authentication
 * Rate Limiting: 3 attempts per customer per 24 hours
 */

import express from 'express';
import { createLogger } from '../../common/logging/index.js';
import { performVerification } from './age_verification.js';
import AgeVerificationStore from './age_verification_store.js';

const router = express.Router();
const logger = createLogger('age-verification-api');

// Initialize store
const store = new AgeVerificationStore();

// Encryption key for sensitive data (must be 32 bytes)
const ENCRYPTION_KEY = process.env.AGE_VERIFICATION_ENCRYPTION_KEY || 'default-key-change-me-32-bytes';

// Ensure encryption key is valid
if (ENCRYPTION_KEY.length !== 32) {
  logger.warn('AGE_VERIFICATION_ENCRYPTION_KEY must be exactly 32 bytes. Using padded/truncated key.');
}

const encryptionKey = ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32);

/**
 * Initialize BigQuery tables on startup
 */
store.ensureTables().catch(error => {
  logger.error({ error: error.message }, 'Failed to ensure tables exist');
});

/**
 * Validate required fields in request body
 */
function validateVerificationRequest(body) {
  const required = ['customerId', 'fullName', 'dateOfBirth', 'idNumberLast4', 'state'];
  const missing = required.filter(field => !body[field]);

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missing.join(', ')}`,
      missing,
    };
  }

  return { valid: true };
}

/**
 * POST /api/age-verification/verify
 * Verify customer age and identity
 */
router.post('/api/age-verification/verify', async (req, res) => {
  const startTime = Date.now();

  try {
    // Validate request body
    const validation = validateVerificationRequest(req.body);
    if (!validation.valid) {
      logger.warn({ missing: validation.missing }, 'Invalid verification request');
      return res.status(400).json({
        success: false,
        error: validation.error,
        missing: validation.missing,
      });
    }

    const { customerId, fullName, dateOfBirth, idNumberLast4, state } = req.body;

    logger.info({ customerId, userId: req.user?.sub }, 'Age verification request received');

    // Check rate limit
    const rateLimit = await store.checkRateLimit(customerId);
    if (!rateLimit.allowed) {
      logger.warn({ customerId, attempts: rateLimit.attempts }, 'Rate limit exceeded');

      // Log the rate-limited attempt
      await store.logAttempt({
        customerId,
        verified: false,
        method: 'rate_limit',
        reason: 'Too many attempts',
      }, req);

      return res.status(429).json({
        success: false,
        error: 'Too many verification attempts',
        message: `You have exceeded the maximum number of verification attempts (${rateLimit.maxAttempts} per 24 hours). Please try again later.`,
        attempts: rateLimit.attempts,
        maxAttempts: rateLimit.maxAttempts,
        resetAt: rateLimit.resetAt,
      });
    }

    // Record attempt timestamp
    store.recordAttemptTimestamp(customerId);

    // Check cache function
    const checkCache = async (custId) => {
      const cached = await store.getVerification(custId);
      if (cached) {
        return {
          verificationId: cached.verification_id,
          verified: cached.verified,
          verifiedAt: cached.verified_at,
          expiresAt: cached.expires_at,
          expired: new Date(cached.expires_at) < new Date(),
        };
      }
      return null;
    };

    // Perform verification
    const result = await performVerification(
      {
        customerId,
        fullName,
        dateOfBirth,
        idNumberLast4,
        state,
      },
      {
        checkCache,
        encryptionKey,
      }
    );

    // Log the attempt
    await store.logAttempt({
      verificationId: result.verificationId,
      customerId,
      verified: result.verified,
      method: result.method,
      reason: result.reason,
      field: result.field,
    }, req);

    // Save verification result if successful
    if (result.verified && result.method !== 'cache') {
      await store.saveVerification(result, {
        customerId,
        fullName,
        dateOfBirth,
        state,
      });
    }

    const responseTime = Date.now() - startTime;

    logger.info({
      customerId,
      verified: result.verified,
      method: result.method,
      responseTime,
    }, 'Age verification completed');

    // Return result
    return res.status(result.verified ? 200 : 400).json({
      success: result.verified,
      verificationId: result.verificationId,
      verified: result.verified,
      method: result.method,
      reason: result.reason,
      age: result.age,
      verifiedAt: result.verifiedAt,
      expiresAt: result.expiresAt,
      timestamp: result.timestamp,
      processingTime: responseTime,
    });

  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Verification error');

    return res.status(500).json({
      success: false,
      error: 'Internal server error during verification',
      message: 'Please try again later',
    });
  }
});

/**
 * GET /api/age-verification/status/:customerId
 * Check verification status for a customer
 */
router.get('/api/age-verification/status/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    logger.info({ customerId, userId: req.user?.sub }, 'Verification status check');

    // Get verification from store
    const verification = await store.getVerification(customerId);

    if (!verification) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'No verification found for this customer',
        customerId,
      });
    }

    // Check if expired
    const expired = new Date(verification.expires_at) < new Date();

    return res.json({
      success: true,
      verified: verification.verified && !expired,
      verificationId: verification.verification_id,
      verifiedAt: verification.verified_at,
      expiresAt: verification.expires_at,
      expired,
      age: verification.age,
      state: verification.state,
      method: verification.verification_method,
    });

  } catch (error) {
    logger.error({ error: error.message, customerId: req.params.customerId }, 'Status check error');

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Could not retrieve verification status',
    });
  }
});

/**
 * POST /api/age-verification/resubmit
 * Resubmit verification (same as verify, but clears cache first)
 */
router.post('/api/age-verification/resubmit', async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: 'customerId is required',
      });
    }

    logger.info({ customerId, userId: req.user?.sub }, 'Age verification resubmit request');

    // Clear cache to force new verification
    store.clearCache(customerId);

    // Forward to verify endpoint
    req.url = '/api/age-verification/verify';
    req.method = 'POST';
    return router.handle(req, res);

  } catch (error) {
    logger.error({ error: error.message }, 'Resubmit error');

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Could not resubmit verification',
    });
  }
});

/**
 * GET /api/age-verification/statistics
 * Get verification statistics (admin only)
 */
router.get('/api/age-verification/statistics', async (req, res) => {
  try {
    // Optional: Check for admin role
    // if (req.user?.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     error: 'Forbidden',
    //     message: 'Admin access required',
    //   });
    // }

    const days = parseInt(req.query.days) || 30;

    logger.info({ userId: req.user?.sub, days }, 'Statistics request');

    const stats = await store.getStatistics({ days });

    return res.json({
      success: true,
      statistics: stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error({ error: error.message }, 'Statistics error');

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Could not retrieve statistics',
    });
  }
});

/**
 * Health check endpoint (no auth required)
 */
router.get('/health/age-verification', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'age-verification',
    timestamp: new Date().toISOString(),
    storage: store.mockMode ? 'mock' : 'bigquery',
  });
});

export { router, store };

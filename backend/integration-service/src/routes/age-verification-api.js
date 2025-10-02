/**
 * Age Verification API - Server-Side Validation
 * CRITICAL: Cannabis compliance - Texas law requires 21+ verification
 */

import express from 'express';
import { calculateAge } from '../age_verification.js';
import { validateBody } from '../../../common/validation/middleware.js';
import { ageVerificationSchema } from '../../../common/validation/schemas.js';
import { logAuditEvent, AUDIT_EVENTS, SEVERITY } from '../../../common/logging/audit-logger.js';

const router = express.Router();

/**
 * POST /api/age-verification/verify
 * Verify age on server-side (cannot be bypassed by client manipulation)
 */
router.post('/verify', validateBody(ageVerificationSchema), async (req, res) => {
  try {
    const { birthdate } = req.body;

    // Server-side age calculation (trusted source)
    const age = calculateAge(birthdate);

    // Texas law: Must be 21+
    if (age < 21) {
      // Log failed verification (no logVerification function, using audit only)

      // Log failed verification
      await logAuditEvent({
        eventType: AUDIT_EVENTS.COMPLIANCE_AGE_VERIFICATION_FAILURE,
        severity: SEVERITY.WARNING,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        resource: '/api/age-verification/verify',
        action: 'POST',
        result: 'failure',
        details: { age, reason: 'Under 21' }
      });

      return res.status(403).json({
        success: false,
        error: 'Must be 21+ to access cannabis products',
        age
      });
    }

    // Log successful verification to audit
    await logAuditEvent({
      eventType: AUDIT_EVENTS.COMPLIANCE_AGE_VERIFICATION,
      severity: SEVERITY.INFO,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      resource: '/api/age-verification/verify',
      action: 'POST',
      result: 'success',
      details: { age, birthdate }
    });

    res.json({
      success: true,
      verified: true,
      age,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });

  } catch (error) {
    console.error('Age verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
});

/**
 * GET /api/age-verification/status
 * Check verification status
 */
router.get('/status', (req, res) => {
  // Check if verification token exists in session/cookie
  const verificationToken = req.headers['x-age-verification'];

  if (!verificationToken) {
    return res.json({
      verified: false,
      required: true
    });
  }

  // TODO: Validate token from Redis/session store
  res.json({
    verified: true,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
});

export default router;
// Last optimized: 2025-10-02

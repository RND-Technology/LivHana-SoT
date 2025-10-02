/**
 * Age Verification API - Server-Side Validation
 * CRITICAL: Cannabis compliance - Texas law requires 21+ verification
 */

import express from 'express';
import { verifyAge, logVerification } from '../age_verification.js';
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
    const { birthdate, metadata } = req.body;

    // Server-side age calculation (trusted source)
    const birthDate = new Date(birthdate);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    // Texas law: Must be 21+
    if (age < 21) {
      await logVerification({
        birthdate,
        age,
        verified: false,
        reason: 'Under 21',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        metadata
      });

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

    // Log successful verification
    const verificationRecord = await logVerification({
      birthdate,
      age,
      verified: true,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata
    });

    // Log successful verification to audit
    await logAuditEvent({
      eventType: AUDIT_EVENTS.COMPLIANCE_AGE_VERIFICATION,
      severity: SEVERITY.INFO,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      resource: '/api/age-verification/verify',
      action: 'POST',
      result: 'success',
      details: { age, verificationId: verificationRecord.id }
    });

    res.json({
      success: true,
      verified: true,
      age,
      verificationId: verificationRecord.id,
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

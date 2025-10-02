/**
 * Age Verification API - Server-Side Validation
 * CRITICAL: Cannabis compliance - Texas law requires 21+ verification
 */

import express from 'express';
import { verifyAge, logVerification } from '../age_verification.js';

const router = express.Router();

/**
 * POST /api/age-verification/verify
 * Verify age on server-side (cannot be bypassed by client manipulation)
 */
router.post('/verify', async (req, res) => {
  try {
    const { birthdate, metadata } = req.body;

    if (!birthdate) {
      return res.status(400).json({
        success: false,
        error: 'Birthdate required'
      });
    }

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

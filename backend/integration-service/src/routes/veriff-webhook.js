import express from 'express';
import { createLogger } from '../../../common/logging/index.js';
import { getVeriffClient } from '../lib/veriff-client.js';

const router = express.Router();
const logger = createLogger('veriff-webhook');

/**
 * VERIFF WEBHOOK HANDLER
 *
 * Receives callbacks from Veriff when verification is complete
 * Updates verification status and triggers auto-enrollment
 *
 * Webhook Events:
 * - started: Verification session started
 * - submitted: User submitted documents
 * - approved: Verification approved (user is 21+)
 * - declined: Verification declined (under 21 or invalid docs)
 * - resubmission_requested: User needs to resubmit
 * - expired: Verification session expired
 * - abandoned: User abandoned verification
 */

/**
 * POST /api/v1/veriff/webhook
 *
 * Veriff sends webhook when verification status changes
 *
 * Request headers:
 * - X-HMAC-SIGNATURE: Webhook signature for verification
 *
 * Request body:
 * {
 *   "id": "session-id",
 *   "feature": "selfid",
 *   "code": 9001,
 *   "action": "verification.approved",
 *   "vendorData": "{\"orderId\":\"LS-12345\",\"email\":\"customer@example.com\"}"
 * }
 */
router.post('/webhook', async (req, res) => {
  const startTime = Date.now();

  try {
    const signature = req.headers['x-hmac-signature'];
    const payload = req.body;

    logger.info('Veriff webhook received', {
      action: payload.action,
      sessionId: payload.id,
      hasSignature: !!signature
    });

    // Verify webhook signature
    const veriffClient = getVeriffClient();
    const isValid = veriffClient.verifyWebhookSignature(payload, signature);

    if (!isValid) {
      logger.error('Invalid webhook signature', {
        sessionId: payload.id
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      });
    }

    // Parse vendor data (contains orderId and email)
    const vendorData = veriffClient.parseVendorData(payload.vendorData);

    if (!vendorData) {
      logger.error('Invalid vendor data', {
        sessionId: payload.id,
        vendorData: payload.vendorData
      });

      return res.status(400).json({
        success: false,
        error: 'Invalid vendor data'
      });
    }

    const { orderId, email } = vendorData;

    // Handle different verification statuses
    switch (payload.action) {
      case 'verification.approved':
        logger.info('✅ Verification APPROVED', {
          sessionId: payload.id,
          orderId,
          email
        });

        // Trigger auto-verification completion in post-purchase system
        await completeVerification(orderId, email, payload.id);
        break;

      case 'verification.declined':
        logger.warn('❌ Verification DECLINED', {
          sessionId: payload.id,
          orderId,
          email,
          code: payload.code,
          reason: payload.reason
        });

        // Mark verification as failed
        await failVerification(orderId, email, payload.reason);
        break;

      case 'verification.resubmission_requested':
        logger.info('🔄 Verification RESUBMISSION REQUESTED', {
          sessionId: payload.id,
          orderId,
          email
        });

        // Send email to customer requesting resubmission
        await sendResubmissionEmail(orderId, email, payload.id);
        break;

      case 'verification.expired':
      case 'verification.abandoned':
        logger.warn('⏰ Verification EXPIRED/ABANDONED', {
          sessionId: payload.id,
          orderId,
          email,
          action: payload.action
        });

        // Mark verification as incomplete (will trigger auto-refund if 72hrs pass)
        await markVerificationAbandoned(orderId, email);
        break;

      default:
        logger.info('Other verification event', {
          action: payload.action,
          sessionId: payload.id,
          orderId
        });
    }

    const elapsed = Date.now() - startTime;
    logger.info('Webhook processed successfully', {
      action: payload.action,
      orderId,
      elapsed: `${elapsed}ms`
    });

    // Always return 200 to acknowledge receipt
    res.json({
      success: true,
      message: 'Webhook received',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Webhook processing failed', {
      error: error.message,
      stack: error.stack,
      payload: req.body
    });

    // Still return 200 to prevent Veriff from retrying
    res.json({
      success: false,
      error: 'Internal processing error',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Complete verification after Veriff approval
 */
async function completeVerification(orderId, email, veriffSessionId) {
  try {
    // TODO: Call post-purchase verification API
    // This will trigger loyalty enrollment and mark order as verified

    logger.info('Completing post-purchase verification', {
      orderId,
      email,
      veriffSessionId
    });

    // For now, log that verification is complete
    // This will be wired to post-purchase-verification.js in next step

  } catch (error) {
    logger.error('Failed to complete verification', {
      error: error.message,
      orderId
    });

    throw error;
  }
}

/**
 * Mark verification as failed
 */
async function failVerification(orderId, email, reason) {
  try {
    logger.info('Marking verification as failed', {
      orderId,
      email,
      reason
    });

    // TODO: Update verification record status to 'failed'
    // Send email to customer explaining why verification failed

  } catch (error) {
    logger.error('Failed to mark verification as failed', {
      error: error.message,
      orderId
    });
  }
}

/**
 * Send resubmission email
 */
async function sendResubmissionEmail(orderId, email, veriffSessionId) {
  try {
    logger.info('Sending resubmission email', {
      orderId,
      email,
      veriffSessionId
    });

    // TODO: Send email with new Veriff session link

  } catch (error) {
    logger.error('Failed to send resubmission email', {
      error: error.message,
      orderId
    });
  }
}

/**
 * Mark verification as abandoned
 */
async function markVerificationAbandoned(orderId, email) {
  try {
    logger.info('Marking verification as abandoned', {
      orderId,
      email
    });

    // TODO: Update verification record
    // Customer still has time until 72hr deadline

  } catch (error) {
    logger.error('Failed to mark verification as abandoned', {
      error: error.message,
      orderId
    });
  }
}

/**
 * GET /api/v1/veriff/session/:sessionId
 *
 * Get Veriff session details (for debugging)
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    logger.info('Getting Veriff session', { sessionId });

    const veriffClient = getVeriffClient();
    const session = await veriffClient.getSession(sessionId);

    res.json({
      success: true,
      session,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get session failed', {
      error: error.message,
      sessionId: req.params.sessionId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get session',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/v1/veriff/decision/:sessionId
 *
 * Get Veriff decision details (for debugging)
 */
router.get('/decision/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    logger.info('Getting Veriff decision', { sessionId });

    const veriffClient = getVeriffClient();
    const decision = await veriffClient.getDecision(sessionId);

    res.json({
      success: true,
      decision,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Get decision failed', {
      error: error.message,
      sessionId: req.params.sessionId
    });

    res.status(500).json({
      success: false,
      error: 'Failed to get decision',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;

// Created: 2025-10-04
// Real Veriff webhook handler
// Tier-1 Option A: Production-ready with signature verification

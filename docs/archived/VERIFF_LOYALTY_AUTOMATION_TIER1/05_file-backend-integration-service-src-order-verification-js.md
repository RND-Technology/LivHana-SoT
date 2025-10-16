### File: `/backend/integration-service/src/order-verification.js`

```javascript
// Order Verification Gate + Loyalty Enrollment Automation
// Handles post-purchase Veriff + Membership checks

import express from 'express';
import crypto from 'crypto';
import { BigQuery } from '@google-cloud/bigquery';
import { createLogger } from '../../common/logging/index.js';
import axios from 'axios';

const router = express.Router();
const logger = createLogger('order-verification');

// Configuration
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET = process.env.BQ_DATASET || 'commerce';
const ORDERS_TABLE = 'lightspeed_orders';
const VERIFICATIONS_TABLE = 'verification_status';
const LOCATION = process.env.BQ_LOCATION || 'US';

// Lightspeed API Config
[REDACTED - SECURITY BREACH]
const LIGHTSPEED_ACCOUNT_ID = process.env.LIGHTSPEED_ACCOUNT_ID;
const LIGHTSPEED_BASE_URL = `https://api.lightspeedapp.com/API/Account/${LIGHTSPEED_ACCOUNT_ID}`;

// Veriff API Config
[REDACTED - SECURITY BREACH]
const VERIFF_BASE_URL = 'https://api.veriff.com/v1';

// Email Service
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3007/api/email/send';

// Membership Service
const MEMBERSHIP_SERVICE_URL = process.env.MEMBERSHIP_SERVICE_URL || 'http://localhost:3005/api/memberships';

const bqClient = new BigQuery({ projectId: PROJECT_ID });

// ==================== VERIFICATION CHECKS ====================

/**
 * Check if customer has completed Veriff age/ID verification
 * @param {string} customerId - Lightspeed customer ID
 * @returns {Promise<{verified: boolean, sessionId: string, verifiedAt: string}>}
 */
async function checkVeriffStatus(customerId) {
  try {
    // Query BigQuery for verification status
    const query = `
      SELECT
        session_id,
        status,
        verified_at,
        person_first_name,
        person_last_name,
        person_date_of_birth
      FROM \`${PROJECT_ID}.${DATASET}.${VERIFICATIONS_TABLE}\`
      WHERE customer_id = @customerId
        AND status = 'approved'
      ORDER BY verified_at DESC
      LIMIT 1
    `;

    const options = {
      query,
      location: LOCATION,
      params: { customerId }
    };

    const [rows] = await bqClient.query(options);

    if (rows.length === 0) {
      return { verified: false, sessionId: null, verifiedAt: null };
    }

    const verification = rows[0];
    return {
      verified: true,
      sessionId: verification.session_id,
      verifiedAt: verification.verified_at,
      firstName: verification.person_first_name,
      lastName: verification.person_last_name,
      dateOfBirth: verification.person_date_of_birth
    };
  } catch (error) {
    logger.error('Failed to check Veriff status', { customerId, error });
    throw error;
  }
}

/**
 * Check if customer has signed membership agreement
 * @param {string} customerId - Lightspeed customer ID
 * @returns {Promise<{signed: boolean, membership: object}>}
 */
async function checkMembershipStatus(customerId) {
  try {
    const response = await axios.get(`${MEMBERSHIP_SERVICE_URL}/${customerId}`);

    if (response.status === 404) {
      return { signed: false, membership: null };
    }

    const membership = response.data.membership;

    // Check if membership is active
    if (membership.status !== 'active') {
      return { signed: false, membership };
    }

    return { signed: true, membership };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { signed: false, membership: null };
    }
    logger.error('Failed to check membership status', { customerId, error });
    throw error;
  }
}

/**
 * Combined verification gate check
 * @param {string} customerId
 * @returns {Promise<{approved: boolean, veriff: object, membership: object, reason: string}>}
 */
async function runVerificationGate(customerId) {
  const veriff = await checkVeriffStatus(customerId);
  const membership = await checkMembershipStatus(customerId);

  const approved = veriff.verified && membership.signed;

  let reason = '';
  if (!veriff.verified) {
    reason = 'Veriff age/ID verification not completed';
  } else if (!membership.signed) {
    reason = 'Membership agreement not signed';
  }

  return {
    approved,
    veriff,
    membership,
    reason
  };
}

// ==================== LIGHTSPEED LOYALTY INTEGRATION ====================

/**
 * Check if customer already has Lightspeed Loyalty account
 * @param {string} customerId
 * @returns {Promise<{exists: boolean, loyaltyId: string, points: number}>}
 */
async function checkLightspeedLoyalty(customerId) {
  try {
    const response = await axios.get(
      `${LIGHTSPEED_BASE_URL}/Customer/${customerId}.json`,
      {
        headers: {
[REDACTED - SECURITY BREACH]
          Accept: 'application/json'
        },
        params: {
          load_relations: 'CustomerLoyalty'
        }
      }
    );

    const customer = response.data.Customer;
    const loyalty = customer.CustomerLoyalty;

    if (!loyalty) {
      return { exists: false, loyaltyId: null, points: 0 };
    }

    return {
      exists: true,
      loyaltyId: loyalty.loyaltyID,
      points: Number(loyalty.balance || 0),
      tier: loyalty.tier || 'Member'
    };
  } catch (error) {
    logger.error('Failed to check Lightspeed Loyalty', { customerId, error });
    return { exists: false, loyaltyId: null, points: 0 };
  }
}

/**
 * Create Lightspeed Loyalty account for customer
 * @param {string} customerId
 * @param {object} membership - Membership details (tier, discount)
 * @returns {Promise<{success: boolean, loyaltyId: string}>}
 */
async function createLightspeedLoyalty(customerId, membership) {
  try {
    // Map membership tier to loyalty tier
    const tierMapping = {
      'BRONZE': 'Member',
      'SILVER': 'Silver',
      'GOLD': 'Gold'
    };

    const loyaltyTier = membership ? tierMapping[membership.tier] || 'Member' : 'Member';

    // Calculate welcome points based on tier
    const welcomePoints = {
      'Member': 100,
      'Silver': 250,
      'Gold': 500
    }[loyaltyTier];

    const loyaltyData = {
      CustomerLoyalty: {
        customerID: customerId,
        balance: welcomePoints,
        tier: loyaltyTier,
        status: 'active',
        enrollmentDate: new Date().toISOString()
      }
    };

    const response = await axios.post(
      `${LIGHTSPEED_BASE_URL}/CustomerLoyalty.json`,
      loyaltyData,
      {
        headers: {
[REDACTED - SECURITY BREACH]
          'Content-Type': 'application/json'
        }
      }
    );

    const loyalty = response.data.CustomerLoyalty;

    logger.info('Lightspeed Loyalty account created', {
      customerId,
      loyaltyId: loyalty.loyaltyID,
      tier: loyaltyTier,
      points: welcomePoints
    });

    return {
      success: true,
      loyaltyId: loyalty.loyaltyID,
      tier: loyaltyTier,
      points: welcomePoints
    };
  } catch (error) {
    logger.error('Failed to create Lightspeed Loyalty', { customerId, error });
    throw error;
  }
}

/**
 * Auto-enroll verified member in Lightspeed Loyalty
 * @param {string} customerId
 * @param {object} membership
 */
async function autoEnrollLoyalty(customerId, membership) {
  try {
    // Check if already enrolled
    const existingLoyalty = await checkLightspeedLoyalty(customerId);

    if (existingLoyalty.exists) {
      logger.info('Customer already has Lightspeed Loyalty', {
        customerId,
        loyaltyId: existingLoyalty.loyaltyId
      });
      return existingLoyalty;
    }

    // Create loyalty account
    const newLoyalty = await createLightspeedLoyalty(customerId, membership);

    logger.info('Customer auto-enrolled in Lightspeed Loyalty', {
      customerId,
      loyaltyId: newLoyalty.loyaltyId,
      tier: newLoyalty.tier
    });

    return newLoyalty;
  } catch (error) {
    logger.error('Failed to auto-enroll loyalty', { customerId, error });
    // Don't fail the order if loyalty enrollment fails
    return null;
  }
}

// ==================== ORDER STATUS UPDATES ====================

/**
 * Update order status in Lightspeed
 * @param {string} orderId
 * @param {string} status - 'PENDING', 'APPROVED', 'REJECTED'
 */
async function updateOrderStatus(orderId, status) {
  try {
    const statusMapping = {
      'PENDING': 'On Hold',
      'APPROVED': 'Processing',
      'REJECTED': 'Cancelled'
    };

    const lightspeedStatus = statusMapping[status] || 'On Hold';

    await axios.put(
      `${LIGHTSPEED_BASE_URL}/Order/${orderId}.json`,
      {
        Order: {
          orderStatus: lightspeedStatus
        }
      },
      {
        headers: {
[REDACTED - SECURITY BREACH]
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info('Order status updated', { orderId, status: lightspeedStatus });
  } catch (error) {
    logger.error('Failed to update order status', { orderId, status, error });
    throw error;
  }
}

/**
 * Process refund for rejected order
 * @param {string} orderId
 * @param {number} amount
 */
async function processRefund(orderId, amount) {
  try {
    // This would integrate with your payment processor (KAJA/Authorize.Net)
    // For now, log the refund request
    logger.info('Processing refund', { orderId, amount });

    // TODO: Implement actual refund logic via KAJA gateway
    // Example:
    // await kajaGateway.refund(orderId, amount);

    return {
      success: true,
      refundId: `REF_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      amount
    };
  } catch (error) {
    logger.error('Failed to process refund', { orderId, amount, error });
    throw error;
  }
}

// ==================== EMAIL AUTOMATION ====================

/**
 * Send verification reminder email
 * @param {string} email
 * @param {string} customerId
 * @param {number} hoursRemaining
 */
async function sendVerificationReminder(email, customerId, hoursRemaining) {
  try {
    const emailData = {
      to: email,
      subject: `Action Required: Complete Verification (${hoursRemaining}h remaining)`,
      template: 'verification_reminder',
      data: {
        customerId,
        hoursRemaining,
        verificationUrl: `https://reggieanddro.com/verify?customer=${customerId}`,
        expiresAt: new Date(Date.now() + hoursRemaining * 60 * 60 * 1000).toISOString()
      }
    };

    await axios.post(EMAIL_SERVICE_URL, emailData);
    logger.info('Verification reminder sent', { email, hoursRemaining });
  } catch (error) {
    logger.error('Failed to send verification reminder', { email, error });
  }
}

/**
 * Schedule 72-hour email sequence
 * @param {string} orderId
 * @param {string} email
 * @param {string} customerId
 */
async function schedule72HourSequence(orderId, email, customerId) {
  try {
    // Schedule 3 reminder emails: 48h, 24h, 6h remaining
    const reminders = [
      { delay: 24 * 60 * 60 * 1000, hoursRemaining: 48 }, // 24h from now (48h left)
      { delay: 48 * 60 * 60 * 1000, hoursRemaining: 24 }, // 48h from now (24h left)
      { delay: 66 * 60 * 60 * 1000, hoursRemaining: 6 }   // 66h from now (6h left)
    ];

    for (const reminder of reminders) {
      setTimeout(() => {
        // Re-check verification status before sending
        runVerificationGate(customerId).then(({ approved }) => {
          if (!approved) {
            sendVerificationReminder(email, customerId, reminder.hoursRemaining);
          }
        });
      }, reminder.delay);
    }

    // Schedule auto-refund after 72 hours
    setTimeout(async () => {
      const { approved } = await runVerificationGate(customerId);
      if (!approved) {
        logger.warn('72-hour verification deadline passed - auto-refunding', { orderId, customerId });
        await updateOrderStatus(orderId, 'REJECTED');
        await processRefund(orderId, 0); // Amount would come from order data
      }
    }, 72 * 60 * 60 * 1000); // 72 hours

    logger.info('72-hour email sequence scheduled', { orderId, email });
  } catch (error) {
    logger.error('Failed to schedule email sequence', { orderId, error });
  }
}

// ==================== WEBHOOK ENDPOINT ====================

/**
 * POST /api/webhooks/lightspeed/order-created
 * Triggered when new order is created in Lightspeed
 */
router.post('/api/webhooks/lightspeed/order-created', async (req, res) => {
  try {
    const { order } = req.body;

    if (!order || !order.orderID || !order.customerID) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook payload - missing order data'
      });
    }

    const orderId = order.orderID;
    const customerId = order.customerID;
    const customerEmail = order.Customer?.email;

    logger.info('Order created webhook received', { orderId, customerId });

    // Run verification gate
    const gateResult = await runVerificationGate(customerId);

    if (gateResult.approved) {
      // ✅ APPROVED - Process immediately
      logger.info('Verification gate PASSED', { orderId, customerId });

      // Update order status to approved
      await updateOrderStatus(orderId, 'APPROVED');

      // Auto-enroll in Lightspeed Loyalty
      await autoEnrollLoyalty(customerId, gateResult.membership.membership);

      return res.json({
        success: true,
        status: 'APPROVED',
        message: 'Order approved and loyalty enrolled',
        verification: gateResult
      });
    } else {
      // ⚠️ PENDING - Start 72-hour countdown
      logger.warn('Verification gate PENDING', { orderId, customerId, reason: gateResult.reason });

      // Update order status to pending/hold
      await updateOrderStatus(orderId, 'PENDING');

      // Start 72-hour email sequence
      if (customerEmail) {
        await schedule72HourSequence(orderId, customerEmail, customerId);
      }

      return res.json({
        success: true,
        status: 'PENDING',
        message: '72-hour verification countdown started',
        reason: gateResult.reason,
        verification: gateResult
      });
    }
  } catch (error) {
    logger.error('Order verification webhook failed', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/verification/check/:customerId
 * Manual check endpoint (for testing or manual verification)
 */
router.post('/api/verification/check/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const gateResult = await runVerificationGate(customerId);

    res.json({
      success: true,
      verification: gateResult
    });
  } catch (error) {
    logger.error('Manual verification check failed', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export {
  router,
  runVerificationGate,
  autoEnrollLoyalty,
  checkLightspeedLoyalty
};
```

---

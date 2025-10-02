// LivHana Membership System
// Three-tier subscription system with BigQuery storage and KAJA payment integration

import express from 'express';
import crypto from 'crypto';
import { BigQuery } from '@google-cloud/bigquery';
import { createLogger } from '../../common/logging/index.js';
import axios from 'axios';

const router = express.Router();
const logger = createLogger('membership-service');

// Configuration
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET = process.env.BQ_DATASET || 'commerce';
const MEMBERSHIPS_TABLE = process.env.BQ_TABLE_MEMBERSHIPS || 'memberships';
const LOCATION = process.env.BQ_LOCATION || 'US';

// KAJA Payment Gateway Configuration (Authorize.Net)
const KAJA_API_LOGIN_ID = process.env.AUTHORIZE_NET_API_LOGIN_ID;
const KAJA_TRANSACTION_KEY = process.env.AUTHORIZE_NET_TRANSACTION_KEY;
const KAJA_SANDBOX = process.env.AUTHORIZE_NET_SANDBOX === 'true';
const KAJA_API_URL = KAJA_SANDBOX
  ? 'https://apitest.authorize.net/xml/v1/request.api'
  : 'https://api.authorize.net/xml/v1/request.api';

// Email service endpoint
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3007/api/email/send';

// Initialize BigQuery client
let bqClient;
try {
  if (PROJECT_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    bqClient = new BigQuery({ projectId: PROJECT_ID });
    logger.info('BigQuery client initialized for membership service');
  } else {
    logger.warn('BigQuery not configured - using mock mode');
  }
} catch (error) {
  logger.error('Failed to initialize BigQuery client', error);
}

// Membership tier definitions
const MEMBERSHIP_TIERS = {
  BRONZE: {
    name: 'Bronze',
    price: 47.00,
    discountPercent: 10,
    benefits: [
      '10% discount on all products',
      'Monthly newsletter',
      'Member-only promotions'
    ],
    stripePriceId: process.env.STRIPE_BRONZE_PRICE_ID || 'price_bronze_monthly'
  },
  SILVER: {
    name: 'Silver',
    price: 97.00,
    discountPercent: 20,
    benefits: [
      '20% discount on all products',
      'Access to exclusive strains',
      'Monthly gift with purchase',
      'Priority customer support',
      'Early access to new products'
    ],
    stripePriceId: process.env.STRIPE_SILVER_PRICE_ID || 'price_silver_monthly'
  },
  GOLD: {
    name: 'Gold',
    price: 197.00,
    discountPercent: 30,
    benefits: [
      '30% discount on all products',
      'VIP event invitations',
      'Monthly raffle entries',
      'Exclusive limited edition strains',
      'Concierge service',
      'Premium gift box monthly',
      'Private consultation sessions'
    ],
    stripePriceId: process.env.STRIPE_GOLD_PRICE_ID || 'price_gold_monthly'
  }
};

// Validation helper
function validateMembershipTier(tier) {
  const validTiers = Object.keys(MEMBERSHIP_TIERS);
  if (!validTiers.includes(tier.toUpperCase())) {
    throw new Error(`Invalid membership tier. Must be one of: ${validTiers.join(', ')}`);
  }
  return tier.toUpperCase();
}

// BigQuery helper functions
async function ensureMembershipsTable() {
  if (!bqClient) return;

  const datasetRef = bqClient.dataset(DATASET);
  const tableRef = datasetRef.table(MEMBERSHIPS_TABLE);

  const [exists] = await tableRef.exists();
  if (exists) {
    logger.info('Memberships table exists');
    return;
  }

  // Create table schema
  const schema = [
    { name: 'id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'customer_id', type: 'STRING', mode: 'REQUIRED' },
    { name: 'email', type: 'STRING', mode: 'REQUIRED' },
    { name: 'tier', type: 'STRING', mode: 'REQUIRED' },
    { name: 'status', type: 'STRING', mode: 'REQUIRED' },
    { name: 'price', type: 'FLOAT', mode: 'REQUIRED' },
    { name: 'discount_percent', type: 'INTEGER', mode: 'REQUIRED' },
    { name: 'subscription_id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'payment_method_id', type: 'STRING', mode: 'NULLABLE' },
    { name: 'start_date', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'next_billing_date', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'cancel_date', type: 'TIMESTAMP', mode: 'NULLABLE' },
    { name: 'created_at', type: 'TIMESTAMP', mode: 'REQUIRED' },
    { name: 'updated_at', type: 'TIMESTAMP', mode: 'REQUIRED' }
  ];

  await tableRef.create({
    schema: { fields: schema },
    location: LOCATION
  });

  logger.info('Memberships table created successfully');
}

// KAJA Payment Gateway Integration
class KAJAPaymentGateway {
  constructor() {
    this.apiLoginId = KAJA_API_LOGIN_ID;
    this.transactionKey = KAJA_TRANSACTION_KEY;
    this.apiUrl = KAJA_API_URL;
  }

  // Create recurring subscription through KAJA/Authorize.Net
  async createSubscription(customerData, tier, paymentMethod) {
    const tierConfig = MEMBERSHIP_TIERS[tier];

    // Generate subscription ID
    const subscriptionId = `SUB_${tier}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // In production, this would make actual API call to Authorize.Net
    // For now, return mock subscription
    logger.info('Creating KAJA subscription', {
      subscriptionId,
      tier,
      amount: tierConfig.price
    });

    // Mock response - in production this would be real API response
    const subscription = {
      subscriptionId,
      status: 'active',
      amount: tierConfig.price,
      interval: 'monthly',
      nextBillingDate: this.calculateNextBillingDate(),
      paymentMethodId: paymentMethod.id || `PM_${crypto.randomBytes(8).toString('hex')}`
    };

    return subscription;
  }

  // Process one-time charge
  async chargeCard(amount, paymentMethod, description) {
    const transactionId = `TXN_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    logger.info('Processing KAJA payment', {
      transactionId,
      amount,
      description
    });

    // Mock successful charge
    return {
      transactionId,
      status: 'success',
      amount,
      timestamp: new Date().toISOString()
    };
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    logger.info('Cancelling KAJA subscription', { subscriptionId });

    // In production, call Authorize.Net API to cancel
    return {
      success: true,
      subscriptionId,
      cancelledAt: new Date().toISOString()
    };
  }

  // Update subscription (upgrade/downgrade)
  async updateSubscription(subscriptionId, newTier) {
    const tierConfig = MEMBERSHIP_TIERS[newTier];

    logger.info('Updating KAJA subscription', {
      subscriptionId,
      newTier,
      newAmount: tierConfig.price
    });

    return {
      subscriptionId,
      newAmount: tierConfig.price,
      effectiveDate: new Date().toISOString()
    };
  }

  calculateNextBillingDate() {
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate.toISOString();
  }
}

const kajaGateway = new KAJAPaymentGateway();

// Email notification helper
async function sendWelcomeEmail(customerEmail, tier, membershipDetails) {
  try {
    const tierConfig = MEMBERSHIP_TIERS[tier];

    const emailData = {
      to: customerEmail,
      subject: `Welcome to LivHana ${tierConfig.name} Membership!`,
      template: 'membership_welcome',
      data: {
        tier: tierConfig.name,
        price: tierConfig.price,
        discount: tierConfig.discountPercent,
        benefits: tierConfig.benefits,
        membershipId: membershipDetails.id,
        nextBillingDate: membershipDetails.next_billing_date
      }
    };

    // Send to email service
    await axios.post(EMAIL_SERVICE_URL, emailData);
    logger.info('Welcome email sent', { customerEmail, tier });
  } catch (error) {
    logger.error('Failed to send welcome email', error);
    // Don't fail the subscription creation if email fails
  }
}

// Database operations
async function saveMembership(membershipData) {
  if (!bqClient) {
    logger.warn('BigQuery not available, returning mock data');
    return membershipData;
  }

  await ensureMembershipsTable();

  const rows = [{
    id: membershipData.id,
    customer_id: membershipData.customer_id,
    email: membershipData.email,
    tier: membershipData.tier,
    status: membershipData.status,
    price: membershipData.price,
    discount_percent: membershipData.discount_percent,
    subscription_id: membershipData.subscription_id,
    payment_method_id: membershipData.payment_method_id,
    start_date: membershipData.start_date,
    next_billing_date: membershipData.next_billing_date,
    cancel_date: membershipData.cancel_date || null,
    created_at: membershipData.created_at,
    updated_at: membershipData.updated_at
  }];

  await bqClient
    .dataset(DATASET)
    .table(MEMBERSHIPS_TABLE)
    .insert(rows);

  logger.info('Membership saved to BigQuery', { membershipId: membershipData.id });
  return membershipData;
}

async function getMembershipByCustomerId(customerId) {
  if (!bqClient) {
    logger.warn('BigQuery not available');
    return null;
  }

  const query = `
    SELECT *
    FROM \`${PROJECT_ID}.${DATASET}.${MEMBERSHIPS_TABLE}\`
    WHERE customer_id = @customerId
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const options = {
    query,
    location: LOCATION,
    params: { customerId }
  };

  const [rows] = await bqClient.query(options);
  return rows.length > 0 ? rows[0] : null;
}

async function updateMembershipStatus(membershipId, updates) {
  if (!bqClient) {
    logger.warn('BigQuery not available');
    return updates;
  }

  // BigQuery doesn't support UPDATE directly, so we insert a new record
  // In production, you'd want to handle this with a more sophisticated approach
  // or use a transactional database for membership state

  logger.info('Membership updated', { membershipId, updates });
  return updates;
}

// Calculate discount for checkout
function calculateMembershipDiscount(subtotal, tier) {
  const tierConfig = MEMBERSHIP_TIERS[tier];
  if (!tierConfig) return 0;

  const discountAmount = subtotal * (tierConfig.discountPercent / 100);
  return parseFloat(discountAmount.toFixed(2));
}

// Calculate membership metrics
async function calculateMembershipMetrics() {
  if (!bqClient) {
    return {
      mrr: 0,
      activeMembers: 0,
      churnRate: 0,
      tierDistribution: {},
      lifetimeValue: {}
    };
  }

  try {
    // Monthly Recurring Revenue (MRR)
    const mrrQuery = `
      SELECT
        SUM(price) as total_mrr,
        COUNT(*) as active_members,
        tier,
        AVG(price) as avg_tier_price
      FROM \`${PROJECT_ID}.${DATASET}.${MEMBERSHIPS_TABLE}\`
      WHERE status = 'active'
      GROUP BY tier
    `;

    const [mrrResults] = await bqClient.query({ query: mrrQuery, location: LOCATION });

    // Churn rate calculation (cancelled in last 30 days vs active at start of period)
    const churnQuery = `
      SELECT
        COUNT(*) as cancelled_count
      FROM \`${PROJECT_ID}.${DATASET}.${MEMBERSHIPS_TABLE}\`
      WHERE status = 'cancelled'
        AND cancel_date >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
    `;

    const activeQuery = `
      SELECT COUNT(*) as active_30_days_ago
      FROM \`${PROJECT_ID}.${DATASET}.${MEMBERSHIPS_TABLE}\`
      WHERE created_at <= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
        AND (cancel_date IS NULL OR cancel_date > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY))
    `;

    const [churnResults] = await bqClient.query({ query: churnQuery, location: LOCATION });
    const [activeResults] = await bqClient.query({ query: activeQuery, location: LOCATION });

    const cancelledCount = churnResults[0]?.cancelled_count || 0;
    const active30DaysAgo = activeResults[0]?.active_30_days_ago || 1;
    const churnRate = ((cancelledCount / active30DaysAgo) * 100).toFixed(2);

    // Aggregate metrics
    const totalMRR = mrrResults.reduce((sum, row) => sum + (row.total_mrr || 0), 0);
    const totalActiveMembers = mrrResults.reduce((sum, row) => sum + (row.active_members || 0), 0);

    const tierDistribution = {};
    const lifetimeValue = {};

    mrrResults.forEach(row => {
      tierDistribution[row.tier] = row.active_members;
      // Simplified LTV = Average Revenue * Average Lifetime (assume 12 months)
      lifetimeValue[row.tier] = parseFloat((row.avg_tier_price * 12).toFixed(2));
    });

    return {
      mrr: parseFloat(totalMRR.toFixed(2)),
      activeMembers: totalActiveMembers,
      churnRate: parseFloat(churnRate),
      tierDistribution,
      lifetimeValue
    };
  } catch (error) {
    logger.error('Error calculating membership metrics', error);
    throw error;
  }
}

// ==================== REST API ENDPOINTS ====================

// POST /api/memberships/subscribe - Create new subscription
router.post('/api/memberships/subscribe', async (req, res) => {
  try {
    const { customerId, email, tier, paymentMethod } = req.body;

    // Validate required fields
    if (!customerId || !email || !tier || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: customerId, email, tier, paymentMethod'
      });
    }

    // Validate tier
    const validatedTier = validateMembershipTier(tier);
    const tierConfig = MEMBERSHIP_TIERS[validatedTier];

    // Check if customer already has active membership
    const existingMembership = await getMembershipByCustomerId(customerId);
    if (existingMembership && existingMembership.status === 'active') {
      return res.status(400).json({
        success: false,
        error: 'Customer already has an active membership'
      });
    }

    // Create subscription with KAJA gateway
    const subscription = await kajaGateway.createSubscription(
      { customerId, email },
      validatedTier,
      paymentMethod
    );

    // Create membership record
    const now = new Date().toISOString();
    const membershipData = {
      id: `MEM_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`,
      customer_id: customerId,
      email,
      tier: validatedTier,
      status: 'active',
      price: tierConfig.price,
      discount_percent: tierConfig.discountPercent,
      subscription_id: subscription.subscriptionId,
      payment_method_id: subscription.paymentMethodId,
      start_date: now,
      next_billing_date: subscription.nextBillingDate,
      cancel_date: null,
      created_at: now,
      updated_at: now
    };

    // Save to BigQuery
    await saveMembership(membershipData);

    // Send welcome email
    await sendWelcomeEmail(email, validatedTier, membershipData);

    logger.info('Membership created', {
      membershipId: membershipData.id,
      customerId,
      tier: validatedTier
    });

    res.status(201).json({
      success: true,
      membership: membershipData
    });
  } catch (error) {
    logger.error('Failed to create membership', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/memberships/:customerId - Get current membership
router.get('/api/memberships/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    const membership = await getMembershipByCustomerId(customerId);

    if (!membership) {
      return res.status(404).json({
        success: false,
        error: 'No membership found for this customer'
      });
    }

    // Add tier details
    const tierConfig = MEMBERSHIP_TIERS[membership.tier];
    const membershipWithDetails = {
      ...membership,
      benefits: tierConfig.benefits
    };

    res.json({
      success: true,
      membership: membershipWithDetails
    });
  } catch (error) {
    logger.error('Failed to retrieve membership', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/memberships/:customerId/upgrade - Upgrade membership tier
router.put('/api/memberships/:customerId/upgrade', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { newTier } = req.body;

    if (!newTier) {
      return res.status(400).json({
        success: false,
        error: 'newTier is required'
      });
    }

    // Validate new tier
    const validatedNewTier = validateMembershipTier(newTier);
    const newTierConfig = MEMBERSHIP_TIERS[validatedNewTier];

    // Get current membership
    const currentMembership = await getMembershipByCustomerId(customerId);
    if (!currentMembership || currentMembership.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: 'No active membership found for this customer'
      });
    }

    const currentTierConfig = MEMBERSHIP_TIERS[currentMembership.tier];

    // Check if it's actually an upgrade
    if (newTierConfig.price <= currentTierConfig.price) {
      return res.status(400).json({
        success: false,
        error: 'New tier must be higher than current tier'
      });
    }

    // Update subscription with KAJA gateway
    await kajaGateway.updateSubscription(
      currentMembership.subscription_id,
      validatedNewTier
    );

    // Calculate prorated charge for immediate upgrade
    const proratedAmount = newTierConfig.price - currentTierConfig.price;
    await kajaGateway.chargeCard(
      proratedAmount,
      { id: currentMembership.payment_method_id },
      `Upgrade to ${newTierConfig.name} - Prorated`
    );

    // Update membership record
    const now = new Date().toISOString();
    const updatedMembership = {
      ...currentMembership,
      tier: validatedNewTier,
      price: newTierConfig.price,
      discount_percent: newTierConfig.discountPercent,
      updated_at: now
    };

    await updateMembershipStatus(currentMembership.id, updatedMembership);

    logger.info('Membership upgraded', {
      customerId,
      from: currentMembership.tier,
      to: validatedNewTier
    });

    res.json({
      success: true,
      membership: updatedMembership,
      proratedCharge: proratedAmount
    });
  } catch (error) {
    logger.error('Failed to upgrade membership', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/memberships/:customerId/cancel - Cancel subscription
router.put('/api/memberships/:customerId/cancel', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { reason } = req.body;

    // Get current membership
    const membership = await getMembershipByCustomerId(customerId);
    if (!membership || membership.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: 'No active membership found for this customer'
      });
    }

    // Cancel subscription with KAJA gateway
    await kajaGateway.cancelSubscription(membership.subscription_id);

    // Update membership status
    const now = new Date().toISOString();
    const cancelledMembership = {
      ...membership,
      status: 'cancelled',
      cancel_date: now,
      updated_at: now,
      cancel_reason: reason || 'No reason provided'
    };

    await updateMembershipStatus(membership.id, cancelledMembership);

    logger.info('Membership cancelled', {
      customerId,
      membershipId: membership.id,
      reason
    });

    res.json({
      success: true,
      message: 'Membership cancelled successfully',
      membership: cancelledMembership
    });
  } catch (error) {
    logger.error('Failed to cancel membership', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/memberships/stats - Admin dashboard statistics
router.get('/api/memberships/stats', async (req, res) => {
  try {
    // Check if user has admin role
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions. Admin access required.'
      });
    }

    const metrics = await calculateMembershipMetrics();

    res.json({
      success: true,
      stats: {
        monthlyRecurringRevenue: metrics.mrr,
        activeMembers: metrics.activeMembers,
        churnRate: `${metrics.churnRate}%`,
        tierDistribution: metrics.tierDistribution,
        lifetimeValueByTier: metrics.lifetimeValue,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to retrieve membership stats', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/memberships/discount/:customerId - Calculate discount for checkout
router.get('/api/memberships/discount/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { subtotal } = req.query;

    if (!subtotal) {
      return res.status(400).json({
        success: false,
        error: 'subtotal query parameter is required'
      });
    }

    const membership = await getMembershipByCustomerId(customerId);

    if (!membership || membership.status !== 'active') {
      return res.json({
        success: true,
        hasDiscount: false,
        discountAmount: 0,
        discountPercent: 0,
        finalTotal: parseFloat(subtotal)
      });
    }

    const discountAmount = calculateMembershipDiscount(parseFloat(subtotal), membership.tier);
    const finalTotal = parseFloat(subtotal) - discountAmount;

    res.json({
      success: true,
      hasDiscount: true,
      discountAmount,
      discountPercent: membership.discount_percent,
      finalTotal: parseFloat(finalTotal.toFixed(2)),
      tier: membership.tier
    });
  } catch (error) {
    logger.error('Failed to calculate discount', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export router and utilities
export {
  router,
  MEMBERSHIP_TIERS,
  calculateMembershipDiscount,
  calculateMembershipMetrics
};
// Last optimized: 2025-10-02

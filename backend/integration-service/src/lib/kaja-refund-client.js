import fetch from 'node-fetch';
import crypto from 'crypto';
import { createLogger } from '../../../common/logging/index.js';

const logger = createLogger('kaja-refund-client');

/**
 * KAJA REFUND CLIENT
 *
 * KAJA payment processing integration for refunds
 * Handles automatic refunds for unverified orders
 *
 * Environment Variables:
 * - KAJA_API_KEY: API key from KAJA dashboard
 * - KAJA_MERCHANT_ID: Merchant ID
 * - KAJA_BASE_URL: API base URL (production or sandbox)
 */

export class KAJARefundClient {
  constructor() {
    this.apiKey = process.env.KAJA_API_KEY;
    this.merchantId = process.env.KAJA_MERCHANT_ID;
    this.baseUrl = process.env.KAJA_BASE_URL || 'https://api.kaja.com';

    this.available = !!(this.apiKey && this.merchantId);

    if (!this.available) {
      logger.warn('KAJA credentials not configured - refunds will be mocked');
    } else {
      logger.info('KAJA refund client initialized', {
        merchantId: this.merchantId,
        baseUrl: this.baseUrl
      });
    }
  }

  isAvailable() {
    return this.available;
  }

  /**
   * Process refund for a transaction
   *
   * @param {Object} params - Refund parameters
   * @param {string} params.transactionId - Original transaction ID
   * @param {number} params.amount - Refund amount
   * @param {string} params.reason - Refund reason
   * @param {string} params.orderId - Order ID for reference
   * @returns {Promise<Object>} Refund result
   */
  async processRefund({ transactionId, amount, reason, orderId }) {
    try {
      logger.info('Processing KAJA refund', {
        transactionId,
        amount,
        orderId,
        reason
      });

      if (!this.available) {
        // Return mock refund if KAJA not configured
        logger.warn('KAJA not configured - returning mock refund', { orderId });

        return {
          success: true,
          refundId: `MOCK-REFUND-${Date.now()}`,
          transactionId,
          amount,
          status: 'pending',
          method: 'original_payment_method',
          processedAt: new Date().toISOString(),
          estimatedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          reason,
          mock: true
        };
      }

      // Real KAJA API call
      const response = await fetch(`${this.baseUrl}/v1/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Merchant-ID': this.merchantId
        },
        body: JSON.stringify({
          transaction_id: transactionId,
          amount: Math.round(amount * 100), // Convert to cents
          reason,
          metadata: {
            order_id: orderId,
            refund_type: 'age_verification_timeout'
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`KAJA API error: ${data.message || response.statusText}`);
      }

      logger.info('KAJA refund processed successfully', {
        refundId: data.refund_id,
        transactionId,
        amount,
        orderId
      });

      return {
        success: true,
        refundId: data.refund_id,
        transactionId,
        amount: data.amount / 100, // Convert back to dollars
        status: data.status,
        method: data.refund_method,
        processedAt: data.created_at,
        estimatedArrival: data.estimated_arrival,
        reason
      };

    } catch (error) {
      logger.error('KAJA refund failed', {
        error: error.message,
        transactionId,
        orderId
      });

      throw error;
    }
  }

  /**
   * Get refund status
   */
  async getRefundStatus(refundId) {
    try {
      if (!this.available) {
        throw new Error('KAJA not configured');
      }

      const response = await fetch(`${this.baseUrl}/v1/refunds/${refundId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Merchant-ID': this.merchantId
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`KAJA API error: ${data.message || response.statusText}`);
      }

      return {
        success: true,
        refundId: data.refund_id,
        status: data.status,
        amount: data.amount / 100,
        processedAt: data.created_at,
        completedAt: data.completed_at
      };

    } catch (error) {
      logger.error('Get refund status failed', {
        error: error.message,
        refundId
      });

      throw error;
    }
  }

  /**
   * Cancel pending refund
   */
  async cancelRefund(refundId, reason) {
    try {
      if (!this.available) {
        throw new Error('KAJA not configured');
      }

      const response = await fetch(`${this.baseUrl}/v1/refunds/${refundId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-Merchant-ID': this.merchantId
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`KAJA API error: ${data.message || response.statusText}`);
      }

      logger.info('KAJA refund cancelled', { refundId, reason });

      return {
        success: true,
        refundId,
        status: 'cancelled'
      };

    } catch (error) {
      logger.error('Cancel refund failed', {
        error: error.message,
        refundId
      });

      throw error;
    }
  }
}

// Export singleton instance
let kajaClient = null;

export function getKAJARefundClient() {
  if (!kajaClient) {
    kajaClient = new KAJARefundClient();
  }
  return kajaClient;
}

export default KAJARefundClient;

// Created: 2025-10-04
// Real KAJA refund integration with fallback to mock
// Production-ready with error handling

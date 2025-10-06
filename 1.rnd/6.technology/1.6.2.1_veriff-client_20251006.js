import fetch from 'node-fetch';
import crypto from 'crypto';
import { createLogger } from '../../common/logging/index.js';

const logger = createLogger('veriff-client');

/**
 * Veriff Client - Real Age Verification Integration
 *
 * Purpose: Create verification sessions and handle webhook callbacks
 * API Docs: https://developers.veriff.com/
 *
 * Environment Variables Required:
[REDACTED - SECURITY BREACH]
 * - VERIFF_API_SECRET: Secret for webhook signature verification (if available)
 * - VERIFF_BASE_URL: API base URL (production or sandbox)
 */

export class VeriffClient {
  constructor() {
[REDACTED - SECURITY BREACH]
    this.apiSecret = process.env.VERIFF_API_SECRET || null;
    this.baseUrl = process.env.VERIFF_BASE_URL || 'https://stationapi.veriff.com';
    this.callbackUrl = process.env.API_BASE_URL
      ? `${process.env.API_BASE_URL}/api/v1/veriff/webhook`
      : 'https://integration-service.run.app/api/v1/veriff/webhook';

    if (!this.apiKey) {
[REDACTED - SECURITY BREACH]
    }

    logger.info('Veriff client initialized', {
      baseUrl: this.baseUrl,
      hasApiSecret: !!this.apiSecret,
      callbackUrl: this.callbackUrl
    });
  }

  /**
   * Create a new verification session
   *
   * @param {Object} params - Session parameters
   * @param {string} params.orderId - Order ID to track verification
   * @param {string} params.email - Customer email
   * @param {string} params.firstName - Customer first name (optional)
   * @param {string} params.lastName - Customer last name (optional)
   * @returns {Promise<Object>} Session details (sessionId, verificationUrl)
   */
  async createSession({ orderId, email, firstName = '', lastName = '' }) {
    const startTime = Date.now();

    try {
      logger.info('Creating Veriff session', { orderId, email });

      const payload = {
        verification: {
          callback: this.callbackUrl,
          person: {
            firstName: firstName || 'Customer',
            lastName: lastName || 'Name'
          },
          vendorData: JSON.stringify({
            orderId,
            email,
            timestamp: new Date().toISOString()
          }),
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch(`${this.baseUrl}/v1/sessions`, {
        method: 'POST',
        headers: {
          'X-AUTH-CLIENT': this.apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'LivHana-Integration/1.0'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('Veriff session creation failed', {
          status: response.status,
          error: data,
          orderId
        });

        throw new Error(`Veriff API error: ${data.message || response.statusText}`);
      }

      const elapsed = Date.now() - startTime;
      logger.info('Veriff session created successfully', {
        sessionId: data.verification.id,
        orderId,
        elapsed: `${elapsed}ms`
      });

      return {
        success: true,
        sessionId: data.verification.id,
        verificationUrl: data.verification.url,
        status: data.verification.status,
        host: data.verification.host,
        vendorData: data.verification.vendorData
      };

    } catch (error) {
      logger.error('Veriff session creation error', {
        error: error.message,
        stack: error.stack,
        orderId
      });

      throw error;
    }
  }

  /**
   * Get session details
   *
   * @param {string} sessionId - Veriff session ID
   * @returns {Promise<Object>} Session details
   */
  async getSession(sessionId) {
    try {
      logger.info('Getting Veriff session', { sessionId });

      const response = await fetch(`${this.baseUrl}/v1/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'X-AUTH-CLIENT': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Veriff API error: ${data.message || response.statusText}`);
      }

      return {
        success: true,
        session: data.verification
      };

    } catch (error) {
      logger.error('Get Veriff session error', {
        error: error.message,
        sessionId
      });

      throw error;
    }
  }

  /**
   * Get decision details (verification result)
   *
   * @param {string} sessionId - Veriff session ID
   * @returns {Promise<Object>} Decision details
   */
  async getDecision(sessionId) {
    try {
      logger.info('Getting Veriff decision', { sessionId });

      const response = await fetch(`${this.baseUrl}/v1/sessions/${sessionId}/decision`, {
        method: 'GET',
        headers: {
          'X-AUTH-CLIENT': this.apiKey,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Veriff API error: ${data.message || response.statusText}`);
      }

      return {
        success: true,
        decision: data.verification,
        status: data.verification.status,
        code: data.verification.code,
        reason: data.verification.reason
      };

    } catch (error) {
      logger.error('Get Veriff decision error', {
        error: error.message,
        sessionId
      });

      throw error;
    }
  }

  /**
   * Verify webhook signature (if API secret is available)
   *
   * @param {Object} payload - Webhook payload
   * @param {string} signature - X-HMAC-SIGNATURE header value
   * @returns {boolean} True if signature is valid
   */
  verifyWebhookSignature(payload, signature) {
    if (!this.apiSecret) {
      logger.warn('API secret not configured - skipping webhook signature verification');
      return true; // Allow webhook if no secret configured (less secure)
    }

    try {
      const payloadString = JSON.stringify(payload);
      const hash = crypto
        .createHmac('sha256', this.apiSecret)
        .update(payloadString)
        .digest('hex');

      const isValid = hash === signature;

      if (!isValid) {
        logger.error('Webhook signature verification failed', {
          expectedHash: hash.substring(0, 10) + '...',
          receivedSignature: signature?.substring(0, 10) + '...'
        });
      }

      return isValid;

    } catch (error) {
      logger.error('Webhook signature verification error', {
        error: error.message
      });

      return false;
    }
  }

  /**
   * Parse vendor data from Veriff webhook
   *
   * @param {string} vendorData - JSON string from webhook
   * @returns {Object} Parsed vendor data
   */
  parseVendorData(vendorData) {
    try {
      return JSON.parse(vendorData);
    } catch (error) {
      logger.error('Failed to parse vendor data', {
        error: error.message,
        vendorData
      });
      return null;
    }
  }
}

// Export singleton instance
let veriffClient = null;

export function getVeriffClient() {
  if (!veriffClient) {
    try {
      veriffClient = new VeriffClient();
    } catch (error) {
      logger.error('Failed to initialize Veriff client', {
        error: error.message
      });
      throw error;
    }
  }
  return veriffClient;
}

export default VeriffClient;

// Created: 2025-10-04
// Real Veriff integration - replaces placeholder code
// Tier-1 Option A: Production-ready with error handling

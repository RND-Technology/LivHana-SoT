import fetch from 'node-fetch';
import crypto from 'crypto';
import { createLogger } from '../../../common/logging/index.js';

const logger = createLogger('doordash-client');

/**
 * DOORDASH DRIVE CLIENT
 *
 * Official DoorDash Drive API integration for enterprise deliveries
 * API Docs: https://developer.doordash.com/en-US/docs/drive/reference/
 *
 * Environment Variables:
 * - DOORDASH_DEVELOPER_ID: Developer ID from DoorDash dashboard
 * - DOORDASH_KEY_ID: Key ID for JWT signing
 * - DOORDASH_SIGNING_SECRET: Secret for JWT signing
 * - DOORDASH_BASE_URL: API base URL (production or sandbox)
 */

export class DoorDashClient {
  constructor() {
    this.developerId = process.env.DOORDASH_DEVELOPER_ID;
    this.keyId = process.env.DOORDASH_KEY_ID;
    this.signingSecret = process.env.DOORDASH_SIGNING_SECRET;
    this.baseUrl = process.env.DOORDASH_BASE_URL || 'https://openapi.doordash.com';

    this.available = !!(this.developerId && this.keyId && this.signingSecret);

    if (!this.available) {
      logger.warn('DoorDash credentials not configured - provider disabled');
    } else {
      logger.info('DoorDash client initialized', {
        baseUrl: this.baseUrl,
        developerId: this.developerId
      });
    }
  }

  isAvailable() {
    return this.available;
  }

  /**
   * Generate JWT token for API authentication
   */
  generateToken() {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
      dd_ver: 'DD-JWT-V1'
    };

    const payload = {
      aud: 'doordash',
      iss: this.developerId,
      key_id: this.keyId,
      exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
      iat: Math.floor(Date.now() / 1000)
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

    const signature = crypto
      .createHmac('sha256', this.signingSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Get delivery quote
   */
  async getQuote({ pickup, dropoff, distance }) {
    try {
      logger.info('Getting DoorDash quote', {
        pickup: pickup.address,
        dropoff: dropoff.address,
        distance
      });

      const token = this.generateToken();

      const response = await fetch(`${this.baseUrl}/drive/v2/quotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          external_delivery_id: `quote-${Date.now()}`,
          pickup_address: pickup.address,
          pickup_business_name: pickup.businessName || 'Reggie & Dro',
          pickup_phone_number: pickup.phone || '+12109999999',
          dropoff_address: dropoff.address,
          dropoff_business_name: dropoff.name || 'Customer',
          dropoff_phone_number: dropoff.phone,
          order_value: 10000 // $100 in cents
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`DoorDash API error: ${data.message || response.statusText}`);
      }

      // Calculate our pricing based on distance
      const deliveryFee = this.calculateDeliveryFee(distance);

      logger.info('DoorDash quote received', {
        quoteId: data.external_delivery_id,
        fee: data.fee,
        currency: data.currency
      });

      return {
        cost: deliveryFee,
        providerCost: data.fee / 100, // Convert cents to dollars
        currency: data.currency,
        eta: data.estimated_pickup_time,
        quoteId: data.external_delivery_id
      };

    } catch (error) {
      logger.error('DoorDash quote failed', {
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Calculate delivery fee based on distance
   */
  calculateDeliveryFee(distance) {
    if (distance <= 5) return 10;
    if (distance <= 10) return 15;
    if (distance <= 20) return 20;
    return 25;
  }

  /**
   * Create delivery
   */
  async createDelivery({ orderId, pickup, dropoff, customer, items, orderTotal, distance }) {
    try {
      logger.info('Creating DoorDash delivery', {
        orderId,
        dropoff: dropoff.address
      });

      const token = this.generateToken();

      const response = await fetch(`${this.baseUrl}/drive/v2/deliveries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          external_delivery_id: orderId,
          pickup_address: pickup.address,
          pickup_business_name: pickup.businessName || 'Reggie & Dro',
          pickup_phone_number: pickup.phone || '+12109999999',
          pickup_instructions: pickup.instructions || 'Please ring doorbell',
          dropoff_address: dropoff.address,
          dropoff_business_name: customer.name || 'Customer',
          dropoff_phone_number: customer.phone,
          dropoff_instructions: dropoff.instructions || 'Leave at door if no answer',
          order_value: Math.round(orderTotal * 100), // Convert to cents
          items: items.map(item => ({
            name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            external_id: item.id
          })),
          pickup_time: new Date(Date.now() + 30 * 60000).toISOString(), // 30 min from now
          dropoff_time: new Date(Date.now() + (30 + distance * 2) * 60000).toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`DoorDash API error: ${data.message || response.statusText}`);
      }

      logger.info('DoorDash delivery created', {
        deliveryId: data.external_delivery_id,
        orderId,
        trackingUrl: data.tracking_url
      });

      return {
        deliveryId: data.external_delivery_id,
        providerDeliveryId: data.delivery_id,
        trackingUrl: data.tracking_url,
        status: data.delivery_status,
        estimatedDeliveryTime: data.estimated_dropoff_time,
        fee: data.fee / 100
      };

    } catch (error) {
      logger.error('DoorDash delivery creation failed', {
        error: error.message,
        orderId
      });

      throw error;
    }
  }

  /**
   * Get delivery status
   */
  async getStatus(deliveryId) {
    try {
      const token = this.generateToken();

      const response = await fetch(`${this.baseUrl}/drive/v2/deliveries/${deliveryId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`DoorDash API error: ${data.message || response.statusText}`);
      }

      return {
        status: data.delivery_status,
        driverLocation: data.dasher_location,
        estimatedArrival: data.estimated_dropoff_time,
        lastUpdate: new Date().toISOString()
      };

    } catch (error) {
      logger.error('DoorDash status check failed', {
        error: error.message,
        deliveryId
      });

      throw error;
    }
  }

  /**
   * Cancel delivery
   */
  async cancelDelivery(deliveryId, reason) {
    try {
      const token = this.generateToken();

      const response = await fetch(`${this.baseUrl}/drive/v2/deliveries/${deliveryId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cancellation_reason: reason
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`DoorDash API error: ${data.message || response.statusText}`);
      }

      logger.info('DoorDash delivery cancelled', {
        deliveryId,
        reason
      });

      return {
        success: true,
        status: 'cancelled'
      };

    } catch (error) {
      logger.error('DoorDash cancellation failed', {
        error: error.message,
        deliveryId
      });

      throw error;
    }
  }
}

export default DoorDashClient;

// Created: 2025-10-04
// Real DoorDash Drive API integration
// Production-ready with JWT authentication

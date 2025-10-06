import fetch from 'node-fetch';
import { createLogger } from '../../../common/logging/index.js';

const logger = createLogger('uber-client');

/**
 * UBER DIRECT CLIENT
 *
 * Uber Direct API integration for on-demand deliveries
 * API Docs: https://developer.uber.com/docs/deliveries/introduction
 *
 * Environment Variables:
 * - UBER_CUSTOMER_ID: Customer ID from Uber Direct
 * - UBER_API_KEY: API key for authentication
 * - UBER_BASE_URL: API base URL (production or sandbox)
 */

export class UberClient {
  constructor() {
    this.customerId = process.env.UBER_CUSTOMER_ID;
    this.apiKey = process.env.UBER_API_KEY;
    this.baseUrl = process.env.UBER_BASE_URL || 'https://api.uber.com/v1/deliveries';

    this.available = !!(this.customerId && this.apiKey);

    if (!this.available) {
      logger.warn('Uber Direct credentials not configured - provider disabled');
    } else {
      logger.info('Uber Direct client initialized', {
        baseUrl: this.baseUrl,
        customerId: this.customerId
      });
    }
  }

  isAvailable() {
    return this.available;
  }

  /**
   * Get delivery quote
   */
  async getQuote({ pickup, dropoff, distance }) {
    try {
      logger.info('Getting Uber Direct quote', {
        pickup: pickup.address,
        dropoff: dropoff.address,
        distance
      });

      const response = await fetch(`${this.baseUrl}/quote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pickup: {
            location: {
              address: pickup.address,
              latitude: pickup.lat,
              longitude: pickup.lng
            },
            contact: {
              first_name: 'Store',
              last_name: 'Manager',
              phone: pickup.phone || '+12109999999'
            }
          },
          dropoff: {
            location: {
              address: dropoff.address,
              latitude: dropoff.lat,
              longitude: dropoff.lng
            },
            contact: {
              first_name: dropoff.firstName || 'Customer',
              last_name: dropoff.lastName || 'Name',
              phone: dropoff.phone
            }
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Uber API error: ${data.message || response.statusText}`);
      }

      // Calculate our pricing
      const deliveryFee = this.calculateDeliveryFee(distance);

      logger.info('Uber Direct quote received', {
        quoteId: data.id,
        fee: data.fee,
        currency: data.currency
      });

      return {
        cost: deliveryFee,
        providerCost: data.fee / 100,
        currency: data.currency,
        eta: data.dropoff_eta,
        quoteId: data.id
      };

    } catch (error) {
      logger.error('Uber Direct quote failed', {
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
      logger.info('Creating Uber Direct delivery', {
        orderId,
        dropoff: dropoff.address
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          external_id: orderId,
          pickup: {
            location: {
              address: pickup.address,
              latitude: pickup.lat,
              longitude: pickup.lng
            },
            contact: {
              first_name: 'Store',
              last_name: 'Manager',
              phone: pickup.phone || '+12109999999'
            },
            notes: pickup.instructions || 'Ring doorbell upon arrival'
          },
          dropoff: {
            location: {
              address: dropoff.address,
              latitude: dropoff.lat,
              longitude: dropoff.lng
            },
            contact: {
              first_name: customer.firstName || 'Customer',
              last_name: customer.lastName || 'Name',
              phone: customer.phone
            },
            notes: dropoff.instructions || 'Leave at door if no answer'
          },
          manifest: {
            total_value: Math.round(orderTotal * 100),
            reference: orderId
          },
          pickup_ready_dt: new Date(Date.now() + 30 * 60000).toISOString(),
          dropoff_ready_dt: new Date(Date.now() + (30 + distance * 2) * 60000).toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Uber API error: ${data.message || response.statusText}`);
      }

      logger.info('Uber Direct delivery created', {
        deliveryId: orderId,
        uberDeliveryId: data.id,
        trackingUrl: data.tracking_url
      });

      return {
        deliveryId: orderId,
        providerDeliveryId: data.id,
        trackingUrl: data.tracking_url,
        status: data.status,
        estimatedDeliveryTime: data.dropoff_eta,
        fee: data.fee / 100
      };

    } catch (error) {
      logger.error('Uber Direct delivery creation failed', {
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
      const response = await fetch(`${this.baseUrl}/${deliveryId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Uber API error: ${data.message || response.statusText}`);
      }

      return {
        status: data.status,
        driverLocation: data.courier?.location,
        estimatedArrival: data.dropoff_eta,
        lastUpdate: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Uber Direct status check failed', {
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
      const response = await fetch(`${this.baseUrl}/${deliveryId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Uber API error: ${data.message || response.statusText}`);
      }

      logger.info('Uber Direct delivery cancelled', {
        deliveryId,
        reason
      });

      return {
        success: true,
        status: 'cancelled'
      };

    } catch (error) {
      logger.error('Uber Direct cancellation failed', {
        error: error.message,
        deliveryId
      });

      throw error;
    }
  }
}

export default UberClient;

// Created: 2025-10-04
// Real Uber Direct API integration
// Secondary provider with fast activation

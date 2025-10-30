// RPM DNA: 1.6.2.1 (RND → Operations → Lightspeed Webhook Integration)
// Purpose: Order creation webhook listener for delivery automation
// Owner: Claude Code CLI
// Status: READY FOR CONFIGURATION
// Timestamp: 2025-10-08

const express = require('express');
const crypto = require('crypto');
const { BigQuery } = require('@google-cloud/bigquery');

/**
 * Lightspeed Webhook Listener
 * Listens for order creation events and triggers delivery workflow
 * Includes HMAC signature validation for security
 */
class LightspeedWebhookListener {
  constructor(options = {}) {
    this.port = options.port || process.env.PORT_INTEGRATION_SERVICE || 3005;
    this.webhookSecret = options.webhookSecret || process.env.LIGHTSPEED_WEBHOOK_SECRET;
    this.deliveryServiceUrl = options.deliveryServiceUrl || process.env.DELIVERY_SERVICE_URL;

    if (!this.webhookSecret) {
      throw new Error('LIGHTSPEED_WEBHOOK_SECRET required for HMAC validation');
    }

    this.app = express();
    this.app.use(express.json());

    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID
    });

    this.setupRoutes();
  }

  /**
   * Verify HMAC signature from Lightspeed
   * @param {string} signature - Signature from X-Lightspeed-Signature header
   * @param {string} body - Raw request body
   * @returns {boolean} Valid signature
   */
  verifySignature(signature, body) {
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    hmac.update(body);
    const calculatedSignature = hmac.digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  }

  /**
   * Setup webhook routes
   */
  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'lightspeed-webhook-listener',
        timestamp: new Date().toISOString()
      });
    });

    // Webhook endpoint
    this.app.post('/webhook/lightspeed', async (req, res) => {
      try {
        // Get raw body for signature verification
        const signature = req.headers['x-lightspeed-signature'];
        const rawBody = JSON.stringify(req.body);

        // Verify signature
        if (!signature || !this.verifySignature(signature, rawBody)) {
          console.error('❌ Invalid webhook signature');
          return res.status(401).json({ error: 'Invalid signature' });
        }

        console.log('✅ Webhook signature verified');

        // Process webhook event
        const event = req.body;
        const eventType = event.type || 'unknown';

        console.log(`📬 Received event: ${eventType}`);

        // Handle order creation
        if (eventType === 'order.created') {
          await this.handleOrderCreated(event.data);
        }

        // Acknowledge receipt
        res.status(200).json({ received: true });

      } catch (error) {
        console.error('❌ Webhook processing error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Manual trigger endpoint (for testing)
    this.app.post('/webhook/test', async (req, res) => {
      try {
        console.log('🧪 Test webhook triggered');
        await this.handleOrderCreated(req.body);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  /**
   * Handle order created event
   * @param {Object} orderData - Order data from Lightspeed
   */
  async handleOrderCreated(orderData) {
    console.log(`🛒 Processing order: ${orderData.id}`);

    try {
      // Extract order details
      const order = {
        orderId: orderData.id,
        customerId: orderData.customer?.id,
        customerName: orderData.customer?.name,
        customerEmail: orderData.customer?.email,
        customerPhone: orderData.customer?.phone,
        deliveryAddress: orderData.shipping_address,
        items: orderData.items || [],
        total: orderData.total,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        createdAt: orderData.created_at,
        status: 'pending_delivery'
      };

      // Check if delivery is required
      const requiresDelivery = orderData.delivery_method === 'delivery';

      if (requiresDelivery) {
        console.log('🚚 Order requires delivery - triggering delivery workflow');

        // Trigger delivery service
        await this.triggerDeliveryService(order);
      } else {
        console.log('🏪 Order is pickup - no delivery needed');
      }

      // Store to BigQuery
      await this.storeOrderToBigQuery(order);

      console.log(`✅ Order processed: ${order.orderId}`);

    } catch (error) {
      console.error('❌ Order processing error:', error.message);
      throw error;
    }
  }

  /**
   * Trigger delivery service
   * @param {Object} order - Order details
   */
  async triggerDeliveryService(order) {
    if (!this.deliveryServiceUrl) {
      console.warn('⚠️  DELIVERY_SERVICE_URL not configured');
      return;
    }

    try {
      const axios = require('axios');

      const deliveryRequest = {
        orderId: order.orderId,
        pickupAddress: {
          street: 'Reggie & Dro Dispensary',
          city: 'San Antonio',
          state: 'TX',
          zip: '78201'
        },
        dropoffAddress: order.deliveryAddress,
        customerPhone: order.customerPhone,
        items: order.items,
        totalValue: order.total
      };

      const response = await axios.post(
        `${this.deliveryServiceUrl}/delivery/create`,
        deliveryRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`
          }
        }
      );

      console.log(`✅ Delivery created: ${response.data.deliveryId}`);
      console.log(`💰 Estimated cost: $${response.data.estimatedCost}`);
      console.log(`⏱️  Estimated time: ${response.data.estimatedTime} minutes`);

    } catch (error) {
      console.error('❌ Delivery service error:', error.message);
      throw error;
    }
  }

  /**
   * Store order to BigQuery
   * @param {Object} order - Order details
   */
  async storeOrderToBigQuery(order) {
    try {
      const row = {
        order_id: order.orderId,
        customer_id: order.customerId,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        delivery_address: JSON.stringify(order.deliveryAddress),
        items: JSON.stringify(order.items),
        total: order.total,
        subtotal: order.subtotal,
        tax: order.tax,
        status: order.status,
        created_at: order.createdAt,
        processed_at: new Date().toISOString()
      };

      await this.bigquery
        .dataset('commerce')
        .table('lightspeed_orders')
        .insert([row]);

      console.log(`✅ Stored order to BigQuery: ${order.orderId}`);

    } catch (error) {
      console.error('❌ BigQuery insert error:', error.message);
      // Don't throw - this is not critical
    }
  }

  /**
   * Start listening for webhooks
   */
  start() {
    this.app.listen(this.port, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎧 Lightspeed Webhook Listener');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ Listening on port ${this.port}`);
      console.log(`📬 Webhook URL: http://localhost:${this.port}/webhook/lightspeed`);
      console.log(`🧪 Test URL: http://localhost:${this.port}/webhook/test`);
      console.log(`🔒 HMAC validation: ENABLED`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  }
}

// Export for use in other modules
module.exports = LightspeedWebhookListener;

// CLI execution
if (require.main === module) {
  const listener = new LightspeedWebhookListener();
  listener.start();

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Shutting down gracefully...');
    process.exit(0);
  });
}

// Optimized: 2025-10-08
// Last updated: 2025-10-08

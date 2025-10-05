import express from 'express';
import { createLogger } from '../../../common/logging/index.js';
import { DeliveryOrchestrator } from '../delivery-orchestrator.js';
import { DoorDashClient } from '../providers/doordash-client.js';
import { UberClient } from '../providers/uber-client.js';

const router = express.Router();
const logger = createLogger('lightspeed-webhook');

// Initialize delivery orchestrator with providers
const providers = {
  doordash: new DoorDashClient(),
  uber: new UberClient()
  // TODO: Add Roadie and GoShare when credentials available
};

const orchestrator = new DeliveryOrchestrator(providers);

/**
 * LIGHTSPEED WEBHOOK HANDLER
 *
 * Receives order webhooks from LightSpeed POS
 * Triggers delivery creation for orders marked as "delivery"
 *
 * Webhook Events:
 * - order.created: New order placed
 * - order.updated: Order status changed
 * - order.completed: Order ready for pickup/delivery
 *
 * Flow:
 * 1. Receive LightSpeed webhook
 * 2. Validate order is delivery type
 * 3. Extract customer and order details
 * 4. Create delivery with best provider
 * 5. Store delivery record in database
 * 6. Send tracking link to customer
 */

/**
 * POST /api/v1/delivery/lightspeed/webhook
 *
 * LightSpeed sends webhook when order is created/updated
 */
router.post('/webhook', async (req, res) => {
  const startTime = Date.now();

  try {
    const payload = req.body;

    logger.info('LightSpeed webhook received', {
      event: payload.event,
      orderId: payload.orderId,
      orderType: payload.orderType
    });

    // Validate this is a delivery order
    if (payload.orderType !== 'delivery') {
      logger.info('Order is not delivery type - skipping', {
        orderId: payload.orderId,
        orderType: payload.orderType
      });

      return res.json({
        success: true,
        message: 'Not a delivery order',
        orderId: payload.orderId
      });
    }

    // Only create delivery for completed orders (ready to ship)
    if (payload.event !== 'order.completed') {
      logger.info('Order not ready for delivery yet', {
        orderId: payload.orderId,
        event: payload.event
      });

      return res.json({
        success: true,
        message: 'Order not ready for delivery',
        orderId: payload.orderId
      });
    }

    // Extract delivery request from LightSpeed order
    const deliveryRequest = buildDeliveryRequest(payload);

    // Create delivery
    const delivery = await orchestrator.createDelivery(deliveryRequest);

    // TODO: Store delivery record in database
    // TODO: Send tracking link to customer via SMS/email

    const elapsed = Date.now() - startTime;

    logger.info('Delivery created from LightSpeed webhook', {
      orderId: payload.orderId,
      deliveryId: delivery.deliveryId,
      provider: delivery.provider,
      elapsed: `${elapsed}ms`
    });

    res.json({
      success: true,
      orderId: payload.orderId,
      delivery: {
        deliveryId: delivery.deliveryId,
        provider: delivery.provider,
        trackingUrl: delivery.trackingUrl,
        estimatedDeliveryTime: delivery.estimatedDeliveryTime,
        cost: delivery.cost,
        distance: delivery.distance
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('LightSpeed webhook processing failed', {
      error: error.message,
      stack: error.stack,
      payload: req.body
    });

    res.status(500).json({
      success: false,
      error: 'Delivery creation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Build delivery request from LightSpeed order payload
 */
function buildDeliveryRequest(lightspeedOrder) {
  return {
    orderId: lightspeedOrder.orderId,

    // Pickup location (store)
    pickup: {
      address: process.env.STORE_ADDRESS || '123 Main St, San Antonio, TX 78201',
      businessName: 'Reggie & Dro',
      phone: process.env.STORE_PHONE || '+12109999999',
      instructions: 'Use side entrance',
      lat: parseFloat(process.env.STORE_LAT || '29.4241'),
      lng: parseFloat(process.env.STORE_LNG || '-98.4936')
    },

    // Delivery location (customer)
    dropoff: {
      address: lightspeedOrder.deliveryAddress,
      name: lightspeedOrder.customerName,
      phone: lightspeedOrder.customerPhone,
      instructions: lightspeedOrder.deliveryInstructions || 'Ring doorbell',
      firstName: lightspeedOrder.customerFirstName,
      lastName: lightspeedOrder.customerLastName,
      lat: lightspeedOrder.deliveryLat,
      lng: lightspeedOrder.deliveryLng
    },

    // Customer details
    customer: {
      id: lightspeedOrder.customerId,
      name: lightspeedOrder.customerName,
      firstName: lightspeedOrder.customerFirstName,
      lastName: lightspeedOrder.customerLastName,
      phone: lightspeedOrder.customerPhone,
      email: lightspeedOrder.customerEmail
    },

    // Order items
    items: lightspeedOrder.items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      price: item.price
    })),

    // Order totals
    orderTotal: lightspeedOrder.total,

    // Delivery timing
    deliveryTime: lightspeedOrder.requestedDeliveryTime || 'ASAP'
  };
}

/**
 * GET /api/v1/delivery/status/:deliveryId
 *
 * Get delivery status
 */
router.get('/status/:deliveryId', async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { provider } = req.query;

    if (!provider) {
      return res.status(400).json({
        success: false,
        error: 'Provider parameter required'
      });
    }

    logger.info('Getting delivery status', { deliveryId, provider });

    const status = await orchestrator.getDeliveryStatus(deliveryId, provider);

    res.json({
      success: true,
      delivery: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Status check failed', {
      error: error.message,
      deliveryId: req.params.deliveryId
    });

    res.status(500).json({
      success: false,
      error: 'Status check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/delivery/cancel
 *
 * Cancel delivery
 */
router.post('/cancel', async (req, res) => {
  try {
    const { deliveryId, provider, reason } = req.body;

    if (!deliveryId || !provider) {
      return res.status(400).json({
        success: false,
        error: 'deliveryId and provider required'
      });
    }

    logger.info('Cancelling delivery', { deliveryId, provider, reason });

    const result = await orchestrator.cancelDelivery(deliveryId, provider, reason);

    res.json({
      success: true,
      delivery: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Delivery cancellation failed', {
      error: error.message,
      deliveryId: req.body.deliveryId
    });

    res.status(500).json({
      success: false,
      error: 'Cancellation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/v1/delivery/create
 *
 * Manually create delivery (for testing or manual orders)
 */
router.post('/create', async (req, res) => {
  try {
    const deliveryRequest = req.body;

    logger.info('Creating manual delivery', {
      orderId: deliveryRequest.orderId
    });

    const delivery = await orchestrator.createDelivery(deliveryRequest);

    res.json({
      success: true,
      delivery,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Manual delivery creation failed', {
      error: error.message,
      orderId: req.body.orderId
    });

    res.status(500).json({
      success: false,
      error: 'Delivery creation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;

// Created: 2025-10-04
// LightSpeed webhook handler for delivery automation
// Integrates POS orders with multi-provider delivery system

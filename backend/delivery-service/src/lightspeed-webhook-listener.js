// LIGHTSPEED WEBHOOK LISTENER - NASH-BEATING DELIVERY MIDDLEWARE
// Automatically creates delivery when Lightspeed order is placed
// Beats Nash by eliminating Square intermediary

import express from 'express';
import crypto from 'crypto';
import { getBestProviderQuote, createDeliveryOrder } from './nash-beating-middleware.js';

const router = express.Router();

// Lightspeed webhook validation
const LIGHTSPEED_WEBHOOK_SECRET = process.env.LIGHTSPEED_WEBHOOK_SECRET;

/**
 * Validate Lightspeed webhook signature
 */
function validateLightspeedSignature(payload, signature) {
  if (!LIGHTSPEED_WEBHOOK_SECRET) {
    console.warn('LIGHTSPEED_WEBHOOK_SECRET not configured - skipping validation');
    return true;
  }

  const expectedSignature = crypto
    .createHmac('sha256', LIGHTSPEED_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * POST /api/delivery/lightspeed/webhook
 * Lightspeed order webhook handler - automatically creates delivery
 */
router.post('/lightspeed/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-lightspeed-signature'];
    const payload = JSON.stringify(req.body);

    // Validate webhook signature
    if (!validateLightspeedSignature(payload, signature)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    const { order } = req.body;

    // Validate required fields
    if (!order || !order.id || !order.shippingAddress) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order payload'
      });
    }

    console.log(`🚚 Processing Lightspeed order ${order.id} for delivery`);

    // Extract delivery information
    const deliveryRequest = {
      orderId: order.id,
      cartTotal: parseFloat(order.total) || 0,
      customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
      customerPhone: order.customer?.phone || order.shippingAddress?.phone,
      deliveryAddress: {
        street: order.shippingAddress?.address1 || '',
        city: order.shippingAddress?.city || '',
        state: order.shippingAddress?.state || '',
        zip: order.shippingAddress?.zip || '',
        country: order.shippingAddress?.country || 'US'
      },
      specialInstructions: order.note || '',
      items: order.items?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })) || []
    };

    // Get best delivery quote using intelligent routing
    const quote = await getBestProviderQuote(deliveryRequest);

    if (!quote) {
      console.error(`❌ No delivery providers available for order ${order.id}`);
      return res.status(500).json({
        success: false,
        error: 'No delivery providers available',
        orderId: order.id
      });
    }

    // Create delivery order
    const delivery = await createDeliveryOrder({
      ...deliveryRequest,
      provider: quote.provider,
      cost: quote.cost,
      estimatedMinutes: quote.estimatedMinutes
    });

    console.log(`✅ Delivery created: ${delivery.deliveryId} via ${quote.provider} for $${quote.cost}`);

    // Return success response
    res.json({
      success: true,
      orderId: order.id,
      deliveryId: delivery.deliveryId,
      provider: quote.provider,
      providerName: quote.name,
      cost: quote.cost,
      estimatedMinutes: quote.estimatedMinutes,
      estimatedArrival: delivery.estimatedArrival,
      trackingUrl: delivery.trackingUrl,
      savings: {
        vsNash: 4.5, // Average savings vs Nash/Square
        message: `Save $4.50 vs Nash/Square`
      }
    });

  } catch (error) {
    console.error('Lightspeed webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/delivery/lightspeed/test
 * Test endpoint to simulate Lightspeed webhook
 */
router.get('/lightspeed/test', async (req, res) => {
  try {
    const testOrder = {
      order: {
        id: `test-${Date.now()}`,
        total: '75.00',
        customer: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1-210-555-0123'
        },
        shippingAddress: {
          address1: '123 Main Street',
          city: 'San Antonio',
          state: 'TX',
          zip: '78228',
          country: 'US',
          phone: '+1-210-555-0123'
        },
        note: 'Please deliver to front door',
        items: [
          {
            name: 'Premium Cannabis Product',
            quantity: 1,
            price: 75.00
          }
        ]
      }
    };

    // Simulate webhook call
    const result = await router.handle({
      method: 'POST',
      url: '/lightspeed/webhook',
      headers: {},
      body: testOrder
    });

    res.json({
      success: true,
      message: 'Test webhook processed',
      testOrder,
      result
    });

  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

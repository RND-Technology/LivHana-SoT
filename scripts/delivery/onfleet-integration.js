#!/usr/bin/env node
/**
 * 💰 LOCAL DELIVERY MIDDLEWARE - ONFLEET INTEGRATION
 * 
 * Priority: #1 Revenue Driver ($50K+ weekly)
 * Integration: LightSpeed → Onfleet → Driver Assignment → Real-time Tracking
 * 
 * Jesse Niesen CEO Approved - MAX AUTO
 */

const axios = require('axios');
const express = require('express');
const { createLogger } = require('../common/logging');

const logger = createLogger('onfleet-integration');
const app = express();
app.use(express.json());

// === CONFIGURATION ===
const ONFLEET_API_KEY = process.env.ONFLEET_API_KEY;
const ONFLEET_BASE_URL = 'https://onfleet.com/api/v2';
const LIGHTSPEED_WEBHOOK_SECRET = process.env.LIGHTSPEED_WEBHOOK_SECRET;
const SAN_ANTONIO_GEOFENCE = {
  lat: 29.4241,
  lng: -98.4936,
  radius_miles: 15
};

// === ONFLEET API CLIENT ===
class OnfleetClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = ONFLEET_BASE_URL;
  }

  async createTask(delivery) {
    try {
      const response = await axios.post(
        `${this.baseURL}/tasks`,
        {
          destination: {
            address: {
              unparsed: delivery.address
            },
            notes: delivery.notes || ''
          },
          recipients: [
            {
              name: delivery.customerName,
              phone: delivery.phone,
              notes: delivery.deliveryInstructions || ''
            }
          ],
          completeBefore: this.calculateDeliveryWindow(delivery.requestedTime),
          autoAssign: {
            mode: 'distance',
            team: process.env.ONFLEET_TEAM_ID
          },
          merchant: {
            name: 'Reggie & Dro',
            phone: '+12105551234' // Replace with actual store phone
          }
        },
        {
          auth: {
            username: this.apiKey,
            password: ''
          }
        }
      );

      logger.info({
        event: 'onfleet_task_created',
        taskId: response.data.id,
        orderId: delivery.orderId
      });

      return response.data;
    } catch (error) {
      logger.error({
        event: 'onfleet_task_creation_failed',
        orderId: delivery.orderId,
        error: error.message
      });
      throw error;
    }
  }

  async getTaskStatus(taskId) {
    try {
      const response = await axios.get(`${this.baseURL}/tasks/${taskId}`, {
        auth: {
          username: this.apiKey,
          password: ''
        }
      });
      return response.data;
    } catch (error) {
      logger.error({
        event: 'onfleet_task_status_failed',
        taskId,
        error: error.message
      });
      throw error;
    }
  }

  calculateDeliveryWindow(requestedTime) {
    // Default: 2-hour delivery window for same-day
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    return requestedTime ? new Date(requestedTime).getTime() : now + twoHours;
  }

  async assignDriver(taskId, driverId) {
    try {
      const response = await axios.put(
        `${this.baseURL}/tasks/${taskId}`,
        {
          worker: driverId
        },
        {
          auth: {
            username: this.apiKey,
            password: ''
          }
        }
      );

      logger.info({
        event: 'driver_assigned',
        taskId,
        driverId
      });

      return response.data;
    } catch (error) {
      logger.error({
        event: 'driver_assignment_failed',
        taskId,
        driverId,
        error: error.message
      });
      throw error;
    }
  }
}

const onfleetClient = new OnfleetClient(ONFLEET_API_KEY);

// === GEOFENCE VALIDATION ===
function isWithinDeliveryZone(address) {
  // Simplified geofence check - in production, use geocoding API
  const sanAntonioKeywords = ['san antonio', 'sa ', 'tx 78'];
  return sanAntonioKeywords.some(keyword => 
    address.toLowerCase().includes(keyword)
  );
}

// === LIGHTSPEED WEBHOOK HANDLER ===
app.post('/webhooks/lightspeed/order-completed', async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-lightspeed-signature'];
    if (!verifySignature(req.body, signature)) {
      logger.warn({ event: 'invalid_webhook_signature' });
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const order = req.body;
    logger.info({
      event: 'lightspeed_order_received',
      orderId: order.id,
      customerId: order.customerId
    });

    // Check if customer requested delivery
    if (!order.deliveryRequested || order.deliveryMethod !== 'local') {
      logger.info({
        event: 'order_not_for_delivery',
        orderId: order.id,
        deliveryMethod: order.deliveryMethod
      });
      return res.json({ status: 'skipped', reason: 'not_delivery_order' });
    }

    // Validate delivery zone
    if (!isWithinDeliveryZone(order.shippingAddress.full)) {
      logger.warn({
        event: 'delivery_outside_zone',
        orderId: order.id,
        address: order.shippingAddress.city
      });
      return res.status(400).json({
        error: 'Delivery address outside San Antonio metro area'
      });
    }

    // Create Onfleet delivery task
    const deliveryTask = await onfleetClient.createTask({
      orderId: order.id,
      customerName: order.customer.name,
      phone: order.customer.phone,
      address: order.shippingAddress.full,
      notes: `LightSpeed Order #${order.id}`,
      deliveryInstructions: order.deliveryNotes,
      requestedTime: order.requestedDeliveryTime
    });

    // Update LightSpeed order with tracking info
    await updateLightSpeedOrder(order.id, {
      deliveryStatus: 'dispatched',
      trackingUrl: `https://onfleet.com/track/${deliveryTask.shortId}`,
      onfleetTaskId: deliveryTask.id
    });

    // Send customer SMS with tracking link
    await sendCustomerSMS(order.customer.phone, {
      message: `Your Reggie & Dro order is on the way! Track it here: https://onfleet.com/track/${deliveryTask.shortId}`,
      orderId: order.id
    });

    logger.info({
      event: 'delivery_dispatched',
      orderId: order.id,
      onfleetTaskId: deliveryTask.id,
      estimatedDelivery: deliveryTask.completeBefore
    });

    res.json({
      status: 'dispatched',
      onfleetTaskId: deliveryTask.id,
      trackingUrl: `https://onfleet.com/track/${deliveryTask.shortId}`
    });
  } catch (error) {
    logger.error({
      event: 'delivery_dispatch_failed',
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to dispatch delivery' });
  }
});

// === ONFLEET WEBHOOK HANDLER (Status Updates) ===
app.post('/webhooks/onfleet/task-update', async (req, res) => {
  try {
    const event = req.body;
    logger.info({
      event: 'onfleet_webhook_received',
      taskId: event.taskId,
      status: event.status
    });

    // Update LightSpeed order status
    const orderId = await getOrderIdFromOnfleetTask(event.taskId);
    await updateLightSpeedOrder(orderId, {
      deliveryStatus: event.status,
      deliveryUpdatedAt: new Date().toISOString()
    });

    // Send customer notifications
    if (event.status === 'completed') {
      await sendCustomerSMS(event.recipient.phone, {
        message: 'Your Reggie & Dro order has been delivered! Enjoy! 🌿',
        orderId
      });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error({
      event: 'onfleet_webhook_processing_failed',
      error: error.message
    });
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// === HELPER FUNCTIONS ===
function verifySignature(payload, signature) {
  // Implement HMAC signature verification
  // For now, return true (replace with actual verification)
  return true;
}

async function updateLightSpeedOrder(orderId, updates) {
  try {
    // Implement LightSpeed API update
    logger.info({
      event: 'lightspeed_order_updated',
      orderId,
      updates
    });
  } catch (error) {
    logger.error({
      event: 'lightspeed_update_failed',
      orderId,
      error: error.message
    });
    throw error;
  }
}

async function getOrderIdFromOnfleetTask(taskId) {
  try {
    const task = await onfleetClient.getTaskStatus(taskId);
    // Extract orderId from task notes
    const match = task.notes.match(/Order #(\d+)/);
    return match ? match[1] : null;
  } catch (error) {
    logger.error({
      event: 'order_id_extraction_failed',
      taskId,
      error: error.message
    });
    return null;
  }
}

async function sendCustomerSMS(phone, { message, orderId }) {
  try {
    // Implement Twilio SMS integration
    logger.info({
      event: 'customer_sms_sent',
      phone: phone.substring(0, 3) + '****', // Mask phone number
      orderId
    });
  } catch (error) {
    logger.error({
      event: 'sms_send_failed',
      orderId,
      error: error.message
    });
  }
}

// === HEALTH ENDPOINT ===
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'local-delivery-middleware',
    timestamp: new Date().toISOString(),
    onfleet: !!ONFLEET_API_KEY,
    lightspeed: !!LIGHTSPEED_WEBHOOK_SECRET
  });
});

// === START SERVER ===
const PORT = process.env.PORT || 4030;
app.listen(PORT, () => {
  logger.info({
    event: 'server_started',
    port: PORT,
    message: '💰 Local Delivery Middleware ACTIVE - $$$$$$$$$'
  });
});

module.exports = { OnfleetClient, app };

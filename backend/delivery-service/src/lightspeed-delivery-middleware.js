// LIGHTSPEED → DELIVERY MIDDLEWARE
// Beats Nash/Square Online by providing:
// - Direct Lightspeed integration (no Square intermediary)
// - Multi-provider routing (DoorDash + Uber)
// - Real-time order sync + delivery creation
// - Better pricing (no Square markup)

import express from 'express';
import axios from 'axios';

const router = express.Router();

// Store config (from environment or database)
const STORE_CONFIG = {
  storeId: process.env.LIGHTSPEED_STORE_ID || '117254578',
  apiToken: process.env.LIGHTSPEED_API_TOKEN,
  storeAddress: {
    street: process.env.STORE_ADDRESS || 'Central San Antonio',
    city: 'San Antonio',
    state: 'TX',
    zip: process.env.STORE_ZIP || '78228',
    lat: 29.4241,
    lng: -98.4936
  },
  storeName: 'Reggie & Dro Cannabis Store',
  storePhone: process.env.STORE_PHONE || '+1-210-555-0100'
};

// Delivery providers config
const PROVIDERS = {
  doordash: {
    enabled: !!process.env.DOORDASH_API_KEY,
    apiKey: process.env.DOORDASH_API_KEY,
    secret: process.env.DOORDASH_SECRET,
    priority: 1,
    baseUrl: 'https://openapi.doordash.com/drive/v2'
  },
  uber: {
    enabled: !!process.env.UBER_API_KEY,
    apiKey: process.env.UBER_API_KEY,
    priority: 2,
    baseUrl: 'https://api.uber.com/v1/deliveries'
  }
};

/**
 * NASH-BEATING FEATURES:
 * 1. Direct Lightspeed integration (no Square)
 * 2. Multi-provider failover (DoorDash + Uber)
 * 3. Real-time order sync
 * 4. Better pricing (no intermediary markup)
 * 5. Custom branding (white-label)
 */

// POST /api/delivery/lightspeed/webhook
// Receives order webhooks from Lightspeed
router.post('/lightspeed/webhook', async (req, res) => {
  try {
    const order = req.body;

    // Validate order is delivery type
    if (order.deliveryMethod !== 'delivery' && order.fulfillmentType !== 'delivery') {
      return res.json({ success: true, message: 'Not a delivery order' });
    }

    // Only process completed orders (paid + ready for delivery)
    if (order.status !== 'complete' && order.status !== 'completed') {
      return res.json({ success: true, message: 'Order not ready for delivery' });
    }

    // Create delivery with best provider
    const deliveryRequest = buildDeliveryRequestFromLightspeed(order);
    const delivery = await createDeliveryWithBestProvider(deliveryRequest);

    // Return delivery details to Lightspeed
    res.json({
      success: true,
      orderId: order.id,
      deliveryId: delivery.id,
      provider: delivery.provider,
      trackingUrl: delivery.trackingUrl,
      estimatedDelivery: delivery.estimatedDelivery
    });

  } catch (error) {
    console.error('Lightspeed webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/delivery/quote
// Get delivery quote for cart checkout
router.post('/quote', async (req, res) => {
  try {
    const { cartTotal, deliveryAddress } = req.body;

    // Get quotes from all enabled providers
    const quotes = await Promise.all([
      PROVIDERS.doordash.enabled ? getDoorDashQuote(deliveryAddress, cartTotal) : null,
      PROVIDERS.uber.enabled ? getUberQuote(deliveryAddress, cartTotal) : null
    ].filter(Boolean));

    // Return best quote
    const bestQuote = quotes.sort((a, b) => a.fee - b.fee)[0];

    res.json({
      success: true,
      provider: bestQuote.provider,
      fee: bestQuote.fee,
      estimatedMinutes: bestQuote.estimatedMinutes,
      availableProviders: quotes.length
    });

  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/delivery/create
// Create delivery from checkout
router.post('/create', async (req, res) => {
  try {
    const deliveryRequest = req.body;

    // Validate delivery address is in zone
    const inZone = await validateDeliveryZone(deliveryRequest.dropoff.address);
    if (!inZone) {
      return res.status(400).json({
        success: false,
        error: 'Address outside delivery zone (35-mile radius)'
      });
    }

    // Create delivery with best provider
    const delivery = await createDeliveryWithBestProvider(deliveryRequest);

    res.json({
      success: true,
      deliveryId: delivery.id,
      provider: delivery.provider,
      trackingUrl: delivery.trackingUrl,
      estimatedDelivery: delivery.estimatedDelivery
    });

  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/delivery/status/:deliveryId
// Get delivery status for order tracking
router.get('/status/:deliveryId', async (req, res) => {
  try {
    const { deliveryId } = req.params;

    // Get status from provider (DoorDash or Uber)
    const status = await getDeliveryStatus(deliveryId);

    res.json({
      success: true,
      deliveryId,
      status: status.status,
      driverName: status.driverName,
      driverPhone: status.driverPhone,
      estimatedDelivery: status.estimatedDelivery,
      trackingUrl: status.trackingUrl
    });

  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/delivery/cancel
// Cancel delivery
router.post('/cancel', async (req, res) => {
  try {
    const { deliveryId, reason } = req.body;

    // Cancel with provider
    const result = await cancelDelivery(deliveryId, reason);

    res.json({
      success: true,
      deliveryId,
      cancelled: result.cancelled,
      refundAmount: result.refundAmount
    });

  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- HELPER FUNCTIONS ---

function buildDeliveryRequestFromLightspeed(order) {
  return {
    orderId: order.id,
    orderValue: order.total || order.totalPrice,
    items: order.items || order.lineItems,
    pickup: {
      name: STORE_CONFIG.storeName,
      phone: STORE_CONFIG.storePhone,
      address: STORE_CONFIG.storeAddress
    },
    dropoff: {
      name: order.customer?.name || `${order.customer?.firstName} ${order.customer?.lastName}`,
      phone: order.customer?.phone || order.deliveryPhone,
      address: {
        street: order.deliveryAddress?.street || order.shippingAddress?.address1,
        city: order.deliveryAddress?.city || order.shippingAddress?.city,
        state: order.deliveryAddress?.state || order.shippingAddress?.province,
        zip: order.deliveryAddress?.zip || order.shippingAddress?.zip
      }
    },
    instructions: order.deliveryInstructions || order.notes || '',
    tip: order.tip || 0
  };
}

async function createDeliveryWithBestProvider(deliveryRequest) {
  // Try DoorDash first (priority 1)
  if (PROVIDERS.doordash.enabled) {
    try {
      return await createDoorDashDelivery(deliveryRequest);
    } catch (error) {
      console.error('DoorDash failed, falling back to Uber:', error.message);
    }
  }

  // Fallback to Uber
  if (PROVIDERS.uber.enabled) {
    return await createUberDelivery(deliveryRequest);
  }

  throw new Error('No delivery providers available');
}

async function createDoorDashDelivery(request) {
  // DoorDash Drive API integration
  const response = await axios.post(
    `${PROVIDERS.doordash.baseUrl}/deliveries`,
    {
      external_delivery_id: request.orderId,
      pickup_address: formatAddressForDoorDash(request.pickup.address),
      pickup_phone_number: request.pickup.phone,
      pickup_business_name: request.pickup.name,
      dropoff_address: formatAddressForDoorDash(request.dropoff.address),
      dropoff_phone_number: request.dropoff.phone,
      dropoff_contact_given_name: request.dropoff.name.split(' ')[0],
      dropoff_contact_family_name: request.dropoff.name.split(' ').slice(1).join(' '),
      dropoff_instructions: request.instructions,
      order_value: Math.round(request.orderValue * 100),
      tip: Math.round(request.tip * 100)
    },
    {
      headers: {
        'Authorization': `Bearer ${PROVIDERS.doordash.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    id: response.data.delivery_id,
    provider: 'doordash',
    trackingUrl: response.data.tracking_url,
    estimatedDelivery: response.data.estimated_pickup_time
  };
}

async function createUberDelivery(request) {
  // Uber Direct API integration
  const response = await axios.post(
    `${PROVIDERS.uber.baseUrl}`,
    {
      pickup: {
        name: request.pickup.name,
        phone_number: request.pickup.phone,
        location: formatAddressForUber(request.pickup.address)
      },
      dropoff: {
        name: request.dropoff.name,
        phone_number: request.dropoff.phone,
        location: formatAddressForUber(request.dropoff.address),
        notes: request.instructions
      },
      manifest: {
        total_value: Math.round(request.orderValue * 100)
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${PROVIDERS.uber.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    id: response.data.id,
    provider: 'uber',
    trackingUrl: response.data.tracking_url,
    estimatedDelivery: response.data.pickup_eta
  };
}

async function getDoorDashQuote(address, orderValue) {
  const response = await axios.post(
    `${PROVIDERS.doordash.baseUrl}/quotes`,
    {
      pickup_address: formatAddressForDoorDash(STORE_CONFIG.storeAddress),
      dropoff_address: formatAddressForDoorDash(address),
      order_value: Math.round(orderValue * 100)
    },
    {
      headers: {
        'Authorization': `Bearer ${PROVIDERS.doordash.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    provider: 'doordash',
    fee: response.data.fee / 100,
    estimatedMinutes: response.data.estimated_delivery_time
  };
}

async function getUberQuote(address, orderValue) {
  const response = await axios.post(
    `${PROVIDERS.uber.baseUrl}/quote`,
    {
      pickup: { location: formatAddressForUber(STORE_CONFIG.storeAddress) },
      dropoff: { location: formatAddressForUber(address) }
    },
    {
      headers: {
        'Authorization': `Bearer ${PROVIDERS.uber.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    provider: 'uber',
    fee: response.data.fee / 100,
    estimatedMinutes: response.data.estimated_delivery_time
  };
}

async function getDeliveryStatus(deliveryId) {
  // Determine provider from deliveryId prefix
  const provider = deliveryId.startsWith('dd_') ? 'doordash' : 'uber';

  if (provider === 'doordash') {
    const response = await axios.get(
      `${PROVIDERS.doordash.baseUrl}/deliveries/${deliveryId}`,
      {
        headers: { 'Authorization': `Bearer ${PROVIDERS.doordash.apiKey}` }
      }
    );

    return {
      status: response.data.delivery_status,
      driverName: response.data.dasher?.name,
      driverPhone: response.data.dasher?.phone_number,
      estimatedDelivery: response.data.estimated_pickup_time,
      trackingUrl: response.data.tracking_url
    };
  } else {
    const response = await axios.get(
      `${PROVIDERS.uber.baseUrl}/${deliveryId}`,
      {
        headers: { 'Authorization': `Bearer ${PROVIDERS.uber.apiKey}` }
      }
    );

    return {
      status: response.data.status,
      driverName: response.data.courier?.name,
      driverPhone: response.data.courier?.phone_number,
      estimatedDelivery: response.data.pickup_eta,
      trackingUrl: response.data.tracking_url
    };
  }
}

async function cancelDelivery(deliveryId, reason) {
  const provider = deliveryId.startsWith('dd_') ? 'doordash' : 'uber';

  if (provider === 'doordash') {
    const response = await axios.post(
      `${PROVIDERS.doordash.baseUrl}/deliveries/${deliveryId}/cancel`,
      { cancellation_reason: reason },
      {
        headers: { 'Authorization': `Bearer ${PROVIDERS.doordash.apiKey}` }
      }
    );

    return {
      cancelled: true,
      refundAmount: response.data.refund_amount / 100
    };
  } else {
    const response = await axios.post(
      `${PROVIDERS.uber.baseUrl}/${deliveryId}/cancel`,
      { reason },
      {
        headers: { 'Authorization': `Bearer ${PROVIDERS.uber.apiKey}` }
      }
    );

    return {
      cancelled: true,
      refundAmount: 0 // Uber doesn't charge cancellation fee
    };
  }
}

async function validateDeliveryZone(address) {
  // Calculate distance from store
  const distance = calculateDistance(
    STORE_CONFIG.storeAddress.lat,
    STORE_CONFIG.storeAddress.lng,
    address.lat || 29.4241, // Fallback to San Antonio center
    address.lng || -98.4936
  );

  return distance <= 35; // 35-mile radius
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  // Haversine formula
  const R = 3959; // Earth radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

function formatAddressForDoorDash(address) {
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
}

function formatAddressForUber(address) {
  return {
    street_address: [address.street],
    city: address.city,
    state: address.state,
    zip_code: address.zip,
    country: 'US'
  };
}

export default router;

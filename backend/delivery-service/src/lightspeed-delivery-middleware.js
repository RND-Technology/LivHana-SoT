// LIGHTSPEED → DELIVERY MIDDLEWARE
// Beats Nash/Square Online by providing:
// - Direct Lightspeed integration (no Square intermediary)
// - Multi-provider routing (DoorDash + Uber + Postmates + Grubhub)
// - Real-time order sync + delivery creation
// - Better pricing (no Square markup)
// - Intelligent provider comparison and routing

import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { getAllProviderQuotes, selectBestProvider } from './provider-comparison.js';
// calculateProviderScore reserved for future use

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

// Delivery providers config (ALL WHITE-LABEL OPTIONS)
const PROVIDERS = {
  doordash: {
    enabled: !!(process.env.DOORDASH_DEVELOPER_ID && process.env.DOORDASH_KEY_ID && process.env.DOORDASH_SIGNING_SECRET),
    developerId: process.env.DOORDASH_DEVELOPER_ID,
    keyId: process.env.DOORDASH_KEY_ID,
    signingSecret: process.env.DOORDASH_SIGNING_SECRET,
    priority: 1,
    baseUrl: 'https://openapi.doordash.com/drive/v2',
    name: 'DoorDash Drive',
    avgCost: 5.5,
    avgTime: 35,
    reliability: 0.95,
    avgRating: 4.8
  },
  uber: {
    enabled: !!process.env.UBER_API_KEY,
    apiKey: process.env.UBER_API_KEY,
    priority: 2,
    baseUrl: 'https://api.uber.com/v1/deliveries',
    name: 'Uber Direct',
    avgCost: 5.0,
    avgTime: 40,
    reliability: 0.93,
    avgRating: 4.7
  },
  postmates: {
    enabled: !!process.env.POSTMATES_API_KEY,
    apiKey: process.env.POSTMATES_API_KEY,
    priority: 3,
    baseUrl: 'https://api.postmates.com/v1',
    name: 'Postmates Fleet',
    avgCost: 5.25,
    avgTime: 38,
    reliability: 0.94,
    avgRating: 4.6
  },
  grubhub: {
    enabled: !!process.env.GRUBHUB_API_KEY,
    apiKey: process.env.GRUBHUB_API_KEY,
    priority: 4,
    baseUrl: 'https://partner-api.grubhub.com',
    name: 'Grubhub Enterprise',
    avgCost: 6.0,
    avgTime: 40,
    reliability: 0.91,
    avgRating: 4.5
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
// Get delivery quote for cart checkout (returns BEST option only)
router.post('/quote', async (req, res) => {
  try {
    const { cartTotal, deliveryAddress, preferences } = req.body;

    // Get quotes from all enabled providers
    const allQuotes = await getAllProviderQuotes(deliveryAddress, cartTotal, PROVIDERS);

    if (allQuotes.totalAvailable === 0) {
      return res.status(503).json({
        success: false,
        error: 'No delivery providers available for this address'
      });
    }

    // Select best provider based on preferences
    const bestQuote = selectBestProvider(allQuotes, preferences);

    res.json({
      success: true,
      provider: bestQuote.provider,
      name: bestQuote.name,
      cost: bestQuote.cost,
      estimatedMinutes: bestQuote.estimatedMinutes,
      estimatedArrival: bestQuote.estimatedArrival,
      rating: bestQuote.rating,
      score: bestQuote.score,
      tags: bestQuote.tags,
      availableProviders: allQuotes.totalAvailable
    });

  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/delivery/providers/compare
// Get ALL provider quotes for UI comparison (Superior UX - beat Nash!)
router.post('/providers/compare', async (req, res) => {
  try {
    const { cartTotal, deliveryAddress } = req.body;

    // Validate required fields
    if (!deliveryAddress || !cartTotal) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: deliveryAddress, cartTotal'
      });
    }

    // Get ALL provider quotes with scoring and tags
    const comparison = await getAllProviderQuotes(deliveryAddress, cartTotal, PROVIDERS);

    if (comparison.totalAvailable === 0) {
      return res.status(503).json({
        success: false,
        error: 'No delivery providers available for this address',
        unavailable: comparison.unavailable
      });
    }

    res.json({
      success: true,
      providers: comparison.available,
      unavailable: comparison.unavailable,
      totalAvailable: comparison.totalAvailable,
      recommendation: comparison.available[0], // Highest scored
      savings: {
        vsNash: calculateNashSavings(comparison.available[0].cost),
        message: `Save $${calculateNashSavings(comparison.available[0].cost).toFixed(2)} vs Nash/Square`
      }
    });

  } catch (error) {
    console.error('Provider comparison error:', error);
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
  // Get quotes from all providers and select best
  const comparison = await getAllProviderQuotes(
    deliveryRequest.dropoff.address,
    deliveryRequest.orderValue,
    PROVIDERS
  );

  if (comparison.totalAvailable === 0) {
    throw new Error('No delivery providers available for this address');
  }

  // Select best provider (highest score = best overall value)
  const bestProvider = selectBestProvider(comparison);

  // Try best provider first
  try {
    console.log(`Creating delivery with ${bestProvider.provider} (score: ${bestProvider.score})...`);
    return await createDeliveryWithProvider(bestProvider.provider, deliveryRequest);
  } catch (error) {
    console.error(`${bestProvider.provider} failed:`, error.message);

    // Automatic failover: try remaining providers in score order
    for (const provider of comparison.available.slice(1)) {
      try {
        console.log(`Failing over to ${provider.provider} (score: ${provider.score})...`);
        return await createDeliveryWithProvider(provider.provider, deliveryRequest);
      } catch (fallbackError) {
        console.error(`${provider.provider} also failed:`, fallbackError.message);
        continue;
      }
    }

    throw new Error('All delivery providers failed');
  }
}

async function createDeliveryWithProvider(providerKey, deliveryRequest) {
  switch (providerKey) {
    case 'doordash':
      return await createDoorDashDelivery(deliveryRequest);
    case 'uber':
      return await createUberDelivery(deliveryRequest);
    case 'postmates':
      return await createPostmatesDelivery(deliveryRequest);
    case 'grubhub':
      return await createGrubhubDelivery(deliveryRequest);
    default:
      throw new Error(`Unknown provider: ${providerKey}`);
  }
}

async function createDoorDashDelivery(request) {
  // DoorDash Drive API integration with JWT authentication
  const jwt = generateDoorDashJWT();

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
        'Authorization': `Bearer ${jwt}`,
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

async function createPostmatesDelivery(request) {
  // Postmates Fleet API integration
  const response = await axios.post(
    `${PROVIDERS.postmates.baseUrl}/deliveries`,
    {
      pickup_name: request.pickup.name,
      pickup_phone_number: request.pickup.phone,
      pickup_address: formatAddressForDoorDash(request.pickup.address), // Uses same format
      dropoff_name: request.dropoff.name,
      dropoff_phone_number: request.dropoff.phone,
      dropoff_address: formatAddressForDoorDash(request.dropoff.address),
      dropoff_notes: request.instructions,
      manifest: request.items?.map(item => item.name).join(', ') || 'Cannabis products',
      quote_id: request.postmatesQuoteId // From previous quote call
    },
    {
      headers: {
        'Authorization': `Bearer ${PROVIDERS.postmates.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    id: response.data.id,
    provider: 'postmates',
    trackingUrl: response.data.tracking_url,
    estimatedDelivery: response.data.dropoff_eta
  };
}

async function createGrubhubDelivery(request) {
  // Grubhub Enterprise API integration
  const response = await axios.post(
    `${PROVIDERS.grubhub.baseUrl}/orders`,
    {
      external_order_id: request.orderId,
      restaurant: {
        name: request.pickup.name,
        phone: request.pickup.phone,
        address: formatAddressForDoorDash(request.pickup.address)
      },
      customer: {
        name: request.dropoff.name,
        phone: request.dropoff.phone,
        address: formatAddressForDoorDash(request.dropoff.address)
      },
      delivery_instructions: request.instructions,
      order_total: Math.round(request.orderValue * 100),
      items: request.items || []
    },
    {
      headers: {
        'Authorization': `Bearer ${PROVIDERS.grubhub.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    id: response.data.order_id,
    provider: 'grubhub',
    trackingUrl: response.data.tracking_url,
    estimatedDelivery: response.data.estimated_delivery_time
  };
}

// eslint-disable-next-line no-unused-vars
async function getDoorDashQuote(address, orderValue) {
  const jwt = generateDoorDashJWT();

  const response = await axios.post(
    `${PROVIDERS.doordash.baseUrl}/quotes`,
    {
      pickup_address: formatAddressForDoorDash(STORE_CONFIG.storeAddress),
      dropoff_address: formatAddressForDoorDash(address),
      order_value: Math.round(orderValue * 100)
    },
    {
      headers: {
        'Authorization': `Bearer ${jwt}`,
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

// eslint-disable-next-line no-unused-vars
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
    const jwt = generateDoorDashJWT();

    const response = await axios.get(
      `${PROVIDERS.doordash.baseUrl}/deliveries/${deliveryId}`,
      {
        headers: { 'Authorization': `Bearer ${jwt}` }
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
    const jwt = generateDoorDashJWT();

    const response = await axios.post(
      `${PROVIDERS.doordash.baseUrl}/deliveries/${deliveryId}/cancel`,
      { cancellation_reason: reason },
      {
        headers: { 'Authorization': `Bearer ${jwt}` }
      }
    );

    return {
      cancelled: true,
      refundAmount: response.data.refund_amount / 100
    };
  } else {
    await axios.post(
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

function calculateNashSavings(ourCost) {
  // Nash charges $7-12 delivery fee
  // We charge the actual provider cost ($5-8)
  const nashAvgCost = 9.50; // Average Nash fee
  return nashAvgCost - ourCost;
}

/**
 * Generate JWT token for DoorDash Drive API authentication
 * See: https://developer.doordash.com/en-US/docs/drive/reference/auth/
 */
function generateDoorDashJWT() {
  const { developerId, keyId, signingSecret } = PROVIDERS.doordash;

  if (!developerId || !keyId || !signingSecret) {
    throw new Error('DoorDash credentials not configured');
  }

  // JWT Header
  const header = {
    alg: 'HS256',
    typ: 'JWT',
    'dd-ver': 'DD-JWT-V1'
  };

  // JWT Payload
  const payload = {
    aud: 'doordash',
    iss: developerId,
    kid: keyId,
    exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes expiry
    iat: Math.floor(Date.now() / 1000)
  };

  // Encode header and payload
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // Create signature
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac('sha256', signingSecret)
    .update(signatureInput)
    .digest('base64url');

  // Return complete JWT
  return `${signatureInput}.${signature}`;
}

export default router;

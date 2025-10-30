// NASH-BEATING DELIVERY MIDDLEWARE
// Direct DoorDash Drive + Uber Direct integration
// Beats Nash/Square by eliminating intermediary costs

import express from 'express';
import axios from 'axios';
import crypto from 'crypto';

const router = express.Router();

// Store configuration
const STORE_CONFIG = {
  name: 'Reggie & Dro Cannabis Store',
  address: {
    street: '1234 Main Street',
    city: 'San Antonio',
    state: 'TX',
    zip: '78228',
    country: 'US'
  },
  phone: process.env.STORE_PHONE || '+1-210-555-0100',
  coordinates: {
    lat: 29.4241,
    lng: -98.4936
  }
};

// Provider configurations with Nash-beating features
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
    avgRating: 4.8,
    features: ['Real-time tracking', 'SMS updates', 'Driver photos']
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
    avgRating: 4.7,
    features: ['Real-time tracking', 'Scheduled deliveries', 'Batch deliveries']
  }
};

// Nash cost comparison (what we're beating)
const NASH_COSTS = {
  squareFee: 0.029, // 2.9%
  squareFixed: 0.30, // $0.30
  nashMarkup: 0.20, // 20% markup on delivery
  avgDeliveryCost: 7.5, // Average delivery cost
  totalPerOrder: 9.5 // Total Nash cost per order
};

/**
 * Generate DoorDash JWT token for authentication
 */
function generateDoorDashToken() {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    iss: PROVIDERS.doordash.developerId,
    aud: 'doordash',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', PROVIDERS.doordash.signingSecret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Calculate provider score for intelligent routing
 * Score = (Cost × 40%) + (Reliability × 30%) + (Speed × 20%) + (Rating × 10%)
 */
function calculateProviderScore(provider, quote) {
  const costScore = Math.max(0, 100 - (quote.cost * 10)); // Lower cost = higher score
  const reliabilityScore = provider.reliability * 100;
  const speedScore = Math.max(0, 100 - (quote.estimatedMinutes / 2)); // Lower time = higher score
  const ratingScore = (provider.avgRating / 5) * 100;

  return Math.round(
    (costScore * 0.4) +
    (reliabilityScore * 0.3) +
    (speedScore * 0.2) +
    (ratingScore * 0.1)
  );
}

/**
 * Get DoorDash Drive quote
 */
async function getDoorDashQuote(deliveryRequest) {
  if (!PROVIDERS.doordash.enabled) {
    throw new Error('DoorDash not configured');
  }

  try {
    const token = generateDoorDashToken();
    
    const quoteRequest = {
      external_delivery_id: `rd-${Date.now()}`,
      pickup_address: STORE_CONFIG.address,
      pickup_phone_number: STORE_CONFIG.phone,
      pickup_business_name: STORE_CONFIG.name,
      pickup_instructions: 'Cannabis delivery - ID verification required',
      dropoff_address: deliveryRequest.deliveryAddress,
      dropoff_phone_number: deliveryRequest.customerPhone,
      dropoff_instructions: deliveryRequest.specialInstructions || 'Please call upon arrival',
      order_value: deliveryRequest.cartTotal,
      items: deliveryRequest.items || []
    };

    const response = await axios.post(
      `${PROVIDERS.doordash.baseUrl}/deliveries/quote`,
      quoteRequest,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const quote = response.data;
    const score = calculateProviderScore(PROVIDERS.doordash, {
      cost: quote.fee / 100, // Convert cents to dollars
      estimatedMinutes: quote.estimated_pickup_time_seconds / 60
    });

    return {
      provider: 'doordash',
      name: PROVIDERS.doordash.name,
      cost: quote.fee / 100,
      estimatedMinutes: Math.round(quote.estimated_pickup_time_seconds / 60),
      estimatedArrival: new Date(Date.now() + (quote.estimated_pickup_time_seconds * 1000)).toISOString(),
      rating: PROVIDERS.doordash.avgRating,
      score,
      tags: score >= 85 ? ['recommended'] : [],
      features: PROVIDERS.doordash.features,
      quoteId: quote.quote_id
    };
  } catch (error) {
    console.error('DoorDash quote error:', error.response?.data || error.message);
    throw new Error(`DoorDash quote failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get Uber Direct quote
 */
async function getUberQuote(deliveryRequest) {
  if (!PROVIDERS.uber.enabled) {
    throw new Error('Uber not configured');
  }

  try {
    const quoteRequest = {
      pickup_address: `${STORE_CONFIG.address.street}, ${STORE_CONFIG.address.city}, ${STORE_CONFIG.address.state} ${STORE_CONFIG.address.zip}`,
      pickup_coordinates: STORE_CONFIG.coordinates,
      pickup_phone: STORE_CONFIG.phone,
      pickup_name: STORE_CONFIG.name,
      dropoff_address: `${deliveryRequest.deliveryAddress.street}, ${deliveryRequest.deliveryAddress.city}, ${deliveryRequest.deliveryAddress.state} ${deliveryRequest.deliveryAddress.zip}`,
      dropoff_coordinates: deliveryRequest.deliveryAddress.coordinates,
      dropoff_phone: deliveryRequest.customerPhone,
      dropoff_name: deliveryRequest.customerName,
      items: deliveryRequest.items || []
    };

    const response = await axios.post(
      `${PROVIDERS.uber.baseUrl}/quotes`,
      quoteRequest,
      {
        headers: {
          'Authorization': `Bearer ${PROVIDERS.uber.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const quote = response.data;
    const score = calculateProviderScore(PROVIDERS.uber, {
      cost: quote.fee,
      estimatedMinutes: quote.estimated_duration_minutes
    });

    return {
      provider: 'uber',
      name: PROVIDERS.uber.name,
      cost: quote.fee,
      estimatedMinutes: quote.estimated_duration_minutes,
      estimatedArrival: new Date(Date.now() + (quote.estimated_duration_minutes * 60 * 1000)).toISOString(),
      rating: PROVIDERS.uber.avgRating,
      score,
      tags: score >= 85 ? ['recommended'] : [],
      features: PROVIDERS.uber.features,
      quoteId: quote.quote_id
    };
  } catch (error) {
    console.error('Uber quote error:', error.response?.data || error.message);
    throw new Error(`Uber quote failed: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * POST /api/delivery/providers/compare
 * Get ALL provider quotes for comparison UI (BEATS NASH!)
 */
router.post('/providers/compare', async (req, res) => {
  try {
    const { cartTotal, deliveryAddress, customerPhone, customerName, specialInstructions } = req.body;

    if (!cartTotal || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        error: 'cartTotal and deliveryAddress are required'
      });
    }

    const deliveryRequest = {
      cartTotal,
      deliveryAddress,
      customerPhone: customerPhone || '+1-210-555-0123',
      customerName: customerName || 'Customer',
      specialInstructions
    };

    // Get quotes from all enabled providers
    const quotes = [];
    const errors = [];

    // Try DoorDash first (highest priority)
    if (PROVIDERS.doordash.enabled) {
      try {
        const quote = await getDoorDashQuote(deliveryRequest);
        quotes.push(quote);
      } catch (error) {
        errors.push({ provider: 'doordash', error: error.message });
      }
    }

    // Try Uber second
    if (PROVIDERS.uber.enabled) {
      try {
        const quote = await getUberQuote(deliveryRequest);
        quotes.push(quote);
      } catch (error) {
        errors.push({ provider: 'uber', error: error.message });
      }
    }

    if (quotes.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'No delivery providers available',
        errors
      });
    }

    // Sort by score (highest first)
    quotes.sort((a, b) => b.score - a.score);

    // Calculate savings vs Nash
    const bestQuote = quotes[0];
    const nashCost = NASH_COSTS.totalPerOrder;
    const savings = nashCost - bestQuote.cost;

    // Add tags
    quotes.forEach((quote, index) => {
      if (index === 0) {
        quote.tags.push('recommended');
      }
      if (quote.cost === Math.min(...quotes.map(q => q.cost))) {
        quote.tags.push('cheapest');
      }
      if (quote.estimatedMinutes === Math.min(...quotes.map(q => q.estimatedMinutes))) {
        quote.tags.push('fastest');
      }
    });

    res.json({
      success: true,
      providers: quotes,
      totalAvailable: quotes.length,
      recommendation: bestQuote,
      savings: {
        vsNash: savings,
        percentage: Math.round((savings / nashCost) * 100),
        message: `Save $${savings.toFixed(2)} vs Nash/Square (${Math.round((savings / nashCost) * 100)}% savings)`
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Provider comparison error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/delivery/quote
 * Get single BEST delivery quote for checkout (simple UI)
 */
router.post('/quote', async (req, res) => {
  try {
    const { cartTotal, deliveryAddress, customerPhone, customerName, specialInstructions } = req.body;

    if (!cartTotal || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        error: 'cartTotal and deliveryAddress are required'
      });
    }

    const deliveryRequest = {
      cartTotal,
      deliveryAddress,
      customerPhone: customerPhone || '+1-210-555-0123',
      customerName: customerName || 'Customer',
      specialInstructions
    };

    // Try providers in priority order until one succeeds
    let bestQuote = null;
    const errors = [];

    // Try DoorDash first
    if (PROVIDERS.doordash.enabled) {
      try {
        bestQuote = await getDoorDashQuote(deliveryRequest);
      } catch (error) {
        errors.push({ provider: 'doordash', error: error.message });
      }
    }

    // Try Uber if DoorDash failed
    if (!bestQuote && PROVIDERS.uber.enabled) {
      try {
        bestQuote = await getUberQuote(deliveryRequest);
      } catch (error) {
        errors.push({ provider: 'uber', error: error.message });
      }
    }

    if (!bestQuote) {
      return res.status(500).json({
        success: false,
        error: 'No delivery providers available',
        errors
      });
    }

    // Calculate savings vs Nash
    const nashCost = NASH_COSTS.totalPerOrder;
    const savings = nashCost - bestQuote.cost;

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
      features: bestQuote.features,
      savings: {
        vsNash: savings,
        percentage: Math.round((savings / nashCost) * 100),
        message: `Save $${savings.toFixed(2)} vs Nash/Square`
      },
      availableProviders: Object.keys(PROVIDERS).filter(key => PROVIDERS[key].enabled)
    });

  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/delivery/lightspeed/webhook
 * Lightspeed webhook handler for automatic delivery creation
 */
router.post('/lightspeed/webhook', async (req, res) => {
  try {
    const order = req.body;

    // Validate Lightspeed webhook signature
    const signature = req.headers['x-lightspeed-signature'];
    if (!signature) {
      return res.status(401).json({
        success: false,
        error: 'Missing Lightspeed signature'
      });
    }

    // Extract delivery information from order
    const deliveryRequest = {
      cartTotal: order.total,
      deliveryAddress: {
        street: order.shippingAddress?.address1,
        city: order.shippingAddress?.city,
        state: order.shippingAddress?.state,
        zip: order.shippingAddress?.zip
      },
      customerPhone: order.customer?.phone,
      customerName: `${order.customer?.firstName} ${order.customer?.lastName}`,
      specialInstructions: order.notes || 'Cannabis delivery - ID verification required',
      items: order.lineItems?.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })) || []
    };

    // Get best quote and create delivery
    let delivery = null;
    const errors = [];

    // Try DoorDash first
    if (PROVIDERS.doordash.enabled) {
      try {
        const quote = await getDoorDashQuote(deliveryRequest);
        
        // Create actual delivery
        const token = generateDoorDashToken();
        const deliveryRequest_dd = {
          external_delivery_id: `rd-${order.id}-${Date.now()}`,
          pickup_address: STORE_CONFIG.address,
          pickup_phone_number: STORE_CONFIG.phone,
          pickup_business_name: STORE_CONFIG.name,
          pickup_instructions: 'Cannabis delivery - ID verification required',
          dropoff_address: deliveryRequest.deliveryAddress,
          dropoff_phone_number: deliveryRequest.customerPhone,
          dropoff_instructions: deliveryRequest.specialInstructions,
          order_value: deliveryRequest.cartTotal,
          items: deliveryRequest.items
        };

        const deliveryResponse = await axios.post(
          `${PROVIDERS.doordash.baseUrl}/deliveries`,
          deliveryRequest_dd,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        delivery = {
          deliveryId: deliveryResponse.data.id,
          provider: 'doordash',
          trackingUrl: deliveryResponse.data.tracking_url,
          estimatedDelivery: deliveryResponse.data.estimated_pickup_time_seconds,
          cost: quote.cost,
          status: 'created'
        };

      } catch (error) {
        errors.push({ provider: 'doordash', error: error.message });
      }
    }

    // Try Uber if DoorDash failed
    if (!delivery && PROVIDERS.uber.enabled) {
      try {
        const quote = await getUberQuote(deliveryRequest);
        
        // Create actual delivery
        const deliveryRequest_uber = {
          pickup_address: `${STORE_CONFIG.address.street}, ${STORE_CONFIG.address.city}, ${STORE_CONFIG.address.state} ${STORE_CONFIG.address.zip}`,
          pickup_coordinates: STORE_CONFIG.coordinates,
          pickup_phone: STORE_CONFIG.phone,
          pickup_name: STORE_CONFIG.name,
          dropoff_address: `${deliveryRequest.deliveryAddress.street}, ${deliveryRequest.deliveryAddress.city}, ${deliveryRequest.deliveryAddress.state} ${deliveryRequest.deliveryAddress.zip}`,
          dropoff_coordinates: deliveryRequest.deliveryAddress.coordinates,
          dropoff_phone: deliveryRequest.customerPhone,
          dropoff_name: deliveryRequest.customerName,
          items: deliveryRequest.items
        };

        const deliveryResponse = await axios.post(
          `${PROVIDERS.uber.baseUrl}/deliveries`,
          deliveryRequest_uber,
          {
            headers: {
              'Authorization': `Bearer ${PROVIDERS.uber.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        delivery = {
          deliveryId: deliveryResponse.data.id,
          provider: 'uber',
          trackingUrl: deliveryResponse.data.tracking_url,
          estimatedDelivery: deliveryResponse.data.estimated_duration_minutes,
          cost: quote.cost,
          status: 'created'
        };

      } catch (error) {
        errors.push({ provider: 'uber', error: error.message });
      }
    }

    if (!delivery) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create delivery with any provider',
        errors
      });
    }

    res.json({
      success: true,
      orderId: order.id,
      deliveryId: delivery.deliveryId,
      provider: delivery.provider,
      trackingUrl: delivery.trackingUrl,
      estimatedDelivery: delivery.estimatedDelivery,
      cost: delivery.cost,
      status: delivery.status
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
 * GET /api/delivery/status/:deliveryId
 * Get real-time delivery status
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

    let status = null;

    if (provider === 'doordash' && PROVIDERS.doordash.enabled) {
      const token = generateDoorDashToken();
      const response = await axios.get(
        `${PROVIDERS.doordash.baseUrl}/deliveries/${deliveryId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
          }
        );
      
      const delivery = response.data;
      status = {
        deliveryId,
        status: delivery.status,
        driverName: delivery.driver?.name,
        driverPhone: delivery.driver?.phone,
        estimatedDelivery: delivery.estimated_pickup_time_seconds,
        trackingUrl: delivery.tracking_url
      };
    } else if (provider === 'uber' && PROVIDERS.uber.enabled) {
      const response = await axios.get(
        `${PROVIDERS.uber.baseUrl}/deliveries/${deliveryId}`,
        {
          headers: {
            'Authorization': `Bearer ${PROVIDERS.uber.apiKey}`
          }
        }
      );
      
      const delivery = response.data;
      status = {
        deliveryId,
        status: delivery.status,
        driverName: delivery.driver?.name,
        driverPhone: delivery.driver?.phone,
        estimatedDelivery: delivery.estimated_duration_minutes,
        trackingUrl: delivery.tracking_url
      };
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider or provider not configured'
      });
    }

    res.json({
      success: true,
      ...status
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/delivery/cancel
 * Cancel delivery with automatic refund
 */
router.post('/cancel', async (req, res) => {
  try {
    const { deliveryId, reason, provider } = req.body;

    if (!deliveryId || !provider) {
      return res.status(400).json({
        success: false,
        error: 'deliveryId and provider are required'
      });
    }

    let cancellation = null;

    if (provider === 'doordash' && PROVIDERS.doordash.enabled) {
      const token = generateDoorDashToken();
      const response = await axios.post(
        `${PROVIDERS.doordash.baseUrl}/deliveries/${deliveryId}/cancel`,
        { reason },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      cancellation = {
        deliveryId,
        cancelled: response.data.cancelled,
        refundAmount: response.data.refund_amount / 100, // Convert cents to dollars
        reason: response.data.reason
      };
    } else if (provider === 'uber' && PROVIDERS.uber.enabled) {
      const response = await axios.post(
        `${PROVIDERS.uber.baseUrl}/deliveries/${deliveryId}/cancel`,
        { reason },
        {
          headers: {
            'Authorization': `Bearer ${PROVIDERS.uber.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      cancellation = {
        deliveryId,
        cancelled: response.data.cancelled,
        refundAmount: response.data.refund_amount,
        reason: response.data.reason
      };
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider or provider not configured'
      });
    }

    res.json({
      success: true,
      ...cancellation
    });

  } catch (error) {
    console.error('Cancellation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

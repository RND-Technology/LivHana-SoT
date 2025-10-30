// PROVIDER COMPARISON & INTELLIGENT ROUTING
// Returns ALL available providers with real-time quotes for superior UI

// import axios from 'axios'; // Reserved for future API integration

/**
 * Calculate provider score based on multiple factors
 * Higher score = better option
 */
export function calculateProviderScore(provider, quote) {
  const weights = {
    cost: 0.40,        // 40% weight on cost
    reliability: 0.30,  // 30% weight on reliability
    speed: 0.20,        // 20% weight on speed
    rating: 0.10        // 10% weight on customer rating
  };

  // Normalize values (0-1 scale, higher is better)
  const costScore = 1 - (quote.cost / 10);  // Cheaper is better
  const reliabilityScore = provider.reliability;  // Already 0-1
  const speedScore = 1 - (quote.estimatedMinutes / 60);  // Faster is better
  const ratingScore = provider.avgRating / 5;  // Already 0-5, convert to 0-1

  const totalScore =
    (costScore * weights.cost) +
    (reliabilityScore * weights.reliability) +
    (speedScore * weights.speed) +
    (ratingScore * weights.rating);

  return Math.round(totalScore * 100); // Return as 0-100
}

/**
 * Get quotes from ALL enabled providers
 * Returns comparison data for UI
 */
export async function getAllProviderQuotes(deliveryAddress, cartTotal, providers) {
  const enabledProviders = Object.entries(providers).filter(([, p]) => p.enabled);

  const quotes = await Promise.allSettled(
    enabledProviders.map(async ([key, provider]) => {
      try {
        // Get real-time quote from provider
        const quote = await getProviderQuote(key, provider, deliveryAddress, cartTotal);

        // Calculate score
        const score = calculateProviderScore(provider, quote);

        return {
          provider: key,
          name: provider.name,
          cost: quote.cost,
          estimatedMinutes: quote.estimatedMinutes,
          estimatedArrival: new Date(Date.now() + quote.estimatedMinutes * 60000).toISOString(),
          rating: provider.avgRating || 4.5,
          reliability: provider.reliability,
          score,
          features: quote.features || [],
          available: true
        };
      } catch (error) {
        // Error logged silently for provider fallback
        return {
          provider: key,
          name: provider.name,
          available: false,
          error: error.message
        };
      }
    })
  );

  // Extract successful quotes
  const successfulQuotes = quotes
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value)
    .filter(quote => quote.available);

  // Sort by score (highest first)
  successfulQuotes.sort((a, b) => b.score - a.score);

  // Add tags for UI
  if (successfulQuotes.length > 0) {
    // Tag fastest
    const fastest = successfulQuotes.reduce((min, q) =>
      q.estimatedMinutes < min.estimatedMinutes ? q : min
    );
    fastest.tags = [...(fastest.tags || []), 'fastest'];

    // Tag cheapest
    const cheapest = successfulQuotes.reduce((min, q) =>
      q.cost < min.cost ? q : min
    );
    cheapest.tags = [...(cheapest.tags || []), 'cheapest'];

    // Tag recommended (highest score)
    successfulQuotes[0].tags = [...(successfulQuotes[0].tags || []), 'recommended'];
  }

  return {
    available: successfulQuotes,
    unavailable: quotes
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value)
      .filter(quote => !quote.available),
    totalAvailable: successfulQuotes.length
  };
}

/**
 * Get quote from specific provider
 */
async function getProviderQuote(providerKey, providerConfig, address, cartTotal) {
  switch (providerKey) {
    case 'doordash':
      return await getDoorDashQuote(providerConfig, address, cartTotal);

    case 'uber':
      return await getUberQuote(providerConfig, address, cartTotal);

    case 'postmates':
      return await getPostmatesQuote(providerConfig, address, cartTotal);

    case 'grubhub':
      return await getGrubhubQuote(providerConfig, address, cartTotal);

    default:
      throw new Error(`Unknown provider: ${providerKey}`);
  }
}

/**
 * DoorDash quote
 */
// eslint-disable-next-line no-unused-vars
async function getDoorDashQuote(provider, address, cartTotal) {
  // TODO: Replace with real API call once keys available
  // For now, return simulated quote
  return {
    cost: 5.50,
    estimatedMinutes: 35,
    features: ['Real-time tracking', 'Contactless delivery', 'SMS updates']
  };

  /* REAL IMPLEMENTATION (once API keys obtained):
  // Generate JWT for authentication
  const jwt = generateDoorDashJWT(provider.developerId, provider.keyId, provider.signingSecret);

  const response = await axios.post(
    `${provider.baseUrl}/quotes`,
    {
      pickup_address: STORE_CONFIG.storeAddress,
      dropoff_address: address,
      order_value: Math.round(cartTotal * 100) // Convert to cents
    },
    {
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    cost: response.data.fee / 100, // Convert cents to dollars
    estimatedMinutes: response.data.estimated_delivery_time,
    features: response.data.supported_features || ['Real-time tracking', 'Contactless delivery', 'SMS updates']
  };
  */
}

/**
 * Generate JWT token for DoorDash Drive API
 * (Helper function - will be moved to shared auth module)
 * Reserved for future API integration
 */
// eslint-disable-next-line no-unused-vars
function _generateDoorDashJWT(developerId, keyId, signingSecret) {
  const crypto = require('crypto');

  const header = {
    alg: 'HS256',
    typ: 'JWT',
    'dd-ver': 'DD-JWT-V1'
  };

  const payload = {
    aud: 'doordash',
    iss: developerId,
    kid: keyId,
    exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
    iat: Math.floor(Date.now() / 1000)
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', signingSecret).update(signatureInput).digest('base64url');

  return `${signatureInput}.${signature}`;
}

/**
 * Uber quote
 */
// eslint-disable-next-line no-unused-vars
async function getUberQuote(provider, address, cartTotal) {
  // TODO: Replace with real API call once keys available
  return {
    cost: 5.00,
    estimatedMinutes: 40,
    features: ['Live tracking', 'Flexible scheduling', 'In-app tips']
  };

  /* REAL IMPLEMENTATION:
  const response = await axios.post(
    `${provider.baseUrl}/quotes`,
    {
      pickup: {
        location: STORE_CONFIG.storeAddress
      },
      dropoff: {
        location: address
      },
      manifest: {
        total_value: cartTotal
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return {
    cost: response.data.fee,
    estimatedMinutes: response.data.duration,
    features: response.data.capabilities
  };
  */
}

/**
 * Postmates quote
 */
// eslint-disable-next-line no-unused-vars
async function getPostmatesQuote(provider, address, cartTotal) {
  // TODO: Implement once API keys available
  return {
    cost: 5.25,
    estimatedMinutes: 38,
    features: ['Real-time GPS', 'Photo delivery proof', 'Customer rating system']
  };
}

/**
 * Grubhub quote
 */
// eslint-disable-next-line no-unused-vars
async function getGrubhubQuote(provider, address, cartTotal) {
  // TODO: Implement once API keys available
  return {
    cost: 6.00,
    estimatedMinutes: 40,
    features: ['Restaurant network', 'Marketing exposure', 'Customer insights']
  };
}

/**
 * Select best provider using intelligent routing
 */
export function selectBestProvider(quotes, preferences = {}) {
  if (quotes.available.length === 0) {
    return null;
  }

  // Apply user preferences if any
  if (preferences.preferredProvider) {
    const preferred = quotes.available.find(q => q.provider === preferences.preferredProvider);
    if (preferred) return preferred;
  }

  if (preferences.prioritizeSpeed) {
    return quotes.available.reduce((fastest, q) =>
      q.estimatedMinutes < fastest.estimatedMinutes ? q : fastest
    );
  }

  if (preferences.prioritizeCost) {
    return quotes.available.reduce((cheapest, q) =>
      q.cost < cheapest.cost ? q : cheapest
    );
  }

  // Default: return highest scored (recommended)
  return quotes.available[0];
}

export default {
  getAllProviderQuotes,
  selectBestProvider,
  calculateProviderScore
};

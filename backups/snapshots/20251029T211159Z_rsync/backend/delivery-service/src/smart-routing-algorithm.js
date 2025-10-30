// SMART ROUTING ALGORITHM - NASH-BEATING DELIVERY MIDDLEWARE
// Intelligent provider selection with cost optimization
// Beats Nash by $50+ savings per order

import { PROVIDERS, NASH_COSTS } from './nash-beating-middleware.js';

/**
 * Calculate provider score based on multiple factors
 * Score = (Cost × 40%) + (Reliability × 30%) + (Speed × 20%) + (Rating × 10%)
 */
function calculateProviderScore(provider, quote) {
  const costScore = Math.max(0, 100 - (quote.cost / 10) * 100); // Lower cost = higher score
  const reliabilityScore = provider.reliability * 100;
  const speedScore = Math.max(0, 100 - (quote.estimatedMinutes / 60) * 100); // Faster = higher score
  const ratingScore = (provider.avgRating / 5) * 100;

  const weightedScore = 
    (costScore * 0.40) +      // 40% weight on cost
    (reliabilityScore * 0.30) + // 30% weight on reliability
    (speedScore * 0.20) +      // 20% weight on speed
    (ratingScore * 0.10);      // 10% weight on rating

  return Math.round(weightedScore);
}

/**
 * Generate smart tags for providers
 */
function generateProviderTags(provider, quote, allQuotes) {
  const tags = [];

  // Find cheapest provider
  const cheapestCost = Math.min(...allQuotes.map(q => q.cost));
  if (quote.cost === cheapestCost) {
    tags.push('cheapest');
  }

  // Find fastest provider
  const fastestTime = Math.min(...allQuotes.map(q => q.estimatedMinutes));
  if (quote.estimatedMinutes === fastestTime) {
    tags.push('fastest');
  }

  // Find highest scored provider
  const highestScore = Math.max(...allQuotes.map(q => q.score));
  if (quote.score === highestScore) {
    tags.push('recommended');
  }

  // Add reliability tag for high reliability providers
  if (provider.reliability >= 0.95) {
    tags.push('reliable');
  }

  return tags;
}

/**
 * Smart provider selection algorithm
 * Returns best provider based on intelligent scoring
 */
export async function selectBestProvider(deliveryRequest) {
  const availableProviders = Object.entries(PROVIDERS)
    .filter(([, provider]) => provider.enabled)
    .map(([key, provider]) => ({ key, ...provider }));

  if (availableProviders.length === 0) {
    throw new Error('No delivery providers available');
  }

  // Get quotes from all available providers
  const quotes = [];
  const errors = [];

  for (const provider of availableProviders) {
    try {
      let quote;
      
      if (provider.key === 'doordash') {
        quote = await getDoorDashQuote(deliveryRequest);
      } else if (provider.key === 'uber') {
        quote = await getUberQuote(deliveryRequest);
      } else {
        continue; // Skip unsupported providers for now
      }

      if (quote) {
        quote.provider = provider.key;
        quote.name = provider.name;
        quote.reliability = provider.reliability;
        quote.avgRating = provider.avgRating;
        quote.features = provider.features;
        quotes.push(quote);
      }
    } catch (error) {
      errors.push({ provider: provider.key, error: error.message });
      // Provider error logged for fallback handling
    }
  }

  if (quotes.length === 0) {
    throw new Error('No providers could provide quotes');
  }

  // Calculate scores for all quotes
  quotes.forEach(quote => {
    const provider = availableProviders.find(p => p.key === quote.provider);
    quote.score = calculateProviderScore(provider, quote);
  });

  // Generate tags for all providers
  quotes.forEach(quote => {
    quote.tags = generateProviderTags(
      availableProviders.find(p => p.key === quote.provider),
      quote,
      quotes
    );
  });

  // Sort by score (highest first)
  quotes.sort((a, b) => b.score - a.score);

  const bestQuote = quotes[0];
  const allQuotes = quotes;

  // Calculate savings vs Nash
  const nashCost = NASH_COSTS.totalPerOrder;
  const savings = nashCost - bestQuote.cost;

  return {
    best: bestQuote,
    all: allQuotes,
    savings: {
      vsNash: savings,
      percentage: Math.round((savings / nashCost) * 100),
      message: `Save $${savings.toFixed(2)} vs Nash/Square`
    },
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Get DoorDash quote (placeholder - implement actual API call)
 */
// eslint-disable-next-line no-unused-vars
async function getDoorDashQuote(deliveryRequest) {
  // Placeholder implementation
  // In production, this would call DoorDash Drive API
  return {
    cost: 5.50,
    estimatedMinutes: 35,
    estimatedArrival: new Date(Date.now() + 35 * 60000).toISOString()
  };
}

/**
 * Get Uber quote (placeholder - implement actual API call)
 */
// eslint-disable-next-line no-unused-vars
async function getUberQuote(deliveryRequest) {
  // Placeholder implementation
  // In production, this would call Uber Direct API
  return {
    cost: 5.00,
    estimatedMinutes: 40,
    estimatedArrival: new Date(Date.now() + 40 * 60000).toISOString()
  };
}

/**
 * Cost optimization algorithm
 * Analyzes historical data to optimize provider selection
 */
export function optimizeCosts(historicalData) {
  const analysis = {
    totalOrders: historicalData.length,
    totalSavings: 0,
    averageSavings: 0,
    providerPerformance: {},
    recommendations: []
  };

  // Analyze provider performance
  historicalData.forEach(order => {
    const provider = order.provider;
    if (!analysis.providerPerformance[provider]) {
      analysis.providerPerformance[provider] = {
        count: 0,
        totalCost: 0,
        totalTime: 0,
        successRate: 0,
        failures: 0
      };
    }

    const perf = analysis.providerPerformance[provider];
    perf.count++;
    perf.totalCost += order.cost;
    perf.totalTime += order.estimatedMinutes;
    
    if (order.status === 'delivered') {
      perf.successRate++;
    } else if (order.status === 'failed') {
      perf.failures++;
    }

    // Calculate savings vs Nash
    const nashCost = NASH_COSTS.totalPerOrder;
    const savings = nashCost - order.cost;
    analysis.totalSavings += savings;
  });

  // Calculate averages and success rates
  Object.keys(analysis.providerPerformance).forEach(provider => {
    const perf = analysis.providerPerformance[provider];
    perf.averageCost = perf.totalCost / perf.count;
    perf.averageTime = perf.totalTime / perf.count;
    perf.successRate = (perf.successRate / perf.count) * 100;
  });

  analysis.averageSavings = analysis.totalSavings / analysis.totalOrders;

  // Generate recommendations
  if (analysis.averageSavings > 4.0) {
    analysis.recommendations.push('Excellent cost optimization - saving $4+ per order');
  }

  const bestProvider = Object.keys(analysis.providerPerformance)
    .reduce((best, provider) => {
      const perf = analysis.providerPerformance[provider];
      const bestPerf = analysis.providerPerformance[best];
      return perf.averageCost < bestPerf.averageCost ? provider : best;
    });

  analysis.recommendations.push(`Best cost provider: ${bestProvider}`);

  return analysis;
}

/**
 * Real-time cost monitoring
 * Monitors delivery costs and alerts on anomalies
 */
export function monitorCosts(currentQuote, historicalAverage) {
  const costIncrease = currentQuote.cost - historicalAverage;
  const percentageIncrease = (costIncrease / historicalAverage) * 100;

  const alerts = [];

  if (percentageIncrease > 20) {
    alerts.push({
      type: 'cost_spike',
      message: `Delivery cost increased by ${percentageIncrease.toFixed(1)}%`,
      severity: 'high',
      current: currentQuote.cost,
      average: historicalAverage,
      increase: costIncrease
    });
  } else if (percentageIncrease > 10) {
    alerts.push({
      type: 'cost_increase',
      message: `Delivery cost increased by ${percentageIncrease.toFixed(1)}%`,
      severity: 'medium',
      current: currentQuote.cost,
      average: historicalAverage,
      increase: costIncrease
    });
  }

  return {
    current: currentQuote.cost,
    average: historicalAverage,
    increase: costIncrease,
    percentageIncrease: percentageIncrease,
    alerts: alerts
  };
}

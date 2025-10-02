/**
 * Memory Learning System - API Client
 *
 * Simple client for interacting with the memory API from other services.
 *
 * Usage:
 *   import { MemoryClient } from './common/memory/client.js';
 *   const client = new MemoryClient({ baseUrl, token, logger });
 *   await client.learn(customerId, interaction);
 */

export class MemoryClient {
  constructor({ baseUrl, token, logger }) {
    this.baseUrl = baseUrl || process.env.REASONING_GATEWAY_URL || 'http://localhost:4002';
    this.token = token;
    this.logger = logger;
  }

  async request(method, path, data = null) {
    const url = `${this.baseUrl}${path}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      return result;
    } catch (error) {
      this.logger?.error?.({ error: error.message, method, path }, 'Memory API request failed');
      throw error;
    }
  }

  /**
   * Record and learn from a customer interaction
   * @param {string} customerId - Customer ID
   * @param {object} interaction - Interaction data
   * @returns {Promise<object>} Learning result
   */
  async learn(customerId, interaction) {
    return await this.request('POST', '/api/memory/learn', {
      customerId,
      interaction,
    });
  }

  /**
   * Get customer context
   * @param {string} customerId - Customer ID
   * @param {object} options - Options (sessionId, depth, includeRecommendations, currentMessage)
   * @returns {Promise<object>} Customer context
   */
  async getContext(customerId, options = {}) {
    const params = new URLSearchParams();
    if (options.sessionId) params.append('sessionId', options.sessionId);
    if (options.depth) params.append('depth', options.depth);
    if (options.includeRecommendations !== undefined) {
      params.append('includeRecommendations', options.includeRecommendations);
    }
    if (options.currentMessage) params.append('currentMessage', options.currentMessage);

    const query = params.toString() ? `?${params.toString()}` : '';
    return await this.request('GET', `/api/memory/context/${customerId}${query}`);
  }

  /**
   * Get predictions for a customer
   * @param {string} customerId - Customer ID
   * @param {string} predictionType - Type ('all', 'next-purchase', 'churn-risk', 'recommendations')
   * @returns {Promise<object>} Predictions
   */
  async predict(customerId, predictionType = 'all') {
    return await this.request('POST', `/api/memory/predict/${customerId}`, {
      predictionType,
    });
  }

  /**
   * Record a customer purchase
   * @param {string} customerId - Customer ID
   * @param {object} purchase - Purchase data
   * @returns {Promise<object>} Purchase result
   */
  async recordPurchase(customerId, purchase) {
    return await this.request('POST', `/api/memory/purchase/${customerId}`, {
      purchase,
    });
  }

  /**
   * Get customer profile
   * @param {string} customerId - Customer ID
   * @returns {Promise<object>} Customer profile
   */
  async getProfile(customerId) {
    return await this.request('GET', `/api/memory/profile/${customerId}`);
  }

  /**
   * Delete customer data (GDPR)
   * @param {string} customerId - Customer ID
   * @param {string} reason - Deletion reason
   * @returns {Promise<object>} Deletion result
   */
  async forgetCustomer(customerId, reason = 'User requested deletion') {
    return await this.request('DELETE', `/api/memory/forget/${customerId}`, {
      reason,
    });
  }

  /**
   * Semantic search for products or conversations
   * @param {string} query - Search query
   * @param {string} searchType - Type ('products' or 'conversations')
   * @param {object} options - Search options
   * @returns {Promise<object>} Search results
   */
  async vectorSearch(query, searchType = 'products', options = {}) {
    return await this.request('POST', '/api/memory/vector/search', {
      query,
      searchType,
      options,
    });
  }

  /**
   * Index a product for semantic search
   * @param {object} product - Product data
   * @returns {Promise<object>} Index result
   */
  async indexProduct(product) {
    return await this.request('POST', '/api/memory/vector/product', {
      product,
    });
  }

  /**
   * Get analytics insights for a time period
   * @param {string} startDate - Start date (ISO 8601)
   * @param {string} endDate - End date (ISO 8601)
   * @returns {Promise<object>} Analytics insights
   */
  async getInsights(startDate, endDate) {
    const params = new URLSearchParams({ startDate, endDate });
    return await this.request('GET', `/api/memory/analytics/insights?${params.toString()}`);
  }

  /**
   * Get customers at risk of churning
   * @param {number} riskThreshold - Risk threshold (0-1)
   * @returns {Promise<object>} Churn cohort
   */
  async getChurnCohort(riskThreshold = 0.7) {
    const params = new URLSearchParams({ riskThreshold });
    return await this.request('GET', `/api/memory/analytics/churn-cohort?${params.toString()}`);
  }

  /**
   * Get customer lifetime value
   * @param {string} customerId - Customer ID
   * @returns {Promise<object>} Lifetime value data
   */
  async getLifetimeValue(customerId) {
    return await this.request('GET', `/api/memory/analytics/ltv/${customerId}`);
  }

  /**
   * Check memory system health
   * @returns {Promise<object>} Health status
   */
  async health() {
    return await this.request('GET', '/api/memory/health');
  }
}

/**
 * Create a memory client instance
 * @param {object} options - Client options
 * @returns {MemoryClient} Client instance
 */
export function createMemoryClient(options) {
  return new MemoryClient(options);
}

// Example usage:
//
// import { createMemoryClient } from './common/memory/client.js';
//
// const memory = createMemoryClient({
//   baseUrl: 'http://localhost:4002',
//   token: 'your-jwt-token',
//   logger: console
// });
//
// // Learn from interaction
// await memory.learn('customer-123', {
//   message: "I need help with sleep",
//   response: "Try Indica strains",
//   sentiment: 0.8
// });
//
// // Get context for AI
// const context = await memory.getContext('customer-123', {
//   depth: 'summary',
//   currentMessage: "What do you recommend?"
// });
//
// // Check churn risk
// const predictions = await memory.predict('customer-123', 'churn-risk');
// if (predictions.churnRisk.churnRisk > 0.7) {
//   console.info('Customer at risk!');
// }

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02

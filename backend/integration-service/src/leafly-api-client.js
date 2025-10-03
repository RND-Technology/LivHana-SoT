// Leafly API Client - Cannabis Menu/Deals/Inventory Integration
// Production-ready stub - awaiting API credentials

const axios = require('axios');
const { createLogger } = require('../../common/logging');

const logger = createLogger('leafly-api-client');

class LeaflyAPIClient {
  constructor() {
    this.apiKey = process.env.LEAFLY_API_KEY;
    this.dispensaryId = process.env.LEAFLY_DISPENSARY_ID;
    this.baseUrl = process.env.LEAFLY_API_BASE_URL || 'https://api.leafly.com/v1';
    this.timeout = parseInt(process.env.LEAFLY_API_TIMEOUT || '30000', 10);

    if (!this.apiKey) {
      logger.warn('LEAFLY_API_KEY not configured - API calls will fail');
    }
    if (!this.dispensaryId) {
      logger.warn('LEAFLY_DISPENSARY_ID not configured - API calls will fail');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'LivHana-E2E-Integration/1.0'
      }
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        logger.error('Leafly API error', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        throw error;
      }
    );
  }

  /**
   * Get full menu for dispensary
   * @returns {Promise<Array>} Menu items with products, pricing, inventory
   */
  async getMenu() {
    try {
      logger.info('Fetching Leafly menu', { dispensaryId: this.dispensaryId });

      const response = await this.client.get(`/dispensaries/${this.dispensaryId}/menu`);

      logger.info('Leafly menu fetched successfully', {
        itemCount: response.data?.items?.length || 0
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch Leafly menu', {
        error: error.message,
        dispensaryId: this.dispensaryId
      });
      throw error;
    }
  }

  /**
   * Get all products for dispensary
   * @returns {Promise<Array>} Product catalog with strains, categories, THC/CBD levels
   */
  async getProducts() {
    try {
      logger.info('Fetching Leafly products', { dispensaryId: this.dispensaryId });

      const response = await this.client.get(`/dispensaries/${this.dispensaryId}/products`);

      logger.info('Leafly products fetched successfully', {
        productCount: response.data?.products?.length || 0
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch Leafly products', {
        error: error.message,
        dispensaryId: this.dispensaryId
      });
      throw error;
    }
  }

  /**
   * Get active deals and promotions
   * @returns {Promise<Array>} Active deals with discount info, expiration dates
   */
  async getDeals() {
    try {
      logger.info('Fetching Leafly deals', { dispensaryId: this.dispensaryId });

      const response = await this.client.get(`/dispensaries/${this.dispensaryId}/deals`);

      logger.info('Leafly deals fetched successfully', {
        dealCount: response.data?.deals?.length || 0
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch Leafly deals', {
        error: error.message,
        dispensaryId: this.dispensaryId
      });
      throw error;
    }
  }

  /**
   * Update inventory levels for products
   * @param {Array} inventoryUpdates - Array of {productId, quantity, inStock}
   * @returns {Promise<Object>} Update confirmation
   */
  async updateInventory(inventoryUpdates) {
    try {
      logger.info('Updating Leafly inventory', {
        dispensaryId: this.dispensaryId,
        updateCount: inventoryUpdates.length
      });

      const response = await this.client.post(
        `/dispensaries/${this.dispensaryId}/inventory`,
        { updates: inventoryUpdates }
      );

      logger.info('Leafly inventory updated successfully', {
        updatedCount: response.data?.updated || 0
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to update Leafly inventory', {
        error: error.message,
        dispensaryId: this.dispensaryId,
        updateCount: inventoryUpdates.length
      });
      throw error;
    }
  }

  /**
   * Get dispensary details and metadata
   * @returns {Promise<Object>} Dispensary info, hours, location, compliance status
   */
  async getDispensaryDetails() {
    try {
      logger.info('Fetching Leafly dispensary details', { dispensaryId: this.dispensaryId });

      const response = await this.client.get(`/dispensaries/${this.dispensaryId}`);

      logger.info('Leafly dispensary details fetched successfully');

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch Leafly dispensary details', {
        error: error.message,
        dispensaryId: this.dispensaryId
      });
      throw error;
    }
  }

  /**
   * Health check - verify API credentials and connectivity
   * @returns {Promise<boolean>} True if API is accessible
   */
  async healthCheck() {
    try {
      if (!this.apiKey || !this.dispensaryId) {
        logger.warn('Leafly API credentials not configured');
        return false;
      }

      await this.getDispensaryDetails();
      logger.info('Leafly API health check passed');
      return true;
    } catch (error) {
      logger.error('Leafly API health check failed', {
        error: error.message
      });
      return false;
    }
  }
}

module.exports = { LeaflyAPIClient };

// Optimized: 2025-10-03
// Status: Production-ready stub - awaiting LEAFLY_API_KEY + LEAFLY_DISPENSARY_ID

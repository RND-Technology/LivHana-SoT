import axios from 'axios';
import { createLogger } from '../../common/logging/index.js';

const logger = createLogger('lightspeed-client');

/**
 * LightSpeed Retail X-Series API Client
 * Uses Personal Token authentication (Bearer token)
 * API Reference: https://x-series-api.lightspeedhq.com/reference
 */
class LightspeedClient {
  constructor(options = {}) {
    // X-Series Personal Token (lsxs_pt_*)
    this.personalToken = options.personalToken || process.env.LIGHTSPEED_API_KEY || process.env.LIGHTSPEED_CLIENT_ID;

    // API base URL for X-Series
    // For reads: Use vendhq.com/api/2.0
    // For writes: Use retail.lightspeed.app/api/2.1
    const defaultApiBase = 'https://reggieanddro.vendhq.com/api/2.0';
    this.apiBase = options.apiBase || process.env.LIGHTSPEED_API_BASE || defaultApiBase;
    this.writeApiBase = 'https://reggieanddro.retail.lightspeed.app/api/2.1';

    // API version (not used with new base URLs)
    this.apiVersion = options.apiVersion || '2.0';
    this.accountId = process.env.LIGHTSPEED_ACCOUNT_ID || 'reggieanddro';

    this.client = null;
    this.configured = !!this.personalToken;

    if (!this.configured) {
      logger.warn('LIGHTSPEED_API_KEY (Personal Token) is required');
    } else {
      logger.info('LightSpeed X-Series client initialized (Vend API)', {
        apiBase: this.apiBase,
        apiVersion: this.apiVersion
      });
    }
  }

  isConfigured() {
    return this.configured;
  }

  /**
   * Get or create the axios client with Bearer token authentication
   */
  getClient() {
    if (this.client) {
      return this.client;
    }

    // For X-Series/Vend API, baseURL should NOT include version (it's part of the path)
    const baseURL = this.apiBase.includes('/api/2.0') ? this.apiBase : `${this.apiBase}/api/2.0`;

    this.client = axios.create({
      baseURL: baseURL,
      headers: {
        'Authorization': `Bearer ${this.personalToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    return this.client;
  }

  /**
   * Get all products from X-Series
   * GET /products
   */
  async getProducts(options = {}) {
    const client = this.getClient();
    const limit = options.limit || 100;
    const offset = options.offset || 0;

    try {
      const params = {
        limit,
        offset
      };

      // Add search filter if provided
      if (options.search) {
        params.search = options.search;
      }

      const response = await client.get('/products', { params });

      // Debug: Log response structure
      logger.debug('API Response structure', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        hasDataProducts: !!response.data?.products,
        dataKeys: response.data ? Object.keys(response.data) : [],
        dataType: typeof response.data
      });

      // Handle different response structures
      let products = response.data.data || response.data.products || response.data || [];

      // Ensure products is an array
      if (!Array.isArray(products)) {
        logger.debug('Products is not an array, attempting conversion', {
          type: typeof products,
          hasLength: 'length' in (products || {}),
          keys: products ? Object.keys(products).slice(0, 10) : []
        });

        // If it's an object with a length property, it might be array-like
        if (products && typeof products === 'object' && 'length' in products) {
          products = Object.values(products);
        } else {
          logger.warn('Products response is not an array and cannot be converted', {
            type: typeof products
          });
          products = [];
        }
      }

      logger.info(`Fetched ${products.length} products from LightSpeed X-Series`);
      return products.map(product => this.transformProduct(product));
    } catch (error) {
      logger.error('Failed to fetch products from LightSpeed X-Series', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(`LightSpeed X-Series API error: ${error.message}`);
    }
  }

  /**
   * Get a single product by ID
   * GET /products/{id}
   */
  async getProduct(productId) {
    const client = this.getClient();

    try {
      const response = await client.get(`/products/${productId}`);
      const product = response.data.data || response.data;

      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      logger.info(`Fetched product ${productId} from LightSpeed X-Series`);
      return this.transformProduct(product);
    } catch (error) {
      logger.error(`Failed to fetch product ${productId} from LightSpeed X-Series`, {
        error: error.message,
        status: error.response?.status
      });
      throw new Error(`LightSpeed X-Series API error: ${error.message}`);
    }
  }

  /**
   * Update a product
   * PUT /products/{id} using API 2.1
   * Requires payload structure: { common: { description: "..." } }
   */
  async updateProduct(productId, updates) {
    try {
      // Use write API base (retail.lightspeed.app/api/2.1)
      const writeClient = axios.create({
        baseURL: this.writeApiBase,
        headers: {
          'Authorization': `Bearer ${this.personalToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      // Transform updates to API 2.1 format
      const payload = {
        common: {}
      };

      if (updates.description !== undefined) {
        payload.common.description = updates.description;
      }
      if (updates.name !== undefined) {
        payload.common.name = updates.name;
      }

      const response = await writeClient.put(`/products/${productId}`, payload);
      const product = response.data.data || response.data;

      logger.info(`Updated product ${productId} in LightSpeed X-Series (API 2.1)`);
      return this.transformProduct(product);
    } catch (error) {
      logger.error(`Failed to update product ${productId} in LightSpeed X-Series`, {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error(`LightSpeed X-Series API error: ${error.message}`);
    }
  }

  /**
   * Get all customers
   * GET /customers
   */
  async getCustomers(options = {}) {
    const client = this.getClient();
    const limit = options.limit || 100;
    const offset = options.offset || 0;

    try {
      const params = {
        limit,
        offset
      };

      // Add search filter if provided
      if (options.search) {
        params.search = options.search;
      }

      if (options.email) {
        params.email = options.email;
      }

      const response = await client.get('/customers', { params });
      const customers = response.data.data || response.data || [];

      logger.info(`Fetched ${customers.length} customers from LightSpeed X-Series`);
      return customers;
    } catch (error) {
      logger.error('Failed to fetch customers from LightSpeed X-Series', {
        error: error.message,
        status: error.response?.status
      });
      throw new Error(`LightSpeed X-Series API error: ${error.message}`);
    }
  }

  /**
   * Get customer by ID
   * GET /customers/{id}
   */
  async getCustomer(customerId) {
    const client = this.getClient();

    try {
      const response = await client.get(`/customers/${customerId}`);
      const customer = response.data.data || response.data;

      if (!customer) {
        throw new Error(`Customer ${customerId} not found`);
      }

      logger.info(`Fetched customer ${customerId} from LightSpeed X-Series`);
      return customer;
    } catch (error) {
      logger.error(`Failed to fetch customer ${customerId} from LightSpeed X-Series`, {
        error: error.message,
        status: error.response?.status
      });
      throw new Error(`LightSpeed X-Series API error: ${error.message}`);
    }
  }

  /**
   * Get inventory
   * GET /inventory
   */
  async getInventory(options = {}) {
    const client = this.getClient();

    try {
      const params = options;
      const response = await client.get('/inventory', { params });
      const inventory = response.data.data || response.data || [];

      logger.info(`Fetched ${inventory.length} inventory records from LightSpeed X-Series`);
      return inventory;
    } catch (error) {
      logger.error('Failed to fetch inventory from LightSpeed X-Series', {
        error: error.message,
        status: error.response?.status
      });
      throw new Error(`LightSpeed X-Series API error: ${error.message}`);
    }
  }

  /**
   * Get sales/orders
   * GET /sales
   */
  async getSales(options = {}) {
    const client = this.getClient();
    const limit = options.limit || 100;
    const offset = options.offset || 0;

    try {
      const params = {
        limit,
        offset
      };

      const response = await client.get('/sales', { params });
      const sales = response.data.data || response.data || [];

      logger.info(`Fetched ${sales.length} sales from LightSpeed X-Series`);
      return sales;
    } catch (error) {
      logger.error('Failed to fetch sales from LightSpeed X-Series', {
        error: error.message,
        status: error.response?.status
      });
      throw new Error(`LightSpeed X-Series API error: ${error.message}`);
    }
  }

  /**
   * Get outlets/locations
   * GET /outlets
   */
  async getOutlets() {
    const client = this.getClient();

    try {
      const response = await client.get('/outlets');
      const outlets = response.data.data || response.data || [];

      logger.info(`Fetched ${outlets.length} outlets from LightSpeed X-Series`);
      return outlets;
    } catch (error) {
      logger.error('Failed to fetch outlets from LightSpeed X-Series', {
        error: error.message,
        status: error.response?.status
      });
      throw new Error(`LightSpeed X-Series API error: ${error.message}`);
    }
  }

  /**
   * Transform X-Series product to our standard format
   */
  transformProduct(product) {
    return {
      id: String(product.id || product.product_id),
      name: product.name || product.title || 'Unknown Product',
      description: product.description || product.body || null,
      sku: product.sku || product.handle || `LS-${product.id}`,
      price: parseFloat(product.price || product.variant_price || 0),
      cost: parseFloat(product.cost || 0),
      quantity: parseInt(product.inventory_quantity || product.quantity || 0),
      inStock: (product.inventory_quantity || product.quantity || 0) > 0,
      category: product.product_type || product.category || 'Uncategorized',
      vendor: product.vendor || null,
      image_url: product.image?.src || product.image_url || null,
      created_at: product.created_at || new Date().toISOString(),
      updated_at: product.updated_at || null,
      raw: product // Keep raw data for reference
    };
  }
}

export default LightspeedClient;

// Optimized: 2025-10-04
// LightSpeed Retail X-Series API client with Personal Token (Bearer) authentication
// Uses Vend API stack: https://api.vendhq.com/api/2.0/
// API Reference: https://x-series-api.lightspeedhq.com/reference

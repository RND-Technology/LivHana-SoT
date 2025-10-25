import { createLogger } from '../../common/logging/index.js';

const logger = createLogger('lightspeed-client');

export class LightSpeedClient {
  constructor() {
    this.apiKey = process.env.LIGHTSPEED_TOKEN || null;
    this.baseUrl = process.env.LIGHTSPEED_BASE_URL || 'https://api.lightspeedhq.com';
    
    if (!this.apiKey) {
      logger.warn('LIGHTSPEED_TOKEN not set - using mock mode');
    }
  }

  async getProducts() {
    if (!this.apiKey) {
      // Mock data for development
      return [
        {
          id: 'premium-flower-001',
          name: 'Premium Flower Collection',
          price: 45.00,
          category: 'flower',
          inStock: true
        },
        {
          id: 'cbd-gummies-001',
          name: 'CBD Gummies',
          price: 25.00,
          category: 'edibles',
          inStock: true
        }
      ];
    }

    // TODO: Implement real LightSpeed API call
    logger.info('Fetching products from LightSpeed API');
    return [];
  }

  async getCustomer(customerId) {
    if (!this.apiKey) {
      // Mock customer data
      return {
        id: customerId,
        name: 'Test Customer',
        email: 'test@example.com',
        verified: false
      };
    }

    // TODO: Implement real LightSpeed API call
    logger.info(`Fetching customer ${customerId} from LightSpeed API`);
    return null;
  }
}

export function getLightSpeedClient() {
  return new LightSpeedClient();
}

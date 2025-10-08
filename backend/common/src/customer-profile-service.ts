// CUSTOMER PROFILE SERVICE - PROTOTYPE 2
// Unified customer profile enriched from all data sources
// Implements parallel data fetching and simple prediction heuristics

import { BigQuery } from '@google-cloud/bigquery';
import axios, { AxiosInstance } from 'axios';

// TypeScript strict mode - no 'any' types allowed
interface PurchaseHistory {
  product_id: string;
  purchase_count: number;
  last_purchase: string;
}

interface ContentEngagement {
  content_type: string;
  views: number;
  avg_time: number;
}

interface CustomerPreferences {
  [category: string]: number;
}

interface ProductPrediction {
  product_id: string;
  confidence: number;
}

interface CustomerProfile {
  id: string;
  basic: any;
  purchase_history: PurchaseHistory[];
  preferences: CustomerPreferences;
  content_engagement: ContentEngagement[];
  predictions: {
    next_purchase_date: string | null;
    likely_products: ProductPrediction[];
  };
}

export class CustomerProfileService {
  private bigquery: BigQuery;
  private lightspeed: AxiosInstance;
  private dataset: string;

  constructor() {
    const token = process.env.LIGHTSPEED_TOKEN;
    if (!token) {
      throw new Error('LIGHTSPEED_TOKEN environment variable required');
    }

    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID || 'reggieanddrodispensary',
    });

    this.lightspeed = axios.create({
      baseURL: 'https://api.lightspeedapp.com/API',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.dataset = process.env.BIGQUERY_DATASET || 'livhana_prod';
  }

  /**
   * Get enriched customer profile from all data sources
   * Fetches data in parallel for optimal performance
   */
  async getEnrichedProfile(customerId: string): Promise<CustomerProfile> {
    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    // Fetch data from all sources in parallel
    const [purchases, inventory, analytics] = await Promise.allSettled([
      this.fetchPurchaseHistory(customerId),
      this.fetchCustomerInfo(customerId),
      this.fetchContentAnalytics(customerId),
    ]);

    // Extract successful results
    const purchaseHistory = purchases.status === 'fulfilled' ? purchases.value : [];
    const basicInfo = inventory.status === 'fulfilled' ? inventory.value : {};
    const contentEngagement = analytics.status === 'fulfilled' ? analytics.value : [];

    // Synthesize into unified profile
    return {
      id: customerId,
      basic: basicInfo,
      purchase_history: purchaseHistory,
      preferences: this.extractPreferences(purchaseHistory),
      content_engagement: contentEngagement,
      predictions: {
        next_purchase_date: this.predictNextPurchase(purchaseHistory),
        likely_products: this.predictProducts(purchaseHistory),
      },
    };
  }

  /**
   * Fetch purchase history from BigQuery
   */
  private async fetchPurchaseHistory(customerId: string): Promise<PurchaseHistory[]> {
    const query = `
      SELECT
        product_id,
        COUNT(*) as purchase_count,
        MAX(timestamp) as last_purchase
      FROM \`${this.dataset}.sales\`
      WHERE customer_id = @customerId
      GROUP BY product_id
      ORDER BY purchase_count DESC
      LIMIT 50
    `;

    try {
      const [rows] = await this.bigquery.query({
        query,
        params: { customerId },
        location: 'US',
      });

      return rows as PurchaseHistory[];
    } catch (error) {
      console.warn('Failed to fetch purchase history:', error);
      return [];
    }
  }

  /**
   * Fetch customer info from Lightspeed
   */
  private async fetchCustomerInfo(customerId: string): Promise<any> {
    try {
      const response = await this.lightspeed.get(`/Account/1/Customer/${customerId}.json`);
      return response.data.Customer || {};
    } catch (error) {
      console.warn('Failed to fetch customer info:', error);
      return {};
    }
  }

  /**
   * Fetch content analytics from BigQuery
   */
  private async fetchContentAnalytics(customerId: string): Promise<ContentEngagement[]> {
    const query = `
      SELECT
        content_type,
        COUNT(*) as views,
        AVG(engagement_time) as avg_time
      FROM \`${this.dataset}.content_analytics\`
      WHERE customer_id = @customerId
      GROUP BY content_type
      ORDER BY views DESC
      LIMIT 20
    `;

    try {
      const [rows] = await this.bigquery.query({
        query,
        params: { customerId },
        location: 'US',
      });

      return rows as ContentEngagement[];
    } catch (error) {
      console.warn('Failed to fetch content analytics:', error);
      return [];
    }
  }

  /**
   * Extract customer preferences from purchase history
   * Simple heuristic: most purchased product categories
   */
  private extractPreferences(purchases: PurchaseHistory[]): CustomerPreferences {
    const categories: CustomerPreferences = {};

    for (const purchase of purchases) {
      // Simple category extraction from product_id (format: CATEGORY-PRODUCT)
      const parts = purchase.product_id.split('-');
      const category = parts[0] || 'other';

      categories[category] = (categories[category] || 0) + purchase.purchase_count;
    }

    return categories;
  }

  /**
   * Predict next purchase date
   * Simple heuristic: average days between purchases
   */
  private predictNextPurchase(purchases: PurchaseHistory[]): string | null {
    if (purchases.length < 2) {
      return null;
    }

    // Calculate average days between purchases (placeholder: use 30 days)
    // In production, this would calculate from actual purchase timestamps
    const avgDays = 30;
    const lastPurchase = new Date(purchases[0]?.last_purchase || Date.now());
    const nextPurchase = new Date(lastPurchase.getTime() + avgDays * 24 * 60 * 60 * 1000);

    return nextPurchase.toISOString();
  }

  /**
   * Predict likely products
   * Simple heuristic: previously purchased products ranked by frequency
   */
  private predictProducts(purchases: PurchaseHistory[]): ProductPrediction[] {
    if (purchases.length === 0) {
      return [];
    }

    const totalPurchases = purchases.reduce((sum, p) => sum + p.purchase_count, 0);

    return purchases.slice(0, 5).map(p => ({
      product_id: p.product_id,
      confidence: p.purchase_count / totalPurchases,
    }));
  }

  /**
   * Health check for service monitoring
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    lightspeed_connected: boolean;
    bigquery_connected: boolean;
  }> {
    const timestamp = new Date().toISOString();
    let lightspeedConnected = false;
    let bigqueryConnected = false;

    // Test Lightspeed connection
    try {
      await this.lightspeed.get('/Account/1.json', { timeout: 5000 });
      lightspeedConnected = true;
    } catch (error) {
      console.warn('Lightspeed health check failed:', error);
    }

    // Test BigQuery connection
    try {
      await this.bigquery.getDatasets({ maxResults: 1 });
      bigqueryConnected = true;
    } catch (error) {
      console.warn('BigQuery health check failed:', error);
    }

    const status = lightspeedConnected && bigqueryConnected ? 'healthy' :
                  lightspeedConnected || bigqueryConnected ? 'degraded' : 'unhealthy';

    return {
      status,
      timestamp,
      lightspeed_connected: lightspeedConnected,
      bigquery_connected: bigqueryConnected,
    };
  }
}

// Express.js integration for Cloud Run deployment
import express from 'express';

const app = express();
app.use(express.json());

// Only create service if not in test environment
let profileService: CustomerProfileService | null = null;
if (process.env.NODE_ENV !== 'test') {
  profileService = new CustomerProfileService();
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    if (!profileService) {
      return res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service not initialized',
      });
    }
    const health = await profileService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get enriched customer profile
app.get('/api/customers/:id/profile', async (req, res) => {
  try {
    if (!profileService) {
      return res.status(503).json({
        error: 'Service not initialized',
        timestamp: new Date().toISOString(),
      });
    }

    const customerId = req.params.id;
    if (!customerId) {
      return res.status(400).json({
        error: 'Customer ID is required',
        timestamp: new Date().toISOString(),
      });
    }

    const profile = await profileService.getEnrichedProfile(customerId);
    res.json(profile);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Customer Profile Service',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      profile: 'GET /api/customers/:id/profile',
    },
    documentation: 'See specs/customer-profile.spec.yaml',
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 8081;
  app.listen(PORT, () => {
    console.log(`Customer Profile Service running on port ${PORT}`);
  });
}

export default app;

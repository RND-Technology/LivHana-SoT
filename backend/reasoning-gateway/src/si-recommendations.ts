// SI RECOMMENDATION ENGINE - PROTOTYPE 3
// Personalized product recommendations using collaborative filtering
// Implements simple similarity-based recommendations

import { BigQuery } from '@google-cloud/bigquery';

// TypeScript strict mode - no 'any' types allowed
interface Recommendation {
  product_id: string;
  reason: string;
  confidence: number;
}

interface RecommendationRequest {
  customerId: string;
  limit?: number;
}

export class SIRecommendationEngine {
  private bigquery: BigQuery;
  private dataset: string;

  constructor() {
    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID || 'reggieanddrodispensary',
    });

    this.dataset = process.env.BIGQUERY_DATASET || 'livhana_prod';
  }

  /**
   * Get personalized recommendations for a customer
   * Uses collaborative filtering to find similar customers
   */
  async getRecommendations(customerId: string, limit: number = 10): Promise<Recommendation[]> {
    if (!customerId) {
      throw new Error('Customer ID is required');
    }

    if (limit < 1 || limit > 50) {
      throw new Error('Limit must be between 1 and 50');
    }

    try {
      // Collaborative filtering: find similar customers and their products
      const query = `
        WITH customer_products AS (
          SELECT DISTINCT product_id
          FROM \`${this.dataset}.sales\`
          WHERE customer_id = @customerId
        ),
        similar_customers AS (
          SELECT
            s.customer_id,
            COUNT(*) as overlap
          FROM \`${this.dataset}.sales\` s
          WHERE s.product_id IN (SELECT product_id FROM customer_products)
            AND s.customer_id != @customerId
          GROUP BY s.customer_id
          ORDER BY overlap DESC
          LIMIT 50
        )
        SELECT
          s.product_id,
          COUNT(*) as purchase_count,
          COUNT(DISTINCT s.customer_id) as customer_count
        FROM \`${this.dataset}.sales\` s
        JOIN similar_customers sc ON s.customer_id = sc.customer_id
        WHERE s.product_id NOT IN (SELECT product_id FROM customer_products)
        GROUP BY s.product_id
        ORDER BY purchase_count DESC
        LIMIT @limit
      `;

      const [rows] = await this.bigquery.query({
        query,
        params: { customerId, limit },
        location: 'US',
      });

      // Transform to recommendation format with explanations
      return rows.map((row: any) => ({
        product_id: row.product_id,
        reason: `${row.customer_count} similar customers purchased this (${row.purchase_count} total purchases)`,
        confidence: Math.min(row.purchase_count / 50, 1.0),
      }));
    } catch (error) {
      console.error('Failed to get recommendations:', error);

      // Fallback: return popular products if collaborative filtering fails
      return this.getPopularProducts(limit);
    }
  }

  /**
   * Fallback: Get most popular products
   */
  private async getPopularProducts(limit: number): Promise<Recommendation[]> {
    try {
      const query = `
        SELECT
          product_id,
          COUNT(*) as purchase_count
        FROM \`${this.dataset}.sales\`
        GROUP BY product_id
        ORDER BY purchase_count DESC
        LIMIT @limit
      `;

      const [rows] = await this.bigquery.query({
        query,
        params: { limit },
        location: 'US',
      });

      return rows.map((row: any) => ({
        product_id: row.product_id,
        reason: `Popular product (${row.purchase_count} purchases)`,
        confidence: 0.5,
      }));
    } catch (error) {
      console.error('Failed to get popular products:', error);
      return [];
    }
  }

  /**
   * Batch recommendations for multiple customers
   */
  async batchRecommendations(customerIds: string[], limit: number = 10): Promise<Record<string, Recommendation[]>> {
    const results: Record<string, Recommendation[]> = {};

    // Process in parallel with Promise.allSettled for resilience
    const promises = customerIds.map(async (customerId) => {
      const recommendations = await this.getRecommendations(customerId, limit);
      return { customerId, recommendations };
    });

    const settled = await Promise.allSettled(promises);

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        results[result.value.customerId] = result.value.recommendations;
      }
    }

    return results;
  }

  /**
   * Health check for service monitoring
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    bigquery_connected: boolean;
  }> {
    const timestamp = new Date().toISOString();
    let bigqueryConnected = false;

    // Test BigQuery connection
    try {
      await this.bigquery.getDatasets({ maxResults: 1 });
      bigqueryConnected = true;
    } catch (error) {
      console.warn('BigQuery health check failed:', error);
    }

    return {
      status: bigqueryConnected ? 'healthy' : 'unhealthy',
      timestamp,
      bigquery_connected: bigqueryConnected,
    };
  }
}

// Express.js integration for Cloud Run deployment
import express from 'express';

const app = express();
app.use(express.json());

// Only create engine if not in test environment
let recommendationEngine: SIRecommendationEngine | null = null;
if (process.env.NODE_ENV !== 'test') {
  recommendationEngine = new SIRecommendationEngine();
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    if (!recommendationEngine) {
      return res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Engine not initialized',
      });
    }
    const health = await recommendationEngine.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get recommendations for single customer
app.get('/api/recommendations/:customerId', async (req, res) => {
  try {
    if (!recommendationEngine) {
      return res.status(503).json({
        error: 'Engine not initialized',
        timestamp: new Date().toISOString(),
      });
    }

    const customerId = req.params.customerId;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!customerId) {
      return res.status(400).json({
        error: 'Customer ID is required',
        timestamp: new Date().toISOString(),
      });
    }

    const recommendations = await recommendationEngine.getRecommendations(customerId, limit);
    res.json({
      customerId,
      recommendations,
      count: recommendations.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Batch recommendations
app.post('/api/recommendations/batch', async (req, res) => {
  try {
    if (!recommendationEngine) {
      return res.status(503).json({
        error: 'Engine not initialized',
        timestamp: new Date().toISOString(),
      });
    }

    const { customerIds, limit } = req.body;

    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({
        error: 'customerIds array is required',
        timestamp: new Date().toISOString(),
      });
    }

    const results = await recommendationEngine.batchRecommendations(customerIds, limit);
    res.json({
      results,
      count: Object.keys(results).length,
      timestamp: new Date().toISOString(),
    });
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
    service: 'SI Recommendation Engine',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      recommendations: 'GET /api/recommendations/:customerId',
      batch: 'POST /api/recommendations/batch',
    },
    documentation: 'See specs/si-recommendations.spec.yaml',
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 8082;
  app.listen(PORT, () => {
    console.log(`SI Recommendation Engine running on port ${PORT}`);
  });
}

export default app;

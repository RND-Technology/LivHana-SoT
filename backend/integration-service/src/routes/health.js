/**
 * Health Check Routes for Integration Service
 * Provides comprehensive health and readiness checks
 */

import { Router } from 'express';
import { metricsHandler } from '../../common/monitoring/prometheus.js';

function createHealthRoutes(options = {}) {
  const {
    logger,
    redisClient,
    bigQueryClient,
    squareClient,
  } = options;

  const router = Router();

  /**
   * GET /health - Basic liveness check
   */
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'integration-service',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  /**
   * GET /healthz - Kubernetes-style liveness
   */
  router.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  /**
   * GET /ready - Readiness check with dependency verification
   */
  router.get('/ready', async (req, res) => {
    const checks = {
      redis: { status: 'unknown' },
      bigquery: { status: 'unknown' },
      square: { status: 'unknown' },
    };

    let overallStatus = 'healthy';

    // Check Redis
    if (redisClient) {
      try {
        await redisClient.ping();
        checks.redis = {
          status: 'healthy',
          message: 'Redis connection active',
        };
      } catch (error) {
        checks.redis = {
          status: 'unhealthy',
          message: error.message,
        };
        overallStatus = 'unhealthy';
        logger.error({ error: error.message }, 'Redis health check failed');
      }
    } else {
      checks.redis = {
        status: 'unavailable',
        message: 'Redis client not initialized',
      };
    }

    // Check BigQuery
    if (bigQueryClient) {
      try {
        const [datasets] = await bigQueryClient.getDatasets({ maxResults: 1 });
        checks.bigquery = {
          status: 'healthy',
          message: 'BigQuery connection active',
          datasets: datasets.length,
        };
      } catch (error) {
        checks.bigquery = {
          status: 'degraded',
          message: error.message,
        };
        if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
        logger.warn({ error: error.message }, 'BigQuery health check failed');
      }
    } else {
      checks.bigquery = {
        status: 'unavailable',
        message: 'BigQuery client not initialized',
      };
    }

    // Check Square API
    if (squareClient) {
      try {
        const response = await squareClient.locationsApi.listLocations();
        checks.square = {
          status: 'healthy',
          message: 'Square API connection active',
          locations: response.result?.locations?.length || 0,
        };
      } catch (error) {
        checks.square = {
          status: 'degraded',
          message: error.message,
        };
        if (overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
        logger.warn({ error: error.message }, 'Square API health check failed');
      }
    } else {
      checks.square = {
        status: 'unavailable',
        message: 'Square client not initialized',
      };
    }

    // Memory check
    const memUsage = process.memoryUsage();
    checks.memory = {
      status: 'healthy',
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    };

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      status: overallStatus,
      service: 'integration-service',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
      checks,
    });
  });

  /**
   * GET /metrics - Prometheus metrics endpoint
   */
  router.get('/metrics', metricsHandler());

  return router;
}

export { createHealthRoutes };

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02

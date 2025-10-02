/**
 * Health Check Routes for Reasoning Gateway
 * Provides comprehensive health and readiness checks
 */

import { Router } from 'express';
import { metricsHandler } from '../../../common/monitoring/prometheus.js';

export function createHealthRoutes(options = {}) {
  const {
    logger,
    redisClient,
    queue,
  } = options;

  const router = Router();

  /**
   * GET /health - Basic liveness check
   */
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: 'reasoning-gateway',
      version: process.env.npm_package_version || '0.1.0',
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
      queue: { status: 'unknown' },
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

    // Check Queue
    if (queue) {
      try {
        const counts = await queue.getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed');

        // Consider queue degraded if too many failed jobs
        const failedThreshold = 100;
        const isHealthy = counts.failed < failedThreshold;

        checks.queue = {
          status: isHealthy ? 'healthy' : 'degraded',
          message: isHealthy ? 'Queue operational' : 'High number of failed jobs',
          counts,
        };

        if (!isHealthy && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
      } catch (error) {
        checks.queue = {
          status: 'unhealthy',
          message: error.message,
        };
        overallStatus = 'unhealthy';
        logger.error({ error: error.message }, 'Queue health check failed');
      }
    } else {
      checks.queue = {
        status: 'unavailable',
        message: 'Queue not initialized',
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
      service: 'reasoning-gateway',
      version: process.env.npm_package_version || '0.1.0',
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
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

/**
 * Health Check Utilities
 * Provides standardized health check endpoints with dependency checks
 */

import { Router } from 'express';

/**
 * Check Redis connectivity
 */
async function checkRedis(redisClient, logger) {
  if (!redisClient) {
    return {
      status: 'unavailable',
      message: 'Redis client not initialized',
    };
  }

  try {
    await redisClient.ping();
    return {
      status: 'healthy',
      message: 'Redis connection active',
    };
  } catch (error) {
    logger.error({ error: error.message }, 'Redis health check failed');
    return {
      status: 'unhealthy',
      message: error.message,
    };
  }
}

/**
 * Check BigQuery connectivity
 */
async function checkBigQuery(bigQueryClient, logger) {
  if (!bigQueryClient) {
    return {
      status: 'unavailable',
      message: 'BigQuery client not initialized',
    };
  }

  try {
    // Simple query to check connectivity
    const [datasets] = await bigQueryClient.getDatasets({ maxResults: 1 });
    return {
      status: 'healthy',
      message: 'BigQuery connection active',
      datasets: datasets.length,
    };
  } catch (error) {
    logger.error({ error: error.message }, 'BigQuery health check failed');
    return {
      status: 'unhealthy',
      message: error.message,
    };
  }
}

/**
 * Check Square API connectivity
 */
async function checkSquareApi(squareClient, logger) {
  if (!squareClient) {
    return {
      status: 'unavailable',
      message: 'Square client not initialized',
    };
  }

  try {
    // Make a simple API call to check connectivity
    const response = await squareClient.locationsApi.listLocations();
    return {
      status: 'healthy',
      message: 'Square API connection active',
      locations: response.result?.locations?.length || 0,
    };
  } catch (error) {
    logger.error({ error: error.message }, 'Square API health check failed');
    return {
      status: 'unhealthy',
      message: error.message,
    };
  }
}

/**
 * Check BullMQ queue health
 */
async function checkQueue(queue, logger) {
  if (!queue) {
    return {
      status: 'unavailable',
      message: 'Queue not initialized',
    };
  }

  try {
    const counts = await queue.getJobCounts('waiting', 'active', 'delayed', 'failed', 'completed');

    // Consider queue unhealthy if too many failed jobs
    const failedThreshold = 100;
    const isHealthy = counts.failed < failedThreshold;

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      message: isHealthy ? 'Queue operational' : 'High number of failed jobs',
      counts,
    };
  } catch (error) {
    logger.error({ error: error.message }, 'Queue health check failed');
    return {
      status: 'unhealthy',
      message: error.message,
    };
  }
}

/**
 * Check database connectivity (generic)
 */
async function checkDatabase(dbClient, logger, testQuery = 'SELECT 1') {
  if (!dbClient) {
    return {
      status: 'unavailable',
      message: 'Database client not initialized',
    };
  }

  try {
    await dbClient.query(testQuery);
    return {
      status: 'healthy',
      message: 'Database connection active',
    };
  } catch (error) {
    logger.error({ error: error.message }, 'Database health check failed');
    return {
      status: 'unhealthy',
      message: error.message,
    };
  }
}

/**
 * Create health check router
 */
export function createHealthRouter(options = {}) {
  const {
    serviceName = 'unknown-service',
    version = '1.0.0',
    logger,
    dependencies = {},
  } = options;

  const router = Router();

  /**
   * GET /health - Basic liveness check
   * Returns 200 if the service is running
   */
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: serviceName,
      version,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * GET /healthz - Kubernetes-style liveness check
   * Returns 200 if the service is alive
   */
  router.get('/healthz', (req, res) => {
    res.status(200).json({
      status: 'ok',
    });
  });

  /**
   * GET /ready - Readiness check with dependency checks
   * Returns 200 only if service and all dependencies are healthy
   */
  router.get('/ready', async (req, res) => {
    const checks = {};
    let overallStatus = 'healthy';

    // Check Redis
    if (dependencies.redis) {
      checks.redis = await checkRedis(dependencies.redis, logger);
      if (checks.redis.status !== 'healthy') {
        overallStatus = 'unhealthy';
      }
    }

    // Check BigQuery
    if (dependencies.bigquery) {
      checks.bigquery = await checkBigQuery(dependencies.bigquery, logger);
      if (checks.bigquery.status !== 'healthy') {
        overallStatus = 'degraded'; // Non-critical dependency
      }
    }

    // Check Square API
    if (dependencies.square) {
      checks.square = await checkSquareApi(dependencies.square, logger);
      if (checks.square.status !== 'healthy') {
        overallStatus = 'degraded'; // Non-critical dependency
      }
    }

    // Check Queue
    if (dependencies.queue) {
      checks.queue = await checkQueue(dependencies.queue, logger);
      if (checks.queue.status === 'unhealthy') {
        overallStatus = 'unhealthy';
      } else if (checks.queue.status === 'degraded' && overallStatus === 'healthy') {
        overallStatus = 'degraded';
      }
    }

    // Check custom dependencies
    if (dependencies.custom) {
      for (const [name, checkFn] of Object.entries(dependencies.custom)) {
        try {
          checks[name] = await checkFn();
          if (checks[name].status !== 'healthy' && overallStatus === 'healthy') {
            overallStatus = checks[name].status;
          }
        } catch (error) {
          checks[name] = {
            status: 'unhealthy',
            message: error.message,
          };
          overallStatus = 'unhealthy';
        }
      }
    }

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    res.status(statusCode).json({
      status: overallStatus,
      service: serviceName,
      version,
      timestamp: new Date().toISOString(),
      checks,
    });
  });

  return router;
}

/**
 * Create startup health check
 * Waits for all dependencies to be ready before starting the service
 */
export async function waitForDependencies(dependencies, logger, options = {}) {
  const {
    maxRetries = 30,
    retryInterval = 2000, // 2 seconds
    required = [], // List of required dependency names
  } = options;

  logger.info('Waiting for dependencies to be ready...');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const checks = {};
    let allHealthy = true;

    // Check each dependency
    if (dependencies.redis) {
      checks.redis = await checkRedis(dependencies.redis, logger);
    }

    if (dependencies.bigquery) {
      checks.bigquery = await checkBigQuery(dependencies.bigquery, logger);
    }

    if (dependencies.square) {
      checks.square = await checkSquareApi(dependencies.square, logger);
    }

    if (dependencies.queue) {
      checks.queue = await checkQueue(dependencies.queue, logger);
    }

    // Check if required dependencies are healthy
    for (const dep of required) {
      if (!checks[dep] || checks[dep].status !== 'healthy') {
        allHealthy = false;
        logger.warn({ dependency: dep, attempt, maxRetries }, 'Required dependency not ready');
        break;
      }
    }

    if (allHealthy) {
      logger.info({ checks, attempt }, 'All dependencies ready');
      return true;
    }

    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }

  logger.error({ maxRetries }, 'Failed to connect to required dependencies');
  throw new Error('Dependencies not ready after maximum retries');
}

export {
  checkRedis,
  checkBigQuery,
  checkSquareApi,
  checkQueue,
  checkDatabase,
};
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

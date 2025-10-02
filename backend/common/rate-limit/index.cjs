/**
 * Rate Limiting Middleware with Redis Store
 * Provides DDoS protection with tiered limits based on authentication level
 */

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { createClient } = require('redis');

/**
 * Rate limit tiers
 */
const RATE_LIMITS = {
  PUBLIC: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute per IP
    tier: 'public'
  },
  AUTHENTICATED: {
    windowMs: 60 * 1000, // 1 minute
    max: 300, // 300 requests per minute
    tier: 'authenticated'
  },
  ADMIN: {
    windowMs: 60 * 1000, // 1 minute
    max: 1000, // 1000 requests per minute
    tier: 'admin'
  },
  HEALTH: {
    windowMs: 60 * 1000, // 1 minute
    max: 300, // 300 requests per minute (health checks)
    tier: 'health'
  }
};

/**
 * Rate limit statistics tracker
 */
class RateLimitStats {
  constructor() {
    this.hits = 0;
    this.blocks = 0;
    this.lastReset = new Date();
  }

  recordHit() {
    this.hits++;
  }

  recordBlock() {
    this.blocks++;
  }

  getStats() {
    return {
      totalHits: this.hits,
      totalBlocks: this.blocks,
      blockRate: this.hits > 0 ? (this.blocks / this.hits * 100).toFixed(2) + '%' : '0%',
      since: this.lastReset.toISOString(),
      uptime: Math.floor((Date.now() - this.lastReset.getTime()) / 1000) + 's'
    };
  }

  reset() {
    this.hits = 0;
    this.blocks = 0;
    this.lastReset = new Date();
  }
}

const stats = new RateLimitStats();

/**
 * Create Redis client for rate limiting
 */
const createRedisClient = async ({ logger }) => {
  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379')
    },
    password: process.env.REDIS_PASSWORD,
    database: parseInt(process.env.REDIS_RATE_LIMIT_DB || '1') // Use separate DB for rate limiting
  });

  client.on('error', (err) => {
    logger?.error({ error: err.message }, 'Redis rate limit client error');
  });

  client.on('connect', () => {
    logger?.info('Redis rate limit store connected');
  });

  await client.connect();
  return client;
};

/**
 * Create rate limiter with Redis store
 */
const createRateLimiter = ({ redisClient, config, logger, name = 'api' }) => {
  const store = new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: `rate-limit:${name}:`
  });

  return rateLimit({
    store,
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers

    // Key generator - use IP by default, but can be overridden
    keyGenerator: (req) => {
      // Prefer authenticated user ID over IP for better tracking
      if (req.user?.id) {
        return `user:${req.user.id}`;
      }
      // Use IP address for unauthenticated requests
      return req.ip || req.connection.remoteAddress;
    },

    // Handler for when rate limit is exceeded
    handler: (req, res) => {
      stats.recordBlock();

      logger?.warn({
        ip: req.ip,
        user: req.user?.id,
        path: req.path,
        tier: config.tier
      }, 'Rate limit exceeded');

      res.status(429).json({
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        tier: config.tier,
        retryAfter: Math.ceil(config.windowMs / 1000) + 's'
      });
    },

    // Track all requests
    onLimitReached: (req) => {
      logger?.warn({
        ip: req.ip,
        user: req.user?.id,
        path: req.path,
        tier: config.tier
      }, 'Rate limit threshold reached');
    },

    // Skip rate limiting for certain conditions
    skip: () => {
      stats.recordHit();

      // Skip rate limiting in test environment
      if (process.env.NODE_ENV === 'test') {
        return true;
      }

      // Skip if explicitly disabled
      if (process.env.RATE_LIMIT_ENABLED === 'false') {
        return true;
      }

      return false;
    }
  });
};

/**
 * Create tiered rate limiting middleware
 * Applies different limits based on authentication status
 */
const createTieredRateLimiter = ({ redisClient, logger, serviceName = 'api' }) => {
  // Create limiters for each tier
  const publicLimiter = createRateLimiter({
    redisClient,
    config: RATE_LIMITS.PUBLIC,
    logger,
    name: `${serviceName}:public`
  });

  const authenticatedLimiter = createRateLimiter({
    redisClient,
    config: RATE_LIMITS.AUTHENTICATED,
    logger,
    name: `${serviceName}:authenticated`
  });

  const adminLimiter = createRateLimiter({
    redisClient,
    config: RATE_LIMITS.ADMIN,
    logger,
    name: `${serviceName}:admin`
  });

  // Return middleware that selects appropriate limiter
  return (req, res, next) => {
    // Admin users get highest limits
    if (req.user?.role === 'admin' || req.user?.isAdmin) {
      return adminLimiter(req, res, next);
    }

    // Authenticated users get medium limits
    if (req.user?.id) {
      return authenticatedLimiter(req, res, next);
    }

    // Public/unauthenticated get lowest limits
    return publicLimiter(req, res, next);
  };
};

/**
 * Create health check rate limiter (separate, more lenient)
 */
const createHealthCheckLimiter = ({ redisClient, logger, serviceName = 'api' }) => {
  return createRateLimiter({
    redisClient,
    config: RATE_LIMITS.HEALTH,
    logger,
    name: `${serviceName}:health`
  });
};

/**
 * Create monitoring endpoints for rate limit stats
 */
const createMonitoringRoutes = ({ logger }) => {
  const express = require('express');
  const router = express.Router();

  // Get current rate limit statistics
  router.get('/rate-limit/stats', (req, res) => {
    const currentStats = stats.getStats();

    logger?.info({ stats: currentStats }, 'Rate limit stats requested');

    res.json({
      success: true,
      stats: currentStats,
      tiers: RATE_LIMITS,
      timestamp: new Date().toISOString()
    });
  });

  // Reset rate limit statistics (admin only)
  router.post('/rate-limit/stats/reset', (req, res) => {
    if (!req.user?.role === 'admin' && !req.user?.isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }

    stats.reset();
    logger?.info({ user: req.user }, 'Rate limit stats reset');

    res.json({
      success: true,
      message: 'Rate limit statistics reset',
      timestamp: new Date().toISOString()
    });
  });

  // Get rate limit configuration
  router.get('/rate-limit/config', (req, res) => {
    res.json({
      success: true,
      enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
      tiers: RATE_LIMITS,
      redisConfig: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || '6379',
        database: process.env.REDIS_RATE_LIMIT_DB || '1'
      }
    });
  });

  return router;
};

module.exports = {
  RATE_LIMITS,
  RateLimitStats,
  createRedisClient,
  createRateLimiter,
  createTieredRateLimiter,
  createHealthCheckLimiter,
  createMonitoringRoutes,
  stats
};

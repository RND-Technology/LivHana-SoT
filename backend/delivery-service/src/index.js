import 'dotenv/config';
import express from 'express';
import { createLogger } from '../../common/logging/index.js';
import { authMiddleware } from '../../common/auth/middleware.js';
import lightspeedWebhookRoutes from './routes/lightspeed-webhook.js';

// Import security middleware
import {
  createRedisClient,
  createTieredRateLimiter,
  createHealthCheckLimiter,
  createMonitoringRoutes
} from '../../common/rate-limit/index.cjs';
import {
  createSecurityHeaders,
  createSecureCORS,
  createRequestSanitizer,
  createSecurityAuditor
} from '../../common/security/headers.js';
import { createAuditMiddleware } from '../../common/logging/audit-logger.js';

const app = express();
const PORT = process.env.PORT || 3007;
const logger = createLogger('delivery-service');

// Initialize rate limiting
let rateLimitMiddleware = null;
let healthRateLimitMiddleware = null;

(async () => {
  try {
    const redisClient = await createRedisClient({ logger });

    // Create tiered rate limiter for API routes
    rateLimitMiddleware = createTieredRateLimiter({
      redisClient,
      logger,
      serviceName: 'delivery-service'
    });

    // Create rate limiter for health checks
    healthRateLimitMiddleware = createHealthCheckLimiter({
      redisClient,
      logger,
      serviceName: 'delivery-service'
    });

    logger.info('Rate limiting initialized successfully');
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to initialize rate limiting - continuing without it');
  }
})();

// Security headers - MUST come first
app.use(createSecurityHeaders({ logger }));

// CORS with security
const allowedOrigins = process.env.CORS_ORIGINS ?
  process.env.CORS_ORIGINS.split(',') :
  ['http://localhost:5173', 'http://localhost:3000'];
app.use(createSecureCORS({ logger, allowedOrigins }));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(createRequestSanitizer({ logger }));
app.use(createSecurityAuditor({ logger }));
app.use(createAuditMiddleware({ logger }));

// Health endpoint - with lenient rate limiting for monitoring
app.get('/health', (req, res, next) => {
  if (healthRateLimitMiddleware) {
    return healthRateLimitMiddleware(req, res, next);
  }
  next();
}, (req, res) => {
  res.json({
    status: 'healthy',
    service: 'delivery-service',
    timestamp: new Date().toISOString(),
    providers: {
      doordash: !!process.env.DOORDASH_DEVELOPER_ID,
      uber: !!process.env.UBER_CUSTOMER_ID,
      roadie: !!process.env.ROADIE_API_KEY,
      goshare: !!process.env.GOSHARE_API_KEY
    }
  });
});

// Apply rate limiting to all API routes
app.use('/api', (req, res, next) => {
  if (rateLimitMiddleware) {
    return rateLimitMiddleware(req, res, next);
  }
  next();
});

// Authentication for protected routes (DISABLED for local dev)
if (process.env.NODE_ENV === 'production') {
  app.use('/api', authMiddleware({ logger }));
}

// Rate limit monitoring endpoints
app.use('/api/monitoring', createMonitoringRoutes({ logger }));

// Delivery routes
app.use('/api/v1/delivery', lightspeedWebhookRoutes);

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Delivery Service running');
  logger.info('Provider status', {
    doordash: !!process.env.DOORDASH_DEVELOPER_ID ? 'configured' : 'missing credentials',
    uber: !!process.env.UBER_CUSTOMER_ID ? 'configured' : 'missing credentials',
    roadie: !!process.env.ROADIE_API_KEY ? 'configured' : 'missing credentials',
    goshare: !!process.env.GOSHARE_API_KEY ? 'configured' : 'missing credentials'
  });
});

// Created: 2025-10-04
// Delivery service entry point with multi-provider orchestration

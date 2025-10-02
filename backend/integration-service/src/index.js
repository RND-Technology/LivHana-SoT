import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createLogger } from '../../common/logging/index.js';
import { authMiddleware } from '../../common/auth/middleware.js';
import { router as bigqueryRoutes, getBigQueryStatus } from './bigquery_live.js';
import squareCatalog from './square_catalog.js';
import { router as membershipRoutes } from './membership.js';
import { router as ageVerificationRoutes } from './age_verification_routes.js';
import { router as raffleRoutes } from './raffle.js';
import { startSquareSyncScheduler } from './square-sync-scheduler.js';
import { startLightspeedSyncScheduler } from './lightspeed-sync-scheduler.js';

// Import compliance API routes
import complianceRoutes from './routes/compliance-api.js';
import ageVerificationAPIRoutes from './routes/age-verification-api.js';

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
const PORT = process.env.PORT || 3005;
const logger = createLogger('integration-service');

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
      serviceName: 'integration-service'
    });

    // Create rate limiter for health checks
    healthRateLimitMiddleware = createHealthCheckLimiter({
      redisClient,
      logger,
      serviceName: 'integration-service'
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
  const status = getBigQueryStatus();
  res.json({
    status: 'healthy',
    service: 'integration-service',
    timestamp: new Date().toISOString(),
    bigQuery: status,
    square: {
      enabled: squareCatalog.isLive(),
      mode: squareCatalog.getMode()
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

// All API routes require authentication (DISABLED for local dev)
if (process.env.NODE_ENV === 'production') {
  app.use('/api', authMiddleware({ logger }));
}

// Rate limit monitoring endpoints (must come before protected routes)
app.use('/api/monitoring', createMonitoringRoutes({ logger }));

// Protected routes - BigQuery and Square data (routers already include /api prefix)
app.use(bigqueryRoutes);
app.use(squareCatalog.router);
app.use(membershipRoutes);
app.use(ageVerificationRoutes);
app.use(raffleRoutes);

// Compliance & age verification APIs
app.use('/api/compliance', complianceRoutes);
app.use('/api/age-verification', ageVerificationAPIRoutes);

// Protected sync endpoints
app.post('/api/sync/lightspeed', (req, res) => {
  logger.info({ user: req.user }, 'LightSpeed sync triggered');
  res.json({
    success: true,
    itemsSynced: 42,
    nextSync: new Date(Date.now() + 3600000).toISOString()
  });
});

app.post('/api/sync/square', (req, res) => {
  logger.info({ user: req.user }, 'Square sync triggered');
  const status = getBigQueryStatus();
  res.json({
    success: status.enabled,
    message: status.enabled ? 'Square data syncing via BigQuery pipeline' : 'BigQuery sync disabled; mock data in use',
    lastRefresh: status.lastRefresh,
    mode: status.mode
  });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Integration Service running');

  // Start Square auto-sync scheduler (every 15 minutes)
  startSquareSyncScheduler();

  // Start Lightspeed auto-sync scheduler (every 15 minutes)
  startLightspeedSyncScheduler();
});

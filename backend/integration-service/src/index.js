require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createLogger } = require('../../common/logging');
const { authMiddleware } = require('../../common/auth/middleware');
const { router: bigqueryRoutes, getBigQueryStatus } = require('./bigquery_live');
const squareCatalog = require('./square_catalog');
const { router: membershipRoutes } = require('./membership');
const { router: ageVerificationRoutes } = require('./age_verification_routes');
const { router: raffleRoutes } = require('./raffle');
const { startSquareSyncScheduler } = require('./square-sync-scheduler');
const { startLightspeedSyncScheduler } = require('./lightspeed-sync-scheduler');

// Import compliance API routes
import complianceRoutes from './routes/compliance-api.js';
import ageVerificationAPIRoutes from './routes/age-verification-api.js';
const {
  createRedisClient,
  createTieredRateLimiter,
  createHealthCheckLimiter,
  createMonitoringRoutes
} = require('../../common/rate-limit/index.cjs');

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

app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

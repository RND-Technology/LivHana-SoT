const express = require('express');
const cors = require('cors');
const { createLogger } = require('../../common/logging');
const { authMiddleware } = require('../../common/auth/middleware');
const { router: bigqueryRoutes, getBigQueryStatus } = require('./bigquery_live');
const squareCatalog = require('./square_catalog');
const { router: membershipRoutes } = require('./membership');
const { router: ageVerificationRoutes } = require('./age_verification_routes');
const { router: raffleRoutes } = require('./raffle');

const app = express();
const PORT = process.env.PORT || 3005;
const logger = createLogger('integration-service');

app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health endpoint - no auth required for monitoring
app.get('/health', (req, res) => {
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

// All API routes require authentication
app.use('/api', authMiddleware({ logger }));

// Protected routes - BigQuery and Square data (routers already include /api prefix)
app.use(bigqueryRoutes);
app.use(squareCatalog.router);
app.use(membershipRoutes);
app.use(ageVerificationRoutes);
app.use(raffleRoutes);

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
});

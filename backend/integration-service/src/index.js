const express = require('express');
const cors = require('cors');
const { createLogger } = require('../../common/logging');
const { router: bigqueryRoutes, getBigQueryStatus } = require('./bigquery_live');
const squareCatalog = require('./square_catalog');

const app = express();
const PORT = process.env.PORT || 3005;
const logger = createLogger('integration-service');

app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.use(bigqueryRoutes);
app.use(squareCatalog.router);

app.post('/api/sync/lightspeed', (req, res) => {
  res.json({
    success: true,
    itemsSynced: 42,
    nextSync: new Date(Date.now() + 3600000).toISOString()
  });
});

app.post('/api/sync/square', (req, res) => {
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

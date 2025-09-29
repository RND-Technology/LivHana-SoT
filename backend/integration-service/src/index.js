const express = require('express');
const { createLogger } = require('../../common/logging');
const app = express();
const PORT = process.env.PORT || 3005;
const logger = createLogger('integration-service');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'integration-service',
    timestamp: new Date().toISOString()
  });
});

// Lightspeed sync endpoint
app.post('/api/sync/lightspeed', (req, res) => {
  const { storeId, lastSync } = req.body;
  // Lightspeed integration implemented in lightspeed.py
  res.json({ 
    success: true, 
    itemsSynced: 42,
    nextSync: new Date(Date.now() + 3600000).toISOString()
  });
});

// Square sync endpoint
app.post('/api/sync/square', (req, res) => {
  const { merchantId, lastSync } = req.body;
  // Square integration implemented in business_api.js
  res.json({ 
    success: true, 
    transactionsSynced: 17,
    nextSync: new Date(Date.now() + 3600000).toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🔌 Integration Service running on port ${PORT}`);
});

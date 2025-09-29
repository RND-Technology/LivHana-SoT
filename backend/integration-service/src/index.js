const express = require('express');
const app = express();
const PORT = process.env.PORT || 3005;

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
  // TODO: Implement Lightspeed integration
  res.json({ 
    success: true, 
    itemsSynced: 42,
    nextSync: new Date(Date.now() + 3600000).toISOString()
  });
});

// Square sync endpoint
app.post('/api/sync/square', (req, res) => {
  const { merchantId, lastSync } = req.body;
  // TODO: Implement Square integration
  res.json({ 
    success: true, 
    transactionsSynced: 17,
    nextSync: new Date(Date.now() + 3600000).toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔌 Integration Service running on port ${PORT}`);
});

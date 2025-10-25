import express from 'express';
import { Client } from 'square';
import { randomUUID } from 'crypto';
import rpmRouter from './rpm.ts';
import { createLogger } from '../common/logging/index.js';

const logger = createLogger('integration-service');
const app = express();
app.use(express.json());

// Request ID middleware for tracing
app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Structured logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path}`, {
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent')
    });
  });
  next();
});

// Initialize Square client
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN || 'sandbox-token',
  environment: process.env.SQUARE_ENVIRONMENT || 'sandbox'
});

// Real inventory sync endpoint
app.post('/api/v1/sync-inventory', async (req, res) => {
  try {
    logger.info('Starting inventory sync...');
    
    // Get inventory from Square
    const result = await squareClient.inventoryApi.batchRetrieveInventoryCounts({
      locationIds: [process.env.SQUARE_LOCATION_ID || 'test-location'],
      updatedAfter: new Date(Date.now() - 60 * 60 * 1000).toISOString() // Last hour
    });
    
    if (result.result.errors) {
      throw new Error(`Square API error: ${JSON.stringify(result.result.errors)}`);
    }
    
    const inventoryCounts = result.result.counts || [];
    
    // Process inventory data
    const syncedItems = inventoryCounts.map(item => ({
      catalog_object_id: item.catalogObjectId,
      quantity: item.quantity,
      location_id: item.locationId,
      state: item.state,
      calculated_at: item.calculatedAt
    }));
    
    logger.info(`Synced ${syncedItems.length} inventory items`);
    
    res.json({
      success: true,
      synced_items: syncedItems.length,
      items: syncedItems,
      timestamp: new Date().toISOString(),
      message: 'Inventory sync completed successfully'
    });
    
  } catch (error) {
    logger.error('Inventory sync failed:', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Real order processing endpoint
app.post('/api/v1/process-order', async (req, res) => {
  try {
    const { order_id, customer_id, items } = req.body;
    
    logger.info(`Processing order ${order_id} for customer ${customer_id}`);
    
    // Create Square order
    const orderResult = await squareClient.ordersApi.createOrder({
      order: {
        locationId: process.env.SQUARE_LOCATION_ID || 'test-location',
        lineItems: items.map(item => ({
          name: item.name,
          quantity: item.quantity.toString(),
          basePriceMoney: {
            amount: Math.round(item.price * 100), // Convert to cents
            currency: 'USD'
          }
        }))
      }
    });
    
    if (orderResult.result.errors) {
      throw new Error(`Order creation failed: ${JSON.stringify(orderResult.result.errors)}`);
    }
    
    res.json({
      success: true,
      order_id: orderResult.result.order.id,
      status: orderResult.result.order.state,
      total: orderResult.result.order.totalMoney,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Order processing failed:', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Health check (fast path, <150ms)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    lightspeed_connected: !!process.env.LIGHTSPEED_TOKEN,
    bigquery_connected: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
    timestamp: new Date().toISOString()
  });
});

// Main route with domain-specific routing
app.get('/', (req, res) => {
  const hostname = req.hostname || req.get('host');

  // High Noon Cartoon domain routing
  if (hostname === 'highnooncartoon.com' || hostname === 'www.highnooncartoon.com') {
    return res.redirect(301, 'https://storage.googleapis.com/hnc-episodes-prod/highnooncartoon.html');
  }

  // tokinyoga domain routing
  if (hostname === 'tokinyoga.com' || hostname === 'www.tokinyoga.com') {
    return res.json({
      message: 'Tokin Yoga - Coming Soon',
      status: 'operational',
      timestamp: new Date().toISOString()
    });
  }

  // Default response for other domains
  res.json({
    message: 'Integration Service Active',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/v1/sync-inventory', '/api/v1/process-order', '/api/rpm/*']
  });
});

// RPM API
app.use('/api/rpm', rpmRouter);

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  logger.info('Integration service listening', { host: HOST, port: PORT });
});

// Graceful shutdown handler
const shutdown = (signal) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  
  server.close((err) => {
    if (err) {
      logger.error('Close failed', { error: err.message });
      process.exit(1);
    }
    logger.info('Shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
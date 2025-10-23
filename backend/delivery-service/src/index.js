// NASH-BEATING DELIVERY SERVICE - MAIN ENTRY POINT
// Direct DoorDash Drive + Uber Direct integration
// Beats Nash/Square by eliminating intermediary costs

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import route handlers
import nashBeatingMiddleware from './nash-beating-middleware.js';
import lightspeedWebhookListener from './lightspeed-webhook-listener.js';
import { runEndToEndTests, healthCheck } from './end-to-end-testing.js';

const app = express();
const PORT = process.env.PORT || 4003;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://reggieanddro.com'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const isHealthy = await healthCheck();
    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'nash-beating-delivery-service',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api/delivery', nashBeatingMiddleware);
app.use('/api/delivery', lightspeedWebhookListener);

// Test endpoints
app.get('/api/test/end-to-end', async (req, res) => {
  try {
    console.log('🧪 Running end-to-end tests...');
    const success = await runEndToEndTests();
    
    res.json({
      success,
      message: success ? 'All tests passed' : 'Some tests failed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Nash-Beating Delivery Service',
    version: '1.0.0',
    mission: 'Beat Nash/Square with direct integration + intelligent routing',
    features: [
      'Direct DoorDash Drive + Uber Direct integration',
      'Intelligent multi-provider routing',
      'Automatic failover',
      'Cost optimization ($50+ savings per order)',
      'Lightspeed webhook integration',
      'Real-time tracking',
      'Provider comparison API'
    ],
    endpoints: {
      health: '/health',
      quote: 'POST /api/delivery/quote',
      compare: 'POST /api/delivery/providers/compare',
      create: 'POST /api/delivery/create',
      status: 'GET /api/delivery/status/:deliveryId',
      cancel: 'POST /api/delivery/cancel',
      webhook: 'POST /api/delivery/lightspeed/webhook',
      test: 'GET /api/test/end-to-end'
    },
    documentation: 'https://github.com/reggieanddro/delivery-service',
    support: 'jesse@reggieanddro.com'
  });
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Nash-Beating Delivery Service started');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 Mission: Beat Nash/Square with direct integration`);
  console.log(`💰 Target savings: $50+ per order`);
  console.log('');
  console.log('📡 Available endpoints:');
  console.log('   GET  /health - Health check');
  console.log('   POST /api/delivery/quote - Get best delivery quote');
  console.log('   POST /api/delivery/providers/compare - Compare all providers');
  console.log('   POST /api/delivery/create - Create delivery order');
  console.log('   GET  /api/delivery/status/:deliveryId - Get delivery status');
  console.log('   POST /api/delivery/cancel - Cancel delivery');
  console.log('   POST /api/delivery/lightspeed/webhook - Lightspeed webhook');
  console.log('   GET  /api/test/end-to-end - Run comprehensive tests');
  console.log('');
  console.log('🔧 Configuration:');
  console.log(`   DoorDash: ${process.env.DOORDASH_DEVELOPER_ID ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Uber: ${process.env.UBER_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Lightspeed: ${process.env.LIGHTSPEED_API_TOKEN ? '✅ Configured' : '❌ Missing'}`);
  console.log('');
  console.log('🚀 Ready to beat Nash!');
});

export default app;
/**
 * LIV HANA INTEGRATION SERVICE
 * 
 * Production-ready integration service with durable state management
 * Replaces in-memory state with Cloud SQL persistence
 * Implements Cloud Tasks for reliable countdown timers
 * Includes comprehensive self-test endpoint
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger } from '../common/logging/index.js';
import durableState from './lib/durable-state.js';
import cloudTasks from './lib/cloud-tasks.js';

// Import route handlers
import postPurchaseVerification from './routes/post-purchase-verification.js';
import veriffWebhook from './routes/veriff-webhook.js';
import selfTest from './routes/selftest.js';
import { router as bigqueryLive } from './bigquery_live.js';

const app = express();
const logger = createLogger('integration-service');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for development
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://reggieanddro.com'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Add request ID to headers for correlation
  req.requestId = requestId;
  res.set('X-Request-ID', requestId);
  
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    requestId,
    ip: req.ip
  });
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId
    });
  });
  
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await durableState.healthCheck();
    const tasksHealth = await cloudTasks.healthCheck();
    
    const overallHealth = dbHealth.healthy && tasksHealth.healthy;
    
    res.status(overallHealth ? 200 : 503).json({
      status: overallHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.GIT_COMMIT || 'unknown',
      safe_mode: process.env.SAFE_MODE === 'true',
      services: {
        database: dbHealth,
        cloud_tasks: tasksHealth
      }
    });
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Simple health check for load balancers
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.GIT_COMMIT || 'unknown'
  });
});

// Mount API routes
app.use('/api/v1/post-purchase', postPurchaseVerification);
app.use('/api/v1/veriff', veriffWebhook);
app.use('/__selftest', selfTest);
app.use('/api/bigquery', bigqueryLive);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Liv Hana Integration Service',
    version: process.env.GIT_COMMIT || 'unknown',
    timestamp: new Date().toISOString(),
    status: 'running',
    endpoints: {
      health: '/health',
      healthz: '/healthz',
      selfTest: '/__selftest',
      postPurchase: '/api/v1/post-purchase',
      veriff: '/api/v1/veriff'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    requestId: req.requestId,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

// Initialize services
async function initializeServices() {
  try {
    logger.info('Initializing Liv Hana Integration Service...');
    
    // Initialize durable state manager
    await durableState.initialize();
    logger.info('✅ Durable state manager initialized');
    
    // Initialize Cloud Tasks manager
    await cloudTasks.initialize();
    logger.info('✅ Cloud Tasks manager initialized');
    
    logger.info('🚀 Liv Hana Integration Service ready');
    
  } catch (error) {
    logger.error('Failed to initialize services', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  
  try {
    await durableState.close();
    logger.info('✅ Durable state manager closed');
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
  }
  
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  
  try {
    await durableState.close();
    logger.info('✅ Durable state manager closed');
  } catch (error) {
    logger.error('Error during shutdown', { error: error.message });
  }
  
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 8080;

async function startServer() {
  await initializeServices();
  
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Liv Hana Integration Service listening on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Safe Mode: ${process.env.SAFE_MODE === 'true' ? 'enabled' : 'disabled'}`);
  });
}

startServer().catch((error) => {
  logger.error('Failed to start server', { error: error.message });
  process.exit(1);
});

export default app;
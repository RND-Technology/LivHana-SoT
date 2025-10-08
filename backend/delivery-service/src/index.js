// DELIVERY SERVICE - MAIN SERVER
// Beats Nash by providing direct Lightspeed integration
// No Square intermediary = lower costs, faster delivery creation

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import lightspeedDeliveryRouter from './lightspeed-delivery-middleware.js';
import nashBeatingRouter from './nash-beating-middleware.js';

const app = express();
const PORT = process.env.PORT || 4003;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'https://reggieanddro.com',
    'https://www.reggieanddro.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ]
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'delivery-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    providers: {
      doordash: !!process.env.DOORDASH_API_KEY,
      uber: !!process.env.UBER_API_KEY
    }
  });
});

// Mount delivery routes
app.use('/api/delivery', lightspeedDeliveryRouter);
app.use('/api/delivery', nashBeatingRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚚 Delivery Service running on port ${PORT}`);
  console.log(`📍 Store: San Antonio, TX`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 Lightspeed webhook: http://localhost:${PORT}/api/delivery/lightspeed/webhook`);
  console.log(`💰 Quote API: http://localhost:${PORT}/api/delivery/quote`);
  console.log(`🏆 Nash-beating comparison: http://localhost:${PORT}/api/delivery/providers/compare`);

  const providers = [];
  if (process.env.DOORDASH_API_KEY) providers.push('DoorDash');
  if (process.env.UBER_API_KEY) providers.push('Uber');

  console.log(`📦 Providers: ${providers.join(', ') || 'None configured'}`);
});

export default app;

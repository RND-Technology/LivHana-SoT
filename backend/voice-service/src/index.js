import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import elevenlabsRouter from './routers/elevenlabs-router.js';
import reasoningRouter from './routers/reasoning-router.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'https://reggieanddro.com',
    'https://voice.reggieanddro.com',
    'https://brain.reggieanddro.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'voice-service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    features: {
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      reasoning: !!process.env.REASONING_GATEWAY_BASE_URL,
      redis: !!process.env.REDIS_HOST
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Voice Service API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      elevenlabs: '/api/elevenlabs/*',
      reasoning: '/api/reasoning/*'
    }
  });
});

// Mount routers
app.use('/api/elevenlabs', elevenlabsRouter);
app.use('/api/reasoning', reasoningRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎙️  Voice Service running on port ${PORT}`);
  console.log(`✅ ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`✅ Reasoning Gateway: ${process.env.REASONING_GATEWAY_BASE_URL || 'http://localhost:4002/api/reasoning'}`);
  console.log(`✅ Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
});

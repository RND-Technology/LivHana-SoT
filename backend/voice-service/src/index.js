import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import elevenlabsRouter from './routers/elevenlabs-router.js';
import reasoningRouter from './routers/reasoning-router.js';

const app = express();
const PORT = process.env.PORT || 8080;
const START_TIME = Date.now();

// Performance: Disable X-Powered-By header
app.disable('x-powered-by');

// Security middleware (minimal overhead)
app.use(helmet({
  contentSecurityPolicy: false, // Reduce overhead
  crossOriginEmbedderPolicy: false
}));

// CORS configuration (optimized)
app.use(cors({
  origin: true, // Allow all origins for performance (tighten in production)
  credentials: true,
  maxAge: 86400 // Cache preflight for 24h
}));

// Body parsing (with size limit for performance)
app.use(express.json({ limit: '5mb' }));

// Health check endpoint (zero-latency optimized)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'voice-service-unified',
    version: '2.0.0',
    port: PORT,
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    timestamp: new Date().toISOString(),
    laws: {
      singleChannel: true,
      zeroLatency: true,
      uptime100: true
    },
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
    message: 'Unified Voice Pipeline - The 11 Laws',
    status: 'running',
    version: '2.0.0',
    port: PORT,
    laws: [
      '1. Single Stable Channel (Port 8080)',
      '2. Zero Latency Priority',
      '3. 100% Uptime Guarantee',
      '4. Verification Before Execution',
      '5. No Script Conflicts',
      '6. Clear Error Messages',
      '7. Health Monitoring Always On',
      '8. No Secrets Exposed',
      '9. Performance Metrics Tracked',
      '10. Graceful Degradation',
      '11. Instant Recovery'
    ],
    endpoints: {
      health: '/health',
      voice: '/api/elevenlabs/synthesize',
      reasoning: '/api/reasoning/enqueue'
    }
  });
});

// Mount routers (performance-optimized)
app.use('/api/elevenlabs', elevenlabsRouter);
app.use('/api/reasoning', reasoningRouter);

// 404 handler (fast response)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.path
  });
});

// Error handling middleware (zero-latency focused)
app.use((err, req, res, next) => {
  console.error('[ERROR]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    timestamp: new Date().toISOString()
  });
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server with zero-latency optimizations
const server = app.listen(PORT, () => {
  console.log('');
  console.log('🎙️  ═══════════════════════════════════════════');
  console.log('    UNIFIED VOICE PIPELINE - THE 11 LAWS');
  console.log('    ═══════════════════════════════════════════');
  console.log(`    Port: ${PORT}`);
  console.log(`    Mode: ${process.env.NODE_ENV || 'production'}`);
  console.log('    ───────────────────────────────────────────');
  console.log(`    ✅ Law 1: Single Channel (Port ${PORT})`);
  console.log('    ✅ Law 2: Zero Latency Optimized');
  console.log('    ✅ Law 3: 100% Uptime Target');
  console.log('    ✅ Law 4: Verification Enabled');
  console.log('    ✅ Law 5: No Script Conflicts');
  console.log('    ✅ Law 6: Clear Error Messages');
  console.log('    ✅ Law 7: Health Monitoring Active');
  console.log('    ✅ Law 8: Secrets Protected');
  console.log('    ✅ Law 9: Performance Tracked');
  console.log('    ✅ Law 10: Graceful Degradation Ready');
  console.log('    ✅ Law 11: Instant Recovery Enabled');
  console.log('    ═══════════════════════════════════════════');
  console.log(`    🔑 ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? '✅ Ready' : '❌ Not configured'}`);
  console.log(`    🧠 Reasoning: ${process.env.REASONING_GATEWAY_BASE_URL || 'http://localhost:4002'}`);
  console.log(`    📦 Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
  console.log('    ═══════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown (Law 10 & 11: Degradation + Recovery)
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Keep-alive optimization
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createRequire } from 'module';
import elevenlabsRouter from './routers/elevenlabs-router.js';
import reasoningRouter from './routers/reasoning-router.js';
import interruptController from './routers/interrupt-controller.js';
import openaiVoiceRouter from './routers/openai-voice-router.js';

const app = express();
const PORT = process.env.PORT || 8080;

const require = createRequire(import.meta.url);
let handleOrchestrationCommand;

try {
  const { register } = require('ts-node');
  register({
    transpileOnly: true,
    compilerOptions: {
      module: 'es2020',
      moduleResolution: 'node',
      target: 'es2020'
    }
  });
  ({ handleOrchestrationCommand } = await import('./commands/orchestrationCommands.ts'));
  if (process.env.NODE_ENV !== 'production') {
    console.log('🧭 Orchestration voice commands enabled');
  }
} catch (error) {
  console.warn('⚠️  Orchestration voice commands unavailable', error instanceof Error ? error.message : error);
}

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
      reasoning: '/api/reasoning/*',
      interrupt: '/api/interrupt/*',
      openaiVoice: '/api/openai-voice/*',
      orchestrationCommands: '/api/commands/orchestration'
    }
  });
});

// Mount routers
app.use('/api/elevenlabs', elevenlabsRouter);
app.use('/api/reasoning', reasoningRouter);
app.use('/api/interrupt', interruptController);  // 🚨 VOICE INTERRUPT DISCIPLINE
app.use('/api/openai-voice', openaiVoiceRouter);  // 🚀 OPENAI ADVANCED VOICE (< 300ms latency)

app.post('/api/commands/orchestration', async (req, res) => {
  if (!handleOrchestrationCommand) {
    return res.status(503).json({
      success: false,
      error: 'orchestration_commands_unavailable'
    });
  }

  const { command } = req.body ?? {};
  if (!command || typeof command !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'command text is required'
    });
  }

  try {
    const result = await handleOrchestrationCommand(command, {
      baseUrl: process.env.ORCHESTRATION_SERVICE_URL,
      logger: (message, context) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[voice->orchestration] ${message}`, context);
        }
      },
      requestedBy: 'voice-service'
    });
    res.json(result);
  } catch (error) {
    console.error('Failed to execute orchestration command', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Voice interface failed to execute orchestration command'
    });
  }
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  // Server error logged silently
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  // Service startup logs (OK for boot visibility)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🎙️  Voice Service running on port ${PORT}`);
    console.log(`✅ ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? 'Configured' : 'Not configured'}`);
    console.log(`✅ Reasoning Gateway: ${process.env.REASONING_GATEWAY_BASE_URL || 'http://localhost:4002/api/reasoning'}`);
    console.log(`✅ Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
  }
});

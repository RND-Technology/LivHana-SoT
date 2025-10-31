import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createRequire } from 'module';
import { createServer } from 'http';
import elevenlabsRouter from './routers/elevenlabs-router.js';
import reasoningRouter from './routers/reasoning-router.js';
import interruptController from './routers/interrupt-controller.js';
import unifiedVoiceRouter, { initWebSocket } from './routers/unified-voice-router.js';
import mcpBridgeRouter, { mcpVoicemodeBridge as mcpBridge } from './mcp-voicemode-bridge.js';
import { requireJWT } from './middleware/auth.js';

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

// CORS configuration - Production domains only
app.use(cors({
  origin: [
    'https://herbitrage.com',
    'https://voice.herbitrage.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Serve static files (test client)
app.use(express.static('public'));

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
      redis: !!process.env.REDIS_HOST,
      whisper: !!process.env.WHISPER_SERVICE_URL,
      vocode: !!process.env.VOCODE_TTS_URL,
      unifiedVoice: true,
      multiModel: true,
      claude: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      mcpBridge: true,
      interruptable: true
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
      mcpBridge: '/api/mcp-bridge/*',
      unifiedVoice: '/api/voice/*',
      voiceWebSocket: 'ws://localhost:PORT/api/voice/ws',
      voiceStats: '/api/voice/stats',
      orchestrationCommands: '/api/commands/orchestration'
    }
  });
});

// Mount routers
// Health endpoint is excluded from JWT auth (public access needed)
// Rate limiting applies to all /api/ routes (configured at line 62)
app.use('/api/elevenlabs', requireJWT, elevenlabsRouter);
app.use('/api/reasoning', requireJWT, reasoningRouter);
app.use('/api/interrupt', requireJWT, interruptController);  // 🚨 VOICE INTERRUPT DISCIPLINE - Rate limited via /api/ limiter
app.use('/api/mcp-bridge', requireJWT, mcpBridgeRouter);  // 🎙️ MCP VOICEMODE BRIDGE - Makes MCP voice interruptable
app.use('/api/voice', requireJWT, unifiedVoiceRouter);  // 🚀 UNIFIED VOICE ROUTER - Multi-model, <200ms target, full interruption

// MCP Bridge endpoints
app.get('/api/mcp-bridge/status', (req, res) => {
  res.json(mcpBridge.getStatus());
});

app.post('/api/mcp-bridge/interrupt/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { reason } = req.body || {};
  const interrupted = mcpBridge.interrupt(sessionId, reason || 'api_request');
  res.json({ ok: interrupted, sessionId });
});

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

// Create HTTP server (needed for WebSocket)
const server = createServer(app);

// Initialize unified WebSocket server
const wss = initWebSocket(server);

// Start server
server.listen(PORT, () => {
  // Service startup logs (OK for boot visibility)
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🎙️  Voice Service running on port ${PORT}`);
    console.log(`✅ ElevenLabs: ${process.env.ELEVENLABS_API_KEY ? 'Configured' : 'Not configured'}`);
    console.log(`✅ Reasoning Gateway: ${process.env.REASONING_GATEWAY_BASE_URL || 'http://localhost:4002/api/reasoning'}`);
    console.log(`✅ Redis: ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`);
    console.log(`🚀 Unified Voice Router: Multi-model (GPT-5, Claude, GPT-4o) with <200ms target`);
    console.log(`🔥 Services: Whisper (${process.env.WHISPER_SERVICE_URL || 'http://localhost:9000'}) + Vocode (${process.env.VOCODE_TTS_URL || 'http://localhost:9001'})`);
    console.log(`⚡ WebSocket: ws://localhost:${PORT}/api/voice/ws (REAL-TIME STREAMING + INTERRUPTION!)`);
    console.log(`📊 Stats: http://localhost:${PORT}/api/voice/stats`);
  }
});

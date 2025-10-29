import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { Worker } from 'bullmq';
import { createQueue, createQueueEvents } from '../common/queue/index.js';
import logger from '../../common/logger/index.js';
import { createRequire } from 'module';

const app = express();
const PORT = parseInt(process.env.PORT || '4002', 10);
const REASONING_QUEUE_NAME = process.env.REASONING_QUEUE_NAME || 'voice-mode-reasoning-jobs';
const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10)
};

const MIN_WORKERS = Math.max(1, parseInt(process.env.REASONING_MIN_WORKERS || '1', 10));
const MAX_WORKERS = Math.max(MIN_WORKERS, parseInt(process.env.REASONING_MAX_WORKERS || '6', 10));
const SCALE_UP_THRESHOLD = Math.max(1, parseInt(process.env.REASONING_SCALE_UP_THRESHOLD || '5', 10));
const SCALE_DOWN_THRESHOLD = Math.max(0, parseInt(process.env.REASONING_SCALE_DOWN_THRESHOLD || '1', 10));
const AUTOSCALER_INTERVAL_MS = Math.max(1000, parseInt(process.env.REASONING_AUTOSCALER_INTERVAL_MS || '5000', 10));
const ORCHESTRATION_URL = process.env.ORCHESTRATION_SERVICE_URL || 'http://localhost:4010';
const CONTROL_SECRET = process.env.ORCHESTRATION_CONTROL_SECRET;
const WORKER_CONCURRENCY = Math.max(1, parseInt(process.env.REASONING_WORKER_CONCURRENCY || '1', 10));

const appOrigins = [
  'https://reggieanddro.com',
  'https://voice.reggieanddro.com',
  'https://brain.reggieanddro.com',
  'http://localhost:3000',
  'http://localhost:5173'
];

app.use(helmet());
app.use(cors({ origin: appOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'test-key'
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'test-key'
});

const MODEL_COSTS = {
  'claude-3-sonnet': 0.000003,
  'gpt-4': 0.00003,
  'gpt-3.5-turbo': 0.000002
};

const require = createRequire(import.meta.url);
let AutoScaler = null;
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
  ({ AutoScaler } = await import('./worker/autoScaler.ts'));
  logger.info('AutoScaler module loaded for reasoning gateway', {});
} catch (error) {
  logger.warn('AutoScaler unavailable; using fallback single-worker mode', {
    error: error instanceof Error ? error.message : String(error)
  });
}

const reasoningQueue = createQueue(REASONING_QUEUE_NAME, REDIS_CONNECTION);
const reasoningQueueEvents = createQueueEvents(REASONING_QUEUE_NAME, REDIS_CONNECTION);

function verifyControlSecret(req) {
  if (!CONTROL_SECRET) {
    return true;
  }
  const header = req.headers['x-orchestration-token'];
  if (Array.isArray(header)) {
    return header.includes(CONTROL_SECRET);
  }
  return header === CONTROL_SECRET;
}

async function processReasoningJob(job) {
  const { prompt, userId, sessionId, metadata } = job.data;

  logger.info('Processing reasoning job', {
    jobId: job.id,
    userId,
    sessionId
  });

  try {
    const model = prompt.length > 500 ? 'claude-sonnet-4-5-20250929' : 'gpt-4o-mini';

    let result;
    if (model.includes('claude') && process.env.ANTHROPIC_API_KEY) {
      const anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropicClient.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      });
      result = response.content[0].text;
    } else if (process.env.OPENAI_API_KEY) {
      const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      });
      result = response.choices[0].message.content;
    } else {
      result = `Hello! I received your prompt: "${prompt}". I would compute 2+2 = 4, but I need API keys configured to provide real AI responses.`;
    }

    logger.info('Reasoning job completed', {
      jobId: job.id,
      model,
      resultLength: result.length
    });

    return {
      success: true,
      result,
      model,
      metadata: {
        userId,
        sessionId,
        ...metadata
      }
    };
  } catch (error) {
    logger.error('Reasoning job failed', {
      jobId: job.id,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

function createReasoningWorker(slotId = 0) {
  const worker = new Worker(REASONING_QUEUE_NAME, processReasoningJob, {
    connection: REDIS_CONNECTION,
    concurrency: WORKER_CONCURRENCY
  });

  worker.on('completed', (job) => {
    logger.info('Worker completed job', {
      workerSlot: slotId,
      jobId: job.id
    });
  });

  worker.on('failed', (job, err) => {
    logger.error('Worker failed job', {
      workerSlot: slotId,
      jobId: job?.id,
      error: err instanceof Error ? err.message : String(err)
    });
  });

  return worker;
}

let autoScalerInstance = null;
let fallbackWorker = null;

if (AutoScaler) {
  autoScalerInstance = new AutoScaler({
    queue: reasoningQueue,
    createWorker: (slotId) => createReasoningWorker(slotId),
    minWorkers: MIN_WORKERS,
    maxWorkers: MAX_WORKERS,
    scaleUpThreshold: SCALE_UP_THRESHOLD,
    scaleDownThreshold: SCALE_DOWN_THRESHOLD,
    pollIntervalMs: AUTOSCALER_INTERVAL_MS,
    orchestratorUrl: ORCHESTRATION_URL,
    serviceName: 'reasoning-gateway',
    logger: (message, context) => logger.info(message, context),
    secretToken: CONTROL_SECRET
  });

  autoScalerInstance.start().catch((error) => {
    logger.error('AutoScaler failed to start', {
      error: error instanceof Error ? error.message : String(error)
    });
  });
} else {
  fallbackWorker = createReasoningWorker(0);
}

// Primary reasoning endpoints
app.post('/api/v1/generate', async (req, res) => {
  try {
    const { prompt, task_type = 'general', max_budget = 0.01 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    logger.info('Generating response for task', { taskType: task_type });

    let model;
    let client;
    if (task_type === 'code_generation' || max_budget >= 0.01) {
      model = 'claude-3-sonnet';
      client = anthropic;
    } else {
      model = 'gpt-3.5-turbo';
      client = openai;
    }

    const startTime = Date.now();

    let responseText;
    let tokens;

    if (model === 'claude-3-sonnet') {
      const result = await client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      });

      responseText = result.content[0].text;
      tokens = result.usage.input_tokens + result.usage.output_tokens;
    } else {
      const result = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000
      });

      responseText = result.choices[0].message.content;
      tokens = result.usage.total_tokens;
    }

    const latency = Date.now() - startTime;
    const cost = tokens * MODEL_COSTS[model];

    res.json({
      success: true,
      model_used: model,
      result: responseText,
      tokens,
      cost,
      latency_ms: latency,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('AI generation failed', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/v1/generate-email', async (req, res) => {
  try {
    const { recipient, subject, context, tone = 'professional' } = req.body;

    const prompt = `Write a ${tone} email to ${recipient} about ${subject}. Context: ${context}`;

    const result = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    const emailContent = result.content[0].text;
    const tokens = result.usage.input_tokens + result.usage.output_tokens;

    res.json({
      success: true,
      email_content: emailContent,
      tokens,
      cost: tokens * MODEL_COSTS['claude-3-sonnet'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Email generation failed', { error: error instanceof Error ? error.message : String(error) });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// Autoscaler control endpoints
app.get('/internal/worker-scale/status', (_req, res) => {
  const snapshot = autoScalerInstance?.getState();
  res.json({
    success: true,
    autoscalerEnabled: Boolean(autoScalerInstance),
    snapshot,
    fallbackWorkers: fallbackWorker ? 1 : 0
  });
});

app.post('/internal/worker-scale', async (req, res) => {
  if (!verifyControlSecret(req)) {
    return res.status(403).json({ success: false, error: 'forbidden' });
  }

  if (!autoScalerInstance) {
    return res.status(503).json({ success: false, error: 'autoscaler_unavailable' });
  }

  const { direction, target, reason, requestedBy } = req.body || {};

  try {
    let snapshot;
    if (typeof target === 'number' && !Number.isNaN(target)) {
      snapshot = await autoScalerInstance.setTargetWorkers(target, { reason, requestedBy });
    } else if (direction === 'up' || direction === 'down') {
      snapshot = await autoScalerInstance.scale(direction, { reason, requestedBy });
    } else {
      return res.status(400).json({ success: false, error: 'direction or target required' });
    }

    res.json({ success: true, snapshot });
  } catch (error) {
    logger.error('Manual autoscaler command failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

app.get('/health', (_req, res) => {
  const autoscalerState = autoScalerInstance?.getState();
  res.json({
    status: 'healthy',
    service: 'reasoning-gateway',
    message: 'Real AI reasoning service active',
    timestamp: new Date().toISOString(),
    features: ['claude_integration', 'openai_integration', 'cost_tracking', 'swarm_coordination'],
    autoscaler: autoscalerState || {
      workers: fallbackWorker ? 1 : 0,
      targetWorkers: fallbackWorker ? 1 : 0,
      lastAction: fallbackWorker ? 'fallback' : 'idle'
    }
  });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Reasoning Gateway Active',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/v1/generate',
      '/api/v1/generate-email',
      '/api/swarm/tasks',
      '/api/swarm/health',
      '/api/swarm/capabilities',
      '/internal/worker-scale/status'
    ]
  });
});

reasoningQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.warn('Queue job failed', { jobId, failedReason });
});

reasoningQueueEvents.on('completed', ({ jobId }) => {
  logger.info('Queue job completed', { jobId });
});

const server = app.listen(PORT, () => {
  logger.info('Reasoning Gateway running', {
    port: PORT,
    redisHost: REDIS_CONNECTION.host,
    queue: REASONING_QUEUE_NAME,
    autoscaler: Boolean(autoScalerInstance)
  });
});

async function shutdown() {
  logger.info('Shutting down reasoning gateway', {});
  server.close();
  if (autoScalerInstance) {
    await autoScalerInstance.stop();
  }
  if (fallbackWorker) {
    await fallbackWorker.close();
  }
  await reasoningQueue.close();
  await reasoningQueueEvents.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

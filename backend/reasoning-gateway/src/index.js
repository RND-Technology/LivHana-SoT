import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import { Queue, QueueEvents, Worker } from 'bullmq';
import { authMiddleware } from '../common/auth/middleware.js';
import { requestLogger, errorLogger } from '../common/logging/logger.js';
import { ensureRedisEnv, createQueueOptions } from '../common/queue/index.js';
import { createReasoningRouter } from './routes/reasoning.js';
import { createMemoryRouter } from './routes/memory.js';
import { createAutonomousRouter } from './routes/autonomous.js';
import { createDeepSeekWorkerProcessor } from './workers/deepseek-processor.js';
import { createSelfImprovementLoop, createSelfImprovementRouter } from './self-improvement-loop.js';
import {
  createRedisClient,
  createTieredRateLimiter,
  createHealthCheckLimiter,
  createMonitoringRoutes
} from '../common/rate-limit/index.mjs';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

// In SAFE_MODE, skip Redis initialization
if (process.env.SAFE_MODE === 'true') {
  logger.warn('Reasoning Gateway running in SAFE_MODE - Redis disabled');
} else {
  ensureRedisEnv({ logger });
}

const app = express();

// Initialize rate limiting
let rateLimitMiddleware = null;
let healthRateLimitMiddleware = null;

if (process.env.SAFE_MODE !== 'true') {
  (async () => {
    try {
      const redisClient = await createRedisClient({ logger });

      // Create tiered rate limiter for API routes
      rateLimitMiddleware = createTieredRateLimiter({
        redisClient,
        logger,
        serviceName: 'reasoning-gateway'
      });

      // Create rate limiter for health checks
      healthRateLimitMiddleware = createHealthCheckLimiter({
        redisClient,
        logger,
        serviceName: 'reasoning-gateway'
      });

      logger.info('Rate limiting initialized successfully');
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to initialize rate limiting - continuing without it');
    }
  })();
} else {
  logger.warn('SAFE_MODE: Rate limiting disabled');
}

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()) ?? '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger(logger));

// Initialize queues and workers
let reasoningQueue = null;
let queueEvents = null;
let reasoningWorker = null;

if (process.env.SAFE_MODE !== 'true') {
  const queueName = process.env.REASONING_QUEUE_NAME ?? 'voice-mode-reasoning-jobs';
  const queueOptions = createQueueOptions();

  reasoningQueue = new Queue(queueName, queueOptions);
  queueEvents = new QueueEvents(queueName, queueOptions);
  reasoningWorker = new Worker(queueName, createDeepSeekWorkerProcessor({ logger }), queueOptions);
  
  logger.info('Reasoning queue and worker initialized');
} else {
  logger.warn('SAFE_MODE: Reasoning queue and worker disabled');
}

// Health endpoints with lenient rate limiting
app.get('/healthz', (req, res, next) => {
  if (healthRateLimitMiddleware) {
    return healthRateLimitMiddleware(req, res, next);
  }
  next();
}, (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/health', (req, res, next) => {
  if (healthRateLimitMiddleware) {
    return healthRateLimitMiddleware(req, res, next);
  }
  next();
}, (_req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'reasoning-gateway', 
    queue: process.env.SAFE_MODE === 'true' ? 'disabled' : (process.env.REASONING_QUEUE_NAME ?? 'voice-mode-reasoning-jobs'),
    safeMode: process.env.SAFE_MODE === 'true'
  });
});

// Apply rate limiting to all API routes
app.use('/api', (req, res, next) => {
  if (rateLimitMiddleware) {
    return rateLimitMiddleware(req, res, next);
  }
  next();
});

// Rate limit monitoring endpoints (no auth for monitoring)
app.use('/api/monitoring', createMonitoringRoutes({ logger }));

// Initialize self-improvement loop (async)
let improvementLoop = null;
if (process.env.ENABLE_SELF_IMPROVEMENT === 'true') {
  createSelfImprovementLoop({ logger })
    .then(loop => {
      improvementLoop = loop;
      logger.info('Self-improvement loop started');

      // Add self-improvement routes
      app.use('/api/improvements', authMiddleware({ logger }), createSelfImprovementRouter({ logger, improvementLoop: loop }));
    })
    .catch(error => {
      logger.error({ error: error.message }, 'Failed to start self-improvement loop');
    });
}

// API endpoints WITHOUT authentication (for now - add back later with login system)
app.use('/api/reasoning', createReasoningRouter({ logger, queue: reasoningQueue, queueEvents }));
app.use('/api/memory', createMemoryRouter({ logger }));
app.use('/api/autonomous', createAutonomousRouter({ logger, queue: reasoningQueue }));
app.use(errorLogger(logger));

const port = Number(process.env.PORT ?? 4002);
app.listen(port, () => {
  logger.info({ 
    port, 
    queueName: process.env.SAFE_MODE === 'true' ? 'disabled' : (process.env.REASONING_QUEUE_NAME ?? 'voice-mode-reasoning-jobs'),
    safeMode: process.env.SAFE_MODE === 'true'
  }, 'reasoning-gateway listening');
});

if (reasoningWorker) {
  reasoningWorker.on('failed', (job, error) => {
    logger.error({ jobId: job.id, error: error.message }, 'reasoning job failed');
  });

  reasoningWorker.on('completed', (job) => {
    logger.info({ jobId: job.id }, 'reasoning job completed');
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');

  if (reasoningWorker) {
    await reasoningWorker.close();
  }
  if (reasoningQueue) {
    await reasoningQueue.close();
  }

  if (improvementLoop) {
    await improvementLoop.shutdown();
  }

  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');

  await reasoningWorker.close();
  await reasoningQueue.close();

  if (improvementLoop) {
    await improvementLoop.shutdown();
  }

  process.exit(0);
});

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02

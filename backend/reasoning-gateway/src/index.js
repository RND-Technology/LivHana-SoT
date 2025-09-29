import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import { Queue, QueueEvents, Worker } from 'bullmq';
import { authMiddleware } from '../../common/auth/middleware.js';
import { requestLogger, errorLogger } from '../../common/logging/logger.js';
import { ensureRedisEnv, createQueueOptions } from '../../common/queue/index.js';
import { createReasoningRouter } from './routes/reasoning.js';
import { createDeepSeekWorkerProcessor } from './workers/deepseek-processor.js';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

ensureRedisEnv({ logger });

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()) ?? '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger(logger));

// Auth middleware - skip in development mode for testing
if (process.env.NODE_ENV === 'production') {
  app.use(authMiddleware({ logger }));
} else {
  logger.warn('AUTH DISABLED - Development mode');
}

const queueName = process.env.REASONING_QUEUE_NAME ?? 'voice-mode-reasoning-jobs';
const queueOptions = createQueueOptions();

const reasoningQueue = new Queue(queueName, queueOptions);
const queueEvents = new QueueEvents(queueName, queueOptions);
const reasoningWorker = new Worker(queueName, createDeepSeekWorkerProcessor({ logger }), queueOptions);

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/reasoning', createReasoningRouter({ logger, queue: reasoningQueue, queueEvents }));
app.use(errorLogger(logger));

const port = Number(process.env.PORT ?? 4002);
app.listen(port, () => {
  logger.info({ port, queueName }, 'reasoning-gateway listening');
});

reasoningWorker.on('failed', (job, error) => {
  logger.error({ jobId: job.id, error: error.message }, 'reasoning job failed');
});

reasoningWorker.on('completed', (job) => {
  logger.info({ jobId: job.id }, 'reasoning job completed');
});

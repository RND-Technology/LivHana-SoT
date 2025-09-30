import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pino from 'pino';
import voiceRouter from './voice-router.js';
import { createHealthRouter } from './voice-health.js';
import { authMiddleware } from '../../common/auth/middleware.js';
import { requestLogger, errorLogger } from '../../common/logging/logger.js';
import { ensureRedisEnv, createQueue } from '../../common/queue/index.js';

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(origin => origin.trim());
if (allowedOrigins?.includes('')) {
  logger.warn('ALLOWED_ORIGINS contains blank entries; check your configuration');
}

ensureRedisEnv({ logger });
const queueName = process.env.REASONING_QUEUE_NAME ?? 'voice-mode-reasoning-jobs';
const reasoningQueue = createQueue(queueName);

app.use(helmet());
app.use(cors({ origin: allowedOrigins ?? '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger(logger));

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Health endpoint without auth for monitoring
app.use('/health', createHealthRouter({ logger, queue: reasoningQueue }));
// Auth required for API endpoints
app.use('/api', authMiddleware({ logger }), voiceRouter({ logger, queue: reasoningQueue }));

app.use(errorLogger(logger));

const port = Number(process.env.PORT ?? 4001);
app.listen(port, () => {
  logger.info({ port }, 'voice-service listening');
});

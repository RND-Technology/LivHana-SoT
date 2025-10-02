import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import { createProductRouter } from './routes/product.js';
import { createLoyaltyRouter } from './routes/loyalty.js';

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) ?? '*' }));
app.use(express.json({ limit: '2mb' }));

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/product', createProductRouter({ logger }));
app.use('/api/member', createLoyaltyRouter({ logger }));

const port = Number(process.env.PORT ?? 4010);
app.listen(port, () => {
  logger.info({ port }, 'product-service listening');
});
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

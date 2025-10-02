import { Queue, QueueEvents } from 'bullmq';

export const REQUIRED_REDIS_ENV_VARS = ['REDIS_HOST', 'REDIS_PORT'];

export const createRedisConfig = (overrides = {}) => {
  const baseConfig = {
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    tls: process.env.REDIS_USE_TLS === 'true' ? {} : undefined,
    db: Number.isFinite(Number(process.env.REDIS_DB)) ? Number(process.env.REDIS_DB) : undefined,
  };

  return {
    connection: {
      ...baseConfig,
      ...overrides,
    },
  };
};

export const ensureRedisEnv = ({ logger } = {}) => {
  const missing = REQUIRED_REDIS_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger?.error({ missing }, 'Redis environment validation failed');
    throw new Error(`Missing required Redis environment variables: ${missing.join(', ')}`);
  }

  return true;
};

export const createQueueOptions = ({ connectionOverrides, jobOptions } = {}) => ({
  ...createRedisConfig(connectionOverrides),
  defaultJobOptions: {
    removeOnComplete: Number(process.env.REDIS_REMOVE_ON_COMPLETE ?? 100),
    removeOnFail: Number(process.env.REDIS_REMOVE_ON_FAIL ?? 1000),
    ...jobOptions,
  },
});

export const createQueue = (name, { connectionOverrides, jobOptions } = {}) => new Queue(
  name,
  createQueueOptions({ connectionOverrides, jobOptions })
);

export const createQueueEvents = (name, { connectionOverrides } = {}) => new QueueEvents(
  name,
  createRedisConfig(connectionOverrides)
);
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

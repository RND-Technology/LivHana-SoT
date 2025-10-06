/**
 * Optimized: 2025-10-02
 * RPM: 1.6.2.3.backend-common-optimization
 * Session: Elephant Strategy Batch 1
 */

/**
 * Optimized: 2025-10-02
 * RPM: 1.6.2.3.backend-common-optimization
 * Session: Elephant Strategy Batch 1
 */

import { createClient } from 'redis';

const inMemoryStore = new Map();

const createRedisClient = async ({ logger }) => {
  const url = process.env.MEMORY_REDIS_URL;
  if (!url) return null;

  try {
    const client = createClient({ url });
    client.on('error', (error) => logger?.error?.({ error: error.message }, 'Memory Redis client error'));
    if (!client.isOpen) {
      await client.connect();
    }
    return client;
  } catch (error) {
    logger?.warn?.({ error: error.message }, 'Falling back to in-memory store');
    return null;
  }
};

export const createMemoryStore = async ({ logger }) => {
  const redisClient = await createRedisClient({ logger });

  const getKey = (jobId) => `voice-mode:memory:${jobId}`;

  const set = async (jobId, payload) => {
    if (redisClient) {
      await redisClient.set(getKey(jobId), JSON.stringify(payload), {
        EX: Number(process.env.MEMORY_TTL_SECONDS ?? 3600),
      });
    }
    inMemoryStore.set(jobId, payload);
  };

  const get = async (jobId) => {
    if (redisClient) {
      const value = await redisClient.get(getKey(jobId));
      if (value) {
        const parsed = JSON.parse(value);
        inMemoryStore.set(jobId, parsed);
        return parsed;
      }
    }
    return inMemoryStore.get(jobId);
  };

  const appendHistory = async (jobId, update) => {
    const current = (await get(jobId)) ?? { history: [] };
    const nextPayload = {
      ...current,
      updatedAt: new Date().toISOString(),
      history: [...(current.history ?? []), update],
    };
    await set(jobId, nextPayload);
    return nextPayload;
  };

  return {
    set,
    get,
    appendHistory,
    isRedisBacked: Boolean(redisClient),
  };
};

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02

/**
 * Async Sync Jobs - Non-Blocking Background Processing
 * PERFORMANCE: 100+ req/s capacity by moving sync to background workers
 *
 * FROM AGENT #5 REPORT:
 * - Square sync currently blocks event loop for 5 minutes
 * - Move to Bull queue with Redis backend
 * - Allow API to return immediately while sync runs in background
 */

import Queue from 'bull';
import { createLogger } from '../../common/logging/index.js';

const logger = createLogger('async-sync-jobs');

// Create queues for different sync types
const squareSyncQueue = new Queue('square-sync', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 100
  }
});

const lightspeedSyncQueue = new Queue('lightspeed-sync', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: 100
  }
});

/**
 * Process Square sync in background
 */
squareSyncQueue.process(async (job) => {
  const { syncType, options } = job.data;

  logger.info({ syncType, jobId: job.id }, 'Starting Square sync job');

  try {
    // Import sync logic (only when processing, not on queue creation)
    const { syncSquareData } = await import('./square-sync-scheduler.js');

    const result = await syncSquareData(options);

    logger.info({
      syncType,
      jobId: job.id,
      itemsSynced: result.itemsSynced
    }, 'Square sync completed');

    return result;

  } catch (error) {
    logger.error({
      syncType,
      jobId: job.id,
      error: error.message
    }, 'Square sync failed');

    throw error;
  }
});

/**
 * Process LightSpeed sync in background
 */
lightspeedSyncQueue.process(async (job) => {
  const { syncType, options } = job.data;

  logger.info({ syncType, jobId: job.id }, 'Starting LightSpeed sync job');

  try {
    const { syncLightspeedData } = await import('./lightspeed-sync-scheduler.js');

    const result = await syncLightspeedData(options);

    logger.info({
      syncType,
      jobId: job.id,
      itemsSynced: result.itemsSynced
    }, 'LightSpeed sync completed');

    return result;

  } catch (error) {
    logger.error({
      syncType,
      jobId: job.id,
      error: error.message
    }, 'LightSpeed sync failed');

    throw error;
  }
});

/**
 * Queue a Square sync job (non-blocking)
 */
async function queueSquareSync(options = {}) {
  const job = await squareSyncQueue.add({
    syncType: 'square',
    options
  }, {
    priority: options.priority || 5,
    delay: options.delay || 0
  });

  logger.info({ jobId: job.id }, 'Square sync queued');

  return {
    jobId: job.id,
    status: 'queued',
    estimatedDuration: '5-10 minutes'
  };
}

/**
 * Queue a LightSpeed sync job (non-blocking)
 */
async function queueLightspeedSync(options = {}) {
  const job = await lightspeedSyncQueue.add({
    syncType: 'lightspeed',
    options
  }, {
    priority: options.priority || 5,
    delay: options.delay || 0
  });

  logger.info({ jobId: job.id }, 'LightSpeed sync queued');

  return {
    jobId: job.id,
    status: 'queued',
    estimatedDuration: '3-5 minutes'
  };
}

/**
 * Get job status
 */
async function getJobStatus(jobId, queueType = 'square') {
  const queue = queueType === 'square' ? squareSyncQueue : lightspeedSyncQueue;

  const job = await queue.getJob(jobId);

  if (!job) {
    return { status: 'not_found' };
  }

  const state = await job.getState();
  const progress = job.progress();
  const failedReason = job.failedReason;

  return {
    jobId: job.id,
    status: state,
    progress,
    failedReason,
    attempts: job.attemptsMade,
    maxAttempts: job.opts.attempts,
    createdAt: new Date(job.timestamp).toISOString(),
    finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null
  };
}

/**
 * Get queue stats
 */
async function getQueueStats(queueType = 'square') {
  const queue = queueType === 'square' ? squareSyncQueue : lightspeedSyncQueue;

  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount()
  ]);

  return {
    queueType,
    waiting,
    active,
    completed,
    failed,
    total: waiting + active
  };
}

export {
  queueSquareSync,
  queueLightspeedSync,
  getJobStatus,
  getQueueStats,
  squareSyncQueue,
  lightspeedSyncQueue
};
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

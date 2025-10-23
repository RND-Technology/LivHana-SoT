import { Queue, QueueEvents } from 'bullmq';

/**
 * Queue Management Module
 * Provides BullMQ queue and event management for voice-mode reasoning jobs
 */

// Default Redis connection
const defaultConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10)
};

/**
 * Create a BullMQ queue
 * @param {string} queueName - Name of the queue
 * @param {object} connection - Redis connection options (optional)
 * @returns {Queue} BullMQ Queue instance
 */
export function createQueue(queueName, connection = defaultConnection) {
  return new Queue(queueName, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: {
        count: 100, // Keep last 100 completed jobs
        age: 3600 // Remove after 1 hour
      },
      removeOnFail: {
        count: 500 // Keep last 500 failed jobs for debugging
      }
    }
  });
}

/**
 * Create queue events listener
 * @param {string} queueName - Name of the queue
 * @param {object} connection - Redis connection options (optional)
 * @returns {QueueEvents} BullMQ QueueEvents instance
 */
export function createQueueEvents(queueName, connection = defaultConnection) {
  return new QueueEvents(queueName, { connection });
}

/**
 * Enqueue a job
 * @param {Queue} queue - BullMQ queue instance
 * @param {string} jobName - Name of the job
 * @param {object} jobData - Job payload
 * @param {object} opts - Job options (optional)
 * @returns {Promise<Job>} BullMQ Job instance
 */
export async function enqueueJob(queue, jobName, jobData, opts = {}) {
  const job = await queue.add(jobName, jobData, opts);
  return {
    id: job.id,
    name: job.name,
    data: job.data,
    timestamp: job.timestamp
  };
}

/**
 * Get job status
 * @param {Queue} queue - BullMQ queue instance
 * @param {string} jobId - Job ID
 * @returns {Promise<object>} Job status and data
 */
export async function getJobStatus(queue, jobId) {
  const job = await queue.getJob(jobId);

  if (!job) {
    return { found: false, jobId };
  }

  const state = await job.getState();
  const progress = job.progress;
  const returnvalue = job.returnvalue;
  const failedReason = job.failedReason;

  return {
    found: true,
    jobId: job.id,
    name: job.name,
    state,
    progress,
    result: returnvalue,
    error: failedReason,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn
  };
}

/**
 * Wait for job completion
 * @param {Job} job - BullMQ job instance
 * @param {number} timeout - Timeout in milliseconds (default: 60000)
 * @returns {Promise<any>} Job result
 */
export async function waitForJob(job, timeout = 60000) {
  return await job.waitUntilFinished(timeout);
}

export default {
  createQueue,
  createQueueEvents,
  enqueueJob,
  getJobStatus,
  waitForJob
};

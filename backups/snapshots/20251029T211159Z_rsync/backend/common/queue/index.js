import { createHardenedQueue, queueMonitor } from './hardenedQueue.js';

/**
 * Queue Management Module
 * Provides hardened BullMQ queue factory with rate limiting, monitoring, and security
 */

// Re-export the hardened queue factory and monitor
export { createHardenedQueue, queueMonitor };

// Backwards compatibility layer
export function createQueue(queueName, connection) {
  console.warn('Warning: createQueue is deprecated. Use createHardenedQueue instead.');
  return createHardenedQueue(queueName, { connection });
}

/**
 * Enqueue a job with rate limiting and monitoring
 * @param {Queue} queue - Hardened queue instance
 * @param {string} jobName - Name of the job
 * @param {object} jobData - Job payload
 * @param {object} opts - Job options (optional)
 * @returns {Promise<object>} Job information
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
 * Get job status with enhanced metrics
 * @param {Queue} queue - Hardened queue instance
 * @param {string} jobId - Job ID
 * @returns {Promise<object>} Job status, data and queue metrics
 */
export async function getJobStatus(queue, jobId) {
  const job = await queue.getJob(jobId);

  if (!job) {
    return { found: false, jobId };
  }

  const state = await job.getState();
  const queueMetrics = queue.getMetrics();

  return {
    found: true,
    jobId: job.id,
    name: job.name,
    state,
    progress: job.progress,
    result: job.returnvalue,
    error: job.failedReason,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    metrics: queueMetrics
  };
}

/**
 * Wait for job completion with timeout
 * @param {Job} job - BullMQ job instance
 * @param {number} timeout - Timeout in milliseconds (default: 60000)
 * @returns {Promise<any>} Job result
 */
export async function waitForJob(job, timeout = 60000) {
  return await job.waitUntilFinished(timeout);
}

// Set up anomaly detection alerts
queueMonitor.on('anomaly', ({ queueName, score, metrics }) => {
  console.warn(`Queue anomaly detected in ${queueName}:`, {
    anomalyScore: score,
    currentMetrics: metrics
  });
});

export default {
  createHardenedQueue,
  createQueue, // Deprecated
  enqueueJob,
  getJobStatus,
  waitForJob,
  queueMonitor
};

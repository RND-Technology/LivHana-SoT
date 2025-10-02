import cron from 'node-cron';
import { spawn } from 'child_process';
import { createLogger } from '../../common/logging/index.js';
import path from 'path';

const logger = createLogger('square-sync-scheduler');

// Run every 15 minutes: 0,15,30,45 * * * *
const SYNC_SCHEDULE = process.env.SQUARE_SYNC_SCHEDULE || '*/15 * * * *';

// PERFORMANCE OPTIMIZATION: Async sync jobs with retry logic
// Target: 100+ req/s capacity (from 20 req/s)
// Impact: Eliminates 5-minute event loop blocking

// Track running jobs
const runningJobs = new Map();
const jobStats = {
  totalRuns: 0,
  successCount: 0,
  failureCount: 0,
  retryCount: 0,
  lastRunAt: null,
  lastSuccessAt: null,
  lastFailureAt: null,
  avgDurationMs: 0,
};

// Exponential backoff retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 5000, // 5 seconds
  maxDelayMs: 60000, // 1 minute
  backoffMultiplier: 2,
};

function calculateBackoffDelay(retryCount) {
  const delay = Math.min(
    RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount),
    RETRY_CONFIG.maxDelayMs
  );
  return delay;
}

function runSquareSync(retryCount = 0) {
  return new Promise((resolve, reject) => {
    const jobId = `sync-${Date.now()}-${retryCount}`;
    const startTime = Date.now();

    logger.info('Starting Square → BigQuery sync (async)', {
      jobId,
      retryCount,
      isRetry: retryCount > 0
    });

    // Spawn async process (non-blocking)
    const child = spawn('node', ['scripts/sync-square-to-bigquery.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'], // Capture stdout/stderr
      detached: false, // Keep connected for monitoring
    });

    runningJobs.set(jobId, {
      pid: child.pid,
      startTime,
      retryCount,
    });

    let stdout = '';
    let stderr = '';

    // Collect output
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Set timeout (5 minutes max)
    const timeout = setTimeout(() => {
      logger.warn('Square sync timeout - killing process', { jobId, pid: child.pid });
      child.kill('SIGTERM');
    }, 300000);

    child.on('exit', (code, signal) => {
      clearTimeout(timeout);
      runningJobs.delete(jobId);

      const duration = Date.now() - startTime;

      // Update stats
      jobStats.totalRuns++;
      jobStats.lastRunAt = new Date().toISOString();
      jobStats.avgDurationMs = Math.round(
        (jobStats.avgDurationMs * (jobStats.totalRuns - 1) + duration) / jobStats.totalRuns
      );

      if (code === 0) {
        // SUCCESS
        jobStats.successCount++;
        jobStats.lastSuccessAt = new Date().toISOString();

        logger.info('Square sync completed successfully', {
          jobId,
          durationMs: duration,
          retryCount,
          output: stdout.trim().split('\n').slice(-3).join('\n'), // Last 3 lines
        });

        resolve({ success: true, duration, retryCount });
      } else {
        // FAILURE
        jobStats.failureCount++;
        jobStats.lastFailureAt = new Date().toISOString();

        const errorInfo = {
          jobId,
          code,
          signal,
          durationMs: duration,
          retryCount,
          stderr: stderr.trim().split('\n').slice(-5).join('\n'), // Last 5 error lines
        };

        // Retry with exponential backoff
        if (retryCount < RETRY_CONFIG.maxRetries) {
          const backoffDelay = calculateBackoffDelay(retryCount);
          jobStats.retryCount++;

          logger.warn('Square sync failed - scheduling retry', {
            ...errorInfo,
            nextRetryIn: `${backoffDelay}ms`,
            attemptsLeft: RETRY_CONFIG.maxRetries - retryCount,
          });

          // Schedule retry with backoff
          setTimeout(() => {
            runSquareSync(retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, backoffDelay);
        } else {
          // Max retries exceeded
          logger.error('Square sync failed after max retries', errorInfo);
          reject(new Error(`Sync failed after ${RETRY_CONFIG.maxRetries} retries`));
        }
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      runningJobs.delete(jobId);

      logger.error('Square sync process error', {
        jobId,
        error: error.message,
      });

      reject(error);
    });
  });
}

function startSquareSyncScheduler() {
  logger.info('Starting Square sync scheduler (async mode)', {
    schedule: SYNC_SCHEDULE,
    retryConfig: RETRY_CONFIG,
  });

  cron.schedule(SYNC_SCHEDULE, async () => {
    logger.info('Triggered scheduled Square → BigQuery sync');

    try {
      const result = await runSquareSync();
      logger.info('Scheduled sync completed', {
        ...result,
        stats: jobStats,
      });
    } catch (error) {
      logger.error('Scheduled sync failed after all retries', {
        error: error.message,
        stats: jobStats,
      });
    }
  });

  logger.info('Square sync scheduler started - async mode with retry logic enabled');
}

export { startSquareSyncScheduler };

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02

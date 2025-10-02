const cron = require('node-cron');
const { execSync } = require('child_process');
const { createLogger } = require('../../common/logging');

const logger = createLogger('square-sync-scheduler');

// Run every 15 minutes: 0,15,30,45 * * * *
const SYNC_SCHEDULE = process.env.SQUARE_SYNC_SCHEDULE || '*/15 * * * *';

function startSquareSyncScheduler() {
  logger.info('Starting Square sync scheduler', { schedule: SYNC_SCHEDULE });

  cron.schedule(SYNC_SCHEDULE, () => {
    logger.info('Running scheduled Square → BigQuery sync');

    try {
      const output = execSync('node scripts/sync-square-to-bigquery.js', {
        cwd: __dirname + '/..',
        encoding: 'utf8',
        timeout: 300000 // 5 min timeout
      });

      logger.info('Square sync completed successfully', {
        output: output.trim().split('\n').slice(-5).join('\n') // Last 5 lines
      });
    } catch (error) {
      logger.error('Square sync failed', {
        error: error.message,
        stderr: error.stderr?.toString()
      });
    }
  });

  logger.info('Square sync scheduler started - runs every 15 minutes');
}

module.exports = { startSquareSyncScheduler };

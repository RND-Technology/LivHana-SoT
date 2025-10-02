const cron = require('node-cron');
const { execSync } = require('child_process');
const { createLogger } = require('../../common/logging');

const logger = createLogger('lightspeed-sync-scheduler');

// Run every 15 minutes: 0,15,30,45 * * * *
const SYNC_SCHEDULE = process.env.LIGHTSPEED_SYNC_SCHEDULE || '*/15 * * * *';

function startLightspeedSyncScheduler() {
  logger.info('Starting Lightspeed sync scheduler', { schedule: SYNC_SCHEDULE });

  cron.schedule(SYNC_SCHEDULE, () => {
    logger.info('Running scheduled Lightspeed → BigQuery sync');

    try {
      const output = execSync('node scripts/sync-lightspeed-to-bigquery.js', {
        cwd: __dirname + '/..',
        encoding: 'utf8',
        timeout: 300000 // 5 min timeout
      });

      logger.info('Lightspeed sync completed successfully', {
        output: output.trim().split('\n').slice(-5).join('\n') // Last 5 lines
      });
    } catch (error) {
      logger.error('Lightspeed sync failed', {
        error: error.message,
        stderr: error.stderr?.toString()
      });
    }
  });

  logger.info('Lightspeed sync scheduler started - runs every 15 minutes');
}

module.exports = { startLightspeedSyncScheduler };

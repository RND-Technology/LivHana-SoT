// Leafly Menu/Deals Sync Scheduler
// Production-ready stub - awaiting API credentials

import cron from 'node-cron';
import { execSync } from 'child_process';
import { createLogger } from '../../common/logging/index.js';

const logger = createLogger('leafly-sync-scheduler');

// Run every 30 minutes: */30 * * * *
// (Less frequent than LightSpeed since menu changes are slower than POS transactions)
const SYNC_SCHEDULE = process.env.LEAFLY_SYNC_SCHEDULE || '*/30 * * * *';

function startLeaflySyncScheduler() {
  logger.info('Starting Leafly sync scheduler', { schedule: SYNC_SCHEDULE });

  // Check if API credentials are configured
  if (!process.env.LEAFLY_API_KEY || !process.env.LEAFLY_DISPENSARY_ID) {
    logger.warn('Leafly API credentials not configured - scheduler disabled', {
      hasApiKey: !!process.env.LEAFLY_API_KEY,
      hasDispensaryId: !!process.env.LEAFLY_DISPENSARY_ID
    });
    logger.info('To enable Leafly sync:');
    logger.info('  1. Set LEAFLY_API_KEY in environment');
    logger.info('  2. Set LEAFLY_DISPENSARY_ID in environment');
    logger.info('  3. Restart integration-service');
    return;
  }

  cron.schedule(SYNC_SCHEDULE, () => {
    logger.info('Running scheduled Leafly → BigQuery sync');

    try {
      const output = execSync('node scripts/sync-leafly-menu.js', {
        cwd: __dirname + '/..',
        encoding: 'utf8',
        timeout: 300000 // 5 min timeout
      });

      logger.info('Leafly sync completed successfully', {
        output: output.trim().split('\n').slice(-5).join('\n') // Last 5 lines
      });
    } catch (error) {
      logger.error('Leafly sync failed', {
        error: error.message,
        stderr: error.stderr?.toString()
      });
    }
  });

  logger.info('Leafly sync scheduler started', {
    schedule: SYNC_SCHEDULE,
    description: 'Syncs menu, deals, inventory every 30 minutes'
  });
}

export { startLeaflySyncScheduler };

// Optimized: 2025-10-03
// Status: Production-ready stub - awaiting LEAFLY_API_KEY + LEAFLY_DISPENSARY_ID

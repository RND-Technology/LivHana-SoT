#!/usr/bin/env node

/**
 * Self-Improvement Cycle Cron Job
 * Run this script on a schedule to trigger improvement analysis
 *
 * Usage:
 *   node scripts/run-improvement-cycle.js [options]
 *
 * Options:
 *   --type=<type>    Type of analysis: daily|weekly|monthly|full (default: daily)
 *   --auto-execute   Automatically execute approved improvements
 *   --dry-run        Don't make any changes, just analyze
 */

import 'dotenv/config';
import pino from 'pino';
import { createSelfImprovementLoop } from '../src/self-improvement-loop.js';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  type: 'daily',
  autoExecute: false,
  dryRun: false,
};

for (const arg of args) {
  if (arg.startsWith('--type=')) {
    options.type = arg.split('=')[1];
  } else if (arg === '--auto-execute') {
    options.autoExecute = true;
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  }
}

async function main() {
  logger.info({ options }, 'Starting improvement cycle');

  let improvementLoop;

  try {
    // Create improvement loop
    improvementLoop = await createSelfImprovementLoop({ logger });

    // Run appropriate cycle based on type
    let results;

    switch (options.type) {
      case 'daily':
        logger.info('Running daily improvement cycle');
        results = await improvementLoop.runImprovementCycle();
        break;

      case 'weekly': {
        logger.info('Running weekly improvement cycle');
        results = await improvementLoop.runImprovementCycle();
        const weeklyReport = await improvementLoop.generateWeeklyReport();
        results.weeklyReport = weeklyReport;
        break;
      }

      case 'monthly':
        logger.info('Running monthly refactoring analysis');
        results = await improvementLoop.generateMonthlyRefactoringReport();
        break;

      case 'full': {
        logger.info('Running full improvement analysis');
        results = await improvementLoop.runImprovementCycle();
        const fullReport = await improvementLoop.getMetricsDashboard();
        results.dashboard = fullReport;
        break;
      }

      default:
        throw new Error(`Unknown cycle type: ${options.type}`);
    }

    // Log summary
    logger.info({
      type: options.type,
      proposalsGenerated: results.proposals?.length || 0,
      learning: results.learning?.status,
      performance: results.performance?.status,
      codeQuality: results.codeQuality?.status,
      features: results.features?.status,
      bugs: results.bugs?.status,
    }, 'Improvement cycle completed');

    // Auto-execute if enabled and not dry-run
    if (options.autoExecute && !options.dryRun && results.proposals) {
      logger.info('Auto-executing eligible proposals');

      for (const proposal of results.proposals) {
        // Only auto-execute low-risk proposals
        if (
          proposal.autoFixEligible &&
          !proposal.requiresApproval &&
          proposal.priority !== 'critical'
        ) {
          try {
            logger.info({ proposalId: proposal.id }, 'Auto-executing proposal');
            await improvementLoop.executeApprovedImprovement(proposal.id);
            logger.info({ proposalId: proposal.id }, 'Proposal executed successfully');
          } catch (error) {
            logger.error({
              proposalId: proposal.id,
              error: error.message,
            }, 'Failed to auto-execute proposal');
          }
        }
      }
    }

    // Get final metrics
    const metrics = await improvementLoop.getMetricsDashboard();
    logger.info({ metrics }, 'Current improvement metrics');

    // Exit successfully
    await improvementLoop.shutdown();
    process.exit(0);
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Improvement cycle failed');

    if (improvementLoop) {
      await improvementLoop.shutdown();
    }

    process.exit(1);
  }
}

// Run
main();
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02

#!/usr/bin/env node

/**
 * CHEETAH OBSERVER
 *
 * Watches Cheetah's implementation every 30 seconds
 * Learns patterns, monitors health, tracks progress
 */

import { chromium } from 'playwright';

const SERVICE_URL = 'http://localhost:8080';
const INTERVAL_MS = 30000; // 30 seconds

async function observeCheetah() {
  console.log('🐆 CHEETAH OBSERVER STARTED');
  console.log(`📡 Monitoring ${SERVICE_URL} every 30 seconds\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let iteration = 1;

  async function snapshot() {
    const timestamp = new Date().toISOString();
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔍 OBSERVATION #${iteration} - ${timestamp}`);
    console.log('='.repeat(80));

    try {
      // Check /__selftest endpoint
      console.log('\n📊 Self-Test Status:');
      const selfTestResponse = await page.goto(`${SERVICE_URL}/__selftest`, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      if (selfTestResponse) {
        const selfTestData = await selfTestResponse.json();
        console.log(`   Status: ${selfTestData.status}`);
        console.log(`   Safe Mode: ${selfTestData.safeMode}`);
        console.log(`   Summary: ${JSON.stringify(selfTestData.summary)}`);

        if (selfTestData.subsystems) {
          console.log('\n   Subsystems:');
          for (const [name, status] of Object.entries(selfTestData.subsystems)) {
            const emoji = status.status === 'ok' ? '✅' :
                         status.status === 'degraded' ? '⚠️' : '❌';
            console.log(`   ${emoji} ${name}: ${status.status} - ${status.message}`);
          }
        }
      }

      // Check /health endpoint
      console.log('\n❤️  Health Check:');
      const healthResponse = await page.goto(`${SERVICE_URL}/health`, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      if (healthResponse) {
        const healthData = await healthResponse.json();
        console.log(`   Status: ${healthData.status}`);
        console.log(`   Version: ${healthData.version}`);
        console.log(`   Safe Mode: ${healthData.safe_mode}`);

        if (healthData.services) {
          console.log('\n   Services:');
          for (const [name, status] of Object.entries(healthData.services)) {
            const emoji = status.healthy ? '✅' : '❌';
            console.log(`   ${emoji} ${name}: ${status.healthy ? 'healthy' : 'unhealthy'}`);
            if (status.error) {
              console.log(`      Error: ${status.error}`);
            }
          }
        }
      }

      // Check /api/v1/post-purchase/stats
      console.log('\n📈 Verification Stats:');
      const statsResponse = await page.goto(`${SERVICE_URL}/api/v1/post-purchase/stats`, {
        waitUntil: 'networkidle',
        timeout: 10000
      });

      if (statsResponse) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          const stats = statsData.stats;
          console.log(`   Total Orders: ${stats.totalOrders}`);
          console.log(`   Verified: ${stats.verified}`);
          console.log(`   Pending: ${stats.pending}`);
          console.log(`   Refunded: ${stats.refunded}`);
          console.log(`   Verification Rate: ${stats.verificationRate}%`);
          console.log(`   Membership Opt-ins: ${stats.membershipOptIns}`);
        }
      }

      console.log('\n✅ Observation complete');

    } catch (error) {
      console.log(`\n❌ Observation failed: ${error.message}`);
      console.log('   Cheetah service may not be running yet');
    }

    iteration++;
  }

  // Run first snapshot immediately
  await snapshot();

  // Schedule subsequent snapshots every 30 seconds
  const intervalId = setInterval(async () => {
    await snapshot();
  }, INTERVAL_MS);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Stopping observer...');
    clearInterval(intervalId);
    await browser.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n🛑 Stopping observer...');
    clearInterval(intervalId);
    await browser.close();
    process.exit(0);
  });
}

// Start observer
observeCheetah().catch((error) => {
  console.error('❌ Observer failed to start:', error.message);
  process.exit(1);
});

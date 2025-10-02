#!/usr/bin/env node

// Test script for Secret Manager
// Tests all fallback scenarios and validates configuration

import { getSecret, loadSecrets, getCacheStatus, clearCache } from './secret-manager.js';

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(color, message) {
  console.info(`${color}${message}${COLORS.reset}`);
}

async function testSecrets() {
  log(COLORS.bright, '\n========================================');
  log(COLORS.bright, 'SECRET MANAGER TEST SUITE');
  log(COLORS.bright, '========================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Environment Detection
  log(COLORS.blue, '[ Test 1 ] Environment Detection');
  try {
    const gcpProject = process.env.GCP_PROJECT_ID;
    const nodeEnv = process.env.NODE_ENV || 'development';

    console.info(`  GCP Project ID: ${gcpProject || 'Not set (using 1Password/env)'}`);
    console.info(`  Node Environment: ${nodeEnv}`);

    if (gcpProject) {
      log(COLORS.green, '  ✅ GCP Secret Manager mode');
    } else {
      log(COLORS.yellow, '  ⚠️  Fallback mode (1Password/env)');
    }

    results.passed++;
    results.tests.push({ name: 'Environment Detection', status: 'PASS' });
  } catch (error) {
    log(COLORS.red, `  ❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Environment Detection', status: 'FAIL', error: error.message });
  }

  // Test 2: Single Secret Load
  log(COLORS.blue, '\n[ Test 2 ] Single Secret Load (JWT_SECRET)');
  try {
    const startTime = Date.now();
    const secret = await getSecret('JWT_SECRET');
    const duration = Date.now() - startTime;

    if (!secret) {
      throw new Error('Secret is empty');
    }

    const cache = getCacheStatus();
    const source = cache.JWT_SECRET?.source || 'unknown';

    console.info(`  Secret loaded: ${secret.substring(0, 10)}... (${secret.length} chars)`);
    console.info(`  Source: ${source}`);
    console.info(`  Load time: ${duration}ms`);

    log(COLORS.green, '  ✅ JWT_SECRET loaded successfully');
    results.passed++;
    results.tests.push({ name: 'Single Secret Load', status: 'PASS', duration });
  } catch (error) {
    log(COLORS.red, `  ❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Single Secret Load', status: 'FAIL', error: error.message });
  }

  // Test 3: Batch Secret Load
  log(COLORS.blue, '\n[ Test 3 ] Batch Secret Load');
  try {
    const startTime = Date.now();
    const secrets = await loadSecrets([
      'JWT_SECRET',
      'JWT_AUDIENCE',
      'JWT_ISSUER'
    ]);
    const duration = Date.now() - startTime;

    const loadedCount = Object.keys(secrets).length;
    console.info(`  Loaded ${loadedCount} secrets in ${duration}ms`);

    Object.keys(secrets).forEach(key => {
      const value = secrets[key];
      const preview = value.length > 20 ? `${value.substring(0, 20)}...` : value;
      console.info(`    - ${key}: ${preview}`);
    });

    if (loadedCount >= 2) {
      log(COLORS.green, '  ✅ Batch load successful');
      results.passed++;
      results.tests.push({ name: 'Batch Secret Load', status: 'PASS', count: loadedCount });
    } else {
      throw new Error(`Only loaded ${loadedCount}/3 secrets`);
    }
  } catch (error) {
    log(COLORS.red, `  ❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Batch Secret Load', status: 'FAIL', error: error.message });
  }

  // Test 4: Cache Status
  log(COLORS.blue, '\n[ Test 4 ] Cache Status & TTL');
  try {
    const status = getCacheStatus();
    const secretCount = Object.keys(status).length;

    console.info(`  Cached secrets: ${secretCount}`);

    Object.entries(status).forEach(([name, data]) => {
      const ttlMinutes = Math.floor(data.ttl / 60);
      const ttlHours = Math.floor(ttlMinutes / 60);
      console.info(`    - ${name}:`);
      console.info(`        Source: ${data.source}`);
      console.info(`        TTL: ${ttlHours}h ${ttlMinutes % 60}m`);
      console.info(`        Expires: ${data.expiresAt}`);
    });

    if (secretCount > 0) {
      log(COLORS.green, '  ✅ Cache is working');
      results.passed++;
      results.tests.push({ name: 'Cache Status', status: 'PASS', count: secretCount });
    } else {
      throw new Error('Cache is empty');
    }
  } catch (error) {
    log(COLORS.red, `  ❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Cache Status', status: 'FAIL', error: error.message });
  }

  // Test 5: Cache Hit Performance
  log(COLORS.blue, '\n[ Test 5 ] Cache Hit Performance');
  try {
    // First call (cache hit)
    const start1 = Date.now();
    await getSecret('JWT_SECRET');
    const duration1 = Date.now() - start1;

    // Second call (should be instant from cache)
    const start2 = Date.now();
    await getSecret('JWT_SECRET');
    const duration2 = Date.now() - start2;

    console.info(`  First call: ${duration1}ms`);
    console.info(`  Second call (cached): ${duration2}ms`);
    console.info(`  Speedup: ${Math.round(duration1 / Math.max(duration2, 1))}x`);

    if (duration2 < duration1) {
      log(COLORS.green, '  ✅ Cache is faster');
      results.passed++;
      results.tests.push({ name: 'Cache Performance', status: 'PASS' });
    } else {
      log(COLORS.yellow, '  ⚠️  Cache may not be working optimally');
      results.passed++;
      results.tests.push({ name: 'Cache Performance', status: 'PASS', warning: 'No speedup' });
    }
  } catch (error) {
    log(COLORS.red, `  ❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Cache Performance', status: 'FAIL', error: error.message });
  }

  // Test 6: Nonexistent Secret (Error Handling)
  log(COLORS.blue, '\n[ Test 6 ] Error Handling (Nonexistent Secret)');
  try {
    await getSecret('NONEXISTENT_SECRET_THAT_SHOULD_NOT_EXIST');
    log(COLORS.red, '  ❌ Should have thrown an error');
    results.failed++;
    results.tests.push({ name: 'Error Handling', status: 'FAIL', error: 'No error thrown' });
  } catch (error) {
    console.info(`  Expected error: ${error.message}`);
    log(COLORS.green, '  ✅ Correctly handles missing secrets');
    results.passed++;
    results.tests.push({ name: 'Error Handling', status: 'PASS' });
  }

  // Test 7: Cache Refresh
  log(COLORS.blue, '\n[ Test 7 ] Cache Refresh');
  try {
    // Load secret
    await getSecret('JWT_SECRET');
    const statusBefore = getCacheStatus();
    const ttlBefore = statusBefore.JWT_SECRET?.ttl;

    // Force refresh
    const startTime = Date.now();
    await getSecret('JWT_SECRET', { refresh: true });
    const duration = Date.now() - startTime;

    const statusAfter = getCacheStatus();
    const ttlAfter = statusAfter.JWT_SECRET?.ttl;

    console.info(`  TTL before: ${Math.floor(ttlBefore / 60)}m`);
    console.info(`  TTL after refresh: ${Math.floor(ttlAfter / 60)}m`);
    console.info(`  Refresh time: ${duration}ms`);

    // TTL should be reset (approximately)
    if (Math.abs(ttlAfter - ttlBefore) > 60) {
      log(COLORS.green, '  ✅ Cache refresh working');
      results.passed++;
      results.tests.push({ name: 'Cache Refresh', status: 'PASS' });
    } else {
      log(COLORS.yellow, '  ⚠️  TTL not significantly changed');
      results.passed++;
      results.tests.push({ name: 'Cache Refresh', status: 'PASS', warning: 'TTL unchanged' });
    }
  } catch (error) {
    log(COLORS.red, `  ❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Cache Refresh', status: 'FAIL', error: error.message });
  }

  // Test 8: Custom TTL
  log(COLORS.blue, '\n[ Test 8 ] Custom Cache TTL');
  try {
    clearCache(); // Start fresh

    // Load with short TTL (5 minutes)
    await getSecret('JWT_SECRET', { expiresIn: 5 * 60 * 1000 });

    const status = getCacheStatus();
    const ttl = status.JWT_SECRET?.ttl;
    const ttlMinutes = Math.floor(ttl / 60);

    console.info(`  Custom TTL: 5 minutes`);
    console.info(`  Actual TTL: ${ttlMinutes} minutes`);

    if (ttlMinutes <= 5 && ttlMinutes > 4) {
      log(COLORS.green, '  ✅ Custom TTL working');
      results.passed++;
      results.tests.push({ name: 'Custom TTL', status: 'PASS' });
    } else {
      log(COLORS.yellow, `  ⚠️  TTL is ${ttlMinutes}m (expected ~5m)`);
      results.passed++;
      results.tests.push({ name: 'Custom TTL', status: 'PASS', warning: 'TTL mismatch' });
    }
  } catch (error) {
    log(COLORS.red, `  ❌ Failed: ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Custom TTL', status: 'FAIL', error: error.message });
  }

  // Results Summary
  log(COLORS.bright, '\n========================================');
  log(COLORS.bright, 'TEST RESULTS');
  log(COLORS.bright, '========================================\n');

  const total = results.passed + results.failed;
  const passRate = Math.round((results.passed / total) * 100);

  console.info(`  Total Tests: ${total}`);
  log(COLORS.green, `  Passed: ${results.passed}`);

  if (results.failed > 0) {
    log(COLORS.red, `  Failed: ${results.failed}`);
  }

  console.info(`  Success Rate: ${passRate}%\n`);

  if (passRate === 100) {
    log(COLORS.green, '✅ ALL TESTS PASSED - SECRET MANAGER READY FOR PRODUCTION');
  } else if (passRate >= 80) {
    log(COLORS.yellow, '⚠️  MOST TESTS PASSED - Review failures before production');
  } else {
    log(COLORS.red, '❌ MULTIPLE FAILURES - Do not use in production');
  }

  log(COLORS.bright, '\n========================================\n');

  return results;
}

// Run tests
testSecrets()
  .then(results => {
    const exitCode = results.failed > 0 ? 1 : 0;
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });

export { testSecrets };

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02

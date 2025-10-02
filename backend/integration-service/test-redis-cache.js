#!/usr/bin/env node
/**
 * Redis Cache Implementation Test
 *
 * Tests the Redis-backed BigQuery cache with monitoring
 */

require('dotenv').config();
const { createClient } = require('redis');
const { createLogger } = require('../common/logging');

const logger = createLogger('cache-test');

async function testRedisConnection() {
  logger.info('Testing Redis connection...');

  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT || 6379),
    }
  });

  try {
    await client.connect();
    logger.info('Redis connection successful');

    // Test write
    const testKey = 'bigquery:cache:test';
    const testValue = { timestamp: Date.now(), message: 'Cache test successful' };
    await client.setEx(testKey, 60, JSON.stringify(testValue));
    logger.info({ testKey }, 'Test value written to Redis');

    // Test read
    const retrieved = await client.get(testKey);
    const parsed = JSON.parse(retrieved);
    logger.info({ retrieved: parsed }, 'Test value retrieved from Redis');

    // Test TTL
    const ttl = await client.ttl(testKey);
    logger.info({ ttl }, 'TTL retrieved');

    // Cleanup
    await client.del(testKey);
    logger.info('Test cleanup completed');

    await client.quit();
    return true;
  } catch (error) {
    logger.error({ error: error.message }, 'Redis connection failed');
    return false;
  }
}

async function testCacheEndpoints() {
  logger.info('Testing cache endpoints...');

  const baseUrl = `http://localhost:${process.env.PORT || 3005}`;

  try {
    // Test cache stats endpoint
    const response = await fetch(`${baseUrl}/api/bigquery/cache-stats`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const stats = await response.json();
    logger.info({ stats }, 'Cache stats retrieved');

    // Validate stats structure
    if (!stats.cache || !stats.config) {
      throw new Error('Invalid cache stats structure');
    }

    logger.info({
      backend: stats.cache.backend,
      hitRate: stats.cache.hitRate,
      avgResponseTime: stats.cache.avgResponseTimeMs
    }, 'Cache performance metrics');

    return true;
  } catch (error) {
    logger.error({ error: error.message }, 'Cache endpoint test failed');
    return false;
  }
}

async function testCachePerformance() {
  logger.info('Testing cache performance...');

  const baseUrl = `http://localhost:${process.env.PORT || 3005}`;
  const iterations = 10;
  const times = [];

  try {
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      const response = await fetch(`${baseUrl}/api/bigquery/dashboard`);
      const elapsed = Date.now() - start;
      times.push(elapsed);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info({
        iteration: i + 1,
        elapsed,
        cached: data.cached,
        mode: data.mode
      }, 'Dashboard request completed');

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    logger.info({
      iterations,
      avgTime: `${avgTime.toFixed(2)}ms`,
      minTime: `${minTime}ms`,
      maxTime: `${maxTime}ms`,
      improvement: minTime < maxTime ? `${((1 - minTime/maxTime) * 100).toFixed(2)}%` : 'N/A'
    }, 'Performance test completed');

    return true;
  } catch (error) {
    logger.error({ error: error.message }, 'Performance test failed');
    return false;
  }
}

async function main() {
  logger.info('Starting Redis cache implementation tests...');
  logger.info({
    redisHost: process.env.REDIS_HOST || '127.0.0.1',
    redisPort: process.env.REDIS_PORT || 6379,
    cacheTTL: process.env.BQ_CACHE_TTL_MS || 30000,
    staleRevalidate: process.env.BQ_STALE_REVALIDATE_MS || 60000
  }, 'Configuration');

  let passed = 0;
  let failed = 0;

  // Test 1: Redis Connection
  logger.info('');
  logger.info('=== TEST 1: Redis Connection ===');
  if (await testRedisConnection()) {
    passed++;
    logger.info('✓ Redis connection test PASSED');
  } else {
    failed++;
    logger.error('✗ Redis connection test FAILED');
  }

  // Test 2: Cache Endpoints (requires service to be running)
  logger.info('');
  logger.info('=== TEST 2: Cache Endpoints ===');
  logger.info('Note: This test requires the integration-service to be running on port', process.env.PORT || 3005);
  if (await testCacheEndpoints()) {
    passed++;
    logger.info('✓ Cache endpoints test PASSED');
  } else {
    failed++;
    logger.error('✗ Cache endpoints test FAILED - Make sure integration-service is running');
  }

  // Test 3: Cache Performance
  logger.info('');
  logger.info('=== TEST 3: Cache Performance ===');
  if (await testCachePerformance()) {
    passed++;
    logger.info('✓ Cache performance test PASSED');
  } else {
    failed++;
    logger.error('✗ Cache performance test FAILED');
  }

  // Summary
  logger.info('');
  logger.info('=================================');
  logger.info('TEST SUMMARY');
  logger.info('=================================');
  logger.info(`Total Tests: ${passed + failed}`);
  logger.info(`Passed: ${passed}`);
  logger.info(`Failed: ${failed}`);
  logger.info('=================================');

  if (failed === 0) {
    logger.info('ALL TESTS PASSED! Redis cache implementation is working correctly.');
  } else {
    logger.warn(`${failed} test(s) failed. Check the logs above for details.`);
  }

  process.exit(failed === 0 ? 0 : 1);
}

main().catch(error => {
  logger.error({ error: error.message }, 'Test suite failed');
  process.exit(1);
});

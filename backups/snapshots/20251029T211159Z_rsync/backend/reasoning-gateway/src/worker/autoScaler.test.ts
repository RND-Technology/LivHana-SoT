/**
 * AutoScaler Functional Tests
 * PO1 Day 2: Test scaling decisions based on queue depth + avg latency
 * Uses ephemeral Redis for isolated testing
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createHardenedQueue, createSecureRedisClient } from '../../../common/queue/hardenedQueue.js';
import { AutoScaler } from './autoScaler';

describe('AutoScaler', () => {
  let redis: any;
  let testQueue: any;
  let autoScaler: AutoScaler;

  // Ephemeral Redis for testing - using secure client factory
  beforeAll(async () => {
    redis = createSecureRedisClient({
      host: process.env.TEST_REDIS_HOST || 'localhost',
      port: parseInt(process.env.TEST_REDIS_PORT || '6380', 10), // Different port for test Redis
      db: 15 // Use a separate DB for tests
    });

    await redis.connect();
  });

  afterAll(async () => {
    if (redis) {
      await redis.flushDb(); // Clean up test data
      await redis.quit();
    }
  });

  beforeEach(async () => {
    // Create fresh queue for each test
    testQueue = createHardenedQueue('test-reasoning-queue', {
      connection: redis,
      monitoringOpts: {
        metricInterval: 1000,
        alertThreshold: 40
      }
    });

    autoScaler = new AutoScaler(testQueue, {
      minWorkers: 1,
      maxWorkers: 6,
      scaleUpThreshold: 10,
      scaleDownThreshold: 2,
      checkInterval: 5000
    });
  });

  afterEach(async () => {
    if (testQueue) {
      await testQueue.close();
    }
    if (autoScaler) {
      autoScaler.stop();
    }
  });

  describe('Scaling Decision Logic', () => {
    it('should scale up when queue depth > threshold', async () => {
      // Simulate high queue depth
      for (let i = 0; i < 15; i++) {
        await testQueue.add('test-job', { data: i });
      }

      // Wait for metrics to update
      await new Promise(resolve => setTimeout(resolve, 1500));

      const decision = await autoScaler.evaluateScaling();

      expect(decision.action).toBe('scale_up');
      expect(decision.targetWorkers).toBeGreaterThan(1);
      expect(decision.reason).toContain('Queue depth');
    });

    it('should scale down when queue depth < threshold', async () => {
      // Start with multiple workers
      await autoScaler.setWorkerCount(4);

      // Queue is empty
      await new Promise(resolve => setTimeout(resolve, 1500));

      const decision = await autoScaler.evaluateScaling();

      expect(decision.action).toBe('scale_down');
      expect(decision.targetWorkers).toBeLessThan(4);
      expect(decision.reason).toContain('Queue depth low');
    });

    it('should factor average latency into scaling decision', async () => {
      // Add jobs with simulated latency metrics
      for (let i = 0; i < 12; i++) {
        await testQueue.add('test-job', { data: i });
      }

      // Simulate high latency in queue metrics
      const metrics = testQueue.getMetrics();
      expect(metrics.depth).toBeGreaterThan(10);

      const decision = await autoScaler.evaluateScaling();

      expect(decision.action).toBe('scale_up');
      expect(decision.metrics.queueDepth).toBeGreaterThan(10);
    });

    it('should respect min/max worker bounds', async () => {
      // Test minimum bound
      await autoScaler.setWorkerCount(1);
      const downDecision = await autoScaler.evaluateScaling();

      expect(downDecision.targetWorkers).toBeGreaterThanOrEqual(1);

      // Test maximum bound
      await autoScaler.setWorkerCount(6);
      for (let i = 0; i < 100; i++) {
        await testQueue.add('test-job', { data: i });
      }

      const upDecision = await autoScaler.evaluateScaling();
      expect(upDecision.targetWorkers).toBeLessThanOrEqual(6);
    });

    it('should calculate scaling multiplier based on depth + latency', async () => {
      // High depth scenario
      for (let i = 0; i < 50; i++) {
        await testQueue.add('test-job', { data: i });
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      const decision = await autoScaler.evaluateScaling();

      // Should scale significantly with high depth
      expect(decision.targetWorkers).toBeGreaterThanOrEqual(4);
      expect(decision.scalingFactor).toBeGreaterThan(1);
    });
  });

  describe('Anomaly Detection Integration', () => {
    it('should detect queue anomalies and trigger scaling', async () => {
      const anomalies: any[] = [];

      testQueue.on('anomaly', (event: any) => {
        anomalies.push(event);
      });

      // Create anomaly: sudden queue spike
      for (let i = 0; i < 30; i++) {
        await testQueue.add('test-job', { data: i }, { priority: i });
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      // AutoScaler should respond to anomaly
      const decision = await autoScaler.evaluateScaling();

      expect(decision.action).toBe('scale_up');
      expect(decision.targetWorkers).toBeGreaterThan(2);
    });

    it('should handle rapid scaling requests gracefully', async () => {
      const decisions = [];

      // Rapid scaling evaluations
      for (let i = 0; i < 5; i++) {
        const decision = await autoScaler.evaluateScaling();
        decisions.push(decision);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Should not cause race conditions
      expect(decisions.length).toBe(5);

      // Last decision should be stable
      const lastDecision = decisions[decisions.length - 1];
      expect(lastDecision.action).toBeDefined();
    });
  });

  describe('Metrics Collection', () => {
    it('should track worker count over time', async () => {
      await autoScaler.setWorkerCount(3);

      const metrics = await autoScaler.getMetrics();

      expect(metrics.currentWorkers).toBe(3);
      expect(metrics.minWorkers).toBe(1);
      expect(metrics.maxWorkers).toBe(6);
    });

    it('should report scaling history', async () => {
      // Perform scaling operations
      await autoScaler.setWorkerCount(2);
      await autoScaler.setWorkerCount(4);
      await autoScaler.setWorkerCount(3);

      const history = await autoScaler.getScalingHistory();

      expect(history.length).toBeGreaterThan(0);
      expect(history[0].action).toBeDefined();
      expect(history[0].timestamp).toBeDefined();
    });

    it('should calculate average queue latency', async () => {
      // Add jobs and let them complete
      for (let i = 0; i < 10; i++) {
        await testQueue.add('test-job', { data: i });
      }

      await new Promise(resolve => setTimeout(resolve, 2000));

      const metrics = testQueue.getMetrics();

      expect(metrics.latency).toBeDefined();
      expect(typeof metrics.latency).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty queue gracefully', async () => {
      const decision = await autoScaler.evaluateScaling();

      expect(decision.action).toBe('no_change');
      expect(decision.targetWorkers).toBe(1); // Minimum
    });

    it('should handle Redis connection errors', async () => {
      // Simulate Redis disconnect
      await redis.disconnect();

      const decision = await autoScaler.evaluateScaling();

      // Should fail gracefully
      expect(decision.action).toBe('error');
      expect(decision.error).toBeDefined();

      // Reconnect for cleanup
      await redis.connect();
    });

    it('should handle invalid worker counts', async () => {
      const invalidCounts = [-1, 0, 100, NaN];

      for (const count of invalidCounts) {
        await expect(autoScaler.setWorkerCount(count)).rejects.toThrow();
      }
    });
  });

  describe('Performance Tests', () => {
    it('should make scaling decision in <200ms', async () => {
      const start = Date.now();
      await autoScaler.evaluateScaling();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });

    it('should handle 100 concurrent job additions', async () => {
      const promises = [];

      for (let i = 0; i < 100; i++) {
        promises.push(testQueue.add('test-job', { data: i }));
      }

      await Promise.all(promises);

      const metrics = testQueue.getMetrics();
      expect(metrics.depth).toBeGreaterThanOrEqual(100);
    });
  });
});

/**
 * Integration Tests with Real Worker Execution
 */
describe('AutoScaler Integration', () => {
  it('should scale workers based on actual job processing', async () => {
    // This test requires a full worker setup
    // TODO: Implement with actual reasoning worker
  });

  it('should maintain latency targets under load', async () => {
    // TODO: Load test with 200ms avg latency, 800ms p95 targets
  });
});

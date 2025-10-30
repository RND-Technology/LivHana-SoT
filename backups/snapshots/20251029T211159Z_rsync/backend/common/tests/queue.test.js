import { jest } from '@jest/globals';
import { Queue } from 'bullmq';
import { createHardenedQueue, queueMonitor } from '../queue/hardenedQueue.js';
import queueHealthMonitor from '../health/QueueHealthMonitor.js';

// Mock Redis for testing
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    on: jest.fn(),
    quit: jest.fn()
  }))
}));

describe('Queue System Tests', () => {
  let queue;
  const TEST_QUEUE = 'test-queue';

  beforeEach(async () => {
    // Create queue with test config
    queue = createHardenedQueue(TEST_QUEUE, {
      connection: {
        host: process.env.TEST_REDIS_HOST || 'localhost',
        port: parseInt(process.env.TEST_REDIS_PORT || '6379'),
        maxRetriesPerRequest: 1
      },
      rateLimitOpts: {
        max: 10,
        interval: 1000
      }
    });
  });

  afterEach(async () => {
    await queue.close();
  });

  describe('Queue Factory', () => {
    test('creates hardened queue with rate limiting', async () => {
      // Add jobs up to rate limit
      const jobs = [];
      for (let i = 0; i < 10; i++) {
        jobs.push(queue.add('test', { data: i }));
      }
      await Promise.all(jobs);

      // Next job should fail due to rate limit
      await expect(queue.add('test', { data: 'overflow' }))
        .rejects
        .toThrow('Rate limit exceeded');
    });

    test('tracks queue metrics', async () => {
      await queue.add('test', { data: 'metric-test' });
      
      const metrics = queue.getMetrics();
      expect(metrics).toHaveProperty('depth');
      expect(metrics).toHaveProperty('latency');
      expect(metrics).toHaveProperty('errors');
      expect(metrics).toHaveProperty('throughput');
    });
  });

  describe('Queue Health Monitoring', () => {
    test('detects high latency', async () => {
      const alerts = [];
      queueHealthMonitor.on('alert', (alert) => alerts.push(alert));

      // Mock high latency metrics
      jest.spyOn(queueMonitor, 'getQueueMetrics').mockImplementation(() => ({
        p95Latency: 1000, // Above 800ms threshold
        depth: 100,
        errors: 0,
        completed: 100
      }));

      await queueHealthMonitor.checkQueueHealth();

      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        type: 'health_check',
        status: 'degraded',
        issues: expect.arrayContaining([
          expect.objectContaining({
            type: 'high_latency'
          })
        ])
      });
    });

    test('detects high error rate', async () => {
      const alerts = [];
      queueHealthMonitor.on('alert', (alert) => alerts.push(alert));

      // Mock high error rate metrics
      jest.spyOn(queueMonitor, 'getQueueMetrics').mockImplementation(() => ({
        p95Latency: 100,
        depth: 100,
        errors: 10,
        completed: 90 // 10% error rate
      }));

      await queueHealthMonitor.checkQueueHealth();

      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        type: 'health_check',
        status: 'degraded',
        issues: expect.arrayContaining([
          expect.objectContaining({
            type: 'high_error_rate'
          })
        ])
      });
    });

    test('detects queue depth issues', async () => {
      const alerts = [];
      queueHealthMonitor.on('alert', (alert) => alerts.push(alert));

      // Mock high queue depth metrics
      jest.spyOn(queueMonitor, 'getQueueMetrics').mockImplementation(() => ({
        p95Latency: 100,
        depth: 1500, // Above 1000 threshold
        errors: 0,
        completed: 100
      }));

      await queueHealthMonitor.checkQueueHealth();

      expect(alerts).toHaveLength(1);
      expect(alerts[0]).toMatchObject({
        type: 'health_check',
        status: 'degraded',
        issues: expect.arrayContaining([
          expect.objectContaining({
            type: 'high_depth'
          })
        ])
      });
    });

    test('calculates anomaly scores', async () => {
      const anomalies = [];
      queueMonitor.on('anomaly', (anomaly) => anomalies.push(anomaly));

      // Simulate rapid metric changes
      const metrics = [
        { latency: 100, depth: 50, errors: 0 },
        { latency: 300, depth: 150, errors: 5 } // 3x latency, 3x depth increase
      ];

      metrics.forEach(metric => {
        queueMonitor.trackMetric(TEST_QUEUE, metric);
      });

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].score).toBeGreaterThan(40); // Above anomaly threshold
    });
  });

  describe('Integration Tests', () => {
    test('end-to-end job processing with monitoring', async () => {
      const jobData = { test: 'data' };
      const job = await queue.add('test', jobData);
      
      // Verify job was added
      expect(job.id).toBeDefined();
      
      // Check queue metrics were updated
      const metrics = queue.getMetrics();
      expect(metrics.depth).toBeGreaterThan(0);
      
      // Verify health monitoring
      const health = queueHealthMonitor.getQueueHealth(TEST_QUEUE);
      expect(health).toMatchObject({
        queueName: TEST_QUEUE,
        currentMetrics: expect.any(Object),
        status: expect.objectContaining({
          status: expect.any(String)
        })
      });
    });
  });
});

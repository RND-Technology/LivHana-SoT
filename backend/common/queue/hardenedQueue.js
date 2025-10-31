import { Queue, QueueEvents } from 'bullmq';
import { createClient } from 'redis';
import { EventEmitter } from 'events';

/**
 * Enhanced Queue Management Module
 * Provides hardened BullMQ queue factory with rate limiting, monitoring, and security
 */

class QueueMonitor extends EventEmitter {
  constructor() {
    super();
    this.metrics = new Map();
    this.anomalyThreshold = 40; // Configurable anomaly score threshold
  }

  trackMetric(queueName, metric) {
    if (!this.metrics.has(queueName)) {
      this.metrics.set(queueName, []);
    }
    const metrics = this.metrics.get(queueName);
    metrics.push({ ...metric, timestamp: Date.now() });
    
    // Keep last hour of metrics
    const oneHourAgo = Date.now() - 3600000;
    this.metrics.set(queueName, metrics.filter(m => m.timestamp > oneHourAgo));

    // Calculate anomaly score
    const anomalyScore = this.calculateAnomalyScore(queueName);
    if (anomalyScore > this.anomalyThreshold) {
      this.emit('anomaly', { queueName, score: anomalyScore, metrics: this.getQueueMetrics(queueName) });
    }
  }

  calculateAnomalyScore(queueName) {
    const metrics = this.metrics.get(queueName) || [];
    if (metrics.length < 2) return 0;

    // Calculate rate of change for key metrics
    const latest = metrics[metrics.length - 1];
    const previous = metrics[metrics.length - 2];
    
    const latencyDelta = (latest.latency - previous.latency) / previous.latency;
    const depthDelta = (latest.depth - previous.depth) / (previous.depth || 1);
    const errorDelta = (latest.errors - previous.errors) / (previous.errors || 1);

    // Weight the components (adjust weights based on importance)
    return Math.abs(latencyDelta * 0.4 + depthDelta * 0.3 + errorDelta * 0.3) * 100;
  }

  getQueueMetrics(queueName) {
    const metrics = this.metrics.get(queueName) || [];
    const latest = metrics[metrics.length - 1] || {};
    
    return {
      latency: latest.latency || 0,
      depth: latest.depth || 0,
      errors: latest.errors || 0,
      throughput: this.calculateThroughput(queueName),
      p95Latency: this.calculateP95Latency(queueName)
    };
  }

  calculateThroughput(queueName) {
    const metrics = this.metrics.get(queueName) || [];
    const recentMetrics = metrics.filter(m => m.timestamp > Date.now() - 60000);
    return recentMetrics.reduce((sum, m) => sum + m.completed, 0);
  }

  calculateP95Latency(queueName) {
    const metrics = this.metrics.get(queueName) || [];
    const latencies = metrics.map(m => m.latency).sort((a, b) => a - b);
    const idx = Math.floor(latencies.length * 0.95);
    return latencies[idx] || 0;
  }
}

// Singleton monitor instance
const monitor = new QueueMonitor();

// Enhanced Redis connection with TLS and ACL support
function createSecureRedisClient(config = {}) {
  const defaultConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
    maxRetriesPerRequest: null, // Required by BullMQ for blocking operations
    enableReadyCheck: true,
    retryStrategy: (times) => Math.min(times * 200, 2000)
  };

  return createClient({ ...defaultConfig, ...config });
}

/**
 * Create a hardened BullMQ queue with enhanced security, monitoring and rate limiting
 * @param {string} queueName - Name of the queue
 * @param {object} options - Queue configuration options
 * @returns {Queue} Hardened BullMQ Queue instance
 */
export function createHardenedQueue(queueName, options = {}) {
  const {
    // Redis connection options
    connection,
    // Rate limiting options
    rateLimitOpts = {
      max: 1000, // Max jobs per interval
      interval: 60000, // Interval in ms (1 minute)
    },
    // Job options
    jobOpts = {},
    // Monitoring options
    monitoringOpts = {
      metricInterval: 5000, // How often to collect metrics
      alertThreshold: 40 // Anomaly score threshold for alerts
    }
  } = options;

  // Create secure Redis connection
  const secureConnection = connection || createSecureRedisClient();

  // Create queue with hardened defaults
  const queue = new Queue(queueName, {
    connection: secureConnection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: {
        count: 100,
        age: 3600
      },
      removeOnFail: {
        count: 500
      },
      ...jobOpts
    }
  });

  // NOTE: QueueScheduler is deprecated in bullmq v3+, handled internally now
  // const scheduler = new QueueScheduler(queueName, { connection: secureConnection });

  // Set up events
  const events = new QueueEvents(queueName, { connection: secureConnection });

  // Rate limiting state
  let jobCount = 0;
  let lastReset = Date.now();

  // Monitor queue metrics
  const startMonitoring = () => {
    setInterval(async () => {
      try {
        const [jobs, workers] = await Promise.all([
          queue.getJobCounts(),
          queue.getWorkers()
        ]);

        const metrics = {
          depth: jobs.waiting + jobs.active,
          latency: await queue.getJobCountByTimestamp('completed'),
          errors: jobs.failed,
          completed: jobs.completed,
          workers: workers.length
        };

        monitor.trackMetric(queueName, metrics);
      } catch (err) {
        console.error(`Queue monitoring error: ${err.message}`);
      }
    }, monitoringOpts.metricInterval);
  };

  // Start monitoring
  startMonitoring();

  // Return wrapped queue with rate limiting
  return {
    async add(name, data, opts = {}) {
      // Rate limiting check
      const now = Date.now();
      if (now - lastReset >= rateLimitOpts.interval) {
        jobCount = 0;
        lastReset = now;
      }

      if (jobCount >= rateLimitOpts.max) {
        throw new Error(`Rate limit exceeded for queue ${queueName}`);
      }

      jobCount++;

      // Add job to queue
      return queue.add(name, data, opts);
    },

    // Pass through other queue methods
    getJob: (...args) => queue.getJob(...args),
    getJobs: (...args) => queue.getJobs(...args),
    getJobCounts: (...args) => queue.getJobCounts(...args),
    getMetrics: () => monitor.getQueueMetrics(queueName),
    
    // Event handling
    on: (event, handler) => {
      events.on(event, handler);
      return () => events.off(event, handler); // Return cleanup function
    },

    // Cleanup
    async close() {
      await Promise.all([
        queue.close(),
        events.close(),
        scheduler.close()
      ]);
    }
  };
}

// Export monitor and secure client for external use
export const queueMonitor = monitor;
export { createSecureRedisClient };

export default {
  createHardenedQueue,
  createSecureRedisClient,
  queueMonitor
};

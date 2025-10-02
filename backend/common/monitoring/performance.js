/**
 * Performance Monitoring
 * Tracks custom performance metrics, API response times, database queries, and job processing
 */

import { performance } from 'perf_hooks';

class PerformanceMonitor {
  constructor(logger) {
    this.logger = logger;
    this.metrics = new Map();
    this.timers = new Map();
    this.histograms = new Map();

    // Initialize metric collections
    this.initMetrics();
  }

  initMetrics() {
    // API metrics
    this.histograms.set('api_response_time', []);
    this.histograms.set('db_query_time', []);
    this.histograms.set('job_processing_time', []);
    this.histograms.set('external_api_time', []);

    // Counters
    this.metrics.set('api_requests_total', 0);
    this.metrics.set('api_errors_total', 0);
    this.metrics.set('db_queries_total', 0);
    this.metrics.set('db_errors_total', 0);
    this.metrics.set('jobs_processed_total', 0);
    this.metrics.set('jobs_failed_total', 0);
  }

  /**
   * Start a performance timer
   */
  startTimer(label) {
    const timerId = `${label}_${Date.now()}_${Math.random()}`;
    this.timers.set(timerId, performance.now());
    return timerId;
  }

  /**
   * End a performance timer and record the duration
   */
  endTimer(timerId, metricName, metadata = {}) {
    const startTime = this.timers.get(timerId);
    if (!startTime) {
      this.logger.warn({ timerId }, 'Timer not found');
      return null;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(timerId);

    // Record in histogram
    if (this.histograms.has(metricName)) {
      const histogram = this.histograms.get(metricName);
      histogram.push({
        duration,
        timestamp: Date.now(),
        ...metadata,
      });

      // Keep only last 1000 entries to prevent memory leaks
      if (histogram.length > 1000) {
        histogram.shift();
      }
    }

    // Log if duration exceeds threshold
    const thresholds = {
      api_response_time: 1000, // 1 second
      db_query_time: 500, // 500ms
      job_processing_time: 5000, // 5 seconds
      external_api_time: 2000, // 2 seconds
    };

    if (thresholds[metricName] && duration > thresholds[metricName]) {
      this.logger.warn(
        {
          metricName,
          duration: `${duration.toFixed(2)}ms`,
          threshold: `${thresholds[metricName]}ms`,
          ...metadata,
        },
        'Performance threshold exceeded'
      );
    }

    return duration;
  }

  /**
   * Record API request
   */
  recordApiRequest(method, path, statusCode, duration, metadata = {}) {
    this.incrementMetric('api_requests_total');

    if (statusCode >= 400) {
      this.incrementMetric('api_errors_total');
    }

    this.logger.info(
      {
        type: 'api_request',
        method,
        path,
        statusCode,
        duration: `${duration.toFixed(2)}ms`,
        ...metadata,
      },
      'API request completed'
    );
  }

  /**
   * Record database query
   */
  recordDbQuery(operation, table, duration, success = true, metadata = {}) {
    this.incrementMetric('db_queries_total');

    if (!success) {
      this.incrementMetric('db_errors_total');
    }

    if (duration > 500) {
      this.logger.warn(
        {
          type: 'slow_db_query',
          operation,
          table,
          duration: `${duration.toFixed(2)}ms`,
          ...metadata,
        },
        'Slow database query detected'
      );
    }
  }

  /**
   * Record job processing
   */
  recordJobProcessing(jobName, duration, success = true, metadata = {}) {
    this.incrementMetric('jobs_processed_total');

    if (!success) {
      this.incrementMetric('jobs_failed_total');
    }

    this.logger.info(
      {
        type: 'job_processed',
        jobName,
        duration: `${duration.toFixed(2)}ms`,
        success,
        ...metadata,
      },
      'Job processing completed'
    );
  }

  /**
   * Record external API call
   */
  recordExternalApiCall(service, endpoint, duration, success = true, metadata = {}) {
    if (duration > 2000) {
      this.logger.warn(
        {
          type: 'slow_external_api',
          service,
          endpoint,
          duration: `${duration.toFixed(2)}ms`,
          success,
          ...metadata,
        },
        'Slow external API call detected'
      );
    }
  }

  /**
   * Increment a counter metric
   */
  incrementMetric(name, value = 1) {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + value);
  }

  /**
   * Set a gauge metric
   */
  setMetric(name, value) {
    this.metrics.set(name, value);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    const metrics = {};

    // Convert counters
    for (const [key, value] of this.metrics.entries()) {
      metrics[key] = value;
    }

    // Calculate histogram statistics
    for (const [key, values] of this.histograms.entries()) {
      if (values.length === 0) {
        metrics[`${key}_count`] = 0;
        metrics[`${key}_avg`] = 0;
        metrics[`${key}_p50`] = 0;
        metrics[`${key}_p95`] = 0;
        metrics[`${key}_p99`] = 0;
        continue;
      }

      const durations = values.map((v) => v.duration).sort((a, b) => a - b);
      const count = durations.length;
      const sum = durations.reduce((acc, d) => acc + d, 0);

      metrics[`${key}_count`] = count;
      metrics[`${key}_avg`] = sum / count;
      metrics[`${key}_p50`] = this.percentile(durations, 0.5);
      metrics[`${key}_p95`] = this.percentile(durations, 0.95);
      metrics[`${key}_p99`] = this.percentile(durations, 0.99);
      metrics[`${key}_min`] = durations[0];
      metrics[`${key}_max`] = durations[count - 1];
    }

    return metrics;
  }

  /**
   * Calculate percentile from sorted array
   */
  percentile(sortedArray, p) {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil(sortedArray.length * p) - 1;
    return sortedArray[Math.max(0, index)];
  }

  /**
   * Get metrics summary for logging
   */
  getMetricsSummary() {
    const metrics = this.getMetrics();

    return {
      api: {
        total_requests: metrics.api_requests_total || 0,
        total_errors: metrics.api_errors_total || 0,
        error_rate: metrics.api_requests_total
          ? ((metrics.api_errors_total || 0) / metrics.api_requests_total * 100).toFixed(2) + '%'
          : '0%',
        avg_response_time: metrics.api_response_time_avg
          ? `${metrics.api_response_time_avg.toFixed(2)}ms`
          : '0ms',
        p95_response_time: metrics.api_response_time_p95
          ? `${metrics.api_response_time_p95.toFixed(2)}ms`
          : '0ms',
      },
      database: {
        total_queries: metrics.db_queries_total || 0,
        total_errors: metrics.db_errors_total || 0,
        avg_query_time: metrics.db_query_time_avg
          ? `${metrics.db_query_time_avg.toFixed(2)}ms`
          : '0ms',
      },
      jobs: {
        total_processed: metrics.jobs_processed_total || 0,
        total_failed: metrics.jobs_failed_total || 0,
        failure_rate: metrics.jobs_processed_total
          ? ((metrics.jobs_failed_total || 0) / metrics.jobs_processed_total * 100).toFixed(2) + '%'
          : '0%',
        avg_processing_time: metrics.job_processing_time_avg
          ? `${metrics.job_processing_time_avg.toFixed(2)}ms`
          : '0ms',
      },
    };
  }

  /**
   * Reset all metrics (useful for testing)
   */
  reset() {
    this.metrics.clear();
    this.timers.clear();
    this.histograms.clear();
    this.initMetrics();
  }

  /**
   * Create Express middleware for automatic API timing
   */
  expressMiddleware() {
    return (req, res, next) => {
      const timerId = this.startTimer(`api_${req.method}_${req.path}`);

      // Capture original end function
      const originalEnd = res.end;

      // Override end function
      res.end = (...args) => {
        // Restore original end
        res.end = originalEnd;

        // End timer and record metrics
        const duration = this.endTimer(timerId, 'api_response_time', {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
        });

        if (duration !== null) {
          this.recordApiRequest(
            req.method,
            req.path,
            res.statusCode,
            duration,
            {
              userAgent: req.get('user-agent'),
              ip: req.ip,
            }
          );
        }

        // Call original end
        return originalEnd.apply(res, args);
      };

      next();
    };
  }
}

// Singleton instance
let performanceMonitorInstance = null;

/**
 * Get or create performance monitor instance
 */
export function getPerformanceMonitor(logger) {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor(logger);
  }
  return performanceMonitorInstance;
}

/**
 * Create a new performance monitor instance (for testing)
 */
export function createPerformanceMonitor(logger) {
  return new PerformanceMonitor(logger);
}

export default PerformanceMonitor;

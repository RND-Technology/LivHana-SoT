/**
 * Prometheus Metrics Exporter
 * Provides /metrics endpoint in Prometheus format
 */

import promClient from 'prom-client';

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, event loop lag, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5], // 10ms to 5s
});

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1, 2], // 1ms to 2s
});

const dbQueriesTotal = new promClient.Counter({
  name: 'db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['operation', 'table', 'status'],
});

const jobProcessingDuration = new promClient.Histogram({
  name: 'job_processing_duration_seconds',
  help: 'Duration of job processing in seconds',
  labelNames: ['job_name', 'status'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60], // 100ms to 60s
});

const jobsProcessedTotal = new promClient.Counter({
  name: 'jobs_processed_total',
  help: 'Total number of jobs processed',
  labelNames: ['job_name', 'status'],
});

const queueDepth = new promClient.Gauge({
  name: 'queue_depth',
  help: 'Current depth of job queue',
  labelNames: ['queue_name'],
});

const externalApiDuration = new promClient.Histogram({
  name: 'external_api_duration_seconds',
  help: 'Duration of external API calls in seconds',
  labelNames: ['service', 'endpoint', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10], // 100ms to 10s
});

const externalApiCallsTotal = new promClient.Counter({
  name: 'external_api_calls_total',
  help: 'Total number of external API calls',
  labelNames: ['service', 'endpoint', 'status'],
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  labelNames: ['type'],
});

const cacheHitsTotal = new promClient.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_name'],
});

const cacheMissesTotal = new promClient.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_name'],
});

const businessMetrics = new promClient.Gauge({
  name: 'business_metric',
  help: 'Custom business metrics',
  labelNames: ['metric_name', 'unit'],
});

// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestsTotal);
register.registerMetric(dbQueryDuration);
register.registerMetric(dbQueriesTotal);
register.registerMetric(jobProcessingDuration);
register.registerMetric(jobsProcessedTotal);
register.registerMetric(queueDepth);
register.registerMetric(externalApiDuration);
register.registerMetric(externalApiCallsTotal);
register.registerMetric(activeConnections);
register.registerMetric(cacheHitsTotal);
register.registerMetric(cacheMissesTotal);
register.registerMetric(businessMetrics);

/**
 * Express middleware to track HTTP requests
 */
export function prometheusMiddleware() {
  return (req, res, next) => {
    const start = Date.now();

    // Capture original end function
    const originalEnd = res.end;

    // Override end function
    res.end = function (...args) {
      // Restore original end
      res.end = originalEnd;

      // Calculate duration
      const duration = (Date.now() - start) / 1000; // Convert to seconds

      // Record metrics
      const labels = {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode.toString(),
      };

      httpRequestDuration.observe(labels, duration);
      httpRequestsTotal.inc(labels);

      // Call original end
      return originalEnd.apply(this, args);
    };

    next();
  };
}

/**
 * Track database query
 */
export function trackDbQuery(operation, table, durationMs, success = true) {
  const duration = durationMs / 1000; // Convert to seconds
  const labels = {
    operation,
    table,
  };

  dbQueryDuration.observe(labels, duration);
  dbQueriesTotal.inc({
    ...labels,
    status: success ? 'success' : 'error',
  });
}

/**
 * Track job processing
 */
export function trackJobProcessing(jobName, durationMs, success = true) {
  const duration = durationMs / 1000; // Convert to seconds
  const status = success ? 'success' : 'failed';
  const labels = {
    job_name: jobName,
    status,
  };

  jobProcessingDuration.observe(labels, duration);
  jobsProcessedTotal.inc(labels);
}

/**
 * Update queue depth
 */
export function updateQueueDepth(queueName, depth) {
  queueDepth.set({ queue_name: queueName }, depth);
}

/**
 * Track external API call
 */
export function trackExternalApi(service, endpoint, durationMs, success = true) {
  const duration = durationMs / 1000; // Convert to seconds
  const status = success ? 'success' : 'error';
  const labels = {
    service,
    endpoint,
    status,
  };

  externalApiDuration.observe(labels, duration);
  externalApiCallsTotal.inc(labels);
}

/**
 * Update active connections
 */
export function updateActiveConnections(type, count) {
  activeConnections.set({ type }, count);
}

/**
 * Track cache hit
 */
export function trackCacheHit(cacheName) {
  cacheHitsTotal.inc({ cache_name: cacheName });
}

/**
 * Track cache miss
 */
export function trackCacheMiss(cacheName) {
  cacheMissesTotal.inc({ cache_name: cacheName });
}

/**
 * Set business metric
 */
export function setBusinessMetric(metricName, value, unit = '') {
  businessMetrics.set({ metric_name: metricName, unit }, value);
}

/**
 * Get metrics in Prometheus format
 */
export async function getMetrics() {
  return register.metrics();
}

/**
 * Get metrics as JSON (for debugging)
 */
export async function getMetricsJSON() {
  return register.getMetricsAsJSON();
}

/**
 * Create Express route handler for /metrics endpoint
 */
export function metricsHandler() {
  return async (req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      const metrics = await getMetrics();
      res.end(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate metrics' });
    }
  };
}

/**
 * Reset all metrics (useful for testing)
 */
export function resetMetrics() {
  register.resetMetrics();
}

export {
  register,
  httpRequestDuration,
  httpRequestsTotal,
  dbQueryDuration,
  dbQueriesTotal,
  jobProcessingDuration,
  jobsProcessedTotal,
  queueDepth,
  externalApiDuration,
  externalApiCallsTotal,
  activeConnections,
  cacheHitsTotal,
  cacheMissesTotal,
  businessMetrics,
};
// Last optimized: 2025-10-02

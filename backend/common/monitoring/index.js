/**
 * Monitoring Module - Centralized Exports
 * Provides all monitoring utilities in one place
 */

// Sentry Error Tracking
export {
  initSentry,
  sentryErrorHandler,
  sentryRequestHandler,
  sentryTracingHandler,
  captureException,
  captureMessage,
  addBreadcrumb,
  setUser,
  setTag,
  setContext,
  Sentry,
} from './sentry.js';

// Performance Monitoring
export {
  getPerformanceMonitor,
  createPerformanceMonitor,
} from './performance.js';

// Prometheus Metrics
export {
  prometheusMiddleware,
  metricsHandler,
  trackDbQuery,
  trackJobProcessing,
  updateQueueDepth,
  trackExternalApi,
  updateActiveConnections,
  trackCacheHit,
  trackCacheMiss,
  setBusinessMetric,
  getMetrics,
  getMetricsJSON,
  resetMetrics,
} from './prometheus.js';

// Health Checks
export {
  createHealthRouter,
  waitForDependencies,
  checkRedis,
  checkBigQuery,
  checkSquareApi,
  checkQueue,
  checkDatabase,
} from './health.js';

// Structured Logging (re-export from logging module)
export {
  createLogger,
  withRequestId,
  requestLogger,
  errorLogger,
} from '../logging/index.js';

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02

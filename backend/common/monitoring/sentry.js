/**
 * Sentry Error Tracking Configuration
 * Centralizes error tracking across all services
 */

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Initialize Sentry for error tracking and performance monitoring
 * @param {Object} options - Configuration options
 * @param {string} options.dsn - Sentry DSN from environment
 * @param {string} options.environment - Current environment (development, staging, production)
 * @param {string} options.serviceName - Service name for identification
 * @param {number} options.tracesSampleRate - Percentage of transactions to sample (0.0 - 1.0)
 * @param {number} options.profilesSampleRate - Percentage of profiles to sample (0.0 - 1.0)
 * @param {Function} options.beforeSend - Optional callback to modify/filter events before sending
 */
export function initSentry(options = {}) {
  const {
    dsn = process.env.SENTRY_DSN,
    environment = process.env.NODE_ENV || 'development',
    serviceName = 'unknown-service',
    tracesSampleRate = 0.1, // 10% in production to reduce costs
    profilesSampleRate = 0.1, // 10% profiling
    beforeSend = null,
  } = options;

  // Skip initialization if no DSN provided (local development)
  if (!dsn) {
    console.warn(`[${serviceName}] Sentry DSN not provided - error tracking disabled`);
    return null;
  }

  Sentry.init({
    dsn,
    environment,
    serverName: serviceName,

    // Performance Monitoring
    tracesSampleRate,
    profilesSampleRate,

    // Integrations
    integrations: [
      // Node profiling for performance insights
      nodeProfilingIntegration(),

      // HTTP instrumentation
      Sentry.httpIntegration(),

      // Express instrumentation (auto-detects if Express is used)
      Sentry.expressIntegration(),

      // Node fetch instrumentation
      Sentry.nativeNodeFetchIntegration(),
    ],

    // Release tracking
    release: process.env.GIT_COMMIT || 'unknown',

    // Custom tags
    initialScope: {
      tags: {
        service: serviceName,
        node_version: process.version,
      },
    },

    // Event filtering/modification
    beforeSend: beforeSend || defaultBeforeSend,

    // Debug mode (only in development)
    debug: environment === 'development',
  });

  console.log(`[${serviceName}] Sentry initialized for ${environment}`);
  return Sentry;
}

/**
 * Default beforeSend handler to filter/modify events
 */
function defaultBeforeSend(event, hint) {
  // Filter out common errors that are not actionable
  const ignoredErrors = [
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
  ];

  const error = hint.originalException;
  if (error && typeof error === 'object' && 'code' in error) {
    if (ignoredErrors.includes(error.code)) {
      return null; // Don't send to Sentry
    }
  }

  // Scrub sensitive data from event
  if (event.request) {
    // Remove authorization headers
    if (event.request.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }

    // Remove sensitive query params
    if (event.request.query_string) {
      event.request.query_string = event.request.query_string
        .replace(/token=[^&]*/gi, 'token=[REDACTED]')
        .replace(/api_key=[^&]*/gi, 'api_key=[REDACTED]')
        .replace(/password=[^&]*/gi, 'password=[REDACTED]');
    }
  }

  return event;
}

/**
 * Express error handler middleware
 * Must be registered AFTER all routes but BEFORE other error handlers
 */
export function sentryErrorHandler() {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all errors with status >= 500
      return error.status >= 500 || !error.status;
    },
  });
}

/**
 * Express request handler middleware
 * Must be registered BEFORE all routes
 */
export function sentryRequestHandler() {
  return Sentry.Handlers.requestHandler({
    ip: false, // Don't track IP addresses for privacy
    user: ['id', 'email'], // Only track user ID and email
  });
}

/**
 * Express tracing handler middleware
 * Must be registered BEFORE all routes
 */
export function sentryTracingHandler() {
  return Sentry.Handlers.tracingHandler();
}

/**
 * Capture exception manually
 */
export function captureException(error, context = {}) {
  Sentry.captureException(error, {
    level: 'error',
    extra: context,
  });
}

/**
 * Capture message manually
 */
export function captureMessage(message, level = 'info', context = {}) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Set user context
 */
export function setUser(user) {
  Sentry.setUser(user);
}

/**
 * Set custom tag
 */
export function setTag(key, value) {
  Sentry.setTag(key, value);
}

/**
 * Set custom context
 */
export function setContext(name, context) {
  Sentry.setContext(name, context);
}

export { Sentry };
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

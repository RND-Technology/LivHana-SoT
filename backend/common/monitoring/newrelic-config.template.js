/**
 * New Relic Configuration Template
 * Copy this to newrelic.js in your service root and configure
 */

'use strict';

module.exports = {
  /**
   * Application name(s)
   * Multiple names can be provided for grouping
   */
  app_name: [process.env.NEW_RELIC_APP_NAME || 'LivHana-Backend'],

  /**
   * Your New Relic license key
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,

  /**
   * Logging configuration
   */
  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
    filepath: 'stdout',
  },

  /**
   * Distributed tracing
   */
  distributed_tracing: {
    enabled: true,
  },

  /**
   * Application logging
   * Forwards application logs to New Relic
   */
  application_logging: {
    enabled: true,
    forwarding: {
      enabled: true,
      max_samples_stored: 10000,
    },
    metrics: {
      enabled: true,
    },
    local_decorating: {
      enabled: true,
    },
  },

  /**
   * Transaction tracer
   */
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    record_sql: 'obfuscated',
    explain_threshold: 500,
  },

  /**
   * Error collector
   */
  error_collector: {
    enabled: true,
    ignore_status_codes: [404],
    expected_messages: {
      'ValidationError': [],
      'UnauthorizedError': [],
    },
  },

  /**
   * Slow SQL
   */
  slow_sql: {
    enabled: true,
  },

  /**
   * Custom instrumentation
   */
  custom_insights_events: {
    enabled: true,
    max_samples_stored: 10000,
  },

  /**
   * Attributes
   */
  attributes: {
    enabled: true,
    include: [
      'request.parameters.*',
      'request.headers.referer',
      'request.headers.userAgent',
    ],
    exclude: [
      'request.headers.authorization',
      'request.headers.cookie',
      'request.parameters.password',
      'request.parameters.token',
      'request.parameters.api_key',
    ],
  },

  /**
   * Browser monitoring (for APIs serving HTML)
   */
  browser_monitoring: {
    enabled: false, // Disable for API services
  },

  /**
   * Transaction events
   */
  transaction_events: {
    enabled: true,
    max_samples_stored: 10000,
  },

  /**
   * Custom events
   */
  custom_events: {
    enabled: true,
    max_samples_stored: 10000,
  },

  /**
   * AI monitoring
   * Tracks OpenAI, Anthropic, and other AI service calls
   */
  ai_monitoring: {
    enabled: true,
    streaming: {
      enabled: true,
    },
    record_content: {
      enabled: false, // Disable to avoid storing PII/sensitive prompts
    },
  },

  /**
   * Security agent
   */
  security: {
    enabled: false, // Enable when using New Relic Security
  },

  /**
   * Custom parameters for grouping
   */
  labels: {
    environment: process.env.NODE_ENV || 'development',
    service: process.env.SERVICE_NAME || 'unknown',
    version: process.env.npm_package_version || '1.0.0',
  },
};

/**
 * New Relic Configuration for Reasoning Gateway
 */

'use strict';

export default {
  app_name: ['LivHana-Reasoning-Gateway'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
    filepath: 'stdout',
  },
  distributed_tracing: {
    enabled: true,
  },
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
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    record_sql: 'obfuscated',
    explain_threshold: 500,
  },
  error_collector: {
    enabled: true,
    ignore_status_codes: [404],
  },
  custom_insights_events: {
    enabled: true,
    max_samples_stored: 10000,
  },
  attributes: {
    enabled: true,
    exclude: [
      'request.headers.authorization',
      'request.headers.cookie',
      'request.parameters.password',
      'request.parameters.token',
      'request.parameters.api_key',
    ],
  },
  browser_monitoring: {
    enabled: false,
  },
  ai_monitoring: {
    enabled: true,
    streaming: {
      enabled: true,
    },
    record_content: {
      enabled: false, // Don't record prompt content for privacy
    },
  },
  labels: {
    environment: process.env.NODE_ENV || 'development',
    service: 'reasoning-gateway',
    version: process.env.npm_package_version || '0.1.0',
  },
};

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02

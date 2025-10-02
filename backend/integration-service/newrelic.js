/**
 * New Relic Configuration for Integration Service
 */

'use strict';

module.exports = {
  app_name: ['LivHana-Integration-Service'],
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
  slow_sql: {
    enabled: true,
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
    enabled: false, // Integration service doesn't use AI
  },
  labels: {
    environment: process.env.NODE_ENV || 'development',
    service: 'integration-service',
    version: process.env.npm_package_version || '1.0.0',
  },
};

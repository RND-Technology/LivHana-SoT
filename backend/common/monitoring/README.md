# LivHana Monitoring Module

Centralized monitoring, observability, and alerting infrastructure for all LivHana backend services.

## Features

- **APM**: New Relic for application performance monitoring
- **Error Tracking**: Sentry for real-time error tracking and profiling
- **Metrics**: Prometheus-compatible metrics export
- **Health Checks**: Standardized health and readiness endpoints
- **Performance Monitoring**: Custom performance tracking and alerting
- **Structured Logging**: Request ID correlation and JSON logging

## Quick Start

### 1. Install Dependencies

```bash
cd backend/common
npm install
```

All monitoring dependencies are included:
- `@sentry/node` - Error tracking
- `@sentry/profiling-node` - Performance profiling
- `newrelic` - APM
- `prom-client` - Prometheus metrics

### 2. Configure Environment Variables

```bash
# Add to your .env file
NEW_RELIC_LICENSE_KEY=your_key_here
NEW_RELIC_APP_NAME=Your-Service-Name
SENTRY_DSN=your_dsn_here
SENTRY_ENVIRONMENT=production
```

See `.env.monitoring.template` for full configuration options.

### 3. Initialize in Your Service

```javascript
// Load New Relic FIRST
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

// Then initialize Sentry
import {
  initSentry,
  sentryRequestHandler,
  sentryTracingHandler,
  sentryErrorHandler,
  createHealthRouter,
  getPerformanceMonitor,
  prometheusMiddleware,
  withRequestId,
  requestLogger,
  errorLogger,
} from '../../common/monitoring';

const express = require('express');
const app = express();

// Initialize Sentry
initSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  serviceName: 'your-service',
});

// Initialize performance monitor
const perfMonitor = getPerformanceMonitor(logger);

// Middleware (ORDER MATTERS!)
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());
app.use(withRequestId(logger));
app.use(requestLogger(logger));
app.use(perfMonitor.expressMiddleware());
app.use(prometheusMiddleware());

// Health check routes
app.use(createHealthRouter({
  logger,
  serviceName: 'your-service',
  version: '1.0.0',
  dependencies: {
    redis: redisClient,
    queue: jobQueue,
    // Add other dependencies
  },
}));

// Your routes here
app.use('/api', apiRoutes);

// Error handling (MUST BE LAST)
app.use(sentryErrorHandler());
app.use(errorLogger(logger));
```

## Module Structure

```
monitoring/
├── index.js              # Main exports
├── sentry.js             # Sentry error tracking
├── performance.js        # Custom performance monitoring
├── prometheus.js         # Prometheus metrics
├── health.js             # Health check utilities
├── newrelic-config.template.js  # New Relic config template
└── README.md            # This file
```

## API Reference

### Sentry Error Tracking

#### `initSentry(options)`

Initialize Sentry error tracking.

```javascript
initSentry({
  dsn: process.env.SENTRY_DSN,
  environment: 'production',
  serviceName: 'my-service',
  tracesSampleRate: 0.1,  // 10% sampling
  profilesSampleRate: 0.1,
});
```

#### Middleware

```javascript
app.use(sentryRequestHandler());     // MUST be first
app.use(sentryTracingHandler());     // For performance monitoring
app.use(sentryErrorHandler());       // MUST be after routes
```

#### Manual Error Capture

```javascript
import { captureException, captureMessage, setUser, setTag } from '../../common/monitoring';

// Capture exception
try {
  // risky code
} catch (error) {
  captureException(error, { extra: { userId: 123 } });
}

// Capture message
captureMessage('Payment processed', 'info', { orderId: 456 });

// Set user context
setUser({ id: user.id, email: user.email });

// Set custom tags
setTag('payment_method', 'stripe');
```

### Performance Monitoring

#### Get Performance Monitor

```javascript
import { getPerformanceMonitor } from '../../common/monitoring';

const perfMonitor = getPerformanceMonitor(logger);
```

#### Express Middleware

```javascript
app.use(perfMonitor.expressMiddleware());
```

#### Manual Timing

```javascript
// Start timer
const timerId = perfMonitor.startTimer('database-query');

// Do work
await db.query('SELECT * FROM users');

// End timer
perfMonitor.endTimer(timerId, 'db_query_time', {
  operation: 'SELECT',
  table: 'users',
});
```

#### Record Metrics

```javascript
// API request
perfMonitor.recordApiRequest('GET', '/api/users', 200, 150);

// Database query
perfMonitor.recordDbQuery('SELECT', 'users', 45, true);

// Job processing
perfMonitor.recordJobProcessing('email-sender', 1200, true);

// External API call
perfMonitor.recordExternalApiCall('stripe', '/charges', 890, true);
```

#### Get Metrics

```javascript
const metrics = perfMonitor.getMetrics();
const summary = perfMonitor.getMetricsSummary();

logger.info(summary, 'Performance metrics');
```

### Prometheus Metrics

#### Middleware

```javascript
import { prometheusMiddleware, metricsHandler } from '../../common/monitoring';

app.use(prometheusMiddleware());
app.get('/metrics', metricsHandler());
```

#### Track Custom Metrics

```javascript
import {
  trackDbQuery,
  trackJobProcessing,
  updateQueueDepth,
  trackExternalApi,
  setBusinessMetric,
} from '../../common/monitoring';

// Database query
trackDbQuery('SELECT', 'users', 45, true);

// Job processing
trackJobProcessing('email-sender', 1200, true);

// Queue depth
updateQueueDepth('email-queue', 150);

// External API
trackExternalApi('stripe', '/charges', 890, true);

// Business metric
setBusinessMetric('revenue', 15000, 'USD');
```

### Health Checks

#### Create Health Router

```javascript
import { createHealthRouter } from '../../common/monitoring';

app.use(createHealthRouter({
  serviceName: 'my-service',
  version: '1.0.0',
  logger,
  dependencies: {
    redis: redisClient,
    bigquery: bigQueryClient,
    square: squareClient,
    queue: jobQueue,
  },
}));
```

#### Endpoints

- `GET /health` - Basic liveness check
- `GET /healthz` - Kubernetes-style liveness
- `GET /ready` - Readiness check with dependencies

#### Wait for Dependencies

```javascript
import { waitForDependencies } from '../../common/monitoring';

// Wait for dependencies before starting server
await waitForDependencies(
  {
    redis: redisClient,
    queue: jobQueue,
  },
  logger,
  {
    maxRetries: 30,
    retryInterval: 2000,
    required: ['redis'],  // Redis must be available
  }
);

app.listen(port);
```

### Structured Logging

#### Request ID Correlation

```javascript
import { withRequestId, requestLogger, errorLogger } from '../../common/monitoring';

// Add request ID to all requests
app.use(withRequestId(logger));

// Log requests
app.use(requestLogger(logger));

// Log errors
app.use(errorLogger(logger));
```

Every request will have:
- Unique request ID in `x-request-id` header
- Request ID in all logs
- Request ID in error responses

#### Use Request Logger

```javascript
app.get('/api/users', (req, res) => {
  // Use req.logger for correlated logs
  req.logger.info({ userId: 123 }, 'Fetching user');

  // Request ID automatically included
  res.json({ users: [] });
});
```

## Health Check Examples

### Integration Service

```javascript
app.use(createHealthRouter({
  logger,
  dependencies: {
    redis: redisClient,
    bigquery: bigQueryClient,
    square: squareClient,
  },
}));
```

Response:
```json
{
  "status": "healthy",
  "service": "integration-service",
  "version": "1.0.0",
  "timestamp": "2025-10-01T00:00:00.000Z",
  "checks": {
    "redis": {
      "status": "healthy",
      "message": "Redis connection active"
    },
    "bigquery": {
      "status": "healthy",
      "message": "BigQuery connection active",
      "datasets": 5
    },
    "square": {
      "status": "healthy",
      "message": "Square API connection active",
      "locations": 3
    }
  }
}
```

### Reasoning Gateway

```javascript
app.use(createHealthRouter({
  logger,
  dependencies: {
    redis: redisClient,
    queue: reasoningQueue,
  },
}));
```

## Testing

### Test Health Endpoints

```bash
curl http://localhost:3005/health
curl http://localhost:3005/ready
curl http://localhost:3005/metrics
```

### Test Error Tracking

```javascript
// Add test endpoint
app.get('/test-error', (req, res) => {
  throw new Error('Test error for Sentry');
});

// Trigger
curl http://localhost:3005/test-error
```

Check Sentry dashboard for the error.

### Test Performance Monitoring

```bash
# Generate some load
for i in {1..100}; do
  curl http://localhost:3005/health
done
```

Check New Relic for transactions.

## Best Practices

### 1. Always Load New Relic First

```javascript
// ✅ Correct
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}
const express = require('express');

// ❌ Wrong
const express = require('express');
require('newrelic');
```

### 2. Order Middleware Correctly

```javascript
// ✅ Correct order
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());
app.use(withRequestId(logger));
app.use(requestLogger(logger));
// ... your routes ...
app.use(sentryErrorHandler());
app.use(errorLogger(logger));

// ❌ Wrong - error handler before routes
app.use(sentryErrorHandler());
app.use('/api', routes);
```

### 3. Use Request Logger

```javascript
// ✅ Correct - uses request-scoped logger
app.get('/api/users', (req, res) => {
  req.logger.info('Fetching users');
  // Request ID automatically included
});

// ❌ Wrong - loses request correlation
app.get('/api/users', (req, res) => {
  logger.info('Fetching users');
  // No request ID
});
```

### 4. Add Context to Errors

```javascript
// ✅ Good - includes context
try {
  await processPayment(orderId);
} catch (error) {
  captureException(error, {
    extra: {
      orderId,
      amount,
      userId,
    },
  });
  throw error;
}

// ❌ Poor - no context
try {
  await processPayment(orderId);
} catch (error) {
  captureException(error);
  throw error;
}
```

### 5. Sample Performance Data

```javascript
// ✅ Good for high-traffic services
initSentry({
  tracesSampleRate: 0.1,  // 10% sampling
  profilesSampleRate: 0.1,
});

// ❌ Expensive for high-traffic
initSentry({
  tracesSampleRate: 1.0,  // 100% sampling
});
```

## Troubleshooting

### New Relic Not Showing Data

1. Verify license key is correct
2. Check New Relic is loaded first
3. Look for errors in `~/.newrelic/newrelic.log`
4. Verify network connectivity
5. Check data ingest quota

### Sentry Not Capturing Errors

1. Verify DSN is correct
2. Check middleware order
3. Look at `beforeSend` filter
4. Test with manual `captureException()`
5. Check error quota

### Health Checks Failing

1. Verify dependencies are actually running
2. Check connection strings
3. Test connections manually
4. Review firewall rules
5. Check initialization order

### High Memory Usage

1. Check for memory leaks in New Relic
2. Review histogram retention in performance monitor
3. Adjust metric retention limits
4. Profile with heap snapshots

## Cost Optimization

### New Relic

- Use free tier (100 GB/month)
- Sample high-volume logs
- Disable AI content recording
- Use data dropping rules

### Sentry

- Sample performance (10-20%)
- Filter expected errors
- Use rate limiting
- Archive old issues

## Documentation

- [Monitoring Setup Guide](../../../docs/MONITORING_SETUP.md)
- [Monitoring Runbook](../../../docs/MONITORING_RUNBOOK.md)
- [Sentry Alert Configuration](../../../docs/SENTRY_ALERTS.md)
- [New Relic Dashboards](../../../docs/NEW_RELIC_DASHBOARDS.json)

## Support

- Slack: #engineering
- New Relic: https://support.newrelic.com/
- Sentry: https://sentry.io/support/

---

**Version**: 1.0.0
**Last Updated**: October 2025

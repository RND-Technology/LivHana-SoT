<!--
Optimized: 2025-10-03
RPM: 3.6.0.6.ops-technology-ship-status-documentation
Session: Dual-AI Collaboration - Sonnet Docs Sweep
-->
# Monitoring Setup Guide

## Overview

This guide walks through setting up the complete monitoring stack for LivHana backend services.

## Prerequisites

- Node.js 18+
- npm or yarn
- Access to New Relic account
- Access to Sentry account
- Redis running

## Step 1: Install Dependencies

All monitoring dependencies are already installed in the common module and individual services.

```bash
# Already completed - verification only
cd backend/common
npm list @sentry/node newrelic prom-client

cd ../integration-service
npm list @sentry/node newrelic

cd ../reasoning-gateway
npm list @sentry/node newrelic
```

## Step 2: Configure Environment Variables

Add the following environment variables to your `.env` files:

### Required for All Services

```bash
# Node Environment
NODE_ENV=production  # or development, staging

# New Relic Configuration
NEW_RELIC_LICENSE_KEY=your_license_key_here
NEW_RELIC_APP_NAME=LivHana-Your-Service-Name
NEW_RELIC_LOG_LEVEL=info  # or debug for troubleshooting

# Sentry Configuration
SENTRY_DSN=your_sentry_dsn_here
SENTRY_ENVIRONMENT=production  # or development, staging
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions
SENTRY_PROFILES_SAMPLE_RATE=0.1  # 10% profiling

# Git commit (for release tracking)
GIT_COMMIT=$(git rev-parse HEAD)

# Logging
LOG_LEVEL=info  # debug, info, warn, error
```

### Example .env Files

**backend/integration-service/.env**:
```bash
NODE_ENV=production
PORT=3005

# Monitoring
NEW_RELIC_LICENSE_KEY=eu01xxNRAL-your-key-here
NEW_RELIC_APP_NAME=LivHana-Integration-Service
SENTRY_DSN=https://your-key@o123456.ingest.us.sentry.io/789
SENTRY_ENVIRONMENT=production

# Existing configuration
REDIS_URL=redis://localhost:6379
BIGQUERY_PROJECT_ID=your-project
# ... rest of your config
```

**backend/reasoning-gateway/.env**:
```bash
NODE_ENV=production
PORT=4002

# Monitoring
NEW_RELIC_LICENSE_KEY=eu01xxNRAL-your-key-here
NEW_RELIC_APP_NAME=LivHana-Reasoning-Gateway
SENTRY_DSN=https://your-key@o123456.ingest.us.sentry.io/789
SENTRY_ENVIRONMENT=production

# Existing configuration
REDIS_URL=redis://localhost:6379
# ... rest of your config
```

## Step 3: Get Your API Keys

### New Relic Setup

1. Log in to [New Relic](https://one.newrelic.com/)
2. Click your name → API Keys
3. Create a new license key (INGEST - LICENSE)
4. Copy the key to your `.env` file

**Free Tier Includes**:
- 100 GB data ingest/month
- Full platform access for 1 user
- Unlimited basic users
- 8-day retention

### Sentry Setup

1. Log in to [Sentry](https://sentry.io/)
2. Create a new project for each service:
   - Integration Service
   - Reasoning Gateway
   - Voice Service
3. Select "Node.js" as platform
4. Copy the DSN from Settings → Client Keys
5. Add to your `.env` file

**Free Tier Includes**:
- 5,000 errors/month
- 10,000 performance units/month
- 7-day retention

**Recommended Plan**: Developer ($29/month)
- 50,000 errors/month
- 100,000 performance units/month
- 90-day retention

## Step 4: Initialize Monitoring in Services

### Integration Service

Update `src/index.js` to initialize monitoring:

```javascript
// Load New Relic FIRST (before any other requires)
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

// Then load Sentry
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from '../../common/monitoring';

require('dotenv').config();
const express = require('express');

// Initialize Sentry
initSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  serviceName: 'integration-service',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
});

const app = express();

// Sentry request handler MUST be the first middleware
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// ... rest of your middleware and routes

// Sentry error handler MUST be AFTER all routes but BEFORE other error handlers
app.use(sentryErrorHandler());

// Your error handler
app.use((error, req, res, next) => {
  // Your error handling logic
});
```

### Reasoning Gateway

Update `src/index.js` to initialize monitoring:

```javascript
// Load New Relic FIRST (before any other requires)
if (process.env.NEW_RELIC_LICENSE_KEY) {
  await import('newrelic');
}

// Then load Sentry
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from '../../common/monitoring/index.js';

import 'dotenv/config';
import express from 'express';

// Initialize Sentry
initSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  serviceName: 'reasoning-gateway',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
});

const app = express();

// Sentry middleware
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// ... rest of your middleware and routes

// Sentry error handler
app.use(sentryErrorHandler());
```

## Step 5: Add Health Check Routes

### Integration Service

Update `src/index.js`:

```javascript
const { createHealthRoutes } = require('./routes/health.js');

// Add health routes
app.use(createHealthRoutes({
  logger,
  redisClient,
  bigQueryClient,
  squareClient,
}));
```

### Reasoning Gateway

Update `src/index.js`:

```javascript
import { createHealthRoutes } from './routes/health.js';

// Add health routes
app.use(createHealthRoutes({
  logger,
  redisClient,
  queue: reasoningQueue,
}));
```

## Step 6: Enable Performance Monitoring

Add performance monitoring middleware:

```javascript
import { getPerformanceMonitor, prometheusMiddleware } from '../../common/monitoring';

// Initialize performance monitor
const perfMonitor = getPerformanceMonitor(logger);

// Add middleware
app.use(perfMonitor.expressMiddleware());
app.use(prometheusMiddleware());

// Log metrics periodically
setInterval(() => {
  logger.info(perfMonitor.getMetricsSummary(), 'Performance metrics');
}, 60000); // Every minute
```

## Step 7: Add Request ID Correlation

Update logging middleware:

```javascript
import { withRequestId, requestLogger, errorLogger } from '../../common/logging';

// Add request ID middleware FIRST
app.use(withRequestId(logger));

// Then other middleware
app.use(requestLogger(logger));

// ... routes ...

// Error logger at the end
app.use(errorLogger(logger));
```

## Step 8: Test the Setup

### Test Health Checks

```bash
# Test basic health
curl http://localhost:3005/health
curl http://localhost:4002/health

# Test readiness with dependencies
curl http://localhost:3005/ready
curl http://localhost:4002/ready

# Test metrics endpoint
curl http://localhost:3005/metrics
curl http://localhost:4002/metrics
```

Expected responses:

```json
// /health
{
  "status": "healthy",
  "service": "integration-service",
  "version": "1.0.0",
  "timestamp": "2025-10-01T00:00:00.000Z",
  "uptime": 123.456
}

// /ready
{
  "status": "healthy",
  "service": "integration-service",
  "version": "1.0.0",
  "timestamp": "2025-10-01T00:00:00.000Z",
  "checks": {
    "redis": { "status": "healthy", "message": "Redis connection active" },
    "bigquery": { "status": "healthy", "message": "BigQuery connection active" },
    "square": { "status": "healthy", "message": "Square API connection active" }
  }
}
```

### Test Error Tracking

Create a test error:

```javascript
// Add a test endpoint
app.get('/test-error', (req, res) => {
  throw new Error('Test error for Sentry');
});

// Visit in browser or curl
curl http://localhost:3005/test-error
```

Check Sentry dashboard to see the error appear.

### Test Performance Monitoring

Generate some load:

```bash
# Simple load test
for i in {1..100}; do curl http://localhost:3005/health; done
```

Check New Relic dashboard for transactions.

## Step 9: Configure Alerts

### New Relic Alerts

1. Go to Alerts & AI → Alert Conditions
2. Create alert policies:

**Critical Alerts** (Immediate notification):
- Service is down (Health check fails)
- Error rate > 5%
- Response time P95 > 2s

**Warning Alerts** (Notification within 15 minutes):
- Error rate > 1%
- Response time P95 > 1s
- Memory usage > 80%
- Queue depth > 500

3. Configure notification channels:
   - Email
   - Slack (#alerts channel)
   - PagerDuty (for P0 alerts)

### Sentry Alerts

1. Go to Alerts → Create Alert
2. Create alert rules:

**Critical Errors**:
- New error types appear
- Error frequency > 100/hour
- Error affects > 10 users

**Performance Issues**:
- Transaction duration P95 > 2s
- N+1 query detected

3. Configure notification channels:
   - Email
   - Slack (#alerts channel)

## Step 10: Set Up Dashboards

### New Relic Dashboards

Create the following dashboards:

1. **System Health Overview**
   - Service status (up/down)
   - Error rate (%)
   - Response time P50/P95/P99
   - Throughput (requests/minute)

2. **API Performance**
   - Top 10 slowest endpoints
   - Error rate by endpoint
   - Throughput by endpoint
   - External API call duration

3. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network I/O

4. **Business Metrics**
   - Active users
   - Revenue (if applicable)
   - Transaction volume
   - Conversion rate

### Prometheus + Grafana (Optional)

If you want to visualize Prometheus metrics:

1. Install Grafana:
```bash
docker run -d -p 3000:3000 grafana/grafana
```

2. Configure Prometheus data source in Grafana

3. Import pre-built Node.js dashboard

## Step 11: Document the Setup

Update your team wiki/documentation with:

1. How to access monitoring dashboards
2. What alerts mean and how to respond
3. On-call rotation schedule
4. Escalation procedures
5. Common troubleshooting steps

Use the [MONITORING_RUNBOOK.md](./MONITORING_RUNBOOK.md) as a template.

## Step 12: Train the Team

1. Schedule training session for the team
2. Walk through each dashboard
3. Simulate an alert and practice response
4. Review escalation procedures
5. Test on-call notification system

## Verification Checklist

- [ ] New Relic showing transactions
- [ ] Sentry receiving errors
- [ ] Health endpoints returning 200
- [ ] Metrics endpoint returning Prometheus format
- [ ] Request IDs appearing in logs
- [ ] Alerts configured and tested
- [ ] Dashboards created
- [ ] Team trained
- [ ] Runbook documented
- [ ] On-call rotation set up

## Production Deployment

Before deploying to production:

1. Test all monitoring in staging environment
2. Verify alert thresholds are appropriate
3. Ensure all team members have access
4. Set up status page for customer communication
5. Review costs and set up billing alerts

## Troubleshooting

### New Relic Not Receiving Data

1. Check license key is correct
2. Verify `newrelic` is loaded FIRST in code
3. Check New Relic logs: `~/.newrelic/newrelic.log`
4. Verify network connectivity to New Relic endpoints
5. Check if data ingest limit exceeded

### Sentry Not Receiving Errors

1. Check DSN is correct
2. Verify Sentry middleware is registered
3. Check `beforeSend` filter not blocking events
4. Verify network connectivity to Sentry
5. Check if quota exceeded

### Health Checks Failing

1. Check dependencies are actually running
2. Verify connection strings are correct
3. Check firewall rules
4. Test connections manually
5. Review dependency initialization code

### Metrics Endpoint Returns Empty

1. Verify Prometheus middleware is registered
2. Check if any requests have been processed
3. Test generating some traffic
4. Review metric registration code

## Cost Optimization Tips

1. **New Relic**:
   - Use log sampling for high-volume services
   - Disable AI content recording for privacy and cost
   - Set up data dropping rules
   - Monitor data ingest dashboard

2. **Sentry**:
   - Filter out expected errors (404s, etc.)
   - Sample performance transactions (10-20%)
   - Use issue grouping effectively
   - Set up rate limiting per issue

3. **General**:
   - Start with free tiers
   - Monitor actual usage before upgrading
   - Review retention policies
   - Use sampling for high-traffic endpoints

## Next Steps

1. Monitor for 1 week in production
2. Adjust alert thresholds based on real data
3. Fine-tune sampling rates
4. Create custom dashboards for your needs
5. Set up automated reports
6. Review and update runbook monthly

## Support

For questions or issues:
- Internal: #engineering Slack channel
- New Relic: https://support.newrelic.com/
- Sentry: https://sentry.io/support/

---

**Last Updated**: October 2025
**Owner**: DevOps Team

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->

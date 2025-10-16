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

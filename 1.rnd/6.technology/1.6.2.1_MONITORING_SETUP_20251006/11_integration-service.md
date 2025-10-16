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

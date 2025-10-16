### 3. Update Service Entry Points

**Integration Service** (`src/index.js`):

```javascript
// Add at the VERY TOP (before other requires)
if (process.env.NEW_RELIC_LICENSE_KEY) {
  require('newrelic');
}

// Then add Sentry initialization
const { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } = require('../../common/monitoring');

// Initialize Sentry
initSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  serviceName: 'integration-service',
});

// Add middleware FIRST
app.use(sentryRequestHandler());
app.use(sentryTracingHandler());

// Your existing middleware...

// Add error handler LAST
app.use(sentryErrorHandler());
```

**Reasoning Gateway** (`src/index.js`):

```javascript
// Add at the VERY TOP
if (process.env.NEW_RELIC_LICENSE_KEY) {
  await import('newrelic');
}

// Then add Sentry
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from '../../common/monitoring/index.js';

initSentry({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  serviceName: 'reasoning-gateway',
});

app.use(sentryRequestHandler());
app.use(sentryTracingHandler());
// ... your middleware ...
app.use(sentryErrorHandler());
```

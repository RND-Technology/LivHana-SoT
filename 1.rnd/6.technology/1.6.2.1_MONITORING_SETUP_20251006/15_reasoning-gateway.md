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

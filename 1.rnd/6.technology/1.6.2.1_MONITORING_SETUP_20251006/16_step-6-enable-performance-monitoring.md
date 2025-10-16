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

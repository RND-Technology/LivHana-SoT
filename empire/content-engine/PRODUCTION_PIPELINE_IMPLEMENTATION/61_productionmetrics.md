#### `ProductionMetrics`

Records performance and error metrics.

```javascript
metrics.recordApiCall('elevenLabs');
metrics.recordFileGeneration('audio');
metrics.recordError(error, context);
const report = metrics.finalize();
```

---

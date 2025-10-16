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

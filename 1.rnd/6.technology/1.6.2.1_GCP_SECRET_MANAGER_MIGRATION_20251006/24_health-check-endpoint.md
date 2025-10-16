### Health Check Endpoint

```javascript
app.get('/health/secrets', async (req, res) => {
  const { getCacheStatus, getRotationStatus } = require('../common/secrets');

  res.json({
    status: 'ok',
    cache: getCacheStatus(),
    rotation: getRotationStatus(),
    timestamp: new Date().toISOString()
  });
});
```

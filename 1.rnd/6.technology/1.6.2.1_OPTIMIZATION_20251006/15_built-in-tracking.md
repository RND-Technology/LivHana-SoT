#### Built-in Tracking

```javascript
async function fetchDashboardData() {
  const startTime = Date.now();

  // ... execute query ...

  const queryTime = Date.now() - startTime;
  logger.info(`Dashboard query completed in ${queryTime}ms`);

  return {
    queryTimeMs: queryTime,
    metrics: { ... }
  };
}
```

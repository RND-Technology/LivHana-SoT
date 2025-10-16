#### 1. Redis Store

```javascript
// Shared rate limit state across all instances
const redisClient = await createRedisClient({ logger });
const rateLimiter = createTieredRateLimiter({
  redisClient,
  logger,
  serviceName: 'integration-service'
});
```

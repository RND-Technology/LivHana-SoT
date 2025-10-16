### Redis Optimization

**CRITICAL: Add Connection Pooling**

```javascript
import { createClient } from 'redis';

const redisPool = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
  },
  password: process.env.REDIS_PASSWORD,
  lazyConnect: false,
  maxRetriesPerRequest: 3,
  enableOfflineQueue: true,
});

// Connection health check
redisPool.on('error', (err) => logger.error('Redis error', err));
redisPool.on('connect', () => logger.info('Redis connected'));
redisPool.on('reconnecting', () => logger.warn('Redis reconnecting'));
```

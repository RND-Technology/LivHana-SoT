#### `RateLimiter`

Enforces API rate limits.

```javascript
const rateLimiter = new RateLimiter(maxRequestsPerMinute = 60);
await rateLimiter.waitForSlot();
```

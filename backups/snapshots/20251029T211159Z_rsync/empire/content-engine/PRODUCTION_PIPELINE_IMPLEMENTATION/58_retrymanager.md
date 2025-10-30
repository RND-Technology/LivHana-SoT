#### `RetryManager`

Handles retry logic with exponential backoff.

```javascript
const retryManager = new RetryManager(maxRetries = 3, baseDelay = 1000);
await retryManager.executeWithRetry(operation, operationName);
```

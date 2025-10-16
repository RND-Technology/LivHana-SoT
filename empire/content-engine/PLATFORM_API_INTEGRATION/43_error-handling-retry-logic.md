## Error Handling & Retry Logic

```javascript
// error-handler.mjs

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    exponentialBase = 2,
    onRetry = () => {}
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      const delay = Math.min(
        baseDelay * Math.pow(exponentialBase, attempt),
        maxDelay
      );

      console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      onRetry(attempt + 1, delay, error);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Platform-specific error handlers
 */
export const errorHandlers = {
  youtube: (error) => {
    if (error.code === 401) {
      return { retry: true, message: 'Token expired, refreshing...' };
    }
    if (error.code === 403) {
      return { retry: false, message: 'Quota exceeded or permissions issue' };
    }
    return { retry: true, message: error.message };
  },

  tiktok: (error) => {
    if (error.response?.status === 429) {
      return { retry: true, message: 'Rate limit exceeded', delay: 60000 };
    }
    if (error.response?.status === 401) {
      return { retry: true, message: 'Token expired' };
    }
    return { retry: true, message: error.message };
  },

  instagram: (error) => {
    if (error.response?.data?.error?.code === 'API_EC_RATE_LIMIT') {
      return { retry: true, message: 'Rate limit exceeded', delay: 3600000 };
    }
    if (error.response?.data?.error?.message?.includes('processing')) {
      return { retry: true, message: 'Video still processing' };
    }
    return { retry: true, message: error.message };
  },

  twitter: (error) => {
    if (error.response?.status === 429) {
      return { retry: true, message: 'Rate limit exceeded', delay: 900000 };
    }
    if (error.response?.status === 503) {
      return { retry: true, message: 'Service temporarily unavailable' };
    }
    return { retry: true, message: error.message };
  }
};
```

---

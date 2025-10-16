### Retry Logic

- Rate limits (429): Auto-retry with backoff
- Server errors (500, 503): Auto-retry
- Network timeouts: Auto-retry
- Max retries: 3 per operation

### Retry Strategy

For transient errors (500, network issues):

1. Wait 1 second
2. Retry up to 3 times
3. Use exponential backoff

For client errors (400, 401, 404):

- Do not retry
- Fix the request and try again

For rate limits (429):

- Wait until `resetAt` timestamp
- Or wait 24 hours from first attempt

---

### Rate Limit Errors

**Error:** `Rate limit exceeded`

**Solution:**

- Pipeline automatically retries with exponential backoff
- Reduce `CONCURRENT_OPERATIONS` in code
- Increase delay between requests

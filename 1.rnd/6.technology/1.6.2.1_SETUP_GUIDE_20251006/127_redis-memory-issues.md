### Redis Memory Issues

Rate limit data is automatically expired after the window period. To manually clear:

```bash
# Clear all rate limit keys
redis-cli --scan --pattern 'rate-limit:*' | xargs redis-cli del
```

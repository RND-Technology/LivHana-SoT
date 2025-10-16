### CloudWatch Metrics (AWS)

If using AWS, monitor these metrics:

1. **Rate Limit Blocks**
   - Metric: `RateLimitBlocks`
   - Alert if > 100/min

2. **Block Rate**
   - Metric: `RateLimitBlockRate`
   - Alert if > 5%

3. **Redis Connection Errors**
   - Metric: `RedisConnectionErrors`
   - Alert immediately

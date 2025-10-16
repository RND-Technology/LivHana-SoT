### Rate Limiting Not Working

1. **Check Redis Connection**

   ```bash
   redis-cli -h localhost -p 6379 ping
   ```

2. **Check Environment Variables**

   ```bash
   echo $REDIS_HOST
   echo $RATE_LIMIT_ENABLED
   ```

3. **Check Logs**

   ```bash
   # Should see: "Rate limiting initialized successfully"
   tail -f backend/integration-service/logs/app.log | grep "rate"
   ```

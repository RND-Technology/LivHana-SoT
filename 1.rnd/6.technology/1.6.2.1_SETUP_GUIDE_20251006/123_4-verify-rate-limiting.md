### 4. Verify Rate Limiting

```bash
# Check configuration
curl http://localhost:3005/api/monitoring/rate-limit/config

# Monitor statistics
watch -n 5 'curl -s http://localhost:3005/api/monitoring/rate-limit/stats | jq .stats'
```

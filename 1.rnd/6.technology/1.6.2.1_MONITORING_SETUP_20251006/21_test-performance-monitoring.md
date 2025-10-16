### Test Performance Monitoring

Generate some load:

```bash
# Simple load test
for i in {1..100}; do curl http://localhost:3005/health; done
```

Check New Relic dashboard for transactions.

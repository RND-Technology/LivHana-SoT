### 3. Monitor Performance in Production

```bash
# Check query timing in logs
tail -f logs/integration-service.log | grep "query completed"

# Example output:
# Dashboard query completed in 320ms
# Historical query completed in 380ms
# Product query completed in 165ms
```

---

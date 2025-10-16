### Debugging

```bash
# Enable debug logs
export LOG_LEVEL=debug

# Watch logs
tail -f logs/reasoning-gateway.log | jq

# Check task details
curl http://localhost:4002/api/autonomous/tasks/$TASK_ID | jq
```

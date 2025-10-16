### Monitoring

```bash
# Health check
curl http://localhost:4002/api/autonomous/health

# Active tasks
curl http://localhost:4002/api/autonomous/tasks?status=executing

# Failed tasks
curl http://localhost:4002/api/autonomous/tasks?status=failed
```

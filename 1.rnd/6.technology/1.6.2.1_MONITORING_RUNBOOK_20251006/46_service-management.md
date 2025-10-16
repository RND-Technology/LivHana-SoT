### Service Management

```bash
# Check service status
pm2 status

# View logs
pm2 logs <service-name>

# Restart service
pm2 restart <service-name>

# Check health
curl http://localhost:3005/health
curl http://localhost:4002/health
```

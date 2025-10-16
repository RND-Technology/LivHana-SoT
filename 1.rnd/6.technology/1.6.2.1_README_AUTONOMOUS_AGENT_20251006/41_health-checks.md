### Health Checks

```bash
# Service health
curl http://localhost:4002/health

# Autonomous agent health
curl http://localhost:4002/api/autonomous/health \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN"
```

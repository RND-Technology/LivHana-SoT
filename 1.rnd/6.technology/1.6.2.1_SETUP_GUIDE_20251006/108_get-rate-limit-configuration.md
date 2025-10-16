### Get Rate Limit Configuration

```bash
# Integration Service
curl http://localhost:3005/api/monitoring/rate-limit/config

# Reasoning Gateway
curl http://localhost:4002/api/monitoring/rate-limit/config

# Response
{
  "success": true,
  "enabled": true,
  "tiers": {
    "PUBLIC": { "windowMs": 60000, "max": 100, "tier": "public" },
    "AUTHENTICATED": { "windowMs": 60000, "max": 300, "tier": "authenticated" },
    "ADMIN": { "windowMs": 60000, "max": 1000, "tier": "admin" },
    "HEALTH": { "windowMs": 60000, "max": 300, "tier": "health" }
  },
  "redisConfig": {
    "host": "localhost",
    "port": "6379",
    "database": "1"
  }
}
```

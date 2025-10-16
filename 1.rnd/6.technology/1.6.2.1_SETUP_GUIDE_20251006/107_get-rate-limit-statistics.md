### Get Rate Limit Statistics

```bash
# Integration Service
curl http://localhost:3005/api/monitoring/rate-limit/stats

# Reasoning Gateway
curl http://localhost:4002/api/monitoring/rate-limit/stats

# Response
{
  "success": true,
  "stats": {
    "totalHits": 1547,
    "totalBlocks": 23,
    "blockRate": "1.49%",
    "since": "2025-10-01T10:00:00.000Z",
    "uptime": "3600s"
  },
  "tiers": {
    "PUBLIC": { "windowMs": 60000, "max": 100, "tier": "public" },
    "AUTHENTICATED": { "windowMs": 60000, "max": 300, "tier": "authenticated" },
    "ADMIN": { "windowMs": 60000, "max": 1000, "tier": "admin" }
  },
  "timestamp": "2025-10-01T11:00:00.000Z"
}
```

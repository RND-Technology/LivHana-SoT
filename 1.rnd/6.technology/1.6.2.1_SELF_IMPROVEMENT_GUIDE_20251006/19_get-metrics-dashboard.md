#### Get Metrics Dashboard

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/improvements/metrics
```

Response:

```json
{
  "metrics": {
    "improvementsProposed": 42,
    "improvementsApproved": 35,
    "improvementsImplemented": 30,
    "bugsDetected": 8,
    "bugsFixed": 7,
    "featuresDiscovered": 12,
    "featuresImplemented": 5,
    "performanceImprovements": 15,
    "testsGenerated": 45,
    "docsGenerated": 28
  },
  "proposals": {
    "total": 42,
    "pending": 7,
    "approved": 5,
    "implemented": 30,
    "failed": 0
  },
  "recentActivity": [...],
  "performanceGains": {
    "totalResponseTimeReduced": 3250,
    "optimizedEndpoints": 15,
    "averageImprovement": 216.67
  }
}
```

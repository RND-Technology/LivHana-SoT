### 10. Health Check

Check health status of the autonomous agent system.

**Endpoint:** `GET /api/autonomous/health`

**Response:** `200 OK`

```json
{
  "status": "healthy",
  "agent": {
    "initialized": true,
    "capabilities": 9,
    "apiKeyConfigured": true
  },
  "tasks": {
    "total": 150,
    "queued": 2,
    "running": 1,
    "pendingApproval": 3,
    "completed": 140
  },
  "learnings": {
    "total": 140,
    "successful": 135
  }
}
```

**Example cURL:**

```bash
curl http://localhost:4002/api/autonomous/health \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

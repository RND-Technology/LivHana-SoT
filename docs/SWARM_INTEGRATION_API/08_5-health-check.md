### 5. Health Check

Get swarm health status and performance metrics.

**Endpoint:** `GET /api/swarm/health`

**Headers:** None required (public endpoint)

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2025-10-07T10:15:30.000Z",
  "active_agents": 3,
  "total_agents": 3,
  "queued_tasks": 2,
  "in_progress_tasks": 3,
  "completed_tasks": 90,
  "failed_tasks": 5,
  "total_tasks": 100,
  "success_rate": "94.74%",
  "avg_execution_time_ms": 45230
}
```

**Example:**
```bash
curl http://localhost:8080/api/swarm/health
```

---

### 7. Start Task

Mark a task as started (used by agents when beginning execution).

**Endpoint:** `POST /api/swarm/tasks/:taskId/start`

**Headers:**
```
X-API-Key: test
X-Agent-Id: claude-code-cli
```

**URL Parameters:**
- `taskId` (required): Task identifier

**Response:** `200 OK`
```json
{
  "success": true,
  "task": {
    "id": "task-1728292800000-abc123",
    "status": "in_progress",
    "startTime": "2025-10-07T10:00:05.000Z"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:8080/api/swarm/tasks/task-1728292800000-abc123/start \
  -H "X-API-Key: test" \
  -H "X-Agent-Id: claude-code-cli"
```

---

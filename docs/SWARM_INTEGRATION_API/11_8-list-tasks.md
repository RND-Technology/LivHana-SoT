### 8. List Tasks

Get a filtered list of all tasks.

**Endpoint:** `GET /api/swarm/tasks`

**Headers:**
```
X-API-Key: test
```

**Query Parameters:**
- `status` (optional): Filter by status (`queued`, `assigned`, `in_progress`, `completed`, `failed`)
- `agent` (optional): Filter by assigned agent ID
- `limit` (optional): Maximum number of tasks to return (default: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "tasks": [
    {
      "id": "task-1728292800003-abc126",
      "type": "deployment",
      "description": "Deploy to HighNoonCartoon.com",
      "status": "in_progress",
      "assignedAgent": "claude-code-cli",
      "createdAt": "2025-10-07T10:05:00.000Z",
      "startTime": "2025-10-07T10:05:05.000Z",
      "endTime": null
    },
    {
      "id": "task-1728292800002-abc125",
      "type": "content-generation",
      "description": "Generate video assets and animations",
      "status": "completed",
      "assignedAgent": "replit-agent",
      "createdAt": "2025-10-07T10:03:00.000Z",
      "startTime": "2025-10-07T10:03:05.000Z",
      "endTime": "2025-10-07T10:05:00.000Z"
    }
  ],
  "total": 2
}
```

**Examples:**
```bash
# All tasks
curl -H "X-API-Key: test" \
  http://localhost:8080/api/swarm/tasks

# Completed tasks only
curl -H "X-API-Key: test" \
  "http://localhost:8080/api/swarm/tasks?status=completed"

# Tasks assigned to specific agent
curl -H "X-API-Key: test" \
  "http://localhost:8080/api/swarm/tasks?agent=claude-code-cli"

# Limit to 10 tasks
curl -H "X-API-Key: test" \
  "http://localhost:8080/api/swarm/tasks?limit=10"
```

---

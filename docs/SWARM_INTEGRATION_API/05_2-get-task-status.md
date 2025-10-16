### 2. Get Task Status

Retrieve the current status and progress of a task.

**Endpoint:** `GET /api/swarm/status/:taskId`

**Headers:**
```
X-API-Key: test
```

**URL Parameters:**
- `taskId` (required): Task identifier from task submission

**Response:** `200 OK`
```json
{
  "success": true,
  "status": {
    "id": "task-1728292800000-abc123",
    "type": "deployment",
    "status": "in_progress",
    "assignedAgent": "claude-code-cli",
    "createdAt": "2025-10-07T10:00:00.000Z",
    "startTime": "2025-10-07T10:00:05.000Z",
    "endTime": null,
    "progress": 50,
    "result": null,
    "error": null
  }
}
```

**Status Values:**
- `queued` - Waiting for agent assignment
- `assigned` - Agent selected, about to start
- `in_progress` - Currently executing
- `completed` - Finished successfully
- `failed` - Execution failed

**Example:**
```bash
curl -H "X-API-Key: test" \
  http://localhost:8080/api/swarm/status/task-1728292800000-abc123
```

---

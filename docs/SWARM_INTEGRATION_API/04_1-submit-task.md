### 1. Submit Task

Create and submit a new task to the swarm.

**Endpoint:** `POST /api/swarm/tasks`

**Headers:**
```
X-API-Key: test
X-Agent-Id: orchestrator
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "deployment",
  "description": "Deploy voice-service to Cloud Run",
  "requiredCapabilities": ["deployment", "testing"],
  "priority": "high",
  "metadata": {
    "service": "voice-service",
    "environment": "production"
  }
}
```

**Parameters:**
- `type` (required): Task type identifier
- `description` (required): Human-readable task description
- `requiredCapabilities` (optional): Array of required agent capabilities
- `priority` (optional): `"high"` | `"medium"` | `"low"` (default: `"medium"`)
- `metadata` (optional): Additional task context

**Response:** `201 Created`
```json
{
  "success": true,
  "task": {
    "id": "task-1728292800000-abc123",
    "type": "deployment",
    "status": "queued",
    "assignedAgent": null,
    "createdAt": "2025-10-07T10:00:00.000Z"
  },
  "message": "Task submitted successfully"
}
```

**Example:**
```bash
curl -X POST http://localhost:8080/api/swarm/tasks \
  -H "X-API-Key: test" \
  -H "X-Agent-Id: orchestrator" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "deployment",
    "description": "Deploy integration-service",
    "requiredCapabilities": ["deployment"],
    "priority": "high"
  }'
```

---

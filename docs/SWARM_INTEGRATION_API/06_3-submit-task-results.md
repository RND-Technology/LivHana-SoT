### 3. Submit Task Results

Submit execution results for a completed task (used by agents).

**Endpoint:** `POST /api/swarm/results`

**Headers:**

```
X-API-Key: test
X-Agent-Id: claude-code-cli
Content-Type: application/json
```

**Request Body:**

```json
{
  "taskId": "task-1728292800000-abc123",
  "success": true,
  "result": {
    "deploymentUrl": "https://voice-service-xyz.a.run.app",
    "buildTime": 45000,
    "revision": "voice-service-00001-abc"
  },
  "error": null,
  "metadata": {
    "executionTime": 67000,
    "memoryUsed": "512Mi"
  }
}
```

**Parameters:**

- `taskId` (required): Task identifier
- `success` (required): Boolean indicating success/failure
- `result` (optional): Object containing task results
- `error` (optional): Error message if failed
- `metadata` (optional): Additional execution metadata

**Response:** `200 OK`

```json
{
  "success": true,
  "task": {
    "id": "task-1728292800000-abc123",
    "status": "completed",
    "completedAt": "2025-10-07T10:01:12.000Z"
  },
  "message": "Result submitted successfully"
}
```

**Example:**

```bash
curl -X POST http://localhost:8080/api/swarm/results \
  -H "X-API-Key: test" \
  -H "X-Agent-Id: claude-code-cli" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-1728292800000-abc123",
    "success": true,
    "result": {
      "status": "deployed",
      "url": "https://service.run.app"
    }
  }'
```

---

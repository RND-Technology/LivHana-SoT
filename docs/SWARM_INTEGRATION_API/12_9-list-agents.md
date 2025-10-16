### 9. List Agents

Get all agents and their current status.

**Endpoint:** `GET /api/swarm/agents`

**Headers:**
```
X-API-Key: test
```

**Response:** `200 OK`
```json
{
  "success": true,
  "agents": [
    {
      "id": "claude-code-cli",
      "type": "terminal",
      "capabilities": ["file-operations", "git", "bash", "deployment", "testing"],
      "status": "available",
      "currentTasks": 1,
      "maxConcurrentTasks": 3,
      "completedTasks": 38,
      "failedTasks": 2,
      "successRate": "95.00%",
      "lastActive": "2025-10-07T10:15:00.000Z"
    },
    {
      "id": "cursor-ide",
      "type": "ide",
      "capabilities": ["code-editing", "refactoring", "debugging", "documentation"],
      "status": "available",
      "currentTasks": 0,
      "maxConcurrentTasks": 2,
      "completedTasks": 12,
      "failedTasks": 0,
      "successRate": "100.00%",
      "lastActive": "2025-10-07T10:10:00.000Z"
    },
    {
      "id": "replit-agent",
      "type": "cloud-executor",
      "capabilities": ["deployment", "testing", "monitoring", "scaling"],
      "status": "available",
      "currentTasks": 2,
      "maxConcurrentTasks": 5,
      "completedTasks": 40,
      "failedTasks": 1,
      "successRate": "97.56%",
      "lastActive": "2025-10-07T10:15:30.000Z"
    }
  ],
  "total": 3
}
```

**Example:**
```bash
curl -H "X-API-Key: test" \
  http://localhost:8080/api/swarm/agents
```

---

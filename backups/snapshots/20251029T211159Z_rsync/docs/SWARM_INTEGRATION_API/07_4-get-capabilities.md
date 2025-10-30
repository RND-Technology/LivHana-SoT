### 4. Get Capabilities

List all available agent capabilities in the swarm.

**Endpoint:** `GET /api/swarm/capabilities`

**Headers:**

```
X-API-Key: test
```

**Response:** `200 OK`

```json
{
  "success": true,
  "capabilities": {
    "agents": [
      {
        "id": "claude-code-cli",
        "type": "terminal",
        "capabilities": ["file-operations", "git", "bash", "deployment", "testing"],
        "status": "available",
        "currentLoad": 1,
        "maxConcurrentTasks": 3,
        "successRate": "95.00%",
        "completedTasks": 38
      },
      {
        "id": "cursor-ide",
        "type": "ide",
        "capabilities": ["code-editing", "refactoring", "debugging", "documentation"],
        "status": "available",
        "currentLoad": 0,
        "maxConcurrentTasks": 2,
        "successRate": "100.00%",
        "completedTasks": 12
      },
      {
        "id": "replit-agent",
        "type": "cloud-executor",
        "capabilities": ["deployment", "testing", "monitoring", "scaling"],
        "status": "available",
        "currentLoad": 2,
        "maxConcurrentTasks": 5,
        "successRate": "97.50%",
        "completedTasks": 40
      }
    ],
    "allCapabilities": [
      "bash",
      "code-editing",
      "debugging",
      "deployment",
      "documentation",
      "file-operations",
      "git",
      "monitoring",
      "refactoring",
      "scaling",
      "testing"
    ]
  }
}
```

**Example:**

```bash
curl -H "X-API-Key: test" \
  http://localhost:8080/api/swarm/capabilities
```

---

### 6. Quick Start HNC Pipeline

Launch the High Noon Cartoon production pipeline.

**Endpoint:** `POST /api/swarm/quick-start/hnc`

**Headers:**
```
X-API-Key: test
X-Agent-Id: orchestrator
```

**Response:** `201 Created`
```json
{
  "success": true,
  "pipeline": {
    "pipelineId": "hnc-pipeline-1728292800000",
    "tasks": [
      "task-1728292800000-abc123",
      "task-1728292800001-abc124",
      "task-1728292800002-abc125",
      "task-1728292800003-abc126"
    ],
    "totalTasks": 4,
    "estimatedCompletionTime": 255000,
    "status": "initiated"
  },
  "message": "High Noon Cartoon production pipeline started",
  "next_steps": [
    "Monitor task progress via /api/swarm/status/:taskId",
    "Check swarm health at /api/swarm/health",
    "View results when tasks complete"
  ]
}
```

**Pipeline Tasks:**
1. Script validation
2. Animation setup (Remotion)
3. Content generation
4. Deployment to HighNoonCartoon.com

**Example:**
```bash
curl -X POST http://localhost:8080/api/swarm/quick-start/hnc \
  -H "X-API-Key: test" \
  -H "X-Agent-Id: orchestrator"
```

---

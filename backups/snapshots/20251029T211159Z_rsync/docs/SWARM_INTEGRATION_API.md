# SWARM INTEGRATION API

Complete API documentation for the Swarm Coordination Layer.

## Base URL

```
http://localhost:8080/api/swarm
```

Production:

```
https://reasoning-gateway-<hash>.a.run.app/api/swarm
```

## Authentication

All endpoints (except `/health`) require authentication via headers:

```
X-API-Key: <your-api-key>
X-Agent-Id: <agent-identifier>
```

**Agent IDs:**

- `claude-code-cli` - Claude Code CLI terminal agent
- `cursor-ide` - Cursor IDE coding agent
- `replit-agent` - Replit cloud execution agent
- `orchestrator` - External orchestrator/user

## Endpoints

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

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request

```json
{
  "success": false,
  "error": "Task type and description are required"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": "Authentication required. Provide X-API-Key header."
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": "Task not found"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Internal server error message"
}
```

---

## Usage Examples

### Complete Workflow: Deploy a Service

```bash
# 1. Submit deployment task
TASK_RESPONSE=$(curl -s -X POST http://localhost:8080/api/swarm/tasks \
  -H "X-API-Key: test" \
  -H "X-Agent-Id: orchestrator" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "deployment",
    "description": "Deploy voice-service to Cloud Run",
    "requiredCapabilities": ["deployment"],
    "priority": "high"
  }')

# Extract task ID
TASK_ID=$(echo $TASK_RESPONSE | jq -r '.task.id')
echo "Task ID: $TASK_ID"

# 2. Monitor progress
while true; do
  STATUS=$(curl -s -H "X-API-Key: test" \
    "http://localhost:8080/api/swarm/status/$TASK_ID" | jq -r '.status.status')

  echo "Status: $STATUS"

  if [ "$STATUS" = "completed" ] || [ "$STATUS" = "failed" ]; then
    break
  fi

  sleep 5
done

# 3. Get final result
curl -H "X-API-Key: test" \
  "http://localhost:8080/api/swarm/status/$TASK_ID" | jq '.'
```

### Monitor Swarm Health

```bash
# Continuous monitoring
watch -n 5 'curl -s http://localhost:8080/api/swarm/health | jq .'
```

### List All Active Tasks

```bash
curl -s -H "X-API-Key: test" \
  "http://localhost:8080/api/swarm/tasks?status=in_progress" | jq '.'
```

---

## Integration Examples

### JavaScript/Node.js

```javascript
const SWARM_API = 'http://localhost:8080/api/swarm';
const API_KEY = 'test';
const AGENT_ID = 'orchestrator';

async function submitTask(type, description, capabilities = []) {
  const response = await fetch(`${SWARM_API}/tasks`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'X-Agent-Id': AGENT_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type,
      description,
      requiredCapabilities: capabilities,
      priority: 'high'
    })
  });

  return response.json();
}

async function getTaskStatus(taskId) {
  const response = await fetch(`${SWARM_API}/status/${taskId}`, {
    headers: { 'X-API-Key': API_KEY }
  });

  return response.json();
}

// Usage
const task = await submitTask('deployment', 'Deploy service', ['deployment']);
console.log('Task submitted:', task.task.id);

const status = await getTaskStatus(task.task.id);
console.log('Task status:', status.status.status);
```

### Python

```python
import requests
import time

SWARM_API = 'http://localhost:8080/api/swarm'
API_KEY = 'test'
AGENT_ID = 'orchestrator'

def submit_task(task_type, description, capabilities=None):
    response = requests.post(
        f'{SWARM_API}/tasks',
        headers={
            'X-API-Key': API_KEY,
            'X-Agent-Id': AGENT_ID,
            'Content-Type': 'application/json'
        },
        json={
            'type': task_type,
            'description': description,
            'requiredCapabilities': capabilities or [],
            'priority': 'high'
        }
    )
    return response.json()

def get_task_status(task_id):
    response = requests.get(
        f'{SWARM_API}/status/{task_id}',
        headers={'X-API-Key': API_KEY}
    )
    return response.json()

# Usage
task = submit_task('deployment', 'Deploy service', ['deployment'])
print(f"Task submitted: {task['task']['id']}")

status = get_task_status(task['task']['id'])
print(f"Task status: {status['status']['status']}")
```

---

## Rate Limits

Currently no rate limits enforced. For production use, consider:

- 100 requests per minute per API key
- 1000 tasks per hour per agent
- 10 concurrent tasks per agent type

---

## Changelog

### v1.0.0 (2025-10-07)

- Initial release
- Core endpoints implemented
- HNC quick-start pipeline
- Health monitoring
- Agent load balancing

---

## Support

For issues or questions:

- GitHub Issues: [LivHana-Trinity-Local/LivHana-SoT](https://github.com/jesseniesen/LivHana-Trinity-Local)
- Email: <support@herbitrage.com>
- Logs: `docker logs reasoning-gateway`

---

**API Version**: 1.0.0
**Last Updated**: 2025-10-07
**Status**: Production Ready

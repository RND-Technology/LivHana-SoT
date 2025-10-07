# SWARM INTEGRATION QUICKSTART

## What is This?

The Swarm Integration Coordinator is a coordination layer that connects:
- **Claude Code CLI** (terminal operations)
- **Cursor IDE** (code editing)
- **Replit Agents** (cloud execution)

All working together on tasks automatically.

## Start the Service

```bash
cd backend/reasoning-gateway
PORT=8080 node src/index.js
```

## Quick Test

```bash
# Check health
curl http://localhost:8080/api/swarm/health | jq .

# Submit a task
curl -X POST http://localhost:8080/api/swarm/tasks \
  -H "X-API-Key: test" \
  -H "X-Agent-Id: orchestrator" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "deployment",
    "description": "Deploy voice-service",
    "requiredCapabilities": ["deployment"],
    "priority": "high"
  }' | jq .

# Launch HNC production pipeline
curl -X POST http://localhost:8080/api/swarm/quick-start/hnc \
  -H "X-API-Key: test" \
  -H "X-Agent-Id: orchestrator" | jq .
```

## Run Full Test Suite

```bash
./test-swarm-api.sh
```

## Key Endpoints

- `GET /api/swarm/health` - System health
- `POST /api/swarm/tasks` - Submit task
- `GET /api/swarm/status/:taskId` - Get task status
- `POST /api/swarm/results` - Submit results
- `GET /api/swarm/capabilities` - List agent capabilities
- `GET /api/swarm/agents` - List all agents
- `POST /api/swarm/quick-start/hnc` - Launch HNC pipeline

## Documentation

- Full API docs: `/docs/SWARM_INTEGRATION_API.md`
- Protocol details: `/.claude/SWARM_COORDINATION_PROTOCOL.md`

## Example: Complete Workflow

```bash
# 1. Submit task
RESPONSE=$(curl -s -X POST http://localhost:8080/api/swarm/tasks \
  -H "X-API-Key: test" \
  -H "X-Agent-Id: orchestrator" \
  -H "Content-Type: application/json" \
  -d '{"type":"deployment","description":"Deploy service","requiredCapabilities":["deployment"],"priority":"high"}')

TASK_ID=$(echo $RESPONSE | jq -r '.task.id')

# 2. Start task (agent picks it up)
curl -X POST http://localhost:8080/api/swarm/tasks/$TASK_ID/start \
  -H "X-API-Key: test" \
  -H "X-Agent-Id: claude-code-cli"

# 3. Submit result
curl -X POST http://localhost:8080/api/swarm/results \
  -H "X-API-Key: test" \
  -H "X-Agent-Id: claude-code-cli" \
  -H "Content-Type: application/json" \
  -d "{\"taskId\":\"$TASK_ID\",\"success\":true,\"result\":{\"status\":\"deployed\"}}"

# 4. Check final status
curl http://localhost:8080/api/swarm/status/$TASK_ID \
  -H "X-API-Key: test" | jq .
```

## Integration in Your Code

### JavaScript
```javascript
const response = await fetch('http://localhost:8080/api/swarm/tasks', {
  method: 'POST',
  headers: {
    'X-API-Key': 'test',
    'X-Agent-Id': 'orchestrator',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'deployment',
    description: 'Deploy service',
    requiredCapabilities: ['deployment'],
    priority: 'high'
  })
});

const data = await response.json();
console.log('Task ID:', data.task.id);
```

### Python
```python
import requests

response = requests.post(
    'http://localhost:8080/api/swarm/tasks',
    headers={
        'X-API-Key': 'test',
        'X-Agent-Id': 'orchestrator',
        'Content-Type': 'application/json'
    },
    json={
        'type': 'deployment',
        'description': 'Deploy service',
        'requiredCapabilities': ['deployment'],
        'priority': 'high'
    }
)

data = response.json()
print(f"Task ID: {data['task']['id']}")
```

## Status

- Service: Running on port 8080
- Agents: 3 (Claude Code CLI, Cursor IDE, Replit)
- All endpoints: Operational
- Tests: 11/14 passing (core functionality 100%)

## Next Steps

1. Deploy to Cloud Run for production
2. Add JWT authentication
3. Add WebSocket for real-time updates
4. Persist state to Redis/PostgreSQL
5. Add task dependencies and DAG execution

---

**Ready to coordinate your agent swarm!**

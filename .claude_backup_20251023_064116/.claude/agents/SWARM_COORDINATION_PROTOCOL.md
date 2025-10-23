# SWARM COORDINATION PROTOCOL

## Overview

The Swarm Integration Coordinator enables seamless collaboration between three autonomous agent types:

1. **Claude Code CLI** - Terminal operations, git, deployments, file operations
2. **Cursor IDE** - Code editing, refactoring, debugging, documentation
3. **Replit Agents** - Cloud execution, testing, monitoring, scaling

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  REASONING GATEWAY                       │
│                 (Coordination Layer)                     │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Claude Code  │   │  Cursor IDE  │   │    Replit    │
│     CLI      │   │              │   │    Agents    │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┴───────────────────┘
                            │
                    ┌───────▼───────┐
                    │  Task Queue   │
                    │  & Results    │
                    └───────────────┘
```

## Agent Capabilities

### Claude Code CLI

- **Primary Role**: Terminal operations and system-level tasks
- **Capabilities**:
  - `file-operations` - Read, write, edit files
  - `git` - Version control operations
  - `bash` - Shell command execution
  - `deployment` - Deploy services to Cloud Run
  - `testing` - Run test suites

### Cursor IDE

- **Primary Role**: Code development and refactoring
- **Capabilities**:
  - `code-editing` - Write and modify code
  - `refactoring` - Improve code structure
  - `debugging` - Fix bugs and issues
  - `documentation` - Create docs and comments

### Replit Agents

- **Primary Role**: Cloud execution and monitoring
- **Capabilities**:
  - `deployment` - Deploy to cloud platforms
  - `testing` - Run automated tests
  - `monitoring` - System health checks
  - `scaling` - Auto-scaling operations

## Communication Protocol

### 1. Task Submission Flow

```
Orchestrator/User → POST /api/swarm/tasks
                        ↓
            Swarm Coordinator receives task
                        ↓
            Analyzes required capabilities
                        ↓
            Selects best agent (load balancing)
                        ↓
            Task enters queue (status: queued)
                        ↓
            Agent assigned (status: assigned)
                        ↓
            Agent starts work (status: in_progress)
```

### 2. Task Execution Flow

```
Agent receives assignment
        ↓
POST /api/swarm/tasks/:taskId/start
        ↓
Executes task locally
        ↓
Monitors progress
        ↓
POST /api/swarm/results (with success/failure)
        ↓
Coordinator updates metrics
        ↓
Next task assigned (if available)
```

### 3. Status Monitoring Flow

```
Client → GET /api/swarm/status/:taskId
            ↓
    Returns current progress
            ↓
    {
      status: "in_progress",
      progress: 50,
      assignedAgent: "claude-code-cli",
      startTime: "2025-10-07T...",
      ...
    }
```

## Task Lifecycle

```
┌──────────┐     ┌──────────┐     ┌─────────────┐     ┌───────────┐
│  Queued  │ ──> │ Assigned │ ──> │ In Progress │ ──> │ Completed │
└──────────┘     └──────────┘     └─────────────┘     └───────────┘
                                          │
                                          ├─────> ┌────────┐
                                          └─────> │ Failed │
                                                  └────────┘
```

### Status Definitions

- **queued**: Task submitted, waiting for agent assignment
- **assigned**: Agent selected, task about to start
- **in_progress**: Agent actively working on task
- **completed**: Task finished successfully
- **failed**: Task failed with error

## API Endpoints

### Core Endpoints

#### Submit Task

```bash
POST /api/swarm/tasks
Headers: X-API-Key, X-Agent-Id
Body: {
  "type": "deployment",
  "description": "Deploy voice-service to Cloud Run",
  "requiredCapabilities": ["deployment", "testing"],
  "priority": "high",
  "metadata": { "service": "voice-service" }
}
```

#### Get Status

```bash
GET /api/swarm/status/:taskId
Headers: X-API-Key
```

#### Submit Results

```bash
POST /api/swarm/results
Headers: X-API-Key, X-Agent-Id
Body: {
  "taskId": "task-xyz",
  "success": true,
  "result": { "deploymentUrl": "https://..." },
  "metadata": { "executionTime": 45000 }
}
```

#### Get Capabilities

```bash
GET /api/swarm/capabilities
Headers: X-API-Key
```

#### Health Check

```bash
GET /api/swarm/health
```

### Special Operations

#### HNC Quick Start

```bash
POST /api/swarm/quick-start/hnc
Headers: X-API-Key, X-Agent-Id
```

Automatically creates and assigns tasks for:

1. Script validation
2. Animation setup
3. Content generation
4. Deployment to HighNoonCartoon.com

## Agent Assignment Algorithm

The coordinator uses intelligent assignment based on:

1. **Capability Matching** (20%)
   - Does agent have required capabilities?
   - Prefer agents with exact capability matches

2. **Current Load** (40%)
   - How many tasks is agent currently handling?
   - Prefer agents with lower load

3. **Success Rate** (40%)
   - Historical performance of agent
   - Prefer agents with higher success rates

**Formula:**

```
score = (successRate * 0.4) + (loadScore * 0.4) + (capabilityScore * 0.2)
```

Highest scoring agent gets the task.

## Continuous Learning Loop

### Performance Metrics Tracked

For each agent:

- Total tasks completed
- Total tasks failed
- Success rate percentage
- Average execution time
- Current load vs capacity

For the swarm:

- Total throughput
- Average task completion time
- System success rate
- Queue depth trends

### Feedback Loop

```
Task Completed
      ↓
Update Agent Metrics
      ↓
Recalculate Success Rates
      ↓
Adjust Future Assignment Weights
      ↓
Optimize Load Balancing
```

## Authentication

### Current: Simple API Key

```
X-API-Key: any-key-works-for-now
X-Agent-Id: claude-code-cli | cursor-ide | replit-agent
```

### Future: JWT Tokens

```
Authorization: Bearer <jwt-token>
```

JWT payload would include:

- Agent ID
- Capabilities
- Permissions
- Expiration

## Error Handling

### Agent Failures

- Task marked as failed
- Error logged with details
- Success rate updated
- Task can be manually reassigned

### Network Issues

- Retry logic (3 attempts)
- Exponential backoff
- Fallback to queue for later

### Coordinator Failures

- Tasks persist in memory (can add Redis for persistence)
- Graceful restart recovers state
- Agents poll for status updates

## Best Practices

### For Task Submission

1. Always specify required capabilities
2. Set appropriate priority (high/medium/low)
3. Include meaningful descriptions
4. Add metadata for tracking

### For Result Submission

1. Always include success flag
2. Provide detailed error messages on failure
3. Include execution metrics
4. Add any learnings or insights

### For Monitoring

1. Check health endpoint regularly
2. Monitor queue depth
3. Track success rates per agent
4. Alert on high failure rates

## Example: Complete Workflow

### Scenario: Deploy Voice Service

1. **Cursor IDE** creates new voice-service code

   ```bash
   POST /api/swarm/tasks
   {
     "type": "code-creation",
     "description": "Create voice-service API endpoints"
   }
   ```

2. **Claude Code CLI** assigned and executes
   - Reads requirements
   - Creates files
   - Submits result

3. **Cursor IDE** refactors and documents

   ```bash
   POST /api/swarm/tasks
   {
     "type": "refactoring",
     "description": "Add JSDoc and improve code structure"
   }
   ```

4. **Replit Agent** runs tests

   ```bash
   POST /api/swarm/tasks
   {
     "type": "testing",
     "description": "Run unit and integration tests"
   }
   ```

5. **Claude Code CLI** deploys

   ```bash
   POST /api/swarm/tasks
   {
     "type": "deployment",
     "description": "Deploy to Cloud Run"
   }
   ```

6. **Replit Agent** monitors

   ```bash
   POST /api/swarm/tasks
   {
     "type": "monitoring",
     "description": "Monitor health for 5 minutes"
   }
   ```

All coordinated automatically by the Swarm Coordinator.

## Quick Start Commands

### Check Swarm Health

```bash
curl http://localhost:8080/api/swarm/health
```

### List Capabilities

```bash
curl -H "X-API-Key: test" \
  http://localhost:8080/api/swarm/capabilities
```

### Submit a Task

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

### Start HNC Pipeline

```bash
curl -X POST http://localhost:8080/api/swarm/quick-start/hnc \
  -H "X-API-Key: test" \
  -H "X-Agent-Id: orchestrator"
```

## Future Enhancements

1. **Task Dependencies**
   - Task B waits for Task A completion
   - DAG-based execution

2. **Task Cancellation**
   - DELETE /api/swarm/tasks/:taskId

3. **Real-time Updates**
   - WebSocket connection for live status
   - Server-sent events for progress

4. **Advanced Scheduling**
   - Cron-like scheduled tasks
   - Batch task submission

5. **Result Persistence**
   - Redis for task queue
   - PostgreSQL for results
   - S3 for artifacts

6. **Multi-tenant Support**
   - Isolated swarms per project
   - Resource quotas
   - Priority queues

## Support

For issues or questions:

- Check logs: `docker logs reasoning-gateway`
- Monitor metrics: `/api/swarm/health`
- Review tasks: `/api/swarm/tasks`

---

**Status**: Production Ready
**Version**: 1.0.0
**Last Updated**: 2025-10-07

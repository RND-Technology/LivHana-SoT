### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/autonomous/execute` | Execute a new autonomous task |
| GET | `/api/autonomous/tasks/:taskId` | Get task status and results |
| GET | `/api/autonomous/stream/:taskId` | SSE stream for real-time updates |
| GET | `/api/autonomous/learnings` | Get learned patterns |
| GET | `/api/autonomous/capabilities` | Get agent capabilities |
| POST | `/api/autonomous/approve/:taskId` | Approve/reject changes |
| POST | `/api/autonomous/rollback/:taskId` | Emergency rollback |
| GET | `/api/autonomous/tasks` | List all tasks |
| DELETE | `/api/autonomous/tasks/:taskId` | Cancel a task |
| GET | `/api/autonomous/health` | Health check |

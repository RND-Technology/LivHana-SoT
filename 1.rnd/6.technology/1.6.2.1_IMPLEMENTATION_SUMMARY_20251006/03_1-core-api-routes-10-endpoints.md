### 1. Core API Routes (10 Endpoints)

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/autonomous/execute` | POST | Execute autonomous task | Admin |
| `/api/autonomous/tasks/:taskId` | GET | Get task status & results | Admin |
| `/api/autonomous/stream/:taskId` | GET | SSE real-time progress | Admin |
| `/api/autonomous/learnings` | GET | Get learned patterns | Admin |
| `/api/autonomous/capabilities` | GET | Get agent capabilities | Admin |
| `/api/autonomous/approve/:taskId` | POST | Approve/reject changes | Admin |
| `/api/autonomous/rollback/:taskId` | POST | Emergency rollback | Admin |
| `/api/autonomous/tasks` | GET | List all tasks | Admin |
| `/api/autonomous/tasks/:taskId` | DELETE | Cancel task | Admin |
| `/api/autonomous/health` | GET | Health check | Admin |

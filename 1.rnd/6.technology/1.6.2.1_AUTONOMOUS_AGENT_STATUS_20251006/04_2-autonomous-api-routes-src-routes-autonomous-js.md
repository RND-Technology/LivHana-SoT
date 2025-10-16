### 2. **Autonomous API Routes** (src/routes/autonomous.js)

10 REST endpoints with JWT auth:

```
POST   /api/autonomous/execute        Execute autonomous task
GET    /api/autonomous/tasks/:taskId  Get task status
GET    /api/autonomous/stream/:taskId SSE real-time progress
GET    /api/autonomous/learnings      Get learned patterns
GET    /api/autonomous/capabilities   List available capabilities
POST   /api/autonomous/approve/:taskId Human-in-loop approval
POST   /api/autonomous/rollback/:taskId Emergency rollback
GET    /api/autonomous/history        Execution history
POST   /api/autonomous/cancel/:taskId Cancel running task
GET    /api/autonomous/metrics        Performance metrics
```

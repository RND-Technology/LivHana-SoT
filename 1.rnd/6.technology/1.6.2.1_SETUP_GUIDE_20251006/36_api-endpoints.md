### **API Endpoints:**

```
GET  /health                              - Service health
GET  /api/autonomous/capabilities         - List capabilities
POST /api/autonomous/execute              - Execute task
GET  /api/autonomous/tasks/:taskId        - Get task status
GET  /api/autonomous/stream/:taskId       - Real-time progress (SSE)
GET  /api/autonomous/learnings            - View learned patterns
POST /api/autonomous/approve/:taskId      - Approve changes
POST /api/autonomous/rollback/:taskId     - Emergency rollback
```

---

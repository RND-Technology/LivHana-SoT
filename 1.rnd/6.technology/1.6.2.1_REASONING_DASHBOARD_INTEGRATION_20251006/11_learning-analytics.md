#### Learning & Analytics

- **GET** `/api/autonomous/learnings` - Get patterns learned

  ```json
  {
    "learnings": [],
    "total": 0,
    "returned": 0
  }
  ```

- **GET** `/api/autonomous/health` - Agent health status

  ```json
  {
    "status": "healthy",
    "agent": {
      "initialized": true,
      "capabilities": 9,
      "apiKeyConfigured": true
    },
    "tasks": {
      "total": 0,
      "queued": 0,
      "running": 0,
      "pendingApproval": 0,
      "completed": 0
    },
    "learnings": {
      "total": 0,
      "successful": 0
    }
  }
  ```

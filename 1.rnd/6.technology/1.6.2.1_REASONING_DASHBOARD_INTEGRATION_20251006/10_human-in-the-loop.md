#### Human-in-the-Loop

- **POST** `/api/autonomous/approve/:taskId` - Approve/reject task changes

  ```json
  {
    "approved": true,
    "reason": "Optional reason"
  }
  ```

- **POST** `/api/autonomous/rollback/:taskId` - Emergency rollback

#### Task Management

- **POST** `/api/autonomous/execute` - Execute new autonomous task

  ```json
  {
    "task": "Task description here",
    "context": {
      "customerId": "optional",
      "domain": "optional",
      "priority": "medium"
    },
    "requireApproval": true
  }
  ```

- **GET** `/api/autonomous/tasks` - List all tasks (paginated)

  ```json
  {
    "tasks": [],
    "pagination": {
      "total": 0,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
  ```

- **GET** `/api/autonomous/tasks/:taskId` - Get specific task status
- **DELETE** `/api/autonomous/tasks/:taskId` - Cancel running task

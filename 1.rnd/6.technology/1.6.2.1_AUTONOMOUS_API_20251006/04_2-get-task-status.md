### 2. Get Task Status

Retrieve current status, progress, and results of a task.

**Endpoint:** `GET /api/autonomous/tasks/:taskId`

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "task": "Add a new endpoint to handle user preferences",
  "status": "executing",
  "currentStep": "Step 3/5: write_file",
  "progress": 65,
  "completedSteps": 2,
  "eta": 45,
  "plan": {
    "totalSteps": 5,
    "steps": [
      { "action": "read_file", "target": "src/routes/user.js" },
      { "action": "write_file", "target": "src/routes/user.js" },
      { "action": "write_file", "target": "tests/user.test.js" },
      { "action": "run_tests", "target": "tests/user.test.js" },
      { "action": "execute_bash", "target": "npm run build" }
    ]
  },
  "createdBy": "admin-user-id",
  "createdAt": "2025-10-01T12:00:00.000Z",
  "updatedAt": "2025-10-01T12:02:30.000Z"
}
```

**Task Statuses:**

- `queued` - Task is waiting to be processed
- `analyzing` - AI is analyzing the task requirements
- `planning` - Creating execution plan
- `executing` - Actively executing the plan
- `verifying` - Verifying results
- `learning` - Learning from execution
- `pending_approval` - Waiting for human approval
- `approved` - Approved and deploying
- `completed` - Successfully completed
- `failed` - Execution failed
- `rejected` - Changes rejected by human
- `rolled_back` - Changes have been rolled back
- `cancelled` - Task was cancelled

**Example cURL:**

```bash
curl http://localhost:4002/api/autonomous/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

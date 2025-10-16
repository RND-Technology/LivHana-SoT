### 9. Cancel Task

Cancel a queued or running task.

**Endpoint:** `DELETE /api/autonomous/tasks/:taskId`

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Task cancelled",
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "cancelled",
    "cancelledBy": "admin-user-id",
    "cancelledAt": "2025-10-01T12:01:00.000Z"
  }
}
```

**Example cURL:**

```bash
curl -X DELETE http://localhost:4002/api/autonomous/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

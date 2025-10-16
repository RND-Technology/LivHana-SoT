### 8. List All Tasks

Get paginated list of all tasks with optional filtering.

**Endpoint:** `GET /api/autonomous/tasks`

**Query Parameters:**

- `status` (optional) - Filter by task status
- `limit` (optional, default: 50) - Number of results per page
- `offset` (optional, default: 0) - Pagination offset

**Response:** `200 OK`

```json
{
  "tasks": [
    {
      "id": "task-1",
      "task": "Fix authentication bug",
      "status": "completed",
      "createdAt": "2025-10-01T12:00:00.000Z",
      "completedAt": "2025-10-01T12:03:00.000Z"
    },
    {
      "id": "task-2",
      "task": "Add new endpoint",
      "status": "pending_approval",
      "createdAt": "2025-10-01T11:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

**Example cURL:**

```bash
curl "http://localhost:4002/api/autonomous/tasks?status=completed&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

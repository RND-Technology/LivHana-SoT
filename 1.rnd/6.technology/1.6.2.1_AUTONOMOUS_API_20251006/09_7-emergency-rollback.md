### 7. Emergency Rollback

Rollback changes from a completed task execution.

**Endpoint:** `POST /api/autonomous/rollback/:taskId`

**Request Body:**

```json
{
  "reason": "Production bug introduced by this change"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Task rolled back successfully",
  "changesReverted": [
    "src/routes/user.js",
    "tests/user.test.js"
  ],
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "rolled_back",
    "rollbackInitiatedBy": "admin-user-id",
    "rolledBackAt": "2025-10-01T12:10:00.000Z"
  }
}
```

**Example cURL:**

```bash
curl -X POST http://localhost:4002/api/autonomous/rollback/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Emergency rollback due to production issue"
  }'
```

---

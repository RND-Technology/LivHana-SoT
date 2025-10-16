### 6. Approve Changes (Human-in-the-Loop)

Approve or reject changes from a task execution before deployment.

**Endpoint:** `POST /api/autonomous/approve/:taskId`

**Request Body:**

```json
{
  "approved": true,
  "reason": "Changes look good, tests passing, ready for deployment"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Changes approved and deployed",
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "completed",
    "approvedBy": "admin-user-id",
    "approvedAt": "2025-10-01T12:05:00.000Z",
    "deployedAt": "2025-10-01T12:05:10.000Z"
  }
}
```

**Rejection Example:**

```json
{
  "approved": false,
  "reason": "Tests are failing, need to investigate further"
}
```

**Example cURL (Approve):**

```bash
curl -X POST http://localhost:4002/api/autonomous/approve/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "reason": "Looks good"
  }'
```

**Example cURL (Reject):**

```bash
curl -X POST http://localhost:4002/api/autonomous/approve/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": false,
    "reason": "Need manual review of security implications"
  }'
```

---

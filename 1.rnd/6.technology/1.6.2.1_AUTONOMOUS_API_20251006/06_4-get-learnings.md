### 4. Get Learnings

Retrieve patterns and insights learned from past task executions.

**Endpoint:** `GET /api/autonomous/learnings`

**Query Parameters:**

- `limit` (optional, default: 50) - Maximum number of learnings to return
- `successful` (optional) - Filter by success status (`true` or `false`)

**Response:** `200 OK`

```json
{
  "learnings": [
    {
      "id": "learning-123",
      "timestamp": "2025-10-01T12:00:00.000Z",
      "task": "Fix authentication bug",
      "success": true,
      "patterns": [
        "JWT validation requires checking both expiry and signature",
        "Refresh tokens should have separate validation logic",
        "Always test edge cases with expired tokens"
      ],
      "improvements": [
        "Add more comprehensive token validation",
        "Include refresh token tests in CI pipeline"
      ]
    }
  ],
  "total": 42,
  "returned": 1
}
```

**Example cURL:**

```bash
curl "http://localhost:4002/api/autonomous/learnings?limit=10&successful=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

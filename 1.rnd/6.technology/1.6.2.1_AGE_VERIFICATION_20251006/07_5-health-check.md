### 5. Health Check

Check if the age verification service is healthy.

**Endpoint:** `GET /health/age-verification`

**Authentication:** None required (public endpoint)

**Success Response (200):**

```json
{
  "status": "healthy",
  "service": "age-verification",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "storage": "bigquery"
}
```

---

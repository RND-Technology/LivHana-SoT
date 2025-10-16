## Step 7: Verify Service Health

```bash
curl http://localhost:3005/health/age-verification
```

Expected response:

```json
{
  "status": "healthy",
  "service": "age-verification",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "storage": "bigquery"
}
```

---

#### Option B: Polling

```bash
# Poll for status
watch -n 2 "curl -s http://localhost:4002/api/autonomous/tasks/550e8400-... \
  -H 'Authorization: Bearer $ADMIN_JWT_TOKEN' | jq '.status, .progress, .currentStep'"
```

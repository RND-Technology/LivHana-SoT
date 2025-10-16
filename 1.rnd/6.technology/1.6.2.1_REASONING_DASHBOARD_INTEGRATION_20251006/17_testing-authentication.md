### Testing Authentication

```bash
# Set token
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtdXNlci1sb2NhbCIsImlkIjoiZGV2LXVzZXItaWQiLCJyb2xlIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbiIsInVzZXIiXSwibmFtZSI6IkxvY2FsIERldiBVc2VyIiwiZW1haWwiOiJkZXZAbGl2aGFuYS5sb2NhbCIsImlhdCI6MTc1OTM1NjgwMiwiZXhwIjoxNzU5OTYxNjAyLCJhdWQiOiJsaXZoYW5hLWxvY2FsIiwiaXNzIjoibGl2aGFuYS1sb2NhbCJ9.dCCP6cVdSFLNeMQ9dYP8ycMsmUmqFIvdn4C3cesmU64"

# Test capabilities
curl -H "Authorization: Bearer $TOKEN" http://localhost:4002/api/autonomous/capabilities

# Test tasks list
curl -H "Authorization: Bearer $TOKEN" http://localhost:4002/api/autonomous/tasks

# Execute a test task
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"task":"List files in current directory","requireApproval":false}' \
  http://localhost:4002/api/autonomous/execute
```

---

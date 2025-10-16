### List All Active Tasks

```bash
curl -s -H "X-API-Key: test" \
  "http://localhost:8080/api/swarm/tasks?status=in_progress" | jq '.'
```

---

### **8B. Review Audit Report**

```bash
# Get taskId from response, then fetch result:
curl -s "http://localhost:4002/api/autonomous/tasks/{taskId}" \
  -H "Authorization: Bearer $TOKEN" | jq .result
```

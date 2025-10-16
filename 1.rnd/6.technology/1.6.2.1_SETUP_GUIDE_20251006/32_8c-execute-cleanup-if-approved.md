### **8C. Execute Cleanup (If Approved)**

```bash
curl -X POST "http://localhost:4002/api/autonomous/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Fix all issues found in audit report {taskId}. Apply fixes one file at a time, run tests after each change, and create a git commit with detailed message.",
    "context": {
      "audit_task_id": "{taskId}",
      "require_approval": true,
      "run_tests": true
    }
  }'
```

---

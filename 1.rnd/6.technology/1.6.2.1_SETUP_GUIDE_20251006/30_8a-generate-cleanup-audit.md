### **8A. Generate Cleanup Audit**

```bash
curl -X POST "http://localhost:4002/api/autonomous/execute" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Audit the backend/common directory for code quality issues. Look for: 1) Unused imports, 2) Copilot/Codex legacy comments, 3) Inconsistent error handling, 4) Missing JSDoc, 5) Magic numbers. Generate a detailed report with file:line references.",
    "context": {
      "type": "code-audit",
      "scope": "backend/common",
      "priority": "high"
    }
  }'
```

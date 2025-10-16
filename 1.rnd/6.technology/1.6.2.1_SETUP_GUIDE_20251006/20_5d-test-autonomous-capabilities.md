### **5D. Test Autonomous Capabilities**

```bash
curl -s "http://localhost:4002/api/autonomous/capabilities" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected:**

```json
{
  "capabilities": [
    "read_file",
    "write_file",
    "execute_bash",
    "search_codebase",
    "run_tests",
    "deploy_code",
    "query_database",
    "analyze_logs",
    "generate_reports"
  ],
  "model": "claude-sonnet-4-20250514",
  "status": "ready"
}
```

**If You Get:**

- `{"error":"Invalid token"}` → Token generation failed, check JWT_SECRET in .env
- `Error: ANTHROPIC_API_KEY environment variable required` → API key not loaded
- Connection refused → Service not running on port 4002

---

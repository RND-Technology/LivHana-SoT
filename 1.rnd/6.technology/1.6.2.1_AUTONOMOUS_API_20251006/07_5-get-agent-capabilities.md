### 5. Get Agent Capabilities

Get comprehensive list of what the autonomous agent can do.

**Endpoint:** `GET /api/autonomous/capabilities`

**Response:** `200 OK`

```json
{
  "actions": [
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
  "features": {
    "autonomousExecution": true,
    "selfHealing": true,
    "learningEngine": true,
    "rollbackSupport": true,
    "humanInTheLoop": true,
    "progressStreaming": true,
    "extendedThinking": true
  },
  "limits": {
    "maxTaskDuration": "10 minutes",
    "maxFileSize": "10MB",
    "supportedLanguages": ["JavaScript", "TypeScript", "Python", "SQL", "Bash"],
    "maxConcurrentTasks": 5
  },
  "integrations": {
    "bigQuery": true,
    "github": true,
    "redis": true,
    "anthropic": true
  }
}
```

**Example cURL:**

```bash
curl http://localhost:4002/api/autonomous/capabilities \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

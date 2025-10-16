#### Capabilities

- **GET** `/api/autonomous/capabilities`

  ```json
  {
    "actions": ["read_file", "write_file", "execute_bash", "search_codebase", "run_tests", "deploy_code", "query_database", "analyze_logs", "generate_reports"],
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
      "bigQuery": false,
      "github": false,
      "redis": false,
      "anthropic": true
    }
  }
  ```

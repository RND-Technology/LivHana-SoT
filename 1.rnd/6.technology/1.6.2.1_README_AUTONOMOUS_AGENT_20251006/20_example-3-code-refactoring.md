### Example 3: Code Refactoring

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Refactor duplicate error handling code into a shared utility",
    "context": {
      "targetFiles": [
        "backend/voice-service/src/index.js",
        "backend/reasoning-gateway/src/index.js",
        "backend/integration-service/src/index.js"
      ],
      "createUtility": "backend/common/errors/handler.js",
      "ensureTestsContinueToPass": true
    },
    "requireApproval": true
  }'
```

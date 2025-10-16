### Example 1: Bug Fix

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Fix the JWT token expiration bug in auth middleware",
    "context": {
      "errorMessage": "Token validation fails after 1 hour instead of 24 hours",
      "affectedFile": "backend/common/auth/middleware.js",
      "expectedBehavior": "Tokens should be valid for 24 hours"
    },
    "requireApproval": false
  }'
```

### Example 4: Database Migration

```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Create a database migration to add a new user preferences table",
    "context": {
      "database": "postgres",
      "table": "user_preferences",
      "columns": {
        "user_id": "UUID PRIMARY KEY",
        "theme": "VARCHAR(20)",
        "notifications_enabled": "BOOLEAN DEFAULT true",
        "language": "VARCHAR(10) DEFAULT en"
      },
      "createIndexOn": ["user_id"],
      "addForeignKey": "users(id)"
    },
    "requireApproval": true
  }'
```

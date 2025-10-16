### 2. Provide Rich Context

```javascript
{
  "task": "Fix the bug",
  "context": {
    "errorMessage": "Exact error message",
    "affectedEndpoint": "/api/users",
    "stepsToReproduce": ["1. Login", "2. Click users"],
    "expectedBehavior": "Should return user list",
    "actualBehavior": "Returns 500 error"
  }
}
```

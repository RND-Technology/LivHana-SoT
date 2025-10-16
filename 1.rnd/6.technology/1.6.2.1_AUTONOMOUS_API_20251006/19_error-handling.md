## Error Handling

All endpoints return standard error responses:

**400 Bad Request:**

```json
{
  "error": "Task description is required"
}
```

**401 Unauthorized:**

```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**

```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

**404 Not Found:**

```json
{
  "error": "Task not found"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Task execution failed",
  "message": "Detailed error message"
}
```

---

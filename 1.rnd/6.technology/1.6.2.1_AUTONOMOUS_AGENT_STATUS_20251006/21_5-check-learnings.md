### **5. Check Learnings**

```bash
curl http://localhost:4002/api/autonomous/learnings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**

```json
{
  "patterns": [
    "Always run tests after file modifications",
    "Users prefer /preferences over /settings endpoint naming",
    "JWT auth fails if JWT_SECRET not set"
  ],
  "improvements": [
    "Add input validation to all POST endpoints",
    "Cache frequently accessed files"
  ],
  "nextSteps": [
    "Implement rate limiting",
    "Add API documentation"
  ]
}
```

---

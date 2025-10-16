### **5B. Test Health Endpoint**

```bash
curl -s http://localhost:4002/health | jq .
```

**Expected:**

```json
{
  "status": "healthy",
  "service": "reasoning-gateway",
  "queue": "voice-mode-reasoning-jobs"
}
```

### **Problem: API key not found**

```bash
cd backend/reasoning-gateway
cat .env | grep ANTHROPIC
[REDACTED - SECURITY BREACH]

# If missing, re-add:
echo "ANTHROPIC_API_KEY=$(op item get vpxxhnpqtsc6wxgnfm444b52p4 --reveal --fields credential)" >> .env
```

---

### **2B. Verify Redis Is Running**

```bash
redis-cli ping
# Expected: PONG
# If not running:
brew services start redis
```

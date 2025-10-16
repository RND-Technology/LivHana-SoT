### Logs

```bash
# Backend logs
cd backend/reasoning-gateway
npm run dev 2>&1 | tee logs/debug.log

# Check for auth errors
grep -i "auth\|jwt\|unauthorized" logs/debug.log
```

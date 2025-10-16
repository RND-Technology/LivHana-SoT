### Option 3: Revert to Previous Service

```bash
# Stop integration service
pm2 stop integration-service

# Revert to previous commit
git revert HEAD

# Restart service
pm2 start integration-service
```

---

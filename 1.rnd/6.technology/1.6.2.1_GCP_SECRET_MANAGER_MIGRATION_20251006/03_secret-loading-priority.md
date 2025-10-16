### Secret Loading Priority

```
1. GCP Secret Manager (Production)
   ↓ (if fails)
2. 1Password op:// references (Local Dev)
   ↓ (if fails)
3. Direct .env values (Emergency Fallback)
```

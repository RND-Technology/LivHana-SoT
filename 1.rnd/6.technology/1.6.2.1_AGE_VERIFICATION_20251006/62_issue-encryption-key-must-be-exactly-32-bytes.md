### Issue: "Encryption key must be exactly 32 bytes"

**Solution:** Regenerate key with correct length:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex').substring(0, 32))"
```

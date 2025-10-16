### Issue: "Invalid token"

**Solution:** Verify JWT configuration:

```bash
# Ensure JWT secret is set
echo $JWT_SECRET

# Check token includes required claims
# Token must have 'aud', 'iss', and valid signature
```

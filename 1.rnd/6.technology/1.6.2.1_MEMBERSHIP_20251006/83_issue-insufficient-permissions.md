### Issue: "Insufficient permissions"

**Solution:** For admin endpoints, JWT must include admin role:

```javascript
// JWT payload must include:
{
  "sub": "user123",
  "role": "admin",  // Required for stats endpoint
  "aud": "livhana-api",
  "iss": "livhana-auth"
}
```

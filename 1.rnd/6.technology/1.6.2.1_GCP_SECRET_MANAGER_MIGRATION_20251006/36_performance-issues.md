### Performance Issues

```javascript
// Increase cache TTL to reduce API calls
const secret = await getSecret('MY_SECRET', {
  expiresIn: 48 * 60 * 60 * 1000 // 48 hours
});

// Disable auto-rotation if not needed
// Set AUTO_ROTATE_SECRETS=false in .env
```

---

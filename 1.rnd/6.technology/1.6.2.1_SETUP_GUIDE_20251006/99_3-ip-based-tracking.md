#### 3. IP-based Tracking

```javascript
// Uses IP for unauthenticated, user ID for authenticated
keyGenerator: (req) => {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  return req.ip || req.connection.remoteAddress;
}
```

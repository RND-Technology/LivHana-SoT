### Admin-Only Access

All autonomous endpoints require:

1. Valid JWT token
2. Admin role in JWT claims

```javascript
// JWT must contain:
{
  "role": "admin"  // or
  "roles": ["admin"]
}
```

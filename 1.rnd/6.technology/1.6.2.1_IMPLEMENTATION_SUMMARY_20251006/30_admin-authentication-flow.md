### Admin Authentication Flow

```javascript
Request → authMiddleware (JWT validation)
              ↓
         req.user populated
              ↓
       adminMiddleware (role check)
              ↓
         Check role === 'admin'
              ↓
    Proceed or 403 Forbidden
```

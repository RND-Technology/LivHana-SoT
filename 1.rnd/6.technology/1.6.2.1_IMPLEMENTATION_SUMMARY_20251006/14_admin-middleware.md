#### Admin Middleware

Created `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/common/auth/admin-middleware.js`:

- Extends base auth middleware
- Requires admin role in JWT
- Logs unauthorized attempts
- Returns 403 for non-admins

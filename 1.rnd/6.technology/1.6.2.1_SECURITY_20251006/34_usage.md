#### Usage

```javascript
const { logAuditEvent, AUDIT_EVENTS, SEVERITY } = require('../../common/logging/audit-logger');

// Log an audit event
await logAuditEvent({
  eventType: AUDIT_EVENTS.AUTH_LOGIN_SUCCESS,
  severity: SEVERITY.INFO,
  userId: user.id,
  userRole: user.role,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  resource: '/api/auth/login',
  action: 'POST',
  result: 'success',
  details: { method: '2fa' }
});
```

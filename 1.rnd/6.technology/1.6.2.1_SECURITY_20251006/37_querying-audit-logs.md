#### Querying Audit Logs

```javascript
const { queryAuditLogs } = require('../../common/logging/audit-logger');

// Get failed login attempts in last 24 hours
const logs = await queryAuditLogs({
  eventType: AUDIT_EVENTS.AUTH_LOGIN_FAILURE,
  startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
  limit: 100
});
```

---

#### Audit Log Structure

```json
{
  "timestamp": "2025-10-01T12:00:00.000Z",
  "eventType": "auth.login.success",
  "severity": "INFO",
  "userId": "user-uuid",
  "userRole": "user",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "resource": "/api/auth/login",
  "action": "POST",
  "result": "success",
  "details": {},
  "sessionId": "session-id",
  "requestId": "req_123456",
  "environment": "production",
  "serviceName": "integration-service"
}
```

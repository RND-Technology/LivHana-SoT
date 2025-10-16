### Logging

All operations are logged with structured logging:

- Customer ID
- Operation type
- Timestamps
- Error details
- Performance metrics

Example:

```json
{
  "level": "info",
  "customerId": "customer-123",
  "interactionId": "uuid",
  "msg": "Learned from interaction"
}
```

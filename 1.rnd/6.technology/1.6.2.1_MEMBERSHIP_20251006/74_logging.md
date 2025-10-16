### Logging

All operations are logged with structured logging:

```javascript
// Subscription created
logger.info('Membership created', {
  membershipId: 'MEM_12345',
  customerId: 'CUST_67890',
  tier: 'SILVER'
});

// Upgrade completed
logger.info('Membership upgraded', {
  customerId: 'CUST_67890',
  from: 'BRONZE',
  to: 'SILVER'
});

// Cancellation
logger.info('Membership cancelled', {
  customerId: 'CUST_67890',
  membershipId: 'MEM_12345',
  reason: 'Customer request'
});
```

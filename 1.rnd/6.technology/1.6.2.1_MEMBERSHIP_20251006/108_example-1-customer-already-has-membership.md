### Example 1: Customer Already Has Membership

```javascript
const response = await fetch('/api/memberships/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`
  },
  body: JSON.stringify({
    customerId: 'CUST_12345',
    email: 'jane@example.com',
    tier: 'SILVER',
    paymentMethod: { id: 'pm_123' }
  })
});

// Response: 400 Bad Request
{
  "success": false,
  "error": "Customer already has an active membership"
}
```

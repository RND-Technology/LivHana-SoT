### 1. Customer Subscribes to Silver Membership

**Frontend Flow:**

1. Customer selects Silver tier ($97/month)
2. Customer enters payment method
3. Frontend calls subscribe endpoint

```javascript
// Example: Customer checkout flow
const subscribeToMembership = async () => {
  const response = await fetch('/api/memberships/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    },
    body: JSON.stringify({
      customerId: 'CUST_12345',
      email: 'jane.doe@example.com',
      tier: 'SILVER',
      paymentMethod: {
        id: 'pm_card_mastercard',
        type: 'card',
        last4: '5555'
      }
    })
  });

  const result = await response.json();

  if (result.success) {
    console.log('Membership created:', result.membership);
    // Show success message
    // Redirect to membership dashboard
  } else {
    console.error('Subscription failed:', result.error);
    // Show error to user
  }
};
```

**Response:**

```json
{
  "success": true,
  "membership": {
    "id": "MEM_1696800000000_abc123",
    "customer_id": "CUST_12345",
    "email": "jane.doe@example.com",
    "tier": "SILVER",
    "status": "active",
    "price": 97.00,
    "discount_percent": 20,
    "subscription_id": "SUB_SILVER_1696800000000_def456",
    "start_date": "2025-10-01T12:00:00.000Z",
    "next_billing_date": "2025-11-01T12:00:00.000Z"
  }
}
```

---

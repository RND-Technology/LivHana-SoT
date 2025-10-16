#### 1. Subscribe to Membership

```javascript
const subscribeMembership = async (customerId, email, tier, paymentMethod) => {
  const response = await fetch('/api/memberships/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`
    },
    body: JSON.stringify({
      customerId,
      email,
      tier,
      paymentMethod
    })
  });

  const data = await response.json();
  return data;
};
```

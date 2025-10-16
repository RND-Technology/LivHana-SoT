#### Apply Discount at Checkout

```javascript
const { calculateMembershipDiscount } = require('./membership');

async function processOrder(customerId, items) {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Get membership
  const membership = await getMembershipByCustomerId(customerId);

  let discount = 0;
  if (membership && membership.status === 'active') {
    discount = calculateMembershipDiscount(subtotal, membership.tier);
  }

  const total = subtotal - discount;

  return {
    subtotal,
    discount,
    total,
    membershipTier: membership?.tier
  };
}
```

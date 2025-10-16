### 7. Backend Integration - Order Processing

**Automatic Discount Application:**

```javascript
// Example: Backend order processing with membership discount
const { calculateMembershipDiscount } = require('./membership');

async function processOrder(customerId, orderItems) {
  // Calculate order subtotal
  const subtotal = orderItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  // Get customer membership
  const membership = await getMembershipByCustomerId(customerId);

  // Calculate discount
  let discount = 0;
  let membershipTier = null;

  if (membership && membership.status === 'active') {
    discount = calculateMembershipDiscount(subtotal, membership.tier);
    membershipTier = membership.tier;
  }

  // Calculate final total
  const total = subtotal - discount;

  // Create order record
  const order = {
    id: generateOrderId(),
    customerId,
    items: orderItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    membershipDiscount: parseFloat(discount.toFixed(2)),
    membershipTier,
    total: parseFloat(total.toFixed(2)),
    createdAt: new Date().toISOString()
  };

  // Save order to database
  await saveOrder(order);

  return order;
}

// Example usage
const order = await processOrder('CUST_12345', [
  { id: 'PROD_1', name: 'Premium Flower', price: 45.00, quantity: 2 },
  { id: 'PROD_2', name: 'CBD Tincture', price: 60.00, quantity: 1 }
]);

console.log(order);
// {
//   id: 'ORD_12345',
//   customerId: 'CUST_12345',
//   subtotal: 150.00,
//   membershipDiscount: 30.00,  // 20% off Silver tier
//   membershipTier: 'SILVER',
//   total: 120.00
// }
```

---

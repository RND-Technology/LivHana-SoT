### Frontend Checkout

```javascript
// 1. Get discount
const discount = await fetch(`/api/memberships/discount/${customerId}?subtotal=${total}`);

// 2. Apply to order
if (discount.hasDiscount) {
  orderTotal = discount.finalTotal;
}
```

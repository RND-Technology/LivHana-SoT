### Example: Checkout Discount

```javascript
// During checkout, calculate discount
const response = await fetch(
  `/api/memberships/discount/${customerId}?subtotal=${cartTotal}`,
  {
    headers: { 'Authorization': `Bearer ${jwtToken}` }
  }
);

const discount = await response.json();

if (discount.hasDiscount) {
  // Apply discount to cart
  displayDiscount(discount.discountAmount, discount.tier);
  updateTotal(discount.finalTotal);
}
```

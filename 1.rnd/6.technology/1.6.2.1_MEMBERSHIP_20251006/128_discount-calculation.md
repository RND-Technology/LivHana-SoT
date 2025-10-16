## Discount Calculation

```javascript
// In checkout flow:
const discountAmount = subtotal * (tier.discountPercent / 100);
const finalTotal = subtotal - discountAmount;
```

Example:

- Subtotal: $200.00
- Silver (20%): -$40.00
- Total: $160.00

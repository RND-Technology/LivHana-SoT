### 2. Apply Membership Discount at Checkout

**Checkout Flow:**

1. Customer adds items to cart
2. System checks for membership
3. Discount automatically applied

```javascript
// Example: Calculate discount during checkout
const processCheckout = async (cartItems, customerId) => {
  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  console.log('Cart subtotal:', subtotal); // $250.00

  // Get membership discount
  const discountResponse = await fetch(
    `/api/memberships/discount/${customerId}?subtotal=${subtotal}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
      }
    }
  );

  const discount = await discountResponse.json();

  if (discount.hasDiscount) {
    console.log(`${discount.tier} member discount: -$${discount.discountAmount}`);
    console.log(`Final total: $${discount.finalTotal}`);

    // Display to user:
    // Subtotal: $250.00
    // Silver Member Discount (20%): -$50.00
    // Total: $200.00
    // You saved $50.00!
  }

  return {
    subtotal,
    discount: discount.discountAmount,
    total: discount.finalTotal,
    membershipTier: discount.tier
  };
};
```

**Example Cart Calculation:**

| Item | Price | Quantity | Subtotal |
|------|-------|----------|----------|
| Premium Flower | $45.00 | 2 | $90.00 |
| CBD Tincture | $60.00 | 1 | $60.00 |
| Edibles Pack | $50.00 | 2 | $100.00 |
| **Subtotal** | | | **$250.00** |
| **Silver Member Discount (20%)** | | | **-$50.00** |
| **Final Total** | | | **$200.00** |

---

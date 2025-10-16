#### 2. Get Membership During Checkout

```javascript
const getMembershipDiscount = async (customerId, subtotal) => {
  const response = await fetch(
    `/api/memberships/discount/${customerId}?subtotal=${subtotal}`,
    {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    }
  );

  const data = await response.json();

  if (data.hasDiscount) {
    console.log(`Save $${data.discountAmount} with ${data.tier} membership!`);
  }

  return data;
};
```

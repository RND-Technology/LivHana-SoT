### Frontend Integration

```javascript
// Before checkout, check if customer is verified
async function proceedToCheckout(customerId) {
  const response = await fetch(
    `/api/age-verification/status/${customerId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  const data = await response.json();

  if (data.verified && !data.expired) {
    // Allow checkout
    window.location.href = '/checkout';
  } else {
    // Redirect to age verification page
    window.location.href = `/age-verification?customerId=${customerId}`;
  }
}
```

### Example 1: Checkout Flow

```javascript
// Check if customer is verified before checkout
async function checkoutFlow(customerId) {
  try {
    const response = await fetch(
      `http://localhost:3005/api/age-verification/status/${customerId}`,
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (data.verified && !data.expired) {
      // Proceed with checkout
      return proceedToCheckout();
    } else {
      // Redirect to age verification
      return redirectToAgeVerification();
    }
  } catch (error) {
    console.error('Verification check failed:', error);
    return showError();
  }
}
```

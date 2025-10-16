### Frontend: Check Verification Before Checkout

```javascript
// checkout.js - React/Vue/vanilla JS
import { useState, useEffect } from 'react';

function CheckoutPage({ customerId, cartItems }) {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAgeVerification();
  }, [customerId]);

  async function checkAgeVerification() {
    try {
      const response = await fetch(
        `/api/age-verification/status/${customerId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      setVerificationStatus(data);
      setLoading(false);

      if (!data.verified || data.expired) {
        // Redirect to age verification page
        window.location.href = `/age-verification?return=/checkout`;
      }
    } catch (error) {
      console.error('Failed to check verification:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Checking age verification...</div>;
  }

  if (!verificationStatus?.verified || verificationStatus?.expired) {
    return (
      <div className="verification-required">
        <h2>Age Verification Required</h2>
        <p>To complete your purchase, please verify your age.</p>
        <button onClick={() => window.location.href = '/age-verification'}>
          Verify Age
        </button>
      </div>
    );
  }

  return (
    <div className="checkout">
      <h2>Checkout</h2>
      {/* Checkout form */}
    </div>
  );
}
```

### Example 2: Age Verification Form

```javascript
// Submit age verification form
async function submitAgeVerification(formData) {
  try {
    const response = await fetch(
      'http://localhost:3005/api/age-verification/verify',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: formData.customerId,
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth, // YYYY-MM-DD
          idNumberLast4: formData.idLast4,
          state: formData.state
        })
      }
    );

    const data = await response.json();

    if (data.success && data.verified) {
      // Success - redirect to checkout
      showSuccessMessage('Age verified successfully!');
      return redirectToCheckout();
    } else if (response.status === 429) {
      // Rate limited
      showError(`Too many attempts. Try again after ${new Date(data.resetAt).toLocaleString()}`);
    } else {
      // Failed verification
      showError(data.reason || 'Verification failed');
    }
  } catch (error) {
    console.error('Verification failed:', error);
    showError('Unable to verify age. Please try again.');
  }
}
```

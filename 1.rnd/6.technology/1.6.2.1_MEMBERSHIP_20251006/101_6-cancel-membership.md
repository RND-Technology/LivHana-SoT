### 6. Cancel Membership

**Cancellation Flow:**

```javascript
// Example: Cancel membership with feedback
const cancelMembership = async (customerId) => {
  // Collect cancellation reason
  const reason = prompt('We\'re sorry to see you go. Can you tell us why?');

  if (!reason) return; // User cancelled

  const confirmed = confirm(
    'Are you sure you want to cancel your membership?\n' +
    'You will keep your benefits until the end of your current billing period.'
  );

  if (!confirmed) return;

  // Process cancellation
  const response = await fetch(`/api/memberships/${customerId}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    },
    body: JSON.stringify({
      reason: reason
    })
  });

  const result = await response.json();

  if (result.success) {
    const endDate = new Date(result.membership.next_billing_date);
    alert(
      'Membership cancelled.\n' +
      `You will keep your benefits until ${endDate.toLocaleDateString()}.\n` +
      'No further charges will be made.'
    );
  } else {
    console.error('Cancellation failed:', result.error);
  }
};
```

---

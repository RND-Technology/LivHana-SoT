### 4. Upgrade from Bronze to Gold

**Upgrade Flow:**

```javascript
// Example: Upgrade membership tier
const upgradeMembership = async (customerId, newTier) => {
  // Confirm with user
  const tierConfig = {
    'BRONZE': { price: 47, discount: 10 },
    'SILVER': { price: 97, discount: 20 },
    'GOLD': { price: 197, discount: 30 }
  };

  const currentTier = 'BRONZE';
  const proratedCharge = tierConfig[newTier].price - tierConfig[currentTier].price;

  const confirmed = confirm(
    `Upgrade to ${newTier} membership?\n` +
    `You will be charged $${proratedCharge} today for the upgrade.\n` +
    `Starting next month, you'll be charged $${tierConfig[newTier].price}/month.`
  );

  if (!confirmed) return;

  // Process upgrade
  const response = await fetch(`/api/memberships/${customerId}/upgrade`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    },
    body: JSON.stringify({
      newTier: newTier
    })
  });

  const result = await response.json();

  if (result.success) {
    console.log('Upgraded to', result.membership.tier);
    console.log('Prorated charge:', result.proratedCharge);
    // Show success message
    // Refresh membership display
  } else {
    console.error('Upgrade failed:', result.error);
  }
};
```

**Timeline Example:**

- Oct 1: Customer subscribes to Bronze ($47/month)
- Oct 15: Customer upgrades to Gold
  - Immediate charge: $150 (proration: $197 - $47)
  - New discount: 30% (was 10%)
- Nov 1: Regular Gold billing begins ($197/month)

---

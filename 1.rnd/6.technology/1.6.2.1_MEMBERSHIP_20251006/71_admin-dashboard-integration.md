## Admin Dashboard Integration

```javascript
// Admin only - requires JWT with admin role
const response = await fetch('/api/memberships/stats', {
  headers: { 'Authorization': `Bearer ${adminJwtToken}` }
});

const { stats } = await response.json();

// Display:
// - MRR: $1,349.00
// - Active Members: 17
// - Churn Rate: 5.26%
// - Tier Distribution: Bronze (10), Silver (5), Gold (2)
// - Lifetime Value: Bronze ($564), Silver ($1,164), Gold ($2,364)
```

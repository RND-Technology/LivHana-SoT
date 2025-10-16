### Admin Dashboard

```javascript
// Display metrics
const { stats } = await fetch('/api/memberships/stats');
displayMRR(stats.monthlyRecurringRevenue);
displayChurnRate(stats.churnRate);
```

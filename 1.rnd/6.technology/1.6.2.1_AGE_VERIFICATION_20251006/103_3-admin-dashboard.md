### 3. Admin Dashboard

```javascript
// Display verification statistics
const stats = await getVerificationStatistics({ days: 30 });
displayMetrics({
  successRate: stats.successRate,
  totalAttempts: stats.totalAttempts,
  // ...
});
```

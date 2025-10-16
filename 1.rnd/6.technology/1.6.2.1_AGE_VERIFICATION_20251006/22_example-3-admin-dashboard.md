### Example 3: Admin Dashboard

```javascript
// Get verification statistics for admin dashboard
async function loadVerificationStats() {
  try {
    const response = await fetch(
      'http://localhost:3005/api/age-verification/statistics?days=30',
      {
        headers: {
          'Authorization': `Bearer ${adminJwtToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (data.success) {
      updateDashboard({
        totalAttempts: data.statistics.totalAttempts,
        successRate: data.statistics.successRate + '%',
        failed: data.statistics.failedVerifications
      });
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}
```

---

## Example 2: Admin Dashboard Integration

```javascript
// admin-dashboard.js
import { useState, useEffect } from 'react';

function AgeVerificationDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30); // days

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  async function loadStatistics() {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/age-verification/statistics?days=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminJwt')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();
      setStats(data.statistics);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading statistics...</div>;
  }

  return (
    <div className="verification-dashboard">
      <h2>Age Verification Statistics</h2>

      <div className="time-range-selector">
        <button onClick={() => setTimeRange(7)} className={timeRange === 7 ? 'active' : ''}>
          7 Days
        </button>
        <button onClick={() => setTimeRange(30)} className={timeRange === 30 ? 'active' : ''}>
          30 Days
        </button>
        <button onClick={() => setTimeRange(90)} className={timeRange === 90 ? 'active' : ''}>
          90 Days
        </button>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Attempts</h3>
            <div className="stat-value">{stats.totalAttempts.toLocaleString()}</div>
          </div>

          <div className="stat-card">
            <h3>Successful Verifications</h3>
            <div className="stat-value">{stats.successfulVerifications.toLocaleString()}</div>
          </div>

          <div className="stat-card">
            <h3>Failed Verifications</h3>
            <div className="stat-value">{stats.failedVerifications.toLocaleString()}</div>
          </div>

          <div className="stat-card success-rate">
            <h3>Success Rate</h3>
            <div className="stat-value">{stats.successRate}%</div>
            {parseFloat(stats.successRate) < 95 && (
              <div className="warning">Below target (95%)</div>
            )}
          </div>
        </div>
      )}

      <div className="period-info">
        <small>Statistics for the last {stats?.period}</small>
      </div>
    </div>
  );
}
```

---

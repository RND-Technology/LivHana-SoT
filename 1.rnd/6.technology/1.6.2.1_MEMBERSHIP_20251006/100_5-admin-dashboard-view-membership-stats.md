### 5. Admin Dashboard - View Membership Stats

**Admin Panel:**

```javascript
// Example: Admin dashboard component
const MembershipDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch('/api/memberships/stats', {
        headers: {
          'Authorization': `Bearer ${adminJwtToken}` // Must have admin role
        }
      });

      const data = await response.json();
      setStats(data.stats);
    };

    fetchStats();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="membership-dashboard">
      <h1>Membership Analytics</h1>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Monthly Recurring Revenue</h3>
          <p className="big-number">${stats.monthlyRecurringRevenue.toLocaleString()}</p>
        </div>

        <div className="metric-card">
          <h3>Active Members</h3>
          <p className="big-number">{stats.activeMembers}</p>
        </div>

        <div className="metric-card">
          <h3>Churn Rate</h3>
          <p className="big-number">{stats.churnRate}</p>
        </div>
      </div>

      <div className="tier-distribution">
        <h2>Members by Tier</h2>
        <ul>
          <li>Bronze: {stats.tierDistribution.BRONZE}</li>
          <li>Silver: {stats.tierDistribution.SILVER}</li>
          <li>Gold: {stats.tierDistribution.GOLD}</li>
        </ul>
      </div>

      <div className="lifetime-value">
        <h2>Lifetime Value by Tier</h2>
        <ul>
          <li>Bronze: ${stats.lifetimeValueByTier.BRONZE}</li>
          <li>Silver: ${stats.lifetimeValueByTier.SILVER}</li>
          <li>Gold: ${stats.lifetimeValueByTier.GOLD}</li>
        </ul>
      </div>

      <p className="timestamp">
        Last updated: {new Date(stats.generatedAt).toLocaleString()}
      </p>
    </div>
  );
};
```

**Example Output:**

```
Membership Analytics

┌─────────────────────────────────┐
│ Monthly Recurring Revenue       │
│ $1,349.00                       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Active Members                  │
│ 17                              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Churn Rate                      │
│ 5.26%                           │
└─────────────────────────────────┘

Members by Tier:
• Bronze: 10 members
• Silver: 5 members
• Gold: 2 members

Lifetime Value by Tier:
• Bronze: $564.00
• Silver: $1,164.00
• Gold: $2,364.00
```

---

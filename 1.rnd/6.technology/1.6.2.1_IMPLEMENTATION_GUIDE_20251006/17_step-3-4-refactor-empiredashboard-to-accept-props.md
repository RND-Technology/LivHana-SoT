### Step 3.4: Refactor EmpireDashboard to Accept Props

**File:** `src/components/EmpireDashboard.jsx`

**Update component signature (line 4):**

```javascript
const EmpireDashboard = ({ data }) => {
  // Use data from props for revenue metrics
  // Remove mock data, use real BigQuery data if available
```

**Replace lines 14-29 with:**

```javascript
const [liveMetrics, setLiveMetrics] = useState({
  dailyRevenue: data?.metrics?.todayRevenue || 0,
  activeEngines: 9,
  domainStatus: {},
  productViews: data?.metrics?.totalTransactions || 0
});

// Remove animation loop, use real data
useEffect(() => {
  if (data?.metrics?.todayRevenue) {
    setLiveMetrics(prev => ({
      ...prev,
      dailyRevenue: data.metrics.todayRevenue
    }));
  }
}, [data]);
```

---

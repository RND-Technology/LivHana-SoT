### Step 3.3: Refactor SquareLiveCockpit to Accept Props

**File:** `src/components/SquareLiveCockpit.jsx`

**Update component signature (line 10):**

```javascript
const SquareLiveCockpit = ({ data }) => {
  // Remove data state
  // Remove fetchLiveData
  // Use data from props
```

**Replace data fetching (lines 11-66) with:**

```javascript
// Derive from props
const liveData = {
  metrics: data?.metrics || {
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    yearRevenue: 0,
    totalTransactions: 0,
    totalCustomers: 0,
    avgOrderValue: 0
  },
  topProducts: data?.topProducts || [],
  recentTransactions: data?.recentTransactions || [],
  historicalData: data?.historical || [],
  lastUpdate: new Date().toISOString(),
  mode: data?.mode || 'live'
};

// Remove useEffect for data fetching
// Keep refresh button to trigger parent refresh
```

### Step 3.2: Refactor ExecutiveDashboard to Accept Props

**File:** `src/components/ExecutiveDashboard.jsx`

**Update component signature (line 79):**

```javascript
const ExecutiveDashboard = ({ data }) => {
  // Remove all fetch functions
  // Remove loading state (parent handles loading)
  // Use data from props instead of state
```

**Replace data fetching with prop usage:**

```javascript
// BEFORE: useState + useEffect + fetch functions
// AFTER: Derive from props

const revenueMetrics = data?.bigquery?.metrics
  ? {
      today: data.bigquery.metrics.todayRevenue || 0,
      week: data.bigquery.metrics.weekRevenue || 0,
      month: data.bigquery.metrics.monthRevenue || 0,
      year: data.bigquery.metrics.yearRevenue || 0,
    }
  : { today: 0, week: 0, month: 0, year: 0 };

const orderMetrics = data?.bigquery?.recentTransactions
  ? {
      today: data.bigquery.recentTransactions.filter(t => {
        const txDate = new Date(t.created_at);
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        return txDate.getTime() >= dayAgo;
      }).length || 0,
      total: data.bigquery.metrics?.totalTransactions || 0,
    }
  : { today: 0, total: 0 };

const topProducts = data?.bigquery?.products
  ?.filter(p => p.price > 0)
  ?.sort((a, b) => b.price - a.price)
  ?.slice(0, 5) || [];

const revenueHistory = data?.bigquery?.historical?.slice(0, 7).reverse() || [];
```

**Remove these sections:**

```javascript
// DELETE: All useState for data
// DELETE: All fetch functions (lines 148-395)
// DELETE: fetchAllData function
// DELETE: useEffect for data fetching
// KEEP: Loading/error from props, UI rendering
```

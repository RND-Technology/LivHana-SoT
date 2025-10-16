### Step 2.2: Update ExecutiveDashboard.jsx

**File:** `src/components/ExecutiveDashboard.jsx`

**Replace lines 148-343 (all fetch functions) with:**

```javascript
import api from '../api/livhanaApiClient';

// ... inside component ...

// BEFORE: 6 separate fetch functions
// AFTER: Use unified API client

const fetchBigQueryData = async () => {
  try {
    const data = await api.bigquery.dashboard();

    if (data && data.metrics) {
      setRevenueMetrics({
        today: data.metrics.todayRevenue || 0,
        week: data.metrics.weekRevenue || 0,
        month: data.metrics.monthRevenue || 0,
        year: data.metrics.yearRevenue || 0,
      });
      // ... rest of state updates ...
    }
  } catch (err) {
    console.error('BigQuery fetch error:', err);
    setAlerts(prev => ({
      ...prev,
      system: [...prev.system, { message: 'Failed to fetch revenue data', severity: 'warning' }]
    }));
  }
};

const fetchHistoricalData = async () => {
  try {
    const data = await api.bigquery.historical();
    if (data && data.daily) {
      setRevenueHistory(data.daily.slice(0, 7).reverse());
    }
  } catch (err) {
    console.error('Historical data fetch error:', err);
  }
};

const fetchProductData = async () => {
  try {
    const data = await api.bigquery.products();
    if (data && data.products) {
      const sortedProducts = data.products
        .filter(p => p.price > 0)
        .sort((a, b) => b.price - a.price)
        .slice(0, 5);
      setTopProducts(sortedProducts);
    }
  } catch (err) {
    console.error('Product data fetch error:', err);
  }
};

const fetchServiceHealth = async () => {
  try {
    const healthData = await api.health.all();
    setServiceHealth(healthData);

    const systemAlerts = Object.entries(healthData)
      .filter(([_, health]) => health.status === 'unhealthy')
      .map(([service, health]) => ({
        message: `${service} is unreachable: ${health.error}`,
        severity: 'error',
      }));

    if (systemAlerts.length > 0) {
      setAlerts(prev => ({ ...prev, system: systemAlerts }));
    }
  } catch (err) {
    console.error('Health check failed:', err);
  }
};

const fetchComplianceData = async () => {
  try {
    const data = await api.bigquery.compliance();
    setComplianceMetrics({
      ageVerificationRate: data.metrics?.ageVerification?.successRate || 0,
      coaValidationRate: data.metrics?.productCompliance?.coaCoverage || 0,
      texasComplianceScore: data.metrics?.texasCompliance?.score || 0,
      activeLicenses: 1,
      expiringLicenses: [],
    });
  } catch (error) {
    console.error('Failed to fetch compliance data:', error);
    setComplianceMetrics({
      ageVerificationRate: null,
      coaValidationRate: null,
      activeLicenses: null,
      expiringLicenses: [],
    });
    setAlerts(prev => ({
      ...prev,
      system: [...prev.system, {
        message: 'Compliance data unavailable - service may be offline',
        severity: 'warning'
      }]
    }));
  }
};
```

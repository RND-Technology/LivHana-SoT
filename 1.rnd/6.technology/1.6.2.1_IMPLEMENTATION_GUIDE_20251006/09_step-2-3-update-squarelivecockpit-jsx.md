### Step 2.3: Update SquareLiveCockpit.jsx

**File:** `src/components/SquareLiveCockpit.jsx`

**Replace lines 33-59 with:**

```javascript
import api from '../api/livhanaApiClient';

const fetchLiveData = async () => {
  try {
    const [dashboard, historical, products] = await Promise.all([
      api.bigquery.dashboard(),
      api.bigquery.historical(),
      api.bigquery.products()
    ]);

    setLiveData({
      ...dashboard,
      historicalData: historical.historical || [],
      dailyData: historical.daily || [],
      monthlyData: historical.monthly || [],
      catalog: products.products || [],
      topSellers: products.topSellers || [],
      mode: dashboard.mode
    });

    setLoading(false);
  } catch (error) {
    console.error('Failed to fetch BigQuery data:', error);
    setLoading(false);
  }
};
```

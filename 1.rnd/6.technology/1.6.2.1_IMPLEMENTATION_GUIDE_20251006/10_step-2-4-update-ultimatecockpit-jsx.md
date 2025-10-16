### Step 2.4: Update UltimateCockpit.jsx

**File:** `src/components/UltimateCockpit.jsx`

**Replace lines 157-182 with:**

```javascript
import api from '../api/livhanaApiClient';

const fetchLiveData = useCallback(async () => {
  setLoading(true);
  try {
    const [integration, reasoning, crisis] = await Promise.all([
      api.bigquery.dashboard(),
      api.health.reasoning(),
      fetch('http://localhost:5001/api/crisis/analytics').then(r => r.json()).catch(() => ({}))
    ]);

    setLiveData({
      revenue: integration.revenue || 0,
      customers: integration.customers || 0,
      orders: integration.orders || 0,
      reasoning: reasoning.status || 'unknown',
      crisisConsults: crisis.totalConsultations || 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Live data fetch error:', error);
  } finally {
    setLoading(false);
  }
}, []);
```

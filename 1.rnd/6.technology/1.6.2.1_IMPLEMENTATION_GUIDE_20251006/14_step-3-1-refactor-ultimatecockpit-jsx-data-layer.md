### Step 3.1: Refactor UltimateCockpit.jsx Data Layer

**File:** `src/components/UltimateCockpit.jsx`

**Add unified data state (after line 79):**

```javascript
const [unifiedData, setUnifiedData] = useState({
  bigquery: {
    metrics: {},
    historical: [],
    products: [],
    recentTransactions: [],
  },
  health: {},
  reasoning: {},
});
```

**Update fetchLiveData to fetch ALL data (replace lines 157-182):**

```javascript
const fetchLiveData = useCallback(async () => {
  setLoading(true);
  try {
    // Fetch all data in parallel
    const [bigqueryDashboard, bigqueryHistorical, bigqueryProducts, healthStatuses] = await Promise.all([
      api.bigquery.dashboard(),
      api.bigquery.historical(),
      api.bigquery.products(),
      api.health.all(),
    ]);

    // Unified state update
    setUnifiedData({
      bigquery: {
        metrics: bigqueryDashboard.metrics || {},
        recentTransactions: bigqueryDashboard.recentTransactions || [],
        historical: bigqueryHistorical.daily || [],
        products: bigqueryProducts.products || [],
        topProducts: bigqueryProducts.topSellers || [],
      },
      health: healthStatuses,
      reasoning: healthStatuses.reasoning || {},
    });

    // Legacy state for overview layer
    setLiveData({
      revenue: bigqueryDashboard.metrics?.todayRevenue || 0,
      customers: bigqueryDashboard.metrics?.totalCustomers || 0,
      orders: bigqueryDashboard.metrics?.totalTransactions || 0,
      reasoning: healthStatuses.reasoning?.status || 'unknown',
      crisisConsults: 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Live data fetch error:', error);
  } finally {
    setLoading(false);
  }
}, []);
```

**Update renderLayerContent to pass data to children (around line 504):**

```javascript
const renderLayerContent = () => {
  if (activeLayer.includes('.')) {
    const [mainLayer, subLayer] = activeLayer.split('.');
    return (
      <Box>
        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
          {subLayers[subLayer]?.name || subLayer}
        </Typography>
        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
          Deep dive into {subLayer} - Real-time data and analytics
        </Typography>
        <Card sx={{ bgcolor: '#1E293B', p: 3 }}>
          <Typography sx={{ color: 'white' }}>
            Sub-layer view for {subLayer} coming soon...
          </Typography>
        </Card>
      </Box>
    );
  }

  if (activeLayer === 'overview') {
    return <OverviewLayer />;
  }

  const layer = businessLayers[activeLayer];
  if (layer && layer.component) {
    const LayerComponent = layer.component;

    // Pass appropriate data to each component
    switch (activeLayer) {
      case 'executive':
        return <LayerComponent data={unifiedData} />;
      case 'empire':
        return <LayerComponent data={unifiedData.bigquery} />;
      case 'square':
        return <LayerComponent data={unifiedData.bigquery} />;
      case 'main':
        return <LayerComponent data={unifiedData} />;
      case 'autonomous':
        return <LayerComponent />;
      default:
        return <LayerComponent />;
    }
  }

  return <OverviewLayer />;
};
```

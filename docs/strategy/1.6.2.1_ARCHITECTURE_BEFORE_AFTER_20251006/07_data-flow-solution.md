### Data Flow Solution

```
Component: UltimateCockpit (DATA ORCHESTRATOR)
│
├─ fetchLiveData()
│   ├─ api.bigquery.dashboard()   ← ONE CALL (parallel)
│   ├─ api.bigquery.historical()  ← ONE CALL (parallel)
│   ├─ api.bigquery.products()    ← ONE CALL (parallel)
│   └─ api.health.all()           ← ONE CALL (parallel all services)
│
├─ unifiedData = {
│   bigquery: { metrics, historical, products, transactions },
│   health: { integration, reasoning, voice, ... }
│ }
│
└─ Pass data to children as props:
    ├─ <ExecutiveDashboard data={unifiedData} />
    ├─ <SquareLiveCockpit data={unifiedData.bigquery} />
    ├─ <EmpireDashboard data={unifiedData.bigquery} />
    └─ <Dashboard data={unifiedData} />

Component: ExecutiveDashboard (PRESENTATION ONLY)
│
├─ Props: data = { bigquery, health }
├─ Derive: revenueMetrics = data.bigquery.metrics
├─ Derive: revenueHistory = data.bigquery.historical
├─ Derive: topProducts = data.bigquery.products
└─ Render: UI with derived data

Component: SquareLiveCockpit (PRESENTATION ONLY)
│
├─ Props: data = { metrics, historical, products, transactions }
├─ Derive: liveData = data
└─ Render: UI with data

TOTAL: 1x fetch of BigQuery data (shared across all dashboards)
       Parallel fetching for performance
       Centralized caching
```

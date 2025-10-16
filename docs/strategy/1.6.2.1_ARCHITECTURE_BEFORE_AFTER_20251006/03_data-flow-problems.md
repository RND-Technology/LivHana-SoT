### Data Flow Problems

```
Component: ExecutiveDashboard
│
├─ fetchBigQueryData()       → GET /api/bigquery/dashboard
├─ fetchHistoricalData()     → GET /api/bigquery/historical
├─ fetchProductData()        → GET /api/bigquery/products
├─ fetchServiceHealth()      → 6x GET /health (parallel)
├─ fetchComplianceData()     → GET /api/compliance/metrics
├─ fetchCustomerIntel()      → Mock data
└─ fetchInventoryAlerts()    → Mock data

Component: SquareLiveCockpit (DUPLICATE CALLS)
│
├─ fetchLiveData()
│   ├─ GET /api/bigquery/dashboard   ← DUPLICATE!
│   ├─ GET /api/bigquery/historical  ← DUPLICATE!
│   └─ GET /api/bigquery/products    ← DUPLICATE!

Component: UltimateCockpit (SEPARATE CALLS)
│
└─ fetchLiveData()
    ├─ GET /api/bigquery/dashboard   ← DUPLICATE AGAIN!
    ├─ GET /health (reasoning)
    └─ GET /api/crisis/analytics

TOTAL: 3x fetch of same BigQuery data = WASTE
```

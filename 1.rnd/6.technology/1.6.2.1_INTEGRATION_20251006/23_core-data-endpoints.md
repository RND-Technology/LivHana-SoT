### Core Data Endpoints

```
GET  /health                           ✅ Service health check
GET  /api/bigquery/dashboard           ✅ Revenue & metrics
GET  /api/bigquery/historical          ✅ Daily/monthly trends
GET  /api/bigquery/products            ✅ Product catalog
GET  /api/bigquery/cache-stats         ✅ Cache performance
POST /api/bigquery/cache/invalidate    ✅ Manual refresh

GET  /api/square/catalog               ✅ Live Square products
GET  /api/square/transactions          ✅ Recent payments

POST /api/sync/lightspeed              ✅ Trigger Lightspeed sync
POST /api/sync/square                  ✅ Trigger Square sync
```

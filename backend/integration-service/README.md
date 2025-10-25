# Integration Service (Lightspeed + RPM API)

Real-time Lightspeed → BigQuery pipeline and RPM API (Option A) for weekly planning exports.

## Features

- ✅ Real-time sales data streaming
- ✅ Idempotent insertion (no duplicates via MERGE statement)
- ✅ Pagination support (up to 1000 sales per sync)
- ✅ Health check endpoint
- ✅ Express.js REST API
- ✅ TypeScript strict mode (zero `any` types)
- ✅ Comprehensive error handling
- ✅ Docker support for Cloud Run
- ✅ Production-ready logging
- ✅ **Tier-1 Hardened** (2025-10-25): Multi-stage Dockerfile, structured JSON logging, Cloud Run GSM secrets, request ID tracking

## Tier-1 Hardening Summary

**Date**: 2025-10-25  
**Status**: Complete

### Changes

1. **Dockerfile**: Multi-stage Node 20 Alpine build, non-root user (UID 1001), healthcheck
2. **Cloud Run**: GSM secrets (LIGHTSPEED_TOKEN, DATABASE_URL), startup/liveness probes, min/max instances
3. **Logging**: Structured JSON format `{severity, timestamp, message, service, requestId?, ...meta}`
4. **Server**: Request ID middleware, request duration tracking, enhanced graceful shutdown
5. **CI**: `.github/workflows/tier1-post-merge.yml` with lint/typecheck/tests

### Notes

- Pre-existing TypeScript errors in `src/pipeline/*` need separate fix
- Docker build blocked by missing type declarations and client modules
- All hardening changes are additive with zero breaking changes

## API Endpoints

### `GET /health`

Health check endpoint. Returns service status and connectivity to external services.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-08T08:00:00Z",
  "version": "1.0.0",
  "lightspeed_connected": true,
  "bigquery_connected": true
}
```

### `POST /sync/sales`

Sync sales data from Lightspeed to BigQuery.

**Request Body (optional):**

```json
{
  "since": "2025-10-07T00:00:00Z",
  "batch_size": 100
}
```

**Response:**

```json
{
  "success": true,
  "inserted": 45,
  "skipped": 2,
  "lastSync": "2025-10-08T08:00:00Z",
  "latency_ms": 3456,
  "errors": []
}
```

### `GET /`

Service information and documentation.

## RPM API (Option A)

Env:

```
DATABASE_URL=postgresql://...
JWT_SECRET=change-me
REDIS_HOST=localhost
REDIS_PORT=6379
```

Routes:

- `GET /api/rpm/weeks/current`
- `GET /api/rpm/weeks/:id/items`
- `POST /api/rpm/weeks/:id/items` (Bearer JWT)
- `GET /api/rpm/weeks/:id/export?format=md|csv|pdf`

Worker:

- Start: `ts-node src/worker.export.ts`
- Outputs artifacts to `/out` (md/csv; pdf currently HTML stub)

Schema:

- See `sql/001_rpm_schema.sql`

## Setup

### Prerequisites

- Node.js 20+
- npm or yarn
- Google Cloud Project with BigQuery enabled
- Lightspeed API credentials

### Environment Variables

```bash
# Required
LIGHTSPEED_TOKEN=your_lightspeed_token
GCP_PROJECT_ID=your_gcp_project_id

# Optional
BIGQUERY_DATASET=livhana_prod  # Default: livhana_prod
PORT=8080                       # Default: 8080
NODE_ENV=production             # Default: production
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Run Production

```bash
npm start
```

### Run Tests

```bash
npm test
npm run test:coverage
```

### Lint

```bash
npm run lint
npm run lint:fix
```

### Type Check

```bash
npm run typecheck
```

## Docker

### Build Image

```bash
docker build -t lightspeed-bigquery .
```

### Run Container

```bash
docker run -p 8080:8080 \
  -e LIGHTSPEED_TOKEN=your_token \
  -e GCP_PROJECT_ID=your_project \
  lightspeed-bigquery
```

## Deploy to Cloud Run

```bash
gcloud run deploy lightspeed-bigquery \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="LIGHTSPEED_TOKEN=op://LivHana-Ops-Keys/LIGHTSPEED_PERSONAL_TOKEN/credential" \
  --set-env-vars="GCP_PROJECT_ID=reggieanddrodispensary"
```

## BigQuery Schema

The service expects a table with the following schema:

```sql
CREATE TABLE `livhana_prod.sales` (
  sale_id STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  customer_id STRING NOT NULL,
  product_id STRING NOT NULL,
  product_name STRING,
  quantity INT64 NOT NULL,
  price FLOAT64 NOT NULL,
  payment_method STRING,
  PRIMARY KEY (sale_id, product_id) NOT ENFORCED
);
```

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌──────────┐
│  Lightspeed │ ───> │  This Service    │ ───> │ BigQuery │
│     API     │      │  (Express.js)    │      │          │
└─────────────┘      └──────────────────┘      └──────────┘
                              │
                              │ Health Checks
                              ▼
                     ┌─────────────────┐
                     │  Cloud Run      │
                     │  Monitoring     │
                     └─────────────────┘
```

## Idempotency

The service uses a MERGE statement to ensure idempotent insertions:

```sql
MERGE `livhana_prod.sales` T
USING (SELECT * FROM UNNEST(@rows)) S
ON T.sale_id = S.sale_id AND T.product_id = S.product_id
WHEN NOT MATCHED THEN INSERT ...
```

This ensures that retrying a sync will not create duplicate rows.

## Error Handling

- **Lightspeed API errors**: Graceful degradation, returns partial results
- **BigQuery insertion errors**: Fallback to individual row insertion
- **Network timeouts**: 30 second timeout on Lightspeed API calls
- **Missing fields**: Default values (e.g., 'anonymous' for customer_id)
- **Invalid data**: Skipped with warning logs

## Monitoring

Health check endpoint at `/health` provides:

- Overall service status (healthy/degraded/unhealthy)
- Lightspeed API connectivity
- BigQuery connectivity
- Timestamp of last sync (optional)

## Performance

- **Parallel fetching**: Multiple Lightspeed API pages fetched in sequence
- **Batch insertion**: Up to 1000 rows inserted per BigQuery request
- **Streaming**: No intermediate storage, direct Lightspeed → BigQuery
- **Memory efficient**: Processes sales in configurable batches

## Security

- ✅ Non-root Docker user (UID 1001)
- ✅ Environment variable injection (no secrets in code)
- ✅ TypeScript strict mode (compile-time safety)
- ✅ Health check for Cloud Run
- ✅ Timeout protection (30s)
- ✅ Input validation on all endpoints

## Troubleshooting

### "LIGHTSPEED_TOKEN environment variable required"

Set the environment variable:

```bash
export LIGHTSPEED_TOKEN=your_token
```

### "Failed to fetch sales from Lightspeed"

Check:

1. Lightspeed token is valid
2. Network connectivity to api.lightspeedapp.com
3. Timeout settings (default: 30s)

### "BigQuery insertion failed"

Check:

1. GCP credentials are configured
2. BigQuery table exists
3. Service account has BigQuery Data Editor role

## Next Steps (Week 3)

- [ ] Add property-based tests (fast-check)
- [ ] Add Prometheus metrics
- [ ] Add structured logging (JSON)
- [ ] Add distributed tracing (OpenTelemetry)
- [ ] Add caching layer (Redis)
- [ ] Add retry logic with exponential backoff
- [ ] Add circuit breaker pattern
- [ ] Optimize BigQuery queries
- [ ] Load testing

## License

UNLICENSED - Proprietary to LivHana

## Contact

<engineering@livhana.com>

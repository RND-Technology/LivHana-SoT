### Metrics: Prometheus

**Endpoints**:

- Integration Service: `http://localhost:3005/metrics`
- Reasoning Gateway: `http://localhost:4002/metrics`
- Voice Service: `http://localhost:4001/metrics`

**Key Metrics**:

- `http_request_duration_seconds` - API response times
- `http_requests_total` - Total API requests
- `db_query_duration_seconds` - Database query times
- `job_processing_duration_seconds` - Background job times
- `queue_depth` - Job queue depth

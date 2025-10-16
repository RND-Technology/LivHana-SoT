### Endpoints

All services now have:

- `GET /health` - Basic health check
- `GET /healthz` - Kubernetes liveness
- `GET /ready` - Readiness with dependency checks
- `GET /metrics` - Prometheus metrics

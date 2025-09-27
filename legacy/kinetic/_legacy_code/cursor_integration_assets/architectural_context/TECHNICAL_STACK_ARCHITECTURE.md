### TECHNICAL STACK ARCHITECTURE

Compute:
- Kubernetes (GKE), autoscaling, node pools for AI vs services
- Jobs/Workers for batch pipelines; HPA/VPA configured

AI Layer:
- DeepSeek V3.1 primary (local/edge inference where possible)
- Fallback providers via central client with PII redaction and routing policies

Data:
- OLTP: AlloyDB (HA, read replicas), schema with explicit constraints
- OLAP: BigQuery/Delta Lake on GCS; Parquet/Iceberg tables; dbt for transforms
- Streaming: Pub/Sub (or Kafka), exactly-once semantics where feasible

APIs:
- API Gateway + Cloud Armor; auth via OAuth/OIDC + service accounts
- Protobuf for internal, OpenAPI for partners; versioned, backward compatible

Security:
- KMS-managed keys, Secret Manager, mTLS between services, IAM least-privilege
- DLP: PII classifiers, tokenization; redact on ingress and at rest

Observability:
- OpenTelemetry traces, Prometheus metrics, Grafana dashboards, Alertmanager
- Log sinks to cloud storage with retention and immutability

DevEx:
- Monorepo with Bazel or pnpm workspaces; pre-commit hooks; CI (Cloud Build/GitHub Actions)
- IaC: Terraform; policy-as-code with OPA/Conftest

SRE:
- Error budgets per service, SLO burn alerts, runbooks, incident retros


### ARCHITECT INFRASTRUCTURE INTEGRATION

Objectives:
- Secure, scalable cloud landing zone with repeatable environment provisioning

Blueprint:
- Projects: prod, stage, dev; separate networking and security projects
- Networking: VPC, private subnets, private service connect, NAT egress
- Identity: Workforce pools, groups, SSO; workload identity for pods
- Secrets: Secret Manager + KMS, rotated; CI has read-on-deploy only
- Storage: GCS buckets with uniform access; CMEK; lifecycle rules

Pipelines:
- CI: lint, test, build images, SCA/DAST; sign images (cosign)
- CD: GitOps (ArgoCD), progressive rollout, health checks, auto-rollback

Compliance Hooks:
- Terraform policy checks, drift detection, audit sinks, access reviews

Validation:
- Preflight conformance tests, canary load, chaos tests for failure modes


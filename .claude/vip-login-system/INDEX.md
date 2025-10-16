---
diataxis: reference
status: active - navigation index
last_updated: 2025-10-08T12:25:00Z
owner: Claude Code (Sonnet 4.5)
source: .claude/vip-login-system-architecture.md
---

# VIP Login System Architecture Index

| Module | Description |
|--------|-------------|
| [00_overview](00_overview.md) | Mission context, infrastructure snapshot, file layout |
| [01_authentication_layer](01_authentication_layer.md) | Auth API design, JWT flows, Redis session management |
| [02_database_schema](02_database_schema.md) | VIP user schema, role/permission tables, audit logging |
| [03_frontend_dashboard](03_frontend_dashboard.md) | VIP portal UI composition, routing, state management |
| [04_cockpit_dashboard](04_cockpit_dashboard.md) | Unified cockpit integration, analytics widgets, ops tooling |
| [05_api_integration_service](05_api_integration_service.md) | External service wiring (Lightspeed, compliance, delivery) |
| [06_deployment_configuration](06_deployment_configuration.md) | Docker + Kubernetes manifests, runtime environment |
| [07_security_features](07_security_features.md) | AuthN/AuthZ controls, data protection, compliance mandates |
| [08_success_metrics](08_success_metrics.md) | Technical, security, and business KPIs |
| [09_conclusion](09_conclusion.md) | Release checklist and action summary |

> Keep these modules under 400 lines; archive older revisions in `/archive/vip-login-system/`.

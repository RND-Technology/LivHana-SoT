### Health Checks

**Endpoints**:

Basic Liveness:

- `/health` - Returns 200 if service is running
- `/healthz` - Kubernetes-style liveness probe

Readiness with Dependencies:

- `/ready` - Returns 200 only if all dependencies are healthy

**Expected Response Times**:

- `/health`: < 50ms
- `/ready`: < 500ms (includes dependency checks)

---

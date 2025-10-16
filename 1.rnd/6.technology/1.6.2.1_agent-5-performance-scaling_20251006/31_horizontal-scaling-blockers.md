### Horizontal Scaling Blockers

**BLOCKER #1: Session Affinity Required**

- Auth middleware disabled in dev (security issue)
- No distributed session store visible
- In-memory cache in integration-service (line 31-39)

**BLOCKER #2: No Health Checks**

- Basic `/health` endpoint exists (line 35-39)
- No readiness/liveness distinction
- No dependency checks (Redis, BigQuery)

**BLOCKER #3: Stateful Workers**

- BullMQ workers tied to specific queue instances
- No worker pool coordination
- Job results stored in memory before Redis flush

**BLOCKER #4: No Service Discovery**

- Hardcoded service URLs
- No load balancer configuration
- No circuit breakers

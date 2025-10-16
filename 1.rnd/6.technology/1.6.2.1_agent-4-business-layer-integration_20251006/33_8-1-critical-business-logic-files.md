### 8.1 Critical Business Logic Files

**Integration Service:**

- `/backend/integration-service/src/index.js` - Main service entry (port 3005)
- `/backend/integration-service/src/bigquery_live.js` - BigQuery data API
- `/backend/integration-service/src/membership.js` - Membership system (743 lines)
- `/backend/integration-service/src/raffle.js` - Raffle system (1300+ lines)
- `/backend/integration-service/src/age_verification.js` - Age verification (517 lines)
- `/backend/integration-service/src/age_verification_store.js` - Verification storage
- `/backend/integration-service/src/square_catalog.js` - Square API client
- `/backend/integration-service/scripts/sync-square-to-bigquery.js` - Square sync
- `/backend/integration-service/scripts/sync-lightspeed-to-bigquery.js` - LightSpeed sync

**Reasoning Gateway:**

- `/backend/reasoning-gateway/src/index.js` - Main service entry (port 4002)
- `/backend/reasoning-gateway/src/routes/memory.js` - Memory API
- `/backend/reasoning-gateway/src/routes/reasoning.js` - Reasoning job API
- `/backend/reasoning-gateway/src/routes/autonomous.js` - Autonomous agent API
- `/backend/reasoning-gateway/src/claude-autonomous-agent.js` - Autonomous execution
- `/backend/reasoning-gateway/src/self-improvement-loop.js` - Self-learning system

**Common (Shared):**

- `/backend/common/auth/middleware.js` - JWT authentication
- `/backend/common/auth/config.js` - Auth configuration
- `/backend/common/memory/learning-engine.js` - Memory learning system
- `/backend/common/memory/bigquery-adapter.js` - BigQuery memory adapter
- `/backend/common/memory/vector-embeddings.js` - Vector search
- `/backend/common/memory/client.js` - Memory API client
- `/backend/common/queue/index.js` - Redis queue configuration
- `/backend/common/logging/index.js` - Structured logging

---

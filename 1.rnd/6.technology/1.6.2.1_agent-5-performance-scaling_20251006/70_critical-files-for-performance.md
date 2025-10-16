### Critical Files for Performance

**Backend Services:**

- `/backend/reasoning-gateway/src/index.js` - Main service, queue config
- `/backend/reasoning-gateway/src/workers/deepseek-processor.js` - AI processing
- `/backend/integration-service/src/index.js` - API gateway, sync schedulers
- `/backend/integration-service/src/bigquery_live.js` - Data layer, caching
- `/backend/common/memory/bigquery-adapter.js` - Batch writes, queries
- `/backend/common/queue/index.js` - Redis connection config
- `/backend/common/security/rate-limit.js` - Rate limiting rules

**Frontend:**

- `/frontend/vibe-cockpit/src/App.jsx` - Routing, component imports
- `/frontend/vibe-cockpit/src/components/UltimateCockpit.jsx` - Complex state mgmt
- `/frontend/vibe-cockpit/package.json` - Dependencies (603MB node_modules)

**Infrastructure:**

- `/docker-compose.yml` - Service orchestration
- `/backend/reasoning-gateway/Dockerfile` - Container config
- `/backend/integration-service/Dockerfile` - Container config

**Configuration:**

- `/backend/reasoning-gateway/.env.example` - Service config
- `/backend/integration-service/.env.example` - API keys, BigQuery settings

---

**Report Generated**: 2025-10-01
**Agent**: #5 Performance & Scaling
**Status**: Analysis Complete, Recommendations Tier 1

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->

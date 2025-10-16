## 📚 **REFERENCE DOCS**

**Critical Files:**

- This guide: `CLEAN_START_GUIDE_AFTER_REBOOT.md`
- Status report: `CLEANUP_PLAN_AND_STATUS.md`
- Bug fix: `backend/reasoning-gateway/SPAWN_BUG_FIX_REPORT.md`
- Agent code: `backend/reasoning-gateway/src/claude-autonomous-agent.js`

**Environment Files:**

- Main: `.env` (root, has Square/BigQuery/KAJA config)
- Service: `backend/reasoning-gateway/.env` (has Anthropic key)
- Example: `backend/reasoning-gateway/.env.example` (template)

**Docker (Alternative to npm start):**

- `docker-compose.yml` (frontend + integration-service + redis)
- `docker-compose.empire.yml` (full empire stack)
- `docker-compose.bigquery.yml` (with data pipelines)

---

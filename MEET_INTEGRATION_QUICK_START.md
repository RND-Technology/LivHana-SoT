# Google Meet Integration - QUICK START

## Status: ✅ READY (1 step remaining)

---

## Integration Service: ✅ RUNNING
```bash
# Check status
lsof -i :3005

# View logs
tail -f /tmp/integration-service.log

# Health check
curl http://localhost:3005/health
```

---

## AlloyDB Schema: ⏳ DEPLOY NOW (15 minutes)

### Quick Deploy (Cloud Shell):
```bash
# 1. Open https://console.cloud.google.com (project: reggieanddrodispensary)
# 2. Click ">_" (Cloud Shell) in top-right
# 3. Upload file: backend/integration-service/sql/meet/002_meet_data_schema.sql

# 4. Connect to AlloyDB:
export PGPASSWORD='x77BXLIf3dGhUwd9SWL1xOOzS'
psql -h 172.18.113.2 -p 5432 -U postgres -d postgres

# 5. Deploy:
\i 002_meet_data_schema.sql

# 6. Verify:
\dt meet_*
```

**Done? Continue below.**

---

## Test Integration: ✅ RUN THIS
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/integration-service
./examples/test_meet_integration.sh

# Expected: All 8 steps pass with ✅
```

---

## API Endpoints (for Browser Extension)

### Start Session
```bash
POST http://localhost:3005/api/meet/sessions/start
Body: {"meet_code":"abc-defg-hij","meet_url":"https://meet.google.com/...","host_name":"Jesse","host_email":"jesse@livhana.com"}
```

### Stream Transcript (CRITICAL - Real-Time)
```bash
POST http://localhost:3005/api/meet/transcripts/stream
Body: {"session_id":"uuid","speaker_name":"Jesse","transcript_text":"...","timestamp_start":"2025-10-28T12:34:56Z","is_final":true}
```

### Get Recent Transcripts (for Agents)
```bash
GET http://localhost:3005/api/meet/transcripts/recent/SESSION_ID?minutes=5
```

---

## Agent Access
```bash
# Get active sessions
curl http://localhost:3005/api/meet/sessions/active

# Read transcripts + extract action items
node examples/agent_meet_reader.js SESSION_ID

# Submit analysis
POST http://localhost:3005/api/meet/analysis
Body: {"session_id":"uuid","agent_name":"Planning","analysis_type":"action_items","analysis_text":"..."}
```

---

## Files
- **Full Guide:** `backend/integration-service/MEET_INTEGRATION_GUIDE.md`
- **Status Report:** `MEET_INTEGRATION_DEPLOYMENT_STATUS.md`
- **Schema:** `backend/integration-service/sql/meet/002_meet_data_schema.sql`
- **Test Script:** `backend/integration-service/examples/test_meet_integration.sh`
- **Agent Reader:** `backend/integration-service/examples/agent_meet_reader.js`

---

## Troubleshooting

### Service not running
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/integration-service
op run --env-file=.env.op -- node src/index.js > /tmp/integration-service.log 2>&1 &
```

### Database timeout
**Cause:** AlloyDB is on private network
**Fix:** Deploy schema via Cloud Shell (see above)

### Test script fails
```bash
# Check service health
curl http://localhost:3005/health

# Check database health
curl http://localhost:3005/api/meet/health

# View service logs
tail -f /tmp/integration-service.log
```

---

## Connection Info
```
AlloyDB:        172.18.113.2:5432
User:           postgres
Password:       x77BXLIf3dGhUwd9SWL1xOOzS
Database:       postgres

Service:        http://localhost:3005
API Base:       http://localhost:3005/api/meet
Logs:           /tmp/integration-service.log
```

---

**Next Action:** Deploy schema in Cloud Shell (15 min)
**Then:** Run test script
**Owner:** Jesse CEO
**Date:** October 28, 2025

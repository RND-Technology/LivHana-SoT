# Google Meet Real-Time Data Streaming Integration

## Overview
Real-time capture and storage of Google Meet sessions into AlloyDB for AI agent analysis.

**Status:** ✅ DEPLOYED - Integration service running on port 3005
**Date:** October 28, 2025
**Owner:** Jesse CEO

---

## Architecture

```
Google Meet (Live Session)
    ↓
[Browser Extension / Meet Scraper]
    ↓ HTTP POST
Integration Service (localhost:3005)
    ↓ SQL INSERT
AlloyDB (172.18.113.2:5432)
    ↓ SQL SELECT
AI Agents (Planning, Artifact, QA, Research, ExecMon)
```

---

## 1. Integration Service Status

### Service Information
- **URL:** http://localhost:3005
- **Port:** 3005
- **Status:** ✅ RUNNING (PID: check with `lsof -i :3005`)
- **Logs:** /tmp/integration-service.log
- **Config:** /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/integration-service/.env.op

### Health Check
```bash
curl http://localhost:3005/health
# Response: {"status":"healthy","timestamp":"..."}

curl http://localhost:3005/api/meet/health
# Response: {"status":"healthy","database":"connected","db_time":"..."}
```

### Start/Stop Commands
```bash
# Start service
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/integration-service
op run --env-file=.env.op -- node src/index.js > /tmp/integration-service.log 2>&1 &

# Check status
lsof -i :3005

# View logs
tail -f /tmp/integration-service.log

# Stop service
kill $(lsof -t -i :3005)
```

---

## 2. AlloyDB Schema

### Database Connection
- **Host:** 172.18.113.2 (Private IP)
- **Port:** 5432
- **Database:** postgres
- **User:** postgres
- **Password:** $(op read "op://LivHana-Ops-Keys/ALLOYDB_POSTGRES_PASSWORD/credential")

### Schema File
**Location:** `/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/integration-service/sql/meet/002_meet_data_schema.sql`

### Tables Created
1. **meet_sessions** - Meeting metadata (start, end, host, participants)
2. **meet_participants** - Individual participant data
3. **meet_transcripts** - Real-time transcript streaming ⚡
4. **meet_screen_captures** - Screen/slide captures
5. **meet_video_segments** - Video recordings
6. **meet_chat_messages** - Chat messages
7. **meet_events** - General events (recording start, screen share, etc.)
8. **meet_agent_analysis** - AI agent insights

### Deploy Schema to AlloyDB

**Option 1: Cloud Shell (Recommended)**
```bash
# 1. Open Cloud Shell at console.cloud.google.com
# 2. Upload schema file or paste SQL
# 3. Connect to AlloyDB
export PGPASSWORD='$(op read "op://LivHana-Ops-Keys/ALLOYDB_POSTGRES_PASSWORD/credential")'
psql -h 172.18.113.2 -p 5432 -U postgres -d postgres

# 4. Run schema
\i 002_meet_data_schema.sql

# 5. Verify
\dt meet_*
SELECT * FROM get_active_sessions();
```

**Option 2: From Local (Requires Bastion VM or Cloud SQL Proxy)**
```bash
# Set up SSH tunnel via bastion VM
gcloud compute ssh alloydb-bastion --tunnel-through-iap \
  --ssh-flag="-L 5432:172.18.113.2:5432"

# In another terminal
PGPASSWORD='$(op read "op://LivHana-Ops-Keys/ALLOYDB_POSTGRES_PASSWORD/credential")' psql -h localhost -p 5432 -U postgres -d postgres -f 002_meet_data_schema.sql
```

---

## 3. API Endpoints

### Base URL
`http://localhost:3005/api/meet`

### Session Management

#### Start a Meeting Session
```bash
curl -X POST http://localhost:3005/api/meet/sessions/start \
  -H "Content-Type: application/json" \
  -d '{
    "meet_code": "abc-defg-hij",
    "meet_url": "https://meet.google.com/abc-defg-hij",
    "host_name": "Jesse Niesen",
    "host_email": "jesse@livhana.com",
    "metadata": {"client": "VIP", "project": "Trinity"}
  }'

# Response:
# {"success":true,"session":{"id":"uuid","meet_code":"abc-defg-hij","status":"active"}}
```

#### End a Meeting Session
```bash
curl -X POST http://localhost:3005/api/meet/sessions/SESSION_ID/end

# Response:
# {"success":true,"session":{"id":"uuid","duration_seconds":3600}}
```

#### Get Active Sessions
```bash
curl http://localhost:3005/api/meet/sessions/active

# Response:
# {"success":true,"sessions":[...]}
```

### Real-Time Transcript Streaming ⚡

**CRITICAL FOR LIVE SESSIONS**
```bash
curl -X POST http://localhost:3005/api/meet/transcripts/stream \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "uuid-from-session-start",
    "speaker_name": "Jesse",
    "transcript_text": "We need to increase conversion by 20% this quarter",
    "timestamp_start": "2025-10-28T12:34:56Z",
    "is_final": true,
    "confidence_score": 0.95,
    "sequence_number": 1
  }'

# Response:
# {"success":true,"transcript_id":"uuid","timestamp":"..."}
```

#### Get Recent Transcripts (for Agents)
```bash
# Last 5 minutes of transcripts
curl "http://localhost:3005/api/meet/transcripts/recent/SESSION_ID?minutes=5&final_only=true"

# Response:
# {"success":true,"transcripts":[...],"count":15}
```

### Participant Management
```bash
# Add participant
curl -X POST http://localhost:3005/api/meet/participants/join \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "uuid",
    "participant_name": "Client Name",
    "participant_email": "client@company.com",
    "is_host": false
  }'

# Remove participant
curl -X POST http://localhost:3005/api/meet/participants/PARTICIPANT_ID/leave
```

### Screen Captures
```bash
curl -X POST http://localhost:3005/api/meet/screen-captures \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "uuid",
    "capture_type": "screenshot",
    "storage_path": "gs://livhana-rpm-datalake/meet/captures/image1.png",
    "width": 1920,
    "height": 1080,
    "ocr_text": "Revenue Chart: $2.5M projected",
    "presenter_name": "Jesse"
  }'
```

### Chat Messages
```bash
curl -X POST http://localhost:3005/api/meet/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "uuid",
    "sender_name": "Jesse",
    "sender_email": "jesse@livhana.com",
    "message_text": "I will send the proposal by end of day",
    "is_private": false
  }'
```

### Events
```bash
curl -X POST http://localhost:3005/api/meet/events \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "uuid",
    "event_type": "recording_started",
    "event_data": {"quality": "1080p", "storage_path": "gs://..."},
    "severity": "info"
  }'
```

---

## 4. Agent Read Access

### For AI Agents to Query Meet Data

#### Agent Access Pattern
```javascript
// Agent reads recent transcripts every 30 seconds
const fetch = require('node-fetch');

async function getRecentMeetTranscripts(sessionId, minutes = 5) {
  const url = `http://localhost:3005/api/meet/transcripts/recent/${sessionId}?minutes=${minutes}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.transcripts;
}

// Example: Planning Agent analyzes transcripts
const transcripts = await getRecentMeetTranscripts('session-uuid', 5);
const actionItems = extractActionItems(transcripts);
await saveToAlloyDB(actionItems);
```

#### Direct AlloyDB Query (Alternative)
```javascript
// Agent connects directly to AlloyDB
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:$(op read "op://LivHana-Ops-Keys/ALLOYDB_POSTGRES_PASSWORD/credential")@172.18.113.2:5432/postgres'
});

// Get transcripts from last 5 minutes
const result = await pool.query(`
  SELECT * FROM get_recent_transcripts($1, $2)
`, [sessionId, 5]);

console.log(result.rows);
```

#### Submit Agent Analysis
```bash
curl -X POST http://localhost:3005/api/meet/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "uuid",
    "agent_name": "Planning",
    "analysis_type": "action_items",
    "analysis_text": "Detected 3 action items: 1) Send proposal by EOD, 2) Schedule follow-up call, 3) Update pricing sheet",
    "analysis_json": {
      "action_items": [
        {"task": "Send proposal", "owner": "Jesse", "due": "2025-10-28T17:00:00Z"},
        {"task": "Schedule follow-up", "owner": "Planning", "due": "2025-10-29T10:00:00Z"}
      ]
    },
    "priority": "high",
    "action_required": true,
    "confidence_score": 0.92
  }'
```

---

## 5. Real-Time Write Pipeline

### Data Flow
```
Meet Session (Live) → Browser/Scraper → POST /api/meet/* → AlloyDB → Agents (read)
```

### Performance Requirements
- **Transcript latency:** < 2 seconds
- **Write throughput:** 10-50 writes/second during active session
- **Connection pooling:** Max 20 connections
- **Indexes:** Full-text search on transcripts for fast agent queries

### Optimizations
1. **Streaming transcripts:** Use `is_final: false` for interim results
2. **Batch writes:** Group chat messages if high volume
3. **Async analysis:** Agents poll every 30-60 seconds (not real-time event stream)
4. **Materialized view:** `meet_sessions_summary` for dashboard (refresh every 5 min)

---

## 6. Verification & Testing

### End-to-End Test
```bash
# 1. Start a test session
SESSION_ID=$(curl -s -X POST http://localhost:3005/api/meet/sessions/start \
  -H "Content-Type: application/json" \
  -d '{
    "meet_code": "test-session",
    "meet_url": "https://meet.google.com/test",
    "host_name": "Test Host",
    "host_email": "test@livhana.com"
  }' | jq -r '.session.id')

echo "Session ID: $SESSION_ID"

# 2. Stream a transcript
curl -X POST http://localhost:3005/api/meet/transcripts/stream \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"speaker_name\": \"Jesse\",
    \"transcript_text\": \"This is a test transcript\",
    \"timestamp_start\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"is_final\": true
  }"

# 3. Get recent transcripts
curl "http://localhost:3005/api/meet/transcripts/recent/$SESSION_ID?minutes=5"

# 4. Submit agent analysis
curl -X POST http://localhost:3005/api/meet/analysis \
  -H "Content-Type: application/json" \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"agent_name\": \"Planning\",
    \"analysis_type\": \"test\",
    \"analysis_text\": \"Test analysis completed\",
    \"priority\": \"normal\"
  }"

# 5. End session
curl -X POST "http://localhost:3005/api/meet/sessions/$SESSION_ID/end"

# 6. View all data
curl "http://localhost:3005/api/meet/analysis/$SESSION_ID"
```

### Database Verification (Cloud Shell)
```sql
-- Check active sessions
SELECT * FROM get_active_sessions();

-- Check recent transcripts
SELECT session_id, speaker_name, transcript_text, timestamp_start
FROM meet_transcripts
WHERE timestamp_start >= NOW() - INTERVAL '10 minutes'
ORDER BY timestamp_start DESC
LIMIT 20;

-- Check agent analyses
SELECT agent_name, analysis_type, priority, action_required, analysis_timestamp
FROM meet_agent_analysis
ORDER BY analysis_timestamp DESC
LIMIT 10;

-- Refresh dashboard summary
REFRESH MATERIALIZED VIEW meet_sessions_summary;
SELECT * FROM meet_sessions_summary WHERE status = 'active';
```

---

## 7. Production Considerations

### Security
- ✅ Private network (AlloyDB on 172.18.113.2, not public)
- ❌ NO authentication on integration service (localhost only - OK for now)
- ⚠️ TODO: Add JWT auth for production deployment

### Monitoring
- ✅ Structured logging (JSON format)
- ✅ Request ID tracing
- ❌ TODO: Add Prometheus metrics
- ❌ TODO: Add error alerting (Slack/PagerDuty)

### Scalability
- Current: Single service instance, localhost only
- Future: Deploy to Cloud Run, add Redis for session cache, use Pub/Sub for agent notifications

### Backup & Recovery
- AlloyDB automated backups enabled (GCP default)
- Retention: 7 days minimum
- Point-in-time recovery available

---

## 8. Troubleshooting

### Issue: Integration service won't start
```bash
# Check logs
cat /tmp/integration-service.log

# Check port availability
lsof -i :3005

# Kill existing process
kill $(lsof -t -i :3005)

# Restart
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/integration-service
op run --env-file=.env.op -- node src/index.js > /tmp/integration-service.log 2>&1 &
```

### Issue: Database connection timeout
**Cause:** AlloyDB is on private network (172.18.113.2)
**Solution:** Run queries from Cloud Shell or via bastion VM

### Issue: Transcripts not appearing
```bash
# Check if session exists
curl http://localhost:3005/api/meet/sessions/SESSION_ID

# Check database directly (Cloud Shell)
psql -h 172.18.113.2 -p 5432 -U postgres -d postgres -c "SELECT COUNT(*) FROM meet_transcripts;"
```

### Issue: Agent can't read data
**Solution 1:** Use API endpoint
```bash
curl http://localhost:3005/api/meet/transcripts/recent/SESSION_ID
```

**Solution 2:** Agent connects directly to AlloyDB (requires VPC access)
```javascript
const pool = new Pool({
  connectionString: 'postgresql://postgres:PASSWORD@172.18.113.2:5432/postgres'
});
```

---

## 9. Next Steps

### Immediate (Today)
1. ✅ Schema deployed to AlloyDB (use Cloud Shell)
2. ⏳ Connect browser extension to integration service
3. ⏳ Test live Meet session capture
4. ⏳ Configure Planning agent to read transcripts

### Short-term (This Week)
1. Add authentication (JWT tokens)
2. Deploy to Cloud Run (for production)
3. Add Pub/Sub for agent notifications
4. Set up monitoring dashboard

### Long-term (Next Month)
1. AI-powered transcript analysis (sentiment, topics, action items)
2. Screen capture OCR integration (Vision API)
3. Automated meeting summaries
4. Integration with RPM weekly plans

---

## Contact
**Owner:** Jesse CEO
**Support:** Liv Hana Tier-1 Agent
**Date:** October 28, 2025

**War's won. Execute.**

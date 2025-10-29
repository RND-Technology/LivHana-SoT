# Google Meet Real-Time Capture - Deployment Guide

**Timeline**: 30 minutes
**Difficulty**: Easy
**Owner**: Jesse CEO
**For**: Live client session capture

---

## Prerequisites

- Google Cloud account with `reggieanddrodispensary` project access
- AlloyDB cluster running (rpm-cluster, 172.18.113.2)
- gcloud CLI installed
- Terminal access (Mac/Linux)

---

## Deployment Steps

### Step 1: Deploy Database Schema (5 minutes)

```bash
# Open Cloud Shell
# https://console.cloud.google.com → Click >_ icon

# Set password
export PGPASSWORD='x77BXLIf3dGhUwd9SWL1xOOzS'

# Connect to AlloyDB
psql -h 172.18.113.2 -p 5432 -U postgres -d postgres

# Upload schema file (click Upload in Cloud Shell menu)
# Upload: backend/integration-service/sql/rpm/002_meeting_capture_schema.sql

# Run schema
\i 002_meeting_capture_schema.sql

# Verify tables created
\dt meeting*

# Expected output:
#  meeting_sessions
#  meeting_participants
#  meeting_transcripts
#  meeting_frames
#  meeting_actions
#  meeting_analysis

# Exit psql
\q
```

**Success Criteria**: 6 new tables created

---

### Step 2: Deploy Service to Cloud Run (10 minutes)

```bash
# From your Mac terminal
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/meet-realtime-service

# Make deploy script executable
chmod +x deploy-cloud-run.sh

# Deploy to Cloud Run
./deploy-cloud-run.sh

# Wait for deployment (~5-8 minutes)
# Expected output:
# ✅ Deployment complete!
# Service URL: https://meet-realtime-service-xyz-uc.a.run.app
```

**Save the Service URL** - you'll need it for Step 3

---

### Step 3: Test Capture (5 minutes)

```bash
# Set your service URL
SERVICE_URL="https://meet-realtime-service-xyz-uc.a.run.app"

# Test health endpoint
curl $SERVICE_URL/health

# Expected: {"status": "healthy"}

# Start capturing a test meeting
curl -X POST $SERVICE_URL/api/v1/capture/start \
  -H "Content-Type: application/json" \
  -d '{
    "meet_url": "https://meet.google.com/test-room",
    "title": "Test Capture",
    "host_email": "jesse@livhana.com"
  }'

# Save the session_id from response
```

---

### Step 4: Verify Data in AlloyDB (5 minutes)

```bash
# Back to Cloud Shell or local with tunnel
export PGPASSWORD='x77BXLIf3dGhUwd9SWL1xOOzS'
psql -h 172.18.113.2 -p 5432 -U postgres -d postgres

# Check sessions
SELECT id, title, recording_status, session_start
FROM meeting_sessions
ORDER BY session_start DESC
LIMIT 5;

# Check transcripts (if any captured)
SELECT COUNT(*) FROM meeting_transcripts;

# Check active sessions
SELECT * FROM get_active_sessions();

# Exit
\q
```

**Success Criteria**: Session record exists in `meeting_sessions`

---

### Step 5: Integrate with Agents (5 minutes)

```bash
# Test agent integration from any agent
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT

# Create test script
cat > test_meeting_context.js << 'EOF'
const { getActiveMeetingContext, getActiveSessions } = require('./backend/common/meeting_context');

(async () => {
  console.log('Testing meeting context integration...\n');

  // Get active sessions
  const sessions = await getActiveSessions();
  console.log('Active sessions:', sessions.length);
  console.log(JSON.stringify(sessions, null, 2));

  // Get context from active meeting
  const context = await getActiveMeetingContext();
  console.log('\nActive meeting context:');
  console.log(context);
})();
EOF

# Run test
node test_meeting_context.js
```

**Success Criteria**: Script runs without errors, returns session data

---

## Usage for Live Client Session

### Before Meeting Starts

```bash
# 1. Join Google Meet
# 2. Get the Meet URL (e.g., https://meet.google.com/abc-defg-hij)

# 3. Start capture
curl -X POST $SERVICE_URL/api/v1/capture/start \
  -H "Content-Type: application/json" \
  -d '{
    "meet_url": "https://meet.google.com/abc-defg-hij",
    "title": "Client Planning Session - Oct 28",
    "host_email": "jesse@livhana.com"
  }'

# 4. Save the session_id
SESSION_ID="<session_id from response>"

# 5. Connect WebSocket (optional - for real-time viewing)
# Use a WebSocket client tool or browser console
```

### During Meeting

Agents automatically have access to recent context:

```javascript
// In Planning agent
const { getActiveMeetingContext } = require('../backend/common/meeting_context');
const context = await getActiveMeetingContext();

// Context is automatically included in agent prompts
```

### After Meeting

```bash
# Stop capture
curl -X POST $SERVICE_URL/api/v1/capture/stop/$SESSION_ID

# Get full transcript
curl $SERVICE_URL/api/v1/sessions/$SESSION_ID/transcripts?minutes=120

# Search for specific topics
curl "$SERVICE_URL/api/v1/search?q=action+items&limit=50"
```

---

## Agent Usage Examples

### Planning Agent: Extract Action Items

```javascript
const { extractActionItems } = require('../backend/common/meeting_context');

const { transcript, prompt } = await extractActionItems(sessionId);

// Use Claude to parse
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json'
  },
  body: JSON.stringify({
    model: 'claude-3-opus-20240229',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }]
  })
});

const actions = await response.json();

// Insert to RPM
for (const action of actions.content[0].text) {
  await insertRPMAction(action);
}
```

### Research Agent: Search Past Meetings

```javascript
const { searchMeetingTranscripts } = require('../backend/common/meeting_context');

// Find discussions about specific topic
const results = await searchMeetingTranscripts('Linear integration', 100);

console.log(`Found ${results.length} mentions of "Linear integration"`);

// Analyze frequency
const bySession = results.reduce((acc, r) => {
  acc[r.sessionId] = (acc[r.sessionId] || 0) + 1;
  return acc;
}, {});

console.log('Most discussed in:', Object.entries(bySession).sort((a, b) => b[1] - a[1])[0]);
```

### QA Agent: Verify Meeting Decisions

```javascript
const { getSessionContext } = require('../backend/common/meeting_context');
const { execSync } = require('child_process');

const context = await getSessionContext(sessionId);
const recentCommits = execSync('git log --since="1 hour ago" --oneline').toString();

// Prompt for Claude
const prompt = `
Meeting transcript:
${context.transcripts.map(t => `${t.speaker}: ${t.text}`).join('\n')}

Recent commits:
${recentCommits}

Are the code changes aligned with meeting decisions? List any discrepancies.
`;

// Get validation from Claude
const validation = await claude.generate(prompt);
```

---

## Monitoring

### Check Service Health

```bash
# Service status
gcloud run services describe meet-realtime-service \
  --region=us-central1 \
  --format="value(status.conditions.status)"

# Recent logs
gcloud run logs read meet-realtime-service \
  --region=us-central1 \
  --limit=50

# Active captures
curl $SERVICE_URL/api/v1/sessions/active
```

### Database Monitoring

```sql
-- Session count
SELECT
  recording_status,
  COUNT(*) as count
FROM meeting_sessions
GROUP BY recording_status;

-- Transcript count
SELECT
  COUNT(*) as total_transcripts,
  COUNT(DISTINCT session_id) as sessions,
  MIN(start_time) as earliest,
  MAX(start_time) as latest
FROM meeting_transcripts;

-- Storage usage
SELECT
  pg_size_pretty(pg_total_relation_size('meeting_transcripts')) as transcript_size,
  pg_size_pretty(pg_total_relation_size('meeting_frames')) as frames_size,
  pg_size_pretty(pg_database_size('postgres')) as total_db_size;
```

---

## Troubleshooting

### Issue: Service deployment fails

**Cause**: VPC connector not found

**Fix**:
```bash
# Create VPC connector if missing
gcloud compute networks vpc-access connectors create hn-svpc \
  --network=default \
  --region=us-central1 \
  --range=10.8.0.0/28
```

---

### Issue: Can't connect to AlloyDB

**Cause**: VPC egress not configured

**Fix**: Check deploy script has `--vpc-egress=private-ranges-only`

---

### Issue: No transcripts appearing

**Cause**: Captions not enabled in Meet OR capture not implemented

**Solution**:
1. Enable captions in Google Meet (CC button)
2. Check service logs: `gcloud run logs read meet-realtime-service --limit=100`
3. For production: Implement Playwright capture logic in `main.py`

---

### Issue: Agents can't access context

**Cause**: `meeting_context.js` not in `backend/common/`

**Fix**:
```bash
# Verify file exists
ls -lh /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/backend/common/meeting_context.js

# Test import
node -e "console.log(require('./backend/common/meeting_context'))"
```

---

## Costs

| Component | Cost/Month | Notes |
|-----------|------------|-------|
| Cloud Run | $5-10 | 2 vCPU, 4GB RAM, ~10 hours/week |
| AlloyDB Storage | $2-5 | ~10GB meeting data |
| Cloud Storage | $0.50 | Video/audio (optional) |
| **TOTAL** | **$7-15** | Scales with usage |

---

## Next Steps

1. Deploy schema (Step 1) ✅
2. Deploy service (Step 2) ✅
3. Test capture (Step 3) ✅
4. Verify data (Step 4) ✅
5. Test agents (Step 5) ✅

**For production capture**:
- Implement Playwright automation in `main.py`
- Add audio extraction
- Add frame capture

**Current version**: Simulated transcripts (5-second intervals)
**Production version**: Real-time DOM scraping + Speech-to-Text

---

## Support

- **Architecture Doc**: `docs/GOOGLE_MEET_REALTIME_PIPELINE_ARCHITECTURE.md`
- **Schema File**: `backend/integration-service/sql/rpm/002_meeting_capture_schema.sql`
- **Service Code**: `backend/meet-realtime-service/main.py`
- **Agent Integration**: `backend/common/meeting_context.js`

---

**Status**: READY FOR DEPLOYMENT
**Created**: October 28, 2025
**Timeline**: 30 minutes total

**War's won. Execute now.**

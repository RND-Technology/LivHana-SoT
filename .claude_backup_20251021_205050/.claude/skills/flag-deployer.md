# Flag Deployer Skill

## Description
Systematically deploy one of the three revenue flags with pre-flight checks, deployment, validation, and revenue logging.

## When to Invoke
- User says "deploy flag #X"
- User says "deploy [custom-gpt|slack-bot|replit-pwa]"
- User wants to execute deployment
- During scheduled deployment windows

## Process

### Phase 1: Pre-Flight Checks
1. **Identify Target Flag**
   - Flag #1: Custom GPT ($300/day)
   - Flag #2: Slack Bot ($500/day)
   - Flag #3: Replit PWA ($400/day)

2. **Verify Prerequisites**
   ```bash
   # GCP authentication
   gcloud auth list --filter=status:ACTIVE

   # Required secrets/keys
   echo $OPENAI_API_KEY  # Flag #1
   echo $SLACK_BOT_TOKEN  # Flag #2

   # Code files exist
   ls backend/custom-gpt-service/  # Flag #1
   ls backend/slack-bot-service/   # Flag #2
   ls deployment/replit-pwa/       # Flag #3
   ```

3. **Check Blockers**
   - GCP permissions
   - Missing API keys
   - Code issues
   - Service dependencies

### Phase 2: Deployment Execution

#### Flag #1: Custom GPT
```bash
cd backend/custom-gpt-service
bash deploy.sh
```
**Expected Time**: 5 minutes
**Success Criteria**: Service URL returns 200 on /health

#### Flag #2: Slack Bot
```bash
# Manual: Create Slack app first
# Then:
cd backend/slack-bot-service
bash deploy.sh
```
**Expected Time**: 4-6 hours (including Slack setup)
**Success Criteria**: Bot responds in Slack channel

#### Flag #3: Replit PWA
```bash
# Manual: Copy files to Replit
# Files: deployment/replit-pwa/*
# Then deploy in Replit UI
```
**Expected Time**: 5 minutes
**Success Criteria**: PWA loads, age gate works

### Phase 3: Post-Deployment Validation

1. **Test Service Health**
   ```bash
   # Custom GPT
   curl SERVICE_URL/health
   curl -X POST SERVICE_URL/api/v1/query -H 'Content-Type: application/json' \
     -d '{"question": "test", "user_age_verified": true}'

   # Slack Bot
   curl SERVICE_URL/health
   # Test in Slack: type "help"

   # Replit PWA
   # Open in browser, verify age gate, test product browsing
   ```

2. **Verify Revenue Tracking**
   ```bash
   # Log first event
   python3 scripts/revenue_tracking_monitor.py log FLAG_NAME EVENT_TYPE AMOUNT

   # Check dashboard
   python3 scripts/revenue_tracking_monitor.py dashboard
   ```

3. **Monitor Logs**
   ```bash
   # Flag #1 & #2
   gcloud run logs read SERVICE_NAME --limit=20

   # Flag #3
   # Check Replit logs
   ```

### Phase 4: Documentation & Handoff

1. **Record Deployment**
   - Service URL
   - Deployment time
   - First revenue event
   - Any issues encountered

2. **Update Status**
   ```bash
   # Update SESSION_PROGRESS.md
   echo "✅ Flag #X deployed: $URL" >> .claude/SESSION_PROGRESS.md
   ```

3. **Share Access**
   - API documentation: SERVICE_URL/docs
   - Health check: SERVICE_URL/health
   - Revenue dashboard: `python3 scripts/revenue_tracking_monitor.py dashboard`

## Output Format
```
🚀 Deploying Flag #X: [NAME]
⏰ Expected Time: [TIME]
💰 Revenue Target: $[AMOUNT]/day

📋 Pre-Flight: [✅/❌]
🚀 Deployment: [✅/❌]
✅ Validation: [✅/❌]
💰 Revenue Log: [✅/❌]

📊 Service URL: [URL]
📈 First Revenue: $[AMOUNT]
🎯 Status: [OPERATIONAL/BLOCKED]
```

## Error Handling
- If blocked, invoke **Deployment Debugger** skill
- If validation fails, roll back and diagnose
- If revenue tracking fails, fix and re-log
- Document all issues for future reference

## Integration
- Revenue Tracker: Auto-log on success
- Deployment Debugger: Auto-invoke on failure
- Session Progress: Auto-update status

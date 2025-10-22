# 🚀 FLAG #2: SLACK BOT DEPLOYMENT RUNBOOK

**Target**: $500/day | **Timeline**: 4-6 hours | **Status**: READY TO EXECUTE

---

## 🎯 MISSION: Liv Hana Team Automation Bot

Deploy a Slack bot that automates team workflows and generates $500/day revenue.

---

## ⚡ QUICK START (Slack App Setup)

### Step 1: Create Slack App (30 min)

```bash
# Go to https://api.slack.com/apps
# Click "Create New App" → "From scratch"
# App Name: "Liv Hana Team Bot"
# Workspace: Your workspace

# Or use Slack CLI:
slack create liv-hana-team-bot
```

**Manual Steps**:

1. Go to <https://api.slack.com/apps>
2. Click "Create New App"
3. Choose "From scratch"
4. Name: "Liv Hana Team Bot"
5. Select your workspace
6. Click "Create App"

---

### Step 2: Configure Scopes (15 min)

**OAuth & Permissions** → **Scopes**:

Bot Token Scopes:

```
chat:write           # Post messages
channels:read        # View channels
groups:read          # View private channels
im:read             # View DMs
mpim:read           # View group DMs
users:read          # View user info
commands            # Slash commands
files:read          # Read files
reactions:read      # Read reactions
```

User Token Scopes:

```
chat:write          # Post as user
```

---

### Step 3: Enable Events (15 min)

**Event Subscriptions** → Enable Events

Request URL: `https://YOUR-CLOUD-RUN-URL/slack/events`

Subscribe to Bot Events:

```
message.channels    # Messages in channels
message.groups      # Messages in private channels
message.im          # Direct messages
app_mention         # When bot is mentioned
reaction_added      # When reaction is added
```

---

### Step 4: Deploy Slack Bot Service (2-3 hours)

```bash
# Create service directory
mkdir -p deployment/slack_bot
cd deployment/slack_bot

# Install dependencies
cat > requirements.txt <<'EOF'
slack-sdk==3.23.0
slack-bolt==1.18.0
fastapi==0.104.1
uvicorn==0.24.0
google-cloud-secret-manager==2.16.4
python-dotenv==1.0.0
EOF

pip install -r requirements.txt

# Create Slack bot service
cat > app.py <<'EOF'
from slack_bolt import App
from slack_bolt.adapter.fastapi import SlackRequestHandler
from fastapi import FastAPI, Request
import os

# Initialize Slack app
slack_app = App(
    token=os.environ.get("SLACK_BOT_TOKEN"),
    signing_secret=os.environ.get("SLACK_SIGNING_SECRET")
)

# Initialize FastAPI
api = FastAPI()
handler = SlackRequestHandler(slack_app)

# Event: Message in channel
@slack_app.event("message")
def handle_message(event, say):
    text = event.get("text", "")

    # Auto-respond to keywords
    if "inventory" in text.lower():
        say("📊 Checking inventory... Use `/inventory` for details.")
    elif "help" in text.lower():
        say("👋 I'm Liv Hana Team Bot! I can help with:\n• Inventory checks\n• Order status\n• Team notifications\n• Workflow automation")

# Slash command: /inventory
@slack_app.command("/inventory")
def inventory_command(ack, respond, command):
    ack()
    # TODO: Integrate with LightSpeed
    respond("📦 Current inventory:\n• Product A: 50 units\n• Product B: 30 units\n• Product C: 20 units")

# Slash command: /sales
@slack_app.command("/sales")
def sales_command(ack, respond, command):
    ack()
    # TODO: Pull from BigQuery
    respond("💰 Sales today:\n• Revenue: $1,250\n• Orders: 15\n• Avg order: $83.33")

# FastAPI endpoints
@api.post("/slack/events")
async def slack_events(req: Request):
    return await handler.handle(req)

@api.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(api, host="0.0.0.0", port=8080)
EOF

# Create Dockerfile
cat > Dockerfile <<'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "app.py"]
EOF

# Deploy to Cloud Run
gcloud run deploy slack-bot-livhana \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN},SLACK_SIGNING_SECRET=${SLACK_SIGNING_SECRET}"

echo "✅ Slack bot deployed to Cloud Run"
echo "📋 Copy the Cloud Run URL and add it to Slack Event Subscriptions"
```

---

### Step 5: Install to Workspace (15 min)

1. Go to **OAuth & Permissions** in Slack app settings
2. Click **Install to Workspace**
3. Review permissions
4. Click **Allow**
5. Copy **Bot User OAuth Token** (starts with `xoxb-`)
6. Add token to GCP Secret Manager:

```bash
# Store Slack tokens in GSM
echo -n "xoxb-YOUR-BOT-TOKEN" | gcloud secrets create SLACK_BOT_TOKEN --data-file=-
echo -n "YOUR-SIGNING-SECRET" | gcloud secrets create SLACK_SIGNING_SECRET --data-file=-
```

---

### Step 6: Test Bot (30 min)

```bash
# In Slack:
# 1. Invite bot to a channel: /invite @Liv Hana Team Bot
# 2. Test message: "help"
# 3. Test slash command: /inventory
# 4. Test slash command: /sales
```

---

## 📊 REVENUE TRACKING INTEGRATION

```bash
# Log team member subscription ($50/month per member)
python3 scripts/revenue_tracking_monitor.py log slack_bot signup 50.00

# View dashboard
python3 scripts/revenue_tracking_monitor.py dashboard
```

---

## 🎯 SUCCESS METRICS

**Launch Criteria**:

- [ ] Bot responds to messages
- [ ] Slash commands work
- [ ] Event subscriptions active
- [ ] First team member signed up

**Daily Targets**:

- [ ] 10 team members subscribed
- [ ] $500/day revenue ($50/month per member)
- [ ] 80%+ automation rate
- [ ] 90%+ team adoption

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment

- [x] Slack workspace access
- [x] GCP project configured
- [ ] Slack app created
- [ ] Bot tokens stored in GSM

### Deployment

- [ ] Slack app configured (scopes, events)
- [ ] Cloud Run service deployed
- [ ] Event subscriptions verified
- [ ] Bot installed to workspace

### Post-Deployment

- [ ] Test all slash commands
- [ ] Monitor message handling
- [ ] Track team member signups
- [ ] Optimize automation workflows

---

## 💰 REVENUE MODEL

- **Price**: $50/month per team member
- **Daily Target**: 10 team members
- **Daily Revenue**: $500
- **Monthly Revenue**: $15,000
- **Annual Revenue**: $180,000

---

## 🎯 NEXT ACTIONS

```bash
# 1. Create Slack app at api.slack.com/apps
# 2. Deploy Cloud Run service
cd deployment/slack_bot
gcloud run deploy slack-bot-livhana --source .

# 3. Get Cloud Run URL
gcloud run services describe slack-bot-livhana --region=us-central1 --format='value(status.url)'

# 4. Add URL to Slack Event Subscriptions
# 5. Install bot to workspace
# 6. Test and log first signup
python3 scripts/revenue_tracking_monitor.py log slack_bot signup 50.00
```

---

**Status**: READY TO DEPLOY
**Timeline**: 4-6 hours to full deployment
**First Revenue**: After first team member signup ($50)

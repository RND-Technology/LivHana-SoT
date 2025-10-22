# 🚀 Slack App Setup Guide for Flag #2

## Quick Setup (10 minutes)

### Step 1: Create Slack App

1. Go to <https://api.slack.com/apps>
2. Click "Create New App"
3. Choose "From scratch"
4. App Name: "Liv Hana Team Bot"
5. Workspace: Select your workspace
6. Click "Create App"

### Step 2: Configure Bot Token Scopes

1. Go to "OAuth & Permissions"
2. Add these Bot Token Scopes:
   - `app_mentions:read`
   - `chat:write`
   - `commands`
   - `workflows:write`
   - `users:read`

### Step 3: Install App to Workspace

1. Click "Install to Workspace"
2. Authorize the app
3. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### Step 4: Get Signing Secret

1. Go to "Basic Information"
2. Copy the "Signing Secret"

### Step 5: Set Environment Variables

```bash
export SLACK_BOT_TOKEN="xoxb-your-token-here"
export SLACK_SIGNING_SECRET="your-signing-secret-here"
```

### Step 6: Deploy Service

```bash
cd backend/slack-bot-service
bash deploy.sh
```

## Revenue Tracking

Log team member subscriptions ($50/month per member):

```bash
python3 scripts/revenue_tracking_monitor.py log slack_bot team_member 50.00
```

## 💰 Target: $500/day (10 team members at $50/month)

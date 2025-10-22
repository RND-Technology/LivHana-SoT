# 🚀 Slack Webhook Setup (2 minutes)

## Get Your Webhook URL

### Option A: Use Existing Slack App (If you have one)
1. Go to https://api.slack.com/apps
2. Select your app
3. Click "Incoming Webhooks" in sidebar
4. Click "Add New Webhook to Workspace"
5. Choose channel (e.g., #general, #updates, #claude-updates)
6. Copy the webhook URL (looks like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`)

### Option B: Create New Incoming Webhook (Fastest)
1. Go to https://YOUR-WORKSPACE.slack.com/apps/manage
2. Search for "Incoming Webhooks"
3. Click "Add to Slack"
4. Choose channel
5. Copy webhook URL

## Set Up in Terminal

```bash
# Set the webhook URL (replace with your URL)
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX"

# Test it
bash scripts/slack_update_poster.sh "🚀 Claude Code is online and ready to deploy three flags!" "🎯"
```

## Enable Automatic Updates

```bash
# Store webhook in environment (optional - for persistence)
echo 'export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"' >> ~/.zshrc
source ~/.zshrc

# Now I can post updates automatically as I work!
```

## What You'll Receive

I'll post updates like:
- 🚀 Starting Flag #1 deployment
- ✅ Custom GPT service code complete
- 📊 Revenue tracking webhook configured
- 🎯 Flag #1 ready for deployment
- ⏰ Estimated completion: 30 minutes
- 💰 First revenue event logged: $0.10

---

**Just paste your webhook URL and I'll keep you updated in real-time!** 🎤

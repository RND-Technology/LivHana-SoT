# Liv Hana Slack Webhook Setup

## Quick Setup (5 minutes)

### Step 1: Create Slack App
1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. App Name: "Liv Hana Alert Bot"
4. Workspace: Select your Liv Hana workspace

### Step 2: Enable Incoming Webhooks
1. In app settings, go to "Incoming Webhooks"
2. Toggle "Activate Incoming Webhooks" to ON
3. Click "Add New Webhook to Workspace"
4. Select channel: #liv-hana-alerts (or create it)
5. Click "Allow"

### Step 3: Get Webhook URL
1. Copy the webhook URL (starts with https://hooks.slack.com/services/...)
2. Add to 1Password as "Slack Webhook URL"

### Step 4: Test Integration
```bash
# Set webhook URL
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Test alert
source .claude/slack-alert-system.sh
security_alert "Test Alert" "Slack integration working!"
```

## Alert Types Available

### Security Alerts (CRITICAL)
- Credential rotation
- Security breaches
- Unauthorized access

### Deployment Alerts (INFO)
- Service deployments
- Domain mappings
- SSL certificates

### Health Alerts (WARNING)
- Service downtime
- Performance issues
- Error rates

## Integration with Existing Systems

The Slack alert system can be integrated with:
- Cloud Run deployments
- DNS updates
- SSL certificate provisioning
- Security monitoring
- Health checks

## Next Steps

1. Complete webhook setup
2. Test integration
3. Integrate with deployment scripts
4. Set up monitoring alerts

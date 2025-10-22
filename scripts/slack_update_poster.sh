#!/bin/bash
# Slack Update Poster - Send progress updates to Slack

SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL}"

if [ -z "$SLACK_WEBHOOK_URL" ]; then
    echo "⚠️  SLACK_WEBHOOK_URL not set"
    echo ""
    echo "To enable Slack updates:"
    echo "1. Go to https://api.slack.com/apps"
    echo "2. Click your workspace → 'Incoming Webhooks'"
    echo "3. Copy webhook URL"
    echo "4. Run: export SLACK_WEBHOOK_URL='your-webhook-url'"
    exit 1
fi

# Function to post to Slack
post_slack() {
    local message="$1"
    local emoji="${2:-🤖}"

    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{
            \"text\": \"${emoji} ${message}\",
            \"username\": \"Claude Code\",
            \"icon_emoji\": \":robot_face:\"
        }" \
        -s > /dev/null

    echo "✅ Posted to Slack: $message"
}

# Export function for use in other scripts
export -f post_slack

# Test if called directly
if [ "$1" ]; then
    post_slack "$1" "$2"
fi

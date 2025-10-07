#!/bin/bash
# Liv Hana Slack Alert System
# Priority: HIGH (security events)

# Configuration
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
ALERT_CHANNEL="#liv-hana-alerts"
ALERT_ICON="🚨"

# Colors for different alert levels
RED="🔴"
YELLOW="🟡"
GREEN="🟢"
BLUE="🔵"

# Alert functions
send_alert() {
    local level="$1"
    local title="$2"
    local message="$3"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Determine color based on level
    case "$level" in
        "CRITICAL"|"ERROR") color="$RED" ;;
        "WARNING") color="$YELLOW" ;;
        "SUCCESS"|"INFO") color="$GREEN" ;;
        *) color="$BLUE" ;;
    esac
    
    # Create Slack message
    local slack_message=$(cat << EOF
{
    "channel": "$ALERT_CHANNEL",
    "username": "Liv Hana Alert Bot",
    "icon_emoji": "$ALERT_ICON",
    "attachments": [
        {
            "color": "$color",
            "title": "$title",
            "text": "$message",
            "footer": "Liv Hana E2E Empire",
            "ts": $(date +%s)
        }
    ]
}
EOF
)
    
    # Send to Slack
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "$slack_message" \
            "$SLACK_WEBHOOK_URL"
        echo "✅ Alert sent to Slack: $title"
    else
        echo "⚠️ SLACK_WEBHOOK_URL not set - alert not sent"
        echo "Message: $title - $message"
    fi
}

# Security alert function
security_alert() {
    local event="$1"
    local details="$2"
    send_alert "CRITICAL" "🚨 Security Event: $event" "$details"
}

# Deployment alert function
deployment_alert() {
    local status="$1"
    local service="$2"
    local details="$3"
    send_alert "INFO" "🚀 Deployment: $service - $status" "$details"
}

# Health check alert function
health_alert() {
    local service="$1"
    local status="$2"
    local details="$3"
    send_alert "WARNING" "💓 Health Check: $service - $status" "$details"
}

# Usage examples
echo "Liv Hana Slack Alert System Ready"
echo "Usage:"
echo "  security_alert 'Credential Rotation' 'GoDaddy API keys rotated successfully'"
echo "  deployment_alert 'SUCCESS' 'integration-service' 'All 8 domains mapped'"
echo "  health_alert 'voice-service' 'DOWN' 'HTTP 500 error detected'"

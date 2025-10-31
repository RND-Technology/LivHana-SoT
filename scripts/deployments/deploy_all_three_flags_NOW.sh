#!/bin/bash
# MASTER DEPLOYMENT SCRIPT - ALL THREE FLAGS
# Target: $1,200/day = $36K/month = $432K/year
# RUN THIS ONCE AND ALL THREE FLAGS DEPLOY

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 THREE-FLAG MASTER DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Target Revenue: \$1,200/day"
echo "📊 Total Annual: \$432,000/year"
echo "⏰ Start Time: $(date)"
echo ""

# Pre-flight checks
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  PRE-FLIGHT CHECKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check GCP auth
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" > /dev/null 2>&1; then
    echo "❌ GCP not authenticated. Run: gcloud auth login"
    exit 1
fi
echo "✅ GCP authenticated"

# Check OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set (needed for Flag #1)"
    echo "   Attempting to get from GSM..."
    OPENAI_API_KEY=$(gcloud secrets versions access latest --secret="OPENAI_API_KEY" 2>/dev/null || echo "")
    if [ -n "$OPENAI_API_KEY" ]; then
        echo "✅ Found OPENAI_API_KEY in GSM"
        export OPENAI_API_KEY
    else
        echo "⚠️  OPENAI_API_KEY not found - Flag #1 will need manual setup"
    fi
else
    echo "✅ OPENAI_API_KEY configured"
fi

# Check Slack tokens
if [ -z "$SLACK_BOT_TOKEN" ]; then
    echo "⚠️  SLACK_BOT_TOKEN not set (needed for Flag #2)"
    echo "   Flag #2 will need manual Slack app setup first"
else
    echo "✅ SLACK_BOT_TOKEN configured"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DEPLOYING FLAG #1: CUSTOM GPT (\$300/day)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$OPENAI_API_KEY" ]; then
    cd backend/custom-gpt-service
    bash deploy.sh
    cd ../..
    echo "✅ Flag #1 deployed successfully"
else
    echo "⚠️  Skipping Flag #1 - OpenAI API key not configured"
    echo "   Manual steps:"
    echo "   1. Set OPENAI_API_KEY"
    echo "   2. Run: cd backend/custom-gpt-service && bash deploy.sh"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DEPLOYING FLAG #2: SLACK BOT (\$500/day)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$SLACK_BOT_TOKEN" ] && [ -n "$SLACK_SIGNING_SECRET" ]; then
    cd backend/slack-bot-service
    bash deploy.sh
    cd ../..
    echo "✅ Flag #2 deployed successfully"
else
    echo "⚠️  Skipping Flag #2 - Slack tokens not configured"
    echo "   Manual steps:"
    echo "   1. Create Slack app at api.slack.com/apps"
    echo "   2. Set SLACK_BOT_TOKEN and SLACK_SIGNING_SECRET"
    echo "   3. Run: cd backend/slack-bot-service && bash deploy.sh"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FLAG #3: REPLIT PWA (\$400/day)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Flag #3 requires manual Replit deployment"
echo "   Automated steps complete - ready for copy/paste to Replit"
echo ""
echo "   Manual steps:"
echo "   1. Go to https://replit.com"
echo "   2. Create new React JavaScript repl"
echo "   3. Copy files from: deployment/replit-pwa/"
echo "   4. Run: npm install && npm start"
echo "   5. Click 'Deploy' button"
echo ""
echo "   See: deployment/replit-pwa/DEPLOY_INSTRUCTIONS.md"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DEPLOYMENT SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

python3 scripts/revenue_tracking_monitor.py dashboard

echo ""
echo "📋 Next Steps:"
echo "1. Test each deployed service"
echo "2. Complete manual setups for skipped flags"
echo "3. Monitor revenue dashboard"
echo "4. Log first revenue events"
echo ""
echo "⏰ End Time: $(date)"
echo ""

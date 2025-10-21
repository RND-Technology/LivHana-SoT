#!/bin/bash
# DEPLOY AGENTS FOR E2E EMPIRE MISSION - EXECUTE NOW

set -euo pipefail

echo "🚀 E2E EMPIRE AGENT DEPLOYMENT"
echo "=============================="
echo ""

# Get JWT token
TOKEN=$(curl -s -X POST http://localhost:4002/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"userId":"jesse-admin","role":"admin"}' | jq -r .token)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Failed to get auth token"
    exit 1
fi

echo "✅ Auth token obtained"
echo ""

# Agent 1: Critical Path - Domain Mapping
echo "🤖 Deploying Agent 1: Domain Mapping + SSL Provisioning (CRITICAL PATH)"
AGENT1=$(curl -s -X POST http://localhost:4002/api/autonomous/execute \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "task": "Create Cloud Run domain mappings for E2E Empire domains",
        "instructions": "For these 18 domains: aaacbdhempflower.com, cannabiscookiestexas.com, exoticcanopysolutions.com, exoticcbdhempflower.com, freeweedsanantonio.com, freeweedtexas.com, herbitrage.com, jesseniesen.com, loudcbdbuds.com, loudcbdflower.com, smokingyoga.com, terpwerk.com, texascannabiscookies.com, thcacannabisdispensary.com, thcaflowerstx.com, thcaflowertx.com, thcasanantonio.com. Create domain mappings: gcloud run domain-mappings create --service integration-service --domain [DOMAIN] --region us-central1 --project livhana-439623. Monitor SSL certificate provisioning status. Report progress every 20% (every 3-4 domains). Test HTTPS after SSL ready: curl -I https://[DOMAIN]. Target: 18/18 domains with SSL certificates ready.",
        "priority": "critical",
        "capabilities": ["execute_bash", "read_file"]
    }')

AGENT1_ID=$(echo "$AGENT1" | jq -r .executionId)
echo "   Agent 1 ID: $AGENT1_ID"
echo "   Status: Deploying domain mappings..."
echo ""

# Agent 2: Load Balancing
echo "🤖 Deploying Agent 2: DNS Load Balancing Optimization"
AGENT2=$(curl -s -X POST http://localhost:4002/api/autonomous/execute \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "task": "Update DNS to use all 8 Cloud Run IPs for load balancing",
        "instructions": "Get all IPs: dig +short integration-service-plad5efvha-uc.a.run.app. Currently domains use single IP 34.143.72.2. Update GoDaddy DNS for 18 domains to add all 8 IPs as A records. Use scripts/godaddy-dns-CORRECT-SOLUTION.sh as reference. Credentials in 1Password (LivHana-Ops-Keys/GoDaddy API Key). Report progress every 20%. Verify: dig +short [DOMAIN] A should return 8 IPs. Target: All 18 domains with 8 A records.",
        "priority": "high",
        "capabilities": ["execute_bash", "read_file"]
    }')

AGENT2_ID=$(echo "$AGENT2" | jq -r .executionId)
echo "   Agent 2 ID: $AGENT2_ID"
echo "   Status: Optimizing DNS load balancing..."
echo ""

# Agent 4: Monitoring (Agent 3 will wait for Agent 1)
echo "🤖 Deploying Agent 4: Monitoring & Alerting"
AGENT4=$(curl -s -X POST http://localhost:4002/api/autonomous/execute \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "task": "Set up production monitoring and alerting for E2E Empire",
        "instructions": "Verify continuous monitor running (scripts/e2e-empire-continuous-monitor.sh). Create Cloud Monitoring dashboard for: Cloud Run health, domain response times, SSL certificate expiry, error rates. Set up alerts: 5xx errors, response time > 5s, SSL expiry < 30 days, service down. Configure log aggregation. Create status dashboard. Document dashboard URLs and alert configuration. Save to docs/E2E-EMPIRE-MONITORING.md",
        "priority": "medium",
        "capabilities": ["execute_bash", "write_file", "read_file"]
    }')

AGENT4_ID=$(echo "$AGENT4" | jq -r .executionId)
echo "   Agent 4 ID: $AGENT4_ID"
echo "   Status: Setting up monitoring..."
echo ""

echo "✅ All agents deployed!"
echo ""
echo "📊 Track progress:"
echo "   Agent 1 (Critical): curl -s http://localhost:4002/api/autonomous/status/$AGENT1_ID -H 'Authorization: Bearer $TOKEN' | jq ."
echo "   Agent 2 (DNS):      curl -s http://localhost:4002/api/autonomous/status/$AGENT2_ID -H 'Authorization: Bearer $TOKEN' | jq ."
echo "   Agent 4 (Monitor):  curl -s http://localhost:4002/api/autonomous/status/$AGENT4_ID -H 'Authorization: Bearer $TOKEN' | jq ."
echo ""
echo "📈 Monitor overall progress:"
echo "   tail -f reports/e2e-empire-monitor/background.log"
echo ""
echo "⏱️  Expected completion: 1-2 hours (waiting for SSL provisioning)"
echo "🎯 Target: 100% production readiness"

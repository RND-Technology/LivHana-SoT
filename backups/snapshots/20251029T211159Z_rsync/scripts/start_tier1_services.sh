#!/usr/bin/env bash
# scripts/start_tier1_services.sh
# Starts all Tier-1 services with proper secrets loaded
set -euo pipefail

ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"

echo "🚀 Starting Tier-1 Services"
echo "=========================="
echo ""

# Check 1Password is signed in
if ! op account get >/dev/null 2>&1; then
  echo "❌ 1Password not signed in"
  echo "Run: eval \"\$(op signin)\" first"
  exit 1
fi

echo "✅ 1Password: Signed in"
echo ""

# Start services with secrets
echo "Starting integration-service..."
cd "$ROOT/backend/integration-service"
op run --env-file=<(cat <<'ENV'
LIGHTSPEED_TOKEN=op://LivHana-Ops-Keys/LIGHTSPEED_TOKEN/credential
GCP_PROJECT_ID=reggieanddrodispensary
ENV
) -- npm start > /tmp/integration-service.log 2>&1 &
INT_PID=$!
echo "  PID: $INT_PID"

echo "Starting voice-service..."
cd "$ROOT/backend/voice-service"
npm start > /tmp/voice-service.log 2>&1 &
VOICE_PID=$!
echo "  PID: $VOICE_PID"

echo "Starting reasoning-gateway..."
cd "$ROOT/backend/reasoning-gateway"  
op run --env-file=<(cat <<'ENV'
ANTHROPIC_API_KEY=op://LivHana-Ops-Keys/ANTHROPIC_API_KEY/credential
OPENAI_API_KEY=op://LivHana-Ops-Keys/OPENAI_API_KEY/credential
ENV
) -- npm start > /tmp/reasoning-gateway.log 2>&1 &
REASON_PID=$!
echo "  PID: $REASON_PID"

echo ""
echo "Waiting 5 seconds for startup..."
sleep 5

echo ""
echo "🏥 Health Checks:"
for service in "integration-service:3005" "voice-service:8080" "reasoning-gateway:4002"; do
  NAME="${service%%:*}"
  PORT="${service##*:}"
  if curl -sf "http://localhost:$PORT/health" >/dev/null 2>&1; then
    echo "✅ $NAME: UP (port $PORT)"
  else
    echo "⚠️  $NAME: DOWN (port $PORT) - check /tmp/${NAME}.log"
  fi
done

echo ""
echo "=========================="
echo "✅ Tier-1 services started"
echo ""
echo "To stop all:"
echo "  pkill -f 'node.*integration-service'"
echo "  pkill -f 'node.*voice-service'"
echo "  pkill -f 'node.*reasoning-gateway'"


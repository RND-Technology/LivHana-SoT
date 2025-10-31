#!/usr/bin/env bash
# Fast Voice System Switch
# Switches from slow conversation pipeline to fast voice-service (2.8s latency)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VOICE_SERVICE_URL="http://localhost:8080"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Fast Voice System Switch"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Verify voice-service is healthy
echo "1️⃣  Verifying voice-service health..."
if ! curl -sf --max-time 2 "${VOICE_SERVICE_URL}/health" >/dev/null; then
  echo "❌ Voice service not responding on port 8080"
  echo "   Start it with: cd backend/voice-service && ./start_with_env.sh"
  exit 1
fi

HEALTH=$(curl -s "${VOICE_SERVICE_URL}/health")
echo "✅ Voice service healthy"
echo "   Status: $(echo "$HEALTH" | jq -r '.status' 2>/dev/null || echo 'unknown')"
echo ""

# 2. Measure baseline latency (use curl timing instead of date)
echo "2️⃣  Measuring fast service latency..."
LATENCY=$(curl -w '%{time_total}' -o /dev/null -s -X POST "${VOICE_SERVICE_URL}/api/reasoning/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2+2? Answer in one word."}')

# Convert to milliseconds (curl returns seconds with decimals)
LATENCY_MS=$(echo "$LATENCY * 1000" | bc | cut -d'.' -f1)

echo "✅ Latency test complete"
echo "   Response time: ${LATENCY_MS}ms"
echo "   Target: <3000ms"
echo ""

if [[ $LATENCY_MS -gt 5000 ]]; then
  echo "⚠️  Warning: Latency higher than expected (${LATENCY_MS}ms > 5000ms)"
fi

# 3. Export environment variable
echo "3️⃣  Setting environment variable..."
export VOICE_BASE_URL="${VOICE_SERVICE_URL}"
echo "✅ VOICE_BASE_URL=${VOICE_BASE_URL}"
echo ""

# 4. Update cockpit .env.local if exists
COCKPIT_DIR="${ROOT_DIR}/frontend/vibe-cockpit"
if [[ -d "$COCKPIT_DIR" ]]; then
  echo "4️⃣  Updating vibe-cockpit configuration..."

  ENV_LOCAL="${COCKPIT_DIR}/.env.local"

  # Create or update .env.local
  if [[ -f "$ENV_LOCAL" ]]; then
    # Update existing
    if grep -q "VOICE_BASE_URL" "$ENV_LOCAL" 2>/dev/null; then
      sed -i.bak "s|VOICE_BASE_URL=.*|VOICE_BASE_URL=${VOICE_SERVICE_URL}|" "$ENV_LOCAL"
      rm -f "${ENV_LOCAL}.bak"
    else
      echo "VOICE_BASE_URL=${VOICE_SERVICE_URL}" >> "$ENV_LOCAL"
    fi
  else
    # Create new
    cat > "$ENV_LOCAL" <<EOL
# Fast Voice Service Configuration
VOICE_BASE_URL=${VOICE_SERVICE_URL}
NEXT_PUBLIC_VOICE_BASE_URL=${VOICE_SERVICE_URL}
EOL
  fi

  echo "✅ Updated ${ENV_LOCAL}"
  echo "   VOICE_BASE_URL=${VOICE_SERVICE_URL}"
  echo ""
else
  echo "4️⃣  Skipping cockpit config (directory not found)"
  echo ""
fi

# 5. Performance diagnostics
echo "5️⃣  Running performance diagnostics..."
echo "   Testing endpoint timings..."

CURL_TIMING=$(curl -w "connect: %{time_connect}s | start_transfer: %{time_starttransfer}s | total: %{time_total}s\n" \
  -o /dev/null -s "${VOICE_SERVICE_URL}/health")

echo "   $CURL_TIMING"
echo ""

# 6. System resource check
echo "6️⃣  Checking system resources..."
VOICE_PID=$(lsof -t -i:8080 2>/dev/null | head -1 || echo "")
if [[ -n "$VOICE_PID" ]]; then
  if command -v ps >/dev/null 2>&1; then
    PS_INFO=$(ps -o pid,%cpu,%mem,command -p "$VOICE_PID" 2>/dev/null | tail -1 || echo "")
    echo "   Voice service PID: $VOICE_PID"
    echo "   $PS_INFO"
  fi
else
  echo "   ⚠️  Could not find voice service PID"
fi
echo ""

# 7. Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Fast Voice System Switch Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Performance Summary:"
echo "   Measured latency: ${LATENCY_MS}ms"
echo "   Target latency: <3000ms"
echo "   Service URL: ${VOICE_SERVICE_URL}"
echo ""
echo "🎯 Next Steps:"
echo "   1. Restart vibe-cockpit if running (to pick up new .env.local)"
echo "   2. Test voice interaction through cockpit UI"
echo "   3. Monitor latency with: scripts/voice/benchmark_voice.sh"
echo ""
echo "💡 Usage:"
echo "   Direct API: curl -X POST ${VOICE_SERVICE_URL}/api/reasoning/chat \\"
echo "               -H 'Content-Type: application/json' \\"
echo "               -d '{\"message\": \"Your question here\"}'"
echo ""
echo "   Cockpit UI: http://localhost:3000 (will use fast service automatically)"
echo ""

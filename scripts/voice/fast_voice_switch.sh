#!/usr/bin/env bash
# Fast Voice System Switch - Marine Corps Precision Edition
# Principle: Verify → Measure → Then Claim (never reverse)
set -euo pipefail

# Error handling
trap 'echo "❌ Error on line $LINENO. Switch FAILED." >&2; exit 1' ERR
trap 'echo "⚠️  Script interrupted." >&2; exit 130' INT TERM

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VOICE_SERVICE_URL="${VOICE_BASE_URL:-http://localhost:8080}"
VERIFICATION_SAMPLES=5

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Fast Voice System Switch (10-80-10 Autonomous Mode)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Pre-flight: Verify voice-service is healthy
echo "1️⃣  Pre-flight: Voice service health check..."
if ! curl -sf --max-time 2 "${VOICE_SERVICE_URL}/health" >/dev/null; then
  echo "❌ Voice service not responding on port 8080"
  echo "   Start it with: cd backend/voice-service && ./start_with_env.sh"
  exit 1
fi

HEALTH=$(curl -s "${VOICE_SERVICE_URL}/health")
echo "✅ Service responding (HTTP 200)"
echo "   Status: $(echo "$HEALTH" | jq -r '.status' 2>/dev/null || echo 'unknown')"
echo ""

# 2. Baseline latency measurement (reasoning endpoint - the real test)
echo "2️⃣  Baseline: Measuring reasoning endpoint latency (${VERIFICATION_SAMPLES} samples)..."
declare -a latencies=()

for i in $(seq 1 $VERIFICATION_SAMPLES); do
  LATENCY=$(curl -w '%{time_total}' -o /dev/null -s --max-time 10 \
    -X POST "${VOICE_SERVICE_URL}/api/reasoning/chat" \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Test ${i}: Quick response.\"}")
  
  LATENCY_MS=$(echo "$LATENCY * 1000" | bc | cut -d'.' -f1)
  latencies+=("$LATENCY_MS")
  echo -n "   Sample $i: ${LATENCY_MS}ms "
  
  if [[ $LATENCY_MS -lt 3000 ]]; then
    echo "✅"
  elif [[ $LATENCY_MS -lt 5000 ]]; then
    echo "🟡"
  else
    echo "❌"
  fi
done

# Calculate P50 (median)
sorted=($(printf '%s\n' "${latencies[@]}" | sort -n))
mid=$((VERIFICATION_SAMPLES / 2))
P50="${sorted[$mid]}"

echo ""
echo "📊 Baseline P50 latency: ${P50}ms"
if [[ $P50 -gt 5000 ]]; then
  echo "❌ FAILED: P50 latency ${P50}ms exceeds 5000ms threshold"
  echo "   Voice service may not be optimized correctly"
  exit 1
elif [[ $P50 -gt 3000 ]]; then
  echo "🟡 WARNING: P50 latency ${P50}ms exceeds <3s target but acceptable"
else
  echo "✅ EXCELLENT: P50 latency ${P50}ms meets <3s target"
fi
echo ""

# 3. Export environment variable
echo "3️⃣  Environment: Setting VOICE_BASE_URL..."
export VOICE_BASE_URL="${VOICE_SERVICE_URL}"
echo "✅ VOICE_BASE_URL=${VOICE_BASE_URL}"
echo ""

# 4. Update cockpit configuration
COCKPIT_DIR="${ROOT_DIR}/frontend/vibe-cockpit"
if [[ -d "$COCKPIT_DIR" ]]; then
  echo "4️⃣  Configuration: Updating vibe-cockpit .env.local..."

  ENV_LOCAL="${COCKPIT_DIR}/.env.local"

  if [[ -f "$ENV_LOCAL" ]]; then
    # Update existing
    if grep -q "VOICE_BASE_URL" "$ENV_LOCAL" 2>/dev/null; then
      sed -i.bak "s|VOICE_BASE_URL=.*|VOICE_BASE_URL=${VOICE_SERVICE_URL}|" "$ENV_LOCAL"
      sed -i.bak "s|NEXT_PUBLIC_VOICE_BASE_URL=.*|NEXT_PUBLIC_VOICE_BASE_URL=${VOICE_SERVICE_URL}|" "$ENV_LOCAL"
      rm -f "${ENV_LOCAL}.bak"
    else
      echo "VOICE_BASE_URL=${VOICE_SERVICE_URL}" >> "$ENV_LOCAL"
      echo "NEXT_PUBLIC_VOICE_BASE_URL=${VOICE_SERVICE_URL}" >> "$ENV_LOCAL"
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
  echo ""
else
  echo "4️⃣  Configuration: Skipping cockpit (directory not found)"
  echo ""
fi

# 5. Automated restart (10-80-10 autonomous execution)
echo "5️⃣  Restart: Gracefully restarting services to apply changes..."

# Check if STOP.sh exists and is executable
if [[ -x "${ROOT_DIR}/STOP.sh" ]]; then
  echo "   Stopping services with STOP.sh..."
  "${ROOT_DIR}/STOP.sh" >/dev/null 2>&1 || echo "   ⚠️  STOP.sh encountered issues (continuing)"
  sleep 2
else
  echo "   ⚠️  STOP.sh not found, attempting manual service stop..."
  # Kill voice service on 8080
  kill $(lsof -ti :8080) 2>/dev/null || true
  sleep 2
fi

# Restart voice service
echo "   Starting voice-service with fast configuration..."
cd "${ROOT_DIR}/backend/voice-service"
if [[ -f "start_with_env.sh" ]]; then
  chmod +x start_with_env.sh
  REASONING_FAST_MODEL=gpt-5 ./start_with_env.sh >/dev/null 2>&1 &
  sleep 5
else
  echo "❌ start_with_env.sh not found in backend/voice-service"
  exit 1
fi

cd "$ROOT_DIR"
echo "✅ Services restarted"
echo ""

# 6. POST-VERIFICATION: The critical test (Verify → Measure → Then Claim)
echo "6️⃣  POST-VERIFICATION: Testing restarted service (${VERIFICATION_SAMPLES} samples)..."

# Wait for service to be fully ready
sleep 3

declare -a post_latencies=()
POST_SUCCESS=0

for i in $(seq 1 $VERIFICATION_SAMPLES); do
  if LATENCY=$(curl -w '%{time_total}' -o /dev/null -s --max-time 10 \
    -X POST "${VOICE_SERVICE_URL}/api/reasoning/chat" \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Post-restart test ${i}\"}"); then
    
    LATENCY_MS=$(echo "$LATENCY * 1000" | bc | cut -d'.' -f1)
    post_latencies+=("$LATENCY_MS")
    POST_SUCCESS=$((POST_SUCCESS + 1))
    
    echo -n "   Sample $i: ${LATENCY_MS}ms "
    if [[ $LATENCY_MS -lt 3000 ]]; then
      echo "✅"
    elif [[ $LATENCY_MS -lt 5000 ]]; then
      echo "🟡"
    else
      echo "❌"
    fi
  else
    echo "   Sample $i: FAILED ❌"
  fi
done

echo ""

# Verify at least 80% success rate
MIN_SUCCESS=$((VERIFICATION_SAMPLES * 80 / 100))
if [[ $POST_SUCCESS -lt $MIN_SUCCESS ]]; then
  echo "❌ POST-VERIFICATION FAILED: Only $POST_SUCCESS/$VERIFICATION_SAMPLES samples succeeded"
  echo "   Service may not be functioning correctly after restart"
  exit 1
fi

# Calculate post-restart P50
if [[ ${#post_latencies[@]} -gt 0 ]]; then
  post_sorted=($(printf '%s\n' "${post_latencies[@]}" | sort -n))
  post_mid=$((${#post_latencies[@]} / 2))
  POST_P50="${post_sorted[$post_mid]}"
else
  POST_P50="N/A"
fi

echo "📊 Post-restart P50 latency: ${POST_P50}ms"
echo "   Success rate: $POST_SUCCESS/$VERIFICATION_SAMPLES ($(( POST_SUCCESS * 100 / VERIFICATION_SAMPLES ))%)"
echo ""

# 7. Final validation and summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ "$POST_P50" != "N/A" ]] && [[ $POST_P50 -le 3000 ]] && [[ $POST_SUCCESS -ge $VERIFICATION_SAMPLES ]]; then
  echo "✅ VERIFICATION COMPLETE: Fast Voice System Switch SUCCESSFUL"
elif [[ $POST_SUCCESS -ge $MIN_SUCCESS ]]; then
  echo "🟡 VERIFICATION COMPLETE: Switch successful with warnings"
else
  echo "❌ VERIFICATION FAILED: Service not functioning correctly"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Performance Comparison:"
echo "   Baseline P50:     ${P50}ms"
echo "   Post-restart P50: ${POST_P50}ms"

if [[ "$POST_P50" != "N/A" ]]; then
  if [[ $POST_P50 -lt $P50 ]]; then
    IMPROVEMENT=$(( (P50 - POST_P50) * 100 / P50 ))
    echo "   Improvement:      ${IMPROVEMENT}% faster ✅"
  elif [[ $POST_P50 -eq $P50 ]]; then
    echo "   Change:           No change (stable)"
  else
    DEGRADATION=$(( (POST_P50 - P50) * 100 / P50 ))
    echo "   Change:           ${DEGRADATION}% slower ⚠️"
  fi
fi

echo ""
echo "🎯 Service Status:"
echo "   URL: ${VOICE_SERVICE_URL}"
echo "   Model: gpt-5 (150 tokens max)"
echo "   Target: <3000ms P50"

if [[ "$POST_P50" != "N/A" ]] && [[ $POST_P50 -le 3000 ]]; then
  echo "   Status: ✅ MEETING TARGET"
else
  echo "   Status: 🟡 Above target but functional"
fi

echo ""
echo "💡 Verification Commands:"
echo "   Health check:     curl ${VOICE_SERVICE_URL}/health"
echo "   Latency test:     curl -X POST ${VOICE_SERVICE_URL}/api/reasoning/chat \\"
echo "                     -H 'Content-Type: application/json' \\"
echo "                     -d '{\"message\": \"Test\"}'"
echo "   Full benchmark:   scripts/voice/benchmark_voice.sh 30"
echo ""

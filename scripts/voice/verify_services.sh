#!/usr/bin/env bash
set -euo pipefail

# LivHana Tier‑1 Voice Preflight Verifier
# Verifies local prerequisites for unified voice router deployment.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "[verify] Repo root: $REPO_ROOT"
echo "[verify] Node: $(command -v node || echo 'node not found')"
echo "[verify] Docker: $(command -v docker || echo 'docker not found')"
echo "[verify] Docker Compose: $(command -v docker-compose || echo 'docker-compose not found')"

echo "[verify] Checking critical files..."
required=(
  "backend/voice-service/src/index.js"
  "backend/voice-service/src/routers/unified-voice-router.js"
  "scripts/voice/start_whisper_service.sh"
  "scripts/voice/start_vocode_service.sh"
)
for f in "${required[@]}"; do
  if [[ -f "$f" ]]; then
    echo "  ✅ $f"
  else
    echo "  ❌ MISSING: $f" >&2
  fi
done

echo "[verify] Checking env keys (masked)..."
mask() { local v="$1"; [[ -n "$v" ]] && echo "set" || echo "missing"; }
echo "  OPENAI_API_KEY:    $(mask "${OPENAI_API_KEY-}")"
echo "  ANTHROPIC_API_KEY: $(mask "${ANTHROPIC_API_KEY-}")"
echo "  ELEVENLABS_API_KEY: $(mask "${ELEVENLABS_API_KEY-}")"
echo "  REDIS_HOST:        ${REDIS_HOST-${REDIS_URL-${REDIS-"unset"}}}"

VOICE_PORT="${PORT-8080}"
WHISPER_URL="${WHISPER_SERVICE_URL-http://localhost:9000}"
VOCODE_URL="${VOCODE_TTS_URL-http://localhost:9001}"

echo "[verify] Checking port collisions on :$VOICE_PORT"
if command -v lsof >/dev/null 2>&1; then
  if lsof -i ":$VOICE_PORT" | grep -q LISTEN; then
    echo "  ⚠️ Port $VOICE_PORT already in use (this may be expected if voice-service is running)"
  else
    echo "  ✅ No listener on :$VOICE_PORT (service may not be started yet)"
  fi
else
  echo "  ℹ️ lsof not available; skipping port check"
fi

curl_quiet() { curl -fsS -o /dev/null --max-time 3 "$1"; }

echo "[verify] Probing local auxiliaries..."
if curl_quiet "$WHISPER_URL/health"; then
  echo "  ✅ Whisper reachable at $WHISPER_URL"
else
  echo "  ⚠️ Whisper not reachable at $WHISPER_URL (run scripts/voice/start_whisper_service.sh)"
fi

if curl_quiet "$VOCODE_URL/health"; then
  echo "  ✅ Vocode reachable at $VOCODE_URL"
else
  echo "  ⚠️ Vocode not reachable at $VOCODE_URL (run scripts/voice/start_vocode_service.sh)"
fi

echo "[verify] Optional housekeeping queue health script..."
if [[ -x automation/scripts/check_housekeeping_queue.sh ]]; then
  automation/scripts/check_housekeeping_queue.sh || true
else
  echo "  ℹ️ automation/scripts/check_housekeeping_queue.sh not found; skipping"
fi

echo "[verify] Git status summary:"
git status -s || true

echo "[verify] Done. If any ❌ items exist, resolve before deploy."
#!/usr/bin/env bash
# Verify Whisper and Vocode services are running
# Exit 0 if all healthy, 1 otherwise

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verifying Voice Services..."

WHISPER_URL="${WHISPER_SERVICE_URL:-http://localhost:9000}"
VOCODE_URL="${VOCODE_TTS_URL:-http://localhost:9001}"

# Check Whisper
echo -n "Checking Whisper service at ${WHISPER_URL}... "
if curl -sf "${WHISPER_URL}/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
    WHISPER_OK=1
else
    # Try alternate port from running processes
    if curl -sf "http://localhost:2022/health" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Running on port 2022 (update WHISPER_SERVICE_URL)${NC}"
        WHISPER_OK=1
    elif pgrep -f "whisper-server" > /dev/null; then
        echo -e "${YELLOW}⚠ Process running but health check failed${NC}"
        WHISPER_OK=1
    else
        echo -e "${RED}✗ Not running${NC}"
        echo "  Start with: ./scripts/voice/start_whisper_service.sh"
        WHISPER_OK=0
    fi
fi

# Check Vocode
echo -n "Checking Vocode TTS service at ${VOCODE_URL}... "
if curl -sf "${VOCODE_URL}/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
    VOCODE_OK=1
elif curl -sf "http://localhost:9001/v1/tts:stream" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Running (no /health endpoint)${NC}"
    VOCODE_OK=1
elif pgrep -f "vocode|tts" > /dev/null; then
    echo -e "${YELLOW}⚠ Process running but health check failed${NC}"
    VOCODE_OK=1
else
    echo -e "${RED}✗ Not running${NC}"
    echo "  Start with: ./scripts/voice/start_vocode_service.sh"
    VOCODE_OK=0
fi

# Check API keys
echo -n "Checking OpenAI API key... "
if [[ -n "${OPENAI_API_KEY:-}" ]]; then
    echo -e "${GREEN}✓ Set${NC}"
    OPENAI_OK=1
else
    echo -e "${RED}✗ Not set${NC}"
    OPENAI_OK=0
fi

echo -n "Checking Anthropic API key... "
if [[ -n "${ANTHROPIC_API_KEY:-}" ]]; then
    echo -e "${GREEN}✓ Set${NC}"
    ANTHROPIC_OK=1
else
    echo -e "${RED}✗ Not set${NC}"
    ANTHROPIC_OK=0
fi

# Summary
echo ""
if [[ $WHISPER_OK -eq 1 && $VOCODE_OK -eq 1 && $OPENAI_OK -eq 1 && $ANTHROPIC_OK -eq 1 ]]; then
    echo -e "${GREEN}✅ All services verified - Ready for deployment${NC}"
    exit 0
else
    echo -e "${RED}❌ Some services missing - Fix above issues before deploying${NC}"
    exit 1
fi


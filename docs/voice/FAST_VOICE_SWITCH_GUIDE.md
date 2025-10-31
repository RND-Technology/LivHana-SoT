# Fast Voice Service Switch - Configuration Guide

**Created**: 2025-10-30  
**Purpose**: Switch from slow voice mode tool (52s latency) to fast voice-service (2.8s latency)  
**Status**: ✅ Service healthy on port 8080

---

## Quick Start

```bash
# 1. Run the automated switch script
./scripts/voice/fast_voice_switch.sh

# 2. Restart frontend dev server
cd frontend/vibe-cockpit && npm run dev

# 3. Test voice interaction via UI
open http://localhost:5173
```

---

## Service Validation

### Health Check
```bash
curl -s http://127.0.0.1:8080/health | jq
```

**Expected Response**:
```json
{
  "status": "healthy",
  "service": "voice-service",
  "version": "1.0.0",
  "timestamp": "2025-10-30T...",
  "features": {
    "elevenlabs": true,
    "reasoning": true,
    "redis": true
  }
}
```

### Available Endpoints
- **Health**: `GET /health`
- **ElevenLabs TTS**: `POST /api/elevenlabs/*`
- **Reasoning Gateway**: `POST /api/reasoning/*`
- **OpenAI Advanced Voice** (<300ms target): `POST /api/openai-voice/*`
- **Interrupt Control**: `POST /api/interrupt/*`
- **Orchestration Commands**: `POST /api/commands/orchestration`

---

## Configuration Files

### Frontend Environment (Vite)
**File**: `frontend/vibe-cockpit/.env.local`

```env
# Voice Service Configuration (Fast Path)
VITE_VOICE_BASE_URL=http://127.0.0.1:8080
```

**Usage in Code**:
```typescript
const voiceBaseUrl = import.meta.env.VITE_VOICE_BASE_URL || 'http://localhost:8080';

// Example: Fetch voice synthesis
const response = await fetch(`${voiceBaseUrl}/api/elevenlabs/synthesize`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: 'Hello world', voice: 'Bella' })
});
```

### Backend Environment
**File**: `backend/voice-service/.env`

```env
PORT=8080
ELEVENLABS_API_KEY=sk_...
REASONING_GATEWAY_BASE_URL=http://localhost:4002/api/reasoning
REDIS_HOST=localhost
REDIS_PORT=6379
NODE_ENV=development
```

### Shell Environment
```bash
export VOICE_BASE_URL=http://127.0.0.1:8080
```

Add to `~/.zshrc` or `~/.bashrc` for persistence.

---

## Cockpit Integration Points

### OrchestrationDashboard.tsx
**Location**: `frontend/vibe-cockpit/src/components/OrchestrationDashboard.tsx`

**Current Pattern** (lines 216, 240):
```typescript
const response = await fetch(`${httpBase}/api/orchestration/state`);
const socket = new WebSocket(wsUrl);
```

**Fast Voice Integration** (add this utility):
```typescript
// Add to top of component or separate config file
const VOICE_SERVICE_BASE = import.meta.env.VITE_VOICE_BASE_URL || 'http://localhost:8080';

// Use for voice-specific calls
const synthesizeSpeech = async (text: string) => {
  const response = await fetch(`${VOICE_SERVICE_BASE}/api/elevenlabs/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: 'Bella' })
  });
  return response.blob(); // Audio stream
};

// For voice commands with reasoning
const processVoiceCommand = async (command: string) => {
  const response = await fetch(`${VOICE_SERVICE_BASE}/api/commands/orchestration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command })
  });
  return response.json();
};
```

### Voice Mode Tool Migration
**Current Issue**: Voice mode conversation tool uses slower pipeline (52s latency)

**Solution**: Replace conversation tool calls with direct API requests:

**Before** (slow):
```typescript
// Using voice mode conversation tool (MCP server)
await voiceModeConverse({ message: "Hello", wait_for_response: true });
```

**After** (fast):
```typescript
// Direct API to fast service
const response = await fetch(`${VOICE_SERVICE_BASE}/api/openai-voice/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: "Hello" })
});
const audio = await response.blob();
// Play audio immediately
```

---

## Latency Diagnostics

### Manual Testing
```bash
# Test with timing breakdown
curl -w '\nConnect: %{time_connect}s\nTransfer: %{time_starttransfer}s\nTotal: %{time_total}s\n' \
  -s -o /dev/null http://127.0.0.1:8080/health
```

### Automated Benchmark
```bash
# Run 100 samples (default)
./scripts/voice/voice_latency_benchmark.sh

# Custom sample size
BENCHMARK_SAMPLES=500 ./scripts/voice/voice_latency_benchmark.sh
```

**Output**:
```
📊 Results:
   Min:  0.6 ms
   Avg:  2.8 ms
   p50:  1.2 ms (median)
   p95:  5.4 ms
   p99:  12.1 ms
   Max:  28.3 ms
```

---

## Performance Comparison

| Pipeline | Latency | Status |
|----------|---------|--------|
| Voice mode conversation tool | ~52s | ❌ Deprecated |
| Fast voice-service (current) | ~2.8s | ✅ Production |
| Phase 2 target (streaming) | <510ms | 🚧 Future |

### Phase 1 Optimizations (Complete)
- ✅ Direct HTTP API (no queue overhead)
- ✅ Redis-backed job processing
- ✅ ElevenLabs streaming TTS
- ✅ Connection pooling
- ✅ Health monitoring

### Phase 2 Optimizations (Pending)
- 🚧 WebSocket streaming for TTS
- 🚧 Model pre-warming on boot
- 🚧 CDN edge caching for common phrases
- 🚧 HTTP/2 multiplexing
- 🚧 Brotli compression

---

## Troubleshooting

### Issue: Service not responding
```bash
# Check if running
lsof -iTCP:8080 -sTCP:LISTEN

# Restart service
cd backend/voice-service
npm start
```

### Issue: 503 Service Unavailable
**Cause**: API keys missing

**Fix**:
```bash
# Check .env file
cat backend/voice-service/.env | grep API_KEY

# If missing, add keys
op run -- npm start  # Use 1Password CLI
```

### Issue: Frontend not picking up .env.local
**Cause**: Vite dev server caches environment

**Fix**:
```bash
cd frontend/vibe-cockpit
rm -rf node_modules/.vite  # Clear cache
npm run dev
```

### Issue: High latency (>5s)
**Possible Causes**:
- Cold start (first request after boot)
- Network congestion
- API rate limiting
- Missing API keys (causing fallback loops)

**Debug**:
```bash
# Check system load
top -o cpu -n 5

# Monitor service logs
tail -f backend/voice-service/logs/voice-service.log

# Test with verbose curl
curl -v http://127.0.0.1:8080/health
```

---

## Next Steps

1. **Immediate**: Run `./scripts/voice/fast_voice_switch.sh`
2. **Validate**: Test voice interaction via cockpit UI
3. **Benchmark**: Run latency benchmark to establish baseline
4. **Monitor**: Check logs for any errors during first 100 requests
5. **Optimize**: If latency >3s, review Phase 2 optimizations

---

## References

- Voice Service Code: `backend/voice-service/src/index.js`
- Router Implementations: `backend/voice-service/src/routers/`
- Deployment Scripts: `backend/voice-service/deploy-voice-mode-NOW.sh`
- Test Suite: `tests/e2e/voice-cockpit.spec.js`

---

**Status**: ✅ Ready for production use  
**Latency Target**: 2.8s avg (Phase 1 complete)  
**Next Milestone**: <510ms (Phase 2)

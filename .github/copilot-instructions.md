# LivHana-SoT Copilot Instructions

**Version**: 2025-11-01 (Unified Pipeline Edition)  
**Owner**: RND-Technology / LivHana-SoT  
**Core Principle**: Zero Latency • 100% Uptime • Flawless Execution

---

## The 11 Laws of Voice Execution

1. **Single Stable Channel**: All voice operations on port 8080 (unified pipeline)
2. **Zero Latency**: Optimize every operation for speed
3. **100% Uptime**: Never break the voice pipeline
4. **Verification First**: Check before changing
5. **No Conflicts**: One script, one channel, one truth
6. **Clear Errors**: Actionable error messages only
7. **Always Monitor**: Health checks mandatory
8. **No Secrets Exposed**: Environment variables only
9. **Track Performance**: Measure latency, uptime
10. **Graceful Degradation**: Fail safely, recover fast
11. **Instant Recovery**: Auto-restart on failure

---

## Quick Reference

### Current Build Architecture
- **Voice Pipeline**: Port 8080 (`backend/voice-service`) - UNIFIED ENTRY POINT
- **Reasoning Gateway**: Port 4002 (`backend/reasoning-gateway`)
- **Integration Service**: Port 3005 (`backend/integration-service`)
- **Frontend**: Port 5173 (`frontend/vibe-cockpit`)
- **Redis**: Port 6379 (queue backend)

### Critical Files
- `START_VOICE_PIPELINE.sh` - SINGLE SCRIPT TO START VOICE (port 8080)
- `START.sh` - Legacy multi-mode startup (use for non-voice)
- `backend/voice-service/src/index.js` - Unified voice entry point

### Voice Commands Flow
```
User → Port 8080 → Voice Service → [ElevenLabs TTS | Reasoning Queue] → Response
```

**NO OTHER VOICE SCRIPTS**. Everything goes through port 8080.
---

## Development Rules (Concise)

### Code Standards
- TypeScript strict mode for new code
- No `any` types - use explicit types
- Shell scripts: `set -euo pipefail`, quote all vars
- Health endpoints: < 250ms response, JSON format
- Errors: Structured JSON with trace IDs

### Security (Non-Negotiable)
- Secrets in environment variables ONLY
- Validate ALL external inputs
- No sudo without explicit approval
- API keys never logged or exposed

### Performance Targets (Voice Pipeline)
| Operation | Target |
|-----------|--------|
| Voice synthesis | < 500ms |
| Health check | < 250ms |
| Reasoning (first token) | < 1500ms |

### Commit Format
```
<type>: <description>

<why + verification>
```
Types: `feat`, `fix`, `perf`, `docs`

---

## Pre-Commit Checklist

✅ Files exist, paths correct  
✅ Tests pass (`npm test`)  
✅ No secrets in code  
✅ Health endpoints work  
✅ Performance within targets  
✅ Voice pipeline not broken  

---

## Voice Pipeline Commands

```bash
# Start unified voice pipeline (PORT 8080)
./START_VOICE_PIPELINE.sh

# Check health
curl http://localhost:8080/health

# Test voice synthesis
curl -X POST http://localhost:8080/api/elevenlabs/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"test"}'

# Stop pipeline
kill $(cat /tmp/voice-pipeline.pid)
```

---

## Troubleshooting

**Port 8080 in use?**
```bash
lsof -i :8080
kill -9 <PID>
./START_VOICE_PIPELINE.sh
```

**Service not responding?**
```bash
curl http://localhost:8080/health
# Check logs, restart if needed
```

**Performance issues?**
```bash
scripts/audit/latency_probe.sh
```

---

## Extended Documentation

For detailed standards:
- EA_PRECISION: `.copilot/instructions-ea-precision.md`
- Verification: `.copilot/verification-checklist.md`
- Audit Plan: `docs/voice_mode_audit_plan.md`

---

**Last Updated**: 2025-11-01 (Unified Pipeline)  
**Priority**: Voice Pipeline Stability > Everything Else

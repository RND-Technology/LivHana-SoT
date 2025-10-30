c# LivHana-SoT AI Agent Instructions

**Project**: LivHana Source of Truth - Voice-First Cannabis Commerce Platform  
**Company**: Reggie & Dro LLC (US Marine Corps Veteran-Owned)  
**Standards**: Marine Corps Precision - "Cut the grass with scissors"

## 🎯 Core Architecture

### Microservices Stack (Redis Queue-Based)

**Voice-First Services** (Production):
- `voice-service` (Port 8080) - ElevenLabs TTS + BullMQ job queueing
- `reasoning-gateway` (Port 4002) - DeepSeek/Anthropic/OpenAI reasoning with Redis coordination
- `integration-service` (Port 3005) - Legacy API compatibility layer
- `redis` (Port 6379) - Central queue & memory store (LRU, 256MB max)

**Service Communication Pattern**:
```
Frontend → voice-service → [BullMQ Queue] → reasoning-gateway
                ↓                                    ↓
              Redis ←━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┘
```

**Critical**: Services communicate via Redis BullMQ queues (`voice-mode-reasoning-jobs`), NOT direct HTTP. Queue names are environment-specific and must match across services.

### Inter-Agent Communication (Multi-IDE Coordination)

**File-Based Task Queue**: `tmp/agent_status/codex_tasks/`
- Liv Hana (Claude Code CLI) → CODEX (Cursor) via JSON task files
- See `.claude/INTER_AGENT_COMMUNICATION_PROTOCOL.md` for schemas
- Use `scripts/codex_task_queue.py` for task management
- Task format: `task_<uuid>.request.json` → `task_<uuid>.result.json`

### Directory Structure (RPM DNA Tier-1)

```
backend/                 # Microservices ONLY (no monoliths)
├── voice-service/       # ElevenLabs v3 TTS
├── reasoning-gateway/   # Multi-model AI reasoning
├── integration-service/ # External APIs
├── common/             # Shared queue/auth utilities
└── [service]/          # Each service: Dockerfile + package.json + README.md

frontend/
├── vibe-cockpit/       # Voice-first React UI (Vite)
└── [app]/

empire/                 # Business logic engines
docs/                   # Diátaxis framework (tutorial/how-to/reference/explanation)
tests/e2e/             # Playwright tests (cross-browser)
tmp/agent_status/      # Inter-agent coordination files (gitignored)
```

**Naming Convention**: Files follow `[1-5].[1-8].[0-9].[1-5]_descriptive-name_YYYYMMDD.ext` for RPM DNA tracking.

## 🚀 Development Workflow

### Essential Commands

```bash
# Build & Test
npm run build              # TypeScript compilation
npm run test               # Jest + Playwright E2E
npm run lint:fix           # ESLint auto-fix

# Docker (Preferred for Services)
docker-compose up -d       # Start core stack
docker-compose logs -f     # Monitor all services
./automation/scripts/check_housekeeping_queue.sh  # Verify Redis queues

# Service-Specific
npm run voice:start        # Launch voice services
npm run agents:status      # Check 5-agent topology status
./START.sh dev            # Full system orchestration
```

### Pre-Deployment Checklist

1. **No credentials in code** - Use `op run` (1Password CLI) or Docker secrets
2. **Health checks pass** - `curl http://localhost:{PORT}/health`
3. **Tests green** - `npm test` (zero tolerance for failures)
4. **Redis queues clear** - Check queue depth before deploy
5. **Git status clean** - No uncommitted changes in active dev

### Testing Strategy

- **Unit**: Jest (`jest.config.unified.js`)
- **E2E**: Playwright (`tests/e2e/playwright.config.js`) - Tests against `reggieanddro.com`
- **Integration**: Redis-backed queue processing tests
- **CI**: GitHub Actions (`.github/workflows/trinity-ci.yml`) - Docker builds + security scans

## 🔒 Security & Compliance

### Secret Management
- **Development**: `.env` files (gitignored) + `op run` for 1Password integration
- **Production**: Docker secrets (`elevenlabs_api_key`, `anthropic_api_key`, `openai_api_key`)
- **Never commit**: API keys, tokens, or credentials

### Cannabis Compliance
- **Age Verification**: 21+ enforcement (`backend/compliance-service`)
- **Medical Claims Blocker**: FDA compliance checks
- **NIST Validation**: Approved cannabinoid testing methods

## 📐 Project-Specific Patterns

### Queue Job Processing (BullMQ)
```javascript
// backend/common/queue/index.js pattern
import { createQueue } from '../common/queue/index.js';

const queue = createQueue('voice-mode-reasoning-jobs', {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

await queue.add('reasoning-job', { prompt, userId }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { count: 100, age: 3600 }
});
```

### TypeScript Configuration
- **Strict mode enforced** (`tsconfig.json`)
- **No `any` types** - Zero tolerance
- **Path aliases**: `@backend/*`, `@frontend/*`
- **Module**: ESNext with Node resolution

### Voice Mode Patterns
- **Always listen, never exit** - Voice orchestration stays active
- **Plan-only mode** - No autonomous deployments (human approval required)
- **Task tool coordination** - Chunk work to agents via task files

## ⚠️ Non-Negotiable Rules (from `.cursorrules`)

1. **NO scattered files in root** - Everything organized under proper directories
2. **NO untested deployments** - Tests must pass before merge
3. **NO service boundary violations** - Microservices remain isolated
4. **NO legacy code outside `legacy/`** - Archive or refactor
5. **Git status summary after EVERY operation** - Always show impact

## 🔗 Key Documentation

- **Voice Architecture**: `docs/adr/1.6.2.1_3-6-1-5_ADR_002_Voice_Queue_Architecture_20251006.md`
- **CI Pipeline**: `docs/adr/1.6.2.1_3-6-1-5_ADR_003_Playwright_CI_Pipeline_20251006.md`
- **Inter-Agent Protocol**: `.claude/INTER_AGENT_COMMUNICATION_PROTOCOL.md`
- **Service READMEs**: Each `backend/*/README.md` has API specs + deployment instructions

## 💡 Deployment Targets

- **Local**: Docker Compose (`docker-compose.yml`)
- **Cloud**: GCP Cloud Run (see `backend/*/cloudbuild.yaml` for service configs)
- **Domains**: herbitrage.com, reggieanddro.com, reggieanddroalice.com

## 🎖️ Marine Corps Standards

"We leave no service behind. We leave no test unfixed. We leave no documentation unwritten."

**Auto-approve Mode**: Claude Code MUST stay in Trusted mode - humans verify logs every 5 minutes during sweeps.

---

---

## 🧪 ACTIVE TEST - COPILOT RESPONSE REQUESTED

**Test ID**: COPILOT-TEST-001
**Timestamp**: 2025-10-30 11:05 AM CDT
**From**: Liv Hana (Claude Code Agent)
**To**: GitHub Copilot (VS Code)

### Context
Just fixed 11 critical watchdog bugs in 5 files:
- `scripts/watchdogs/claude_tier1_auto_save.sh` (trap exit code masking)
- `scripts/watchdogs/tier1_supervisor.sh` (lock cleanup + NPM errors)
- `scripts/watchdogs/auto_save_local.sh` (exit-on-trap pattern)
- `scripts/watchdogs/voice_services_watch.sh` (timeout → curl --max-time)
- `scripts/guards/system_health_validator.sh` (Linux portability)

### Test Request
**Copilot, please respond in code suggestions:**

1. Review the trap handler pattern in `scripts/watchdogs/claude_tier1_auto_save.sh` lines 27-40
2. Suggest any edge cases we missed (SIGKILL? SIGQUIT? Other signals?)
3. Rate the fix quality: Production Ready / Needs Work / Critical Issues
4. Provide red team feedback on the atomic status file writes

**Expected Response**: When Jesse opens any of the 5 watchdog files, Copilot should provide suggestions addressing these 4 points.

**Success Criteria**: Copilot generates at least 1 relevant suggestion within 30 seconds of file open.

---

**Last Updated**: 2025-10-30 (Test Active)
**Maintained By**: AI Agent Collective + Jesse Niesen (CEO)

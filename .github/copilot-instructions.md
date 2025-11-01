# LivHana-SoT Copilot Space Repository Instructions

**Version**: 2025-11-01  
**Owner**: RND-Technology / LivHana-SoT  
**Primary Languages**: JavaScript (Node), TypeScript, HTML, Shell, minimal Python/CSS  
**Principles**: Verification Over Generation • Truth & Safety First • Performance Second • Speed Third (after truth & safety locked) • Shell-Safe Patterns • 21+ Guardrails (no disallowed content; maintain professional, secure output)

---

## 0. Purpose

These instructions guide GitHub Copilot (standard suggestions, Chat, Coding Agent) to produce context-aware, verifiable, minimally risky contributions for this repository. The system should default to:

1. Verifying existing functionality and constraints before generating new code.
2. Emitting changes that are test-backed, observable, and traceable.
3. Avoiding speculative architecture unless explicitly requested.

If instructions conflict, repository-level guidance herein supersedes generic suggestions.

**Extended Standards**: For detailed enterprise audit precision standards, see:
- **EA_PRECISION Module**: `.copilot/instructions-ea-precision.md` (verification hierarchy, audit trails, security)
- **Verification Checklist**: `.copilot/verification-checklist.md` (pre-commit checklist)
- **Voice Audit Plan**: `docs/voice_mode_audit_plan.md` (comprehensive audit framework)
- **Audit Scripts**: `scripts/audit/` (automated verification tools)

---

## 1. Repository Context Snapshot

**Current known services** (inferred from START.sh):
- backend/integration-service (port 3005, health expected at /health)
- backend/reasoning-gateway (port 4002, /health)
- backend/voice-service (port 4001, /health; may need verification)
- frontend/vibe-cockpit (Vite dev server, port 5173 default)

**Supporting infra**:
- Redis (startup auto-detected/started in START.sh)
- Optional docker-compose for full mode

**START.sh implements**:
- Mode selection: dev | voice | full | test
- Memory & VS Code process safety checks
- Health endpoint polling via curl
- Service bring-up using background npm start calls

**IMPORTANT**: Copilot MUST treat START.sh as canonical for process orchestration until refactor tasks explicitly redefine behavior.

---

## 2. Core Development Standards

### 2.1 TypeScript & JavaScript
- Prefer TypeScript for new logic; enable "strict": true.
- Avoid `any`; use explicit types and narrow unions.
- Side-effect modules must document exported runtime effects.
- All new modules require a top-of-file doc comment explaining purpose + invariants.

### 2.2 Shell / Automation
- Always use: `set -euo pipefail`
- Quote variable expansions: `"$VAR"`
- Use `command -v tool >/dev/null 2>&1` for capability checks.
- Prefer functions for repeated logic; avoid duplicated cd + npm start patterns.
- For background processes: track PIDs; avoid blind pkill unless legacy script requires.
- NEVER write scripts that assume root unless specified.

### 2.3 Security & Secrets
- No secrets hard-coded; reference via process.env or GitHub Actions secrets.
- Validate external inputs (HTTP params, WebSocket messages) before processing.
- Add dependency health checks (npm audit / osv-scanner) in workflows—do not suppress without justification.

### 2.4 Error Handling
- Service APIs must return structured error JSON: `{error:{code, message, traceId?}}`
- Avoid swallowing errors silently in promises; log with structured fields: level, service, component, correlationId.

### 2.5 Logging & Observability
- Emit machine-parseable logs (JSON lines) for new backend code: `{ts, level, service, event, meta:{...}}`
- Health endpoints must include: status, service, version, commit, uptimeSec, dependencies array.

### 2.6 Performance & Benchmarks
- Introduce metrics incrementally; do not over-instrument early code.
- New streaming logic must measure first-token latency, total processing time.
- Bench scripts should output JSON artifacts (for diffing in CI).

---

## 3. Pull Request (PR) Guidelines

Copilot Coding Agent when creating a PR MUST:

1. Include a **Problem Statement** with:
   - What is changing
   - Why (reference issue IDs if exist)
   - Verification plan (manual + automated)
2. Add/update tests for all new logic.
3. If modifying START.sh or deployment scripts: show diff rationale and rollback plan.
4. Provide risk assessment section (Security, Performance, Compatibility).
5. Run local health verification (simulate dev or voice mode) when relevant.

---

## 4. Branch & Commit Conventions

- **Branch naming**: `feature/<short-desc>`, `fix/<issue-num>`, `refactor/<component>`
- **Commit format**: Conventional Commits style:
  ```
  <type>(<scope>): <subject>
  
  [optional body]
  
  [optional footer]
  ```
  Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

- For START.sh changes: keep prior version snippet in PR description for audit.

---

## 5. Testing Requirements

### Test Coverage Targets
- **Unit tests**: 80%+ for new code
- **Integration tests**: For API endpoints and service interactions
- **E2E tests**: For UI changes and user workflows
- **Manual testing**: For complex scenarios

### Running Tests
```bash
npm test                  # All tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e          # E2E tests
npm run test:coverage     # Coverage report
```

### Test Naming
```javascript
describe('VoiceService', () => {
  describe('processVoiceRequest', () => {
    it('should return audio response for valid input', () => {
      // test implementation
    });
  });
});
```

---

## 6. Security & Compliance

### No Secrets in Code
- Never commit API keys, passwords, or sensitive data
- Use environment variables or secret management
- Use `op run` for 1Password secrets
- Add `.env.example` files for required variables

### Cannabis Compliance
- Follow Texas cannabis regulations
- Implement age verification where required (21+)
- Use compliant language (avoid "weed" terminology)
- Maintain audit trails for transactions
- State-specific rules (product types, THC limits)

### AI Guardrails
- Implement content filtering for AI responses
- Add compliance checks before AI processing
- Log all AI interactions for audit purposes
- Implement rate limiting and abuse prevention

---

## 7. Monitoring & Observability

### Required Instrumentation
- **Health endpoints**: `/health` and `/ready` on all services
- **Structured logging**: JSON format with request ID correlation
- **Metrics export**: Prometheus format
- **Error tracking**: Sentry integration
- **APM**: New Relic instrumentation

### Logging Standards
```javascript
logger.info('Voice request processed', {
  requestId: req.id,
  userId: user.id,
  duration: Date.now() - startTime,
  service: 'voice-service'
});
```

---

## 8. Architectural Decision Records (ADRs)

### When Required
- New architectural patterns
- Technology stack changes
- System-wide configuration changes
- Security model changes
- Performance-critical decisions

### ADR Format (Nygard Schema)
```markdown
---
adr: ADR-XXX
status: proposed|accepted|deprecated
---

# ADR-XXX: [Title]

## Status
[proposed|accepted|deprecated]

## Context
[Background and problem statement]

## Decision
[The change that is being proposed or made]

## Consequences
### Positive
- [Benefits]

### Negative
- [Drawbacks]
```

---

## 9. Copilot-Specific Guidance

### When to Use Which Service
- **Voice processing**: Use `backend/voice-service` (ElevenLabs)
- **LLM/reasoning**: Use `backend/reasoning-gateway` (DeepSeek 33B)
- **Compliance checks**: Use `backend/cannabis-service`
- **Payments**: Use `backend/payment-service` (Stripe/Square)
- **External APIs**: Use `backend/integration-service`
- **Product data**: Use `backend/product-service`

### Common Patterns
- **Queue-based processing**: Use Redis + BullMQ (in `backend/common/queue/`)
- **Authentication**: JWT middleware in `backend/common/auth/`
- **Logging**: Structured logger in `backend/common/logging/`
- **Monitoring**: New Relic + Sentry in `backend/common/monitoring/`
- **AI memory**: Use `backend/common/memory/` (Redis + BigQuery)

### Preferred Libraries
- **HTTP client**: `axios`
- **Testing**: `jest` (unit/integration), `playwright` (e2e)
- **Validation**: `joi` or `zod`
- **Database**: `pg` for PostgreSQL, `redis` for Redis
- **Queue**: `bullmq`
- **Monitoring**: `@newrelic/native`, `@sentry/node`

---

## 10. Environment & Configuration

### Environment Variables
Use `.env.example` as template. Required variables:
```bash
# Core
NODE_ENV=development|production|test
PORT=<service-port>

# APIs
ELEVENLABS_API_KEY=<key>
OPENAI_API_KEY=<key>
DEEPSEEK_API_URL=<url>

# Monitoring
NEW_RELIC_LICENSE_KEY=<key>
NEW_RELIC_APP_NAME=LivHana-<service>
SENTRY_DSN=<dsn>
SENTRY_ENVIRONMENT=<env>

# Database
REDIS_URL=redis://localhost:6379
BIGQUERY_PROJECT_ID=<project-id>

# Authentication
JWT_SECRET=<secret>
JWT_EXPIRATION=24h
```

### Startup Scripts
```bash
./START.sh dev      # Core services (30 seconds)
./START.sh voice    # Voice AI mode (45 seconds)
./START.sh full     # Everything via Docker (60 seconds)
./START.sh test     # Run all tests
```

---

## 11. Performance Targets

### Response Times
- **API endpoints**: < 200ms p95
- **Voice synthesis**: < 500ms
- **LLM reasoning**: < 2s for simple queries, < 5s for complex
- **Database queries**: < 50ms p95

### Reliability
- **Uptime**: 99.99% SLA
- **Error rate**: < 0.1%
- **Test coverage**: 80%+ for new code
- **Zero critical vulnerabilities**

---

## 12. Common Tasks & How-Tos

### Adding a New Endpoint
1. Add route in `backend/<service>/src/routes/`
2. Implement controller in `backend/<service>/src/controllers/`
3. Add validation (joi/zod)
4. Add authentication middleware if needed
5. Write unit tests
6. Write integration tests
7. Update API documentation
8. Test with Postman/curl

### Adding a New Service
1. Create directory in `backend/<service-name>/`
2. Copy structure from existing service
3. Update `docker-compose.yml`
4. Add environment variables
5. Implement health endpoints
6. Add monitoring instrumentation
7. Write tests
8. Update README.md
9. Add to `.github/workflows/ci.yml`

---

## 13. Troubleshooting & Debugging

### Service Won't Start
1. Check Docker: `docker ps`
2. Check logs: `docker-compose logs <service>`
3. Check environment variables in `.env`
4. Verify port availability: `lsof -i :<port>`
5. Check Redis connection: `redis-cli ping`

### Tests Failing
1. Check service dependencies are running
2. Verify environment variables for test environment
3. Check test database is seeded correctly
4. Run tests in isolation: `npm test -- <test-file>`
5. Check for race conditions or timing issues

---

## 14. Integration Points

### External Services
- **ElevenLabs**: Voice synthesis (API key required)
- **DeepSeek**: Local LLM (self-hosted or API)
- **OpenAI**: Embeddings for vector search
- **Square**: POS data ingestion (OAuth)
- **Lightspeed**: POS data ingestion (OAuth)
- **BigQuery**: Analytics and data warehouse
- **Stripe/Square**: Payment processing
- **New Relic**: Application monitoring
- **Sentry**: Error tracking

### Data Pipelines
Located in `automation/data-pipelines/`:
- Square POS ingestion (33,317 transactions)
- Lightspeed POS ingestion (OAuth active)
- Gmail email history
- Notion knowledge base

---

## 15. Release & Deployment

### Semantic Versioning
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Changelog
- Update `CHANGELOG.md` for all releases
- Use [Keep a Changelog](https://keepachangelog.com/) format
- Categorize: Added, Changed, Fixed, Removed
- Link to issues/PRs

---

## 16. Voice Mode Specific Guidelines

### Voice Service (`backend/voice-service`)
- Uses ElevenLabs v3 API
- Real-time voice synthesis
- Audio streaming support
- Error handling for API failures
- Rate limiting to prevent abuse

### Reasoning Gateway (`backend/reasoning-gateway`)
- DeepSeek 33B local LLM
- Autonomous decision-making
- Context-aware responses
- Compliance guardrails
- Queue-based processing (Redis + BullMQ)

### Voice Cockpit UI (`frontend/vibe-cockpit`)
- React component: `VoicePanel`
- Hook: `useReasoningJob`
- Real-time WebSocket updates
- Audio player integration
- Executive dashboard with compliance monitoring

---

## 17. Special Considerations

### START.sh Script
- Central orchestrator for launching services
- DO NOT modify unless:
  1. Approved by Jesse Niesen (CEO)
  2. Includes ADR justifying the change
  3. Prior version snippet included in PR description for audit

### Cannabis-Specific Language
- Avoid slang terms (e.g., "weed")
- Use: "cannabis," "flower," "concentrate," "edible"
- Age verification: 21+ required
- State-specific regulations enforced

---

## 18. Performance SLO Draft (Subject to Revision)

- Health endpoint p99 < 250ms (local dev)
- First token latency p90 < 1500ms in voice mode synthetic tests
- Error rate (<5xx) < 1% over rolling 15m window in reasoning-gateway

---

## 19. Incremental Refactor Policy

Do not batch unrelated improvements. Sequence:
1. Introduce metrics
2. Introduce structured health JSON
3. Introduce orchestrator skeleton
4. Introduce feedback ingestion
5. Introduce adaptive policy loader

---

## 20. Missing Context Flags

If Copilot cannot find:
- voice-service directory
- health endpoint implementation

It must respond with: **"Verification required: file/path not found. Provide path or confirm creation."**

---

## Quick Reference Checklist (Copilot Pre-Commit)

- [ ] Files exist or creation justified
- [ ] Tests updated/added
- [ ] Lint/type pass locally
- [ ] Health endpoints preserved/improved
- [ ] No secrets or unsafe shell patterns added
- [ ] Logging structured
- [ ] Performance impact considered
- [ ] Documentation (ADR / issue markdown) updated or scheduled

---

## End of Instructions

These instructions are living. Changes must be done via PR referencing this file and an ADR documenting rationale.

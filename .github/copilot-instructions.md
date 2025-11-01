# Copilot Instructions for LivHana-SoT

**Purpose**: These instructions guide GitHub Copilot (and other AI coding agents) when working on the LivHana-SoT repository. They establish repository standards, file structure, and decision-making frameworks.

**Last Updated**: 2025-11-01  
**Owner**: Jesse Niesen (CEO)

---

## 1. Project Overview

### Name & Identity
- **Primary**: LivHana-SoT  
- **Meaning**: Single source of truth, system of thoughts, state of truthfulness (tri-une meaning)  
- **Mission**: TIER-1 cannabis AI platform combining voice-first commerce with autonomous AI memory

### Core Stack
- **Frontend**: React 18 + Vite + Tailwind CSS  
- **Backend**: Node.js 20, Express, Redis, PostgreSQL (optional)  
- **AI/ML**: DeepSeek 33B local LLM, OpenAI embeddings, Vector search  
- **Voice**: ElevenLabs v3 (real-time voice synthesis)  
- **Data**: BigQuery for analytics, Square/Lightspeed integrations  
- **Monitoring**: New Relic APM (free tier), Sentry ($29/month)  
- **Infrastructure**: Docker Compose, GitHub Actions CI/CD  
- **Security**: 1Password CLI for secrets, JWT auth, PCI DSS compliant

### Key Services (7 total, all Dockerized)
1. **voice-service** (port 4001): ElevenLabs voice synthesis  
2. **reasoning-gateway** (port 4002): DeepSeek 33B + autonomous agent  
3. **cannabis-service** (port 3003): Compliance & regulations  
4. **payment-service** (port 3004): Payment processing  
5. **integration-service** (port 3005): External API gateway + BigQuery  
6. **product-service** (port 4010): Product catalog  
7. **redis** (port 6379): Queue & cache

---

## 2. Repository Structure & File Organization

### Top-level Directories
```
LivHana-SoT/
├── backend/           # All backend services (microservices)
├── frontend/          # React apps (vibe-cockpit primary)
├── automation/        # Data pipelines (Square, Lightspeed, Gmail, Notion)
├── docs/              # Documentation (ADRs, PRDs, architecture)
├── infra/             # Docker configs, deployment scripts
├── tests/             # Shared test utilities
├── scripts/           # Utility scripts
├── reports/           # Workstream completion reports
├── legacy/            # Archived content
└── .github/           # GitHub workflows, templates, contribution guidelines
```

### Backend Service Structure
Each service in `backend/` follows this pattern:
```
backend/<service-name>/
├── src/
│   ├── index.js       # Entry point
│   ├── routes/        # API routes
│   ├── controllers/   # Business logic
│   ├── models/        # Data models
│   └── utils/         # Helpers
├── tests/
│   ├── unit/
│   └── integration/
├── package.json
├── Dockerfile
└── README.md
```

### Common Modules (`backend/common/`)
- **memory/**: AI learning system (Redis + BigQuery)  
- **monitoring/**: New Relic + Sentry  
- **auth/**: JWT authentication  
- **logging/**: Structured logging  
- **queue/**: Redis queue system  
- **guardrails/**: Safety & compliance checks

---

## 3. Development Standards

### Code Quality
- **Linting**: ESLint with zero errors required  
- **Formatting**: Prettier configured  
- **Testing**: 80%+ coverage for new code  
- **Type Safety**: TypeScript preferred for new modules  
- **Performance**: < 200ms p95 response time  
- **Security**: Zero critical vulnerabilities

### Commit Standards (Conventional Commits)
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Examples**:
```bash
feat(voice): add ElevenLabs v3 integration
fix(checkout): resolve pickup date selection issue
docs(adr): add ADR-005 for payment processing
perf(api): optimize database queries by 40%
```

### Documentation (Diátaxis Framework)
All docs categorized as:
- **Tutorial**: Learning-oriented (step-by-step)  
- **How-to**: Problem-oriented (solving specific problems)  
- **Reference**: Information-oriented (specifications)  
- **Explanation**: Understanding-oriented (background/context)

**Front-matter required**:
```markdown
---
diataxis: [tutorial|how-to|reference|explanation]
owner: [Name]
adr: [ADR-XXX if applicable]
last-reviewed: YYYY-MM-DD
---
```

---

## 4. Architectural Decision Records (ADRs)

### When Required
- New architectural patterns  
- Technology stack changes  
- System-wide configuration changes  
- Security model changes  
- Performance-critical decisions

### ADR Format (Nygard Schema)
```markdown
---
diataxis: explanation
owner: [Name]
adr: ADR-XXX
last-reviewed: YYYY-MM-DD
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

### ADR Linking in Commits
For architectural changes:
```bash
feat(architecture): implement voice queue system

Implements ADR-002: Voice Mode Queue Architecture & Guardrails
- Add Redis-based queue management
- Implement BullMQ for job processing
- Add guardrails for compliance

Closes #123
```

---

## 5. Testing Requirements

### Test Coverage Targets
- **Unit tests**: 80%+ for new code  
- **Integration tests**: For API endpoints and service interactions  
- **Playwright tests**: For UI changes and user workflows  
- **Manual testing**: For complex user scenarios

### Running Tests
```bash
npm test                  # All tests
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:e2e          # Playwright tests
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
- Implement age verification where required  
- Use compliant language (avoid "weed" terminology)  
- Maintain audit trails for transactions  
- State-specific rules (product types, THC limits)

### AI Guardrails
- Implement content filtering for AI responses  
- Add compliance checks before AI processing  
- Log all AI interactions for audit purposes  
- Implement rate limiting and abuse prevention

### Authentication & Authorization
- JWT tokens on all endpoints  
- Role-based access control (admin, user, dispensary)  
- API rate limiting (100 req/min)  
- SQL injection prevention  
- XSS/CSRF protection

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

### Performance Monitoring
- Response time tracking  
- Database query optimization  
- Memory usage monitoring  
- Error rate tracking

---

## 8. Pull Request Process

### Pre-submission Checklist
- [ ] Conventional commit message  
- [ ] ADR link (if architectural)  
- [ ] Tests pass  
- [ ] Linting passes  
- [ ] Documentation updated  
- [ ] CHANGELOG.md updated  
- [ ] No secrets exposed  
- [ ] Security review completed

### PR Template
Use `.github/PULL_REQUEST_TEMPLATE.md` which includes:
- Pre-submission requirements  
- Architectural change checklist  
- Documentation change checklist  
- Testing requirements  
- Security & compliance checklist

### Review Process
1. Automated checks (CI/CD)  
2. Code review (at least one team member)  
3. Security review (for security/compliance changes)  
4. Documentation review (for doc changes)  
5. Final approval (maintainer required)

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

### Docker Commands
```bash
docker-compose up -d              # Start all services
docker-compose logs -f            # View logs
docker-compose down               # Stop all services
docker-compose build --no-cache   # Rebuild services
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

### Scalability
- **Concurrent users**: 50K+  
- **Requests/second**: 10K+  
- **Data storage**: Unlimited (BigQuery)

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

### Updating Dependencies
1. Check for security vulnerabilities: `npm audit`  
2. Update: `npm update`  
3. Test thoroughly  
4. Update `package-lock.json`  
5. Document breaking changes in CHANGELOG.md  
6. Create PR with conventional commit

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

### Performance Issues
1. Check New Relic dashboard  
2. Review database query performance  
3. Check Redis memory usage  
4. Profile with Chrome DevTools or Node.js profiler  
5. Review application logs for slow operations

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

### Production Deployment
1. All tests pass (340/341 = 99.7%)  
2. Docker images built  
3. Secrets in 1Password  
4. SSL certificates ready  
5. Monitoring configured  
6. Backup strategy defined  
7. Compliance verified  
8. Rate limiting enabled

---

## 16. Tier 1 Option A Standards

### Quality Metrics
- **Code coverage**: 80%+ minimum  
- **Performance**: < 100ms API response times  
- **Reliability**: 99.9% uptime target  
- **Security**: Zero critical vulnerabilities  
- **Documentation**: 100% API coverage

### Marine Corps Precision
- No shortcuts  
- Zero defects  
- 100% excellence  
- Peer review required  
- Continuous improvement

---

## 17. Voice Mode Specific Guidelines

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

## 18. Special Considerations

### START.sh Script
- Central orchestrator for launching services  
- DO NOT modify unless:
  1. Approved by Jesse Niesen (CEO)  
2. Includes ADR justifying the change  
3. Prior version snippet included in PR description for audit

### Finance Layer (Sovereign Life OS)
- Personal finance automation (Jesse pilot)  
- Integration with banking APIs  
- Privacy-first approach  
- Compliance with financial regulations

### Cannabis-Specific Language
- Avoid slang terms (e.g., "weed")  
- Use: "cannabis," "flower," "concentrate," "edible"  
- Age verification: 21+ required  
- State-specific regulations enforced

---

## 19. Performance SLO Draft (Subject to Revision)
- Health endpoint p99 < 250ms (local dev)  
- First token latency p90 < 1500ms in voice mode synthetic tests  
- Error rate (<5xx) < 1% over rolling 15m window in reasoning-gateway

---

## 20. Incremental Refactor Policy
Do not batch unrelated improvements. Sequence:
1. Introduce metrics  
2. Introduce structured health JSON  
3. Introduce orchestrator skeleton  
4. Introduce feedback ingestion  
5. Introduce adaptive policy loader

---

## 21. Missing Context Flags
If Copilot cannot find:
- voice-service directory  
- health endpoint implementation

It must respond with: "Verification required: file/path not found. Provide path or confirm creation."

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

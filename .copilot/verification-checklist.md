# Pre-Commit Verification Checklist

**Purpose**: Quick reference checklist for developers and Copilot before committing code  
**Based on**: EA_PRECISION standards (`.copilot/instructions-ea-precision.md`)

---

## ✅ Quick Checklist (2 minutes)

Copy this into your commit message or PR description:

```markdown
## Pre-Commit Verification

### Files & Paths
- [ ] All referenced files exist
- [ ] Paths are correct and absolute where needed
- [ ] No broken imports or references

### Functional
- [ ] Code runs without errors
- [ ] Tests pass locally (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (if applicable)

### Security
- [ ] No secrets/API keys in code
- [ ] Input validation present
- [ ] Error messages don't leak sensitive data
- [ ] Dependencies scanned (`npm audit`)

### Performance
- [ ] No obvious performance issues
- [ ] Resource usage reasonable
- [ ] Latency acceptable (if measured)

### Documentation
- [ ] README updated (if behavior changed)
- [ ] API docs current (if endpoints changed)
- [ ] Comments added for complex logic
- [ ] ADR written (if architectural change)

### Audit Trail
- [ ] Conventional commit format used
- [ ] ADR referenced (if applicable)
- [ ] Issue/ticket linked
- [ ] Verification evidence included (if critical)
```

---

## 🔍 Detailed Verification (10 minutes)

For critical changes or before merging to main:

### 1. File Verification

```bash
# Verify all files exist
git status
git diff --name-only

# Check for missing files
git ls-files --others --exclude-standard
```

**Verify**:
- [ ] All new files are intentional
- [ ] No temporary/test files included
- [ ] .gitignore updated if needed
- [ ] No accidentally deleted files

### 2. Functional Verification

```bash
# Run full test suite
npm test

# Run specific tests
npm test -- path/to/test

# Check test coverage
npm run test:coverage

# Lint code
npm run lint

# Build (if applicable)
npm run build
```

**Verify**:
- [ ] All tests pass
- [ ] Coverage >= 80% for new code
- [ ] No lint errors
- [ ] No TypeScript errors
- [ ] Build succeeds

### 3. Integration Verification

```bash
# Start services
./START.sh dev

# Wait for health
sleep 10

# Check health endpoints
curl http://localhost:4001/health
curl http://localhost:4002/health
curl http://localhost:3005/health

# Run integration tests
npm run test:integration
```

**Verify**:
- [ ] Services start successfully
- [ ] Health endpoints return 200
- [ ] Integration tests pass
- [ ] No errors in logs

### 4. Security Verification

```bash
# Check for secrets
git diff | grep -i "api[_-]key\|password\|secret\|token"

# Scan dependencies
npm audit

# Check for hardcoded credentials
grep -r "password\|secret\|key" --include="*.js" --include="*.ts" . | grep -v "env\|example"
```

**Verify**:
- [ ] No secrets found in diff
- [ ] No critical vulnerabilities
- [ ] No hardcoded credentials
- [ ] Environment variables used correctly

### 5. Performance Verification

```bash
# Run performance tests
scripts/audit/latency_probe.sh

# Check resource usage
top -b -n 1 | head -20

# Monitor memory
watch -n 1 'free -h'
```

**Verify**:
- [ ] Latency within SLO targets
- [ ] CPU usage < 80%
- [ ] Memory stable (no leaks)
- [ ] No degradation vs baseline

### 6. Documentation Verification

```bash
# Check for outdated docs
git diff README.md
git diff docs/

# Verify API docs
find . -name "*.md" -exec grep -l "API" {} \;
```

**Verify**:
- [ ] README reflects current behavior
- [ ] API docs match implementation
- [ ] Examples are correct
- [ ] ADR written (if architectural)
- [ ] CHANGELOG updated

### 7. Commit Message Verification

```bash
# Check commit format
git log -1 --pretty=format:"%s"

# Verify conventional commit
echo "feat(scope): description" | grep -E "^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)"
```

**Verify**:
- [ ] Follows conventional commits format
- [ ] Scope is specific
- [ ] Description is clear
- [ ] Body explains why (if needed)
- [ ] Footer includes links/references

---

## 🚨 Critical Checks (MANDATORY)

These checks MUST pass before merging:

### Shell Script Safety
```bash
# Check for dangerous patterns
grep -r "rm -rf /\|sudo\|eval.*\$" scripts/ --include="*.sh"

# Verify set -euo pipefail
head -5 scripts/**/*.sh | grep "set -euo pipefail"
```

**Must have**:
- [ ] `set -euo pipefail` in all shell scripts
- [ ] No `sudo` without approval
- [ ] No `eval` with user input
- [ ] No blind `rm -rf`
- [ ] Variables quoted: `"$VAR"`

### Secrets Safety
```bash
# Final secret scan
git diff | grep -E "sk-|pk-|secret_key|api_key.*=.*['\"]"

# Check .env not committed
git status | grep "\.env$"
```

**Must NOT have**:
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] No tokens in code
- [ ] .env not committed
- [ ] Secrets use env vars only

### Health Endpoints
```bash
# Verify health endpoints work
scripts/audit/verify_services.sh
```

**Must have**:
- [ ] All services have /health
- [ ] Health returns JSON
- [ ] Health includes dependencies
- [ ] Health responds < 250ms
- [ ] No auth required for health

---

## 📊 Service-Specific Checks

### Voice Service
```bash
# Verify TTS works
scripts/audit/verify_tts.sh

# Test synthesis
curl -X POST http://localhost:4001/api/elevenlabs/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"test"}' \
  -o /tmp/test.mp3
```

**Verify**:
- [ ] ELEVENLABS_API_KEY set
- [ ] Voice service responds
- [ ] Synthesis produces audio
- [ ] Audio file > 1KB
- [ ] Latency < 500ms

### Reasoning Gateway
```bash
# Test reasoning
curl -X POST http://localhost:4002/api/reasoning/enqueue \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'

# Check queue stats
curl http://localhost:4002/api/reasoning/queue/stats
```

**Verify**:
- [ ] Job enqueues successfully
- [ ] Job ID returned
- [ ] Queue processes jobs
- [ ] Results retrievable
- [ ] First token < 1500ms

### Frontend
```bash
# Start dev server
cd frontend/vibe-cockpit && npm run dev

# Check build
npm run build
```

**Verify**:
- [ ] Dev server starts
- [ ] No console errors
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] Assets load correctly

---

## 🔄 Automation Checks (CI/CD)

These run automatically but good to verify locally:

### GitHub Actions
```bash
# Validate workflow files
find .github/workflows -name "*.yml" -exec yamllint {} \;

# Test workflow locally (if act installed)
act -l
```

**Check**:
- [ ] Workflow syntax valid
- [ ] All jobs defined
- [ ] Secrets configured
- [ ] Triggers correct

### Docker
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs
```

**Verify**:
- [ ] Images build successfully
- [ ] Containers start
- [ ] No error logs
- [ ] Health checks pass

---

## 📝 Commit Template

Use this template for commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Example**:
```
feat(voice): add ElevenLabs v3 integration

Implements ADR-002: Voice Mode Queue Architecture
- Added voice synthesis endpoint
- Integrated with reasoning gateway via BullMQ
- Added health monitoring and metrics

Verified:
- All tests pass (340/341)
- Health endpoint responds < 200ms
- Voice synthesis latency p95: 450ms
- No secrets in code
- Linting passes

Closes #123
```

---

## 🎯 Quick Commands

### Pre-Commit
```bash
npm test && npm run lint && git add . && git commit
```

### Full Verification
```bash
npm test && \
npm run lint && \
npm audit && \
scripts/audit/verify_services.sh && \
scripts/audit/verify_tts.sh && \
git add . && \
git commit
```

### Emergency Rollback
```bash
git revert HEAD
git push origin main
```

---

## 📚 References

- EA_PRECISION standards: `.copilot/instructions-ea-precision.md`
- Copilot instructions: `.github/copilot-instructions.md`
- Voice audit plan: `docs/voice_mode_audit_plan.md`
- Audit scripts: `scripts/audit/`

---

**Last Updated**: 2025-11-01  
**Maintained By**: Operations Team

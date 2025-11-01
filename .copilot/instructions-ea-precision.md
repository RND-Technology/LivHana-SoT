# EA_PRECISION - Enterprise Audit Precision Standards

**Version**: 1.0  
**Date**: 2025-11-01  
**Owner**: RND-Technology / LivHana-SoT  
**Purpose**: Enterprise-grade precision standards for code verification and audit compliance

---

## Core Principles

**EA_PRECISION** defines the standard for enterprise audit-ready code in the LivHana-SoT repository. These standards ensure:

1. **Verification Over Generation**: Always verify before creating
2. **Audit Trail Completeness**: Every change is traceable
3. **Truth & Safety First**: No speculative code without explicit approval
4. **Performance Second**: Optimize after correctness is proven
5. **Speed Third**: Never sacrifice safety for speed

---

## Verification Hierarchy

### Level 1: File Existence (MANDATORY)
Before modifying or referencing any file:
```bash
# Verify file exists
ls -la path/to/file

# Verify directory structure
find . -type d -name "target-dir"
```

**Copilot MUST**:
- Check file existence before editing
- Verify paths before creating references
- Confirm directory structure matches expectations
- Report "Verification required: file/path not found" if missing

### Level 2: Functional Verification (MANDATORY)
Before claiming functionality works:
```bash
# Test the endpoint
curl -f http://localhost:PORT/health

# Verify service runs
ps aux | grep service-name

# Check port is listening
lsof -i :PORT
```

**Copilot MUST**:
- Test endpoints before documenting them
- Verify services start successfully
- Confirm integrations work end-to-end
- Never assume functionality without testing

### Level 3: Performance Verification (REQUIRED for Production)
Before claiming performance targets:
```bash
# Measure actual latency
scripts/audit/latency_probe.sh

# Check resource usage
top -b -n 1 | head -20

# Verify under load
ab -n 1000 -c 10 http://localhost:PORT/endpoint
```

**Copilot SHOULD**:
- Measure p50, p95, p99 latencies
- Document actual performance numbers
- Compare against SLO targets
- Flag when performance doesn't meet requirements

---

## Audit Trail Requirements

### Git Commit Standards
Every commit MUST include:
1. Conventional commit format: `<type>(<scope>): <description>`
2. ADR reference (if architectural change)
3. Issue/ticket number (if applicable)
4. Verification evidence (for critical changes)

**Examples**:
```bash
# Good
feat(voice): add ElevenLabs v3 integration

Implements ADR-002: Voice Mode Queue Architecture
- Verified endpoint responds with 200 OK
- Tested with sample audio synthesis
- Latency p95: 450ms (within 500ms SLO)

Closes #123

# Bad
Fixed voice stuff
```

### Documentation Standards
Every significant change MUST include:
1. Updated README if behavior changes
2. API documentation if endpoints change
3. ADR if architectural decision made
4. Runbook update if operations impacted

**Verification Checklist**:
- [ ] README.md updated
- [ ] API docs current
- [ ] ADR written (if needed)
- [ ] Runbook updated (if needed)

---

## Shell Script Safety (CRITICAL)

All shell scripts MUST follow these patterns:

### Required Safeguards
```bash
#!/bin/bash
set -euo pipefail  # MANDATORY

# Quote all variable expansions
echo "$VAR"        # Good
echo $VAR          # Bad

# Check command exists before using
if command -v tool >/dev/null 2>&1; then
    tool --do-thing
fi

# Use functions for repeated logic
function check_service() {
    local service=$1
    # ...
}

# Track PIDs for background processes
MY_PID=$!
echo $MY_PID > /tmp/service.pid
```

### Forbidden Patterns
```bash
# NEVER use these patterns
sudo anything              # Requires explicit approval
rm -rf /                  # Obviously dangerous
eval "$user_input"        # Code injection risk
curl | bash               # Blind execution
kill -9 $(ps aux | grep) # Blind process killing
```

**Copilot MUST**:
- Always include `set -euo pipefail`
- Quote all variable expansions
- Validate user inputs
- Never use `sudo` without approval
- Check command availability before use

---

## Health Endpoint Standards

Every service MUST implement:

### Health Response Format
```json
{
  "status": "healthy|degraded|unhealthy",
  "service": "service-name",
  "version": "1.0.0",
  "commit": "abc123",
  "uptimeSec": 3600,
  "timestamp": "2025-11-01T00:00:00Z",
  "dependencies": [
    {
      "name": "redis",
      "status": "healthy",
      "latencyMs": 5
    },
    {
      "name": "database",
      "status": "healthy",
      "latencyMs": 12
    }
  ]
}
```

### Health Check Requirements
- [ ] Endpoint responds within 250ms (p99)
- [ ] Includes all dependencies
- [ ] Reports actual health status
- [ ] No authentication required
- [ ] Includes version/commit for tracking

---

## Testing Standards

### Test Coverage Requirements
- **Unit Tests**: 80%+ for new code
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user paths
- **Performance Tests**: SLO validation

### Test Quality Standards
```javascript
// Good: Specific, testable, isolated
describe('VoiceService', () => {
  describe('synthesize', () => {
    it('should return audio/mpeg for valid text input', async () => {
      const result = await voiceService.synthesize('test');
      expect(result.contentType).toBe('audio/mpeg');
      expect(result.size).toBeGreaterThan(1000);
    });
  });
});

// Bad: Vague, untestable
describe('test', () => {
  it('works', () => {
    // ...
  });
});
```

**Copilot MUST**:
- Write specific, isolated tests
- Include assertions for all outcomes
- Test error cases
- Measure actual behavior
- Never skip or disable tests without justification

---

## Security Verification (CRITICAL)

### Secrets Management
```bash
# Good
export API_KEY="${ELEVENLABS_API_KEY}"
echo "Key length: ${#API_KEY}"

# Bad
export API_KEY="sk-1234567890abcdef"  # Hardcoded
echo "API_KEY=$API_KEY"               # Logged
```

**Copilot MUST**:
- Never commit secrets
- Use environment variables
- Validate secrets exist before use
- Never log secret values
- Redact secrets in error messages

### Input Validation
```javascript
// Good: Validate all inputs
function processRequest(req) {
  const text = validateString(req.body.text, 1, 5000);
  const userId = validateUUID(req.body.userId);
  // ...
}

// Bad: Trust user input
function processRequest(req) {
  const text = req.body.text;  // No validation
  // ...
}
```

**Copilot MUST**:
- Validate all user inputs
- Sanitize before processing
- Reject invalid data early
- Log validation failures
- Use allow-lists, not deny-lists

---

## Performance SLO Targets

### Response Times
| Endpoint Type | p95 Target | p99 Target |
|--------------|-----------|-----------|
| Health checks | < 200ms | < 250ms |
| Voice synthesis | < 500ms | < 750ms |
| Reasoning (first token) | < 1500ms | < 2000ms |
| API endpoints | < 200ms | < 300ms |

### Resource Limits
| Resource | Normal | Warning | Critical |
|---------|--------|---------|----------|
| CPU | < 60% | < 80% | < 90% |
| Memory | < 70% | < 85% | < 95% |
| Disk I/O | < 60% | < 80% | < 90% |

**Copilot MUST**:
- Measure actual performance
- Document measurements
- Compare against targets
- Flag when targets not met
- Suggest optimizations if needed

---

## Logging Standards

### Structured Logging (JSON)
```javascript
// Good: Structured, parseable
logger.info('Request processed', {
  requestId: req.id,
  userId: user.id,
  duration: Date.now() - start,
  endpoint: req.path,
  statusCode: 200
});

// Bad: Unstructured string
logger.info(`User ${user.id} request processed in ${duration}ms`);
```

### Log Levels
- **ERROR**: System failures requiring immediate attention
- **WARN**: Degraded state or unusual conditions
- **INFO**: Normal operational events
- **DEBUG**: Detailed diagnostic information

**Copilot MUST**:
- Use structured logging (JSON)
- Include correlation IDs
- Appropriate log levels
- Redact sensitive data
- Include context for debugging

---

## Pre-Commit Verification Checklist

Before committing code, verify:

### Functional
- [ ] Files exist and are in correct locations
- [ ] Code runs without errors
- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Health endpoints work

### Security
- [ ] No secrets in code
- [ ] Input validation present
- [ ] Error messages safe
- [ ] Dependencies scanned
- [ ] Auth/authz working

### Performance
- [ ] No obvious performance issues
- [ ] Resource usage reasonable
- [ ] Latency within targets (if applicable)
- [ ] No memory leaks

### Documentation
- [ ] README updated (if needed)
- [ ] API docs current (if applicable)
- [ ] Comments explain non-obvious code
- [ ] ADR written (if architectural)

### Audit Trail
- [ ] Conventional commit format
- [ ] ADR referenced (if applicable)
- [ ] Issue/ticket linked
- [ ] Verification evidence included

---

## Enforcement

These standards are ENFORCED through:

1. **Automated checks** (CI/CD pipelines)
2. **Code review** (peer verification)
3. **Audit scripts** (`scripts/audit/*.sh`)
4. **Copilot instructions** (this document)

**Violations** of critical standards (security, shell safety, secrets) result in:
- Immediate PR rejection
- Incident report filed
- Remediation required

---

## References

- Main Copilot instructions: `.github/copilot-instructions.md`
- Voice mode audit plan: `docs/voice_mode_audit_plan.md`
- Audit scripts: `scripts/audit/`
- ADR index: `docs/adr/`

---

## Updates

Changes to this document MUST:
1. Include ADR justification
2. Get CEO approval (Jesse Niesen)
3. Be communicated to all team members
4. Include training if needed

**Last Updated**: 2025-11-01  
**Next Review**: 2025-12-01  
**Owner**: Operations Team

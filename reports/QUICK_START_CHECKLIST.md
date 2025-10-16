# QUICK START CHECKLIST - Docker & MCP Activation
**Time Required**: 1 hour
**Status**: Ready to Execute

---

## PHASE 1: MCP ACTIVATION (15 minutes)

### Step 1: Restart Claude Code (2 min)
```bash
# Exit current session: Ctrl+C

# Restart
npx claude-code
# OR
claude
```

**Success Check**: Claude Code starts without errors

---

### Step 2: Authenticate MCP Servers (5 min)
```bash
# In Claude Code, run:
/mcp
```

**Linear Authentication**:
1. Click OAuth link (opens in browser)
2. Sign in to Linear workspace
3. Authorize Claude Code
4. Return to terminal
5. Verify: "Linear authenticated successfully"

**Success Check**:
- Linear: ✅ Authenticated
- Playwright: ✅ Auto-loaded
- Semgrep: ✅ Auto-loaded

---

### Step 3: Install Playwright Dependencies (5 min)
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/tests/e2e

# Install npm packages
npm install

# Install browsers (Chromium, Firefox, WebKit)
npx playwright install --with-deps

# Verify
npx playwright --version
```

**Expected Output**: `Version 1.48.0`

**Success Check**: Playwright installed, browsers downloaded (~300MB)

---

### Step 4: Install Semgrep CLI (2 min)
```bash
# Option 1: pip (recommended)
pip3 install semgrep

# Option 2: Homebrew (macOS)
brew install semgrep

# Verify
semgrep --version
```

**Expected Output**: `semgrep 1.x.x`

**Success Check**: Semgrep CLI installed and working

---

### Step 5: Test MCP Integration (1 min)
```bash
# In Claude Code conversation:
"Create a test Linear issue with title 'MCP Activation Test' and priority P3"

# Verify in Linear web UI that issue was created
```

**Success Check**: Issue appears in Linear

---

## PHASE 2: FIRST SCANS (20 minutes)

### Step 6: Run Secrets Scan (2 min) - CRITICAL
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT

# Create reports directory
mkdir -p reports

# Run secrets scan
semgrep scan . \
  --config=p/secrets \
  --exclude=node_modules \
  --exclude=.git \
  --json > reports/semgrep-secrets-$(date +%Y%m%d).json

# View findings count
cat reports/semgrep-secrets-*.json | jq '.results | length'
```

**Expected**: `0` (no secrets found)

**IF > 0**:
- Review findings immediately
- Rotate exposed credentials
- Remove from code
- Create P0 Linear issue

**Success Check**: 0 secrets found or all secrets secured

---

### Step 7: Run First E2E Test (3 min)
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/tests/e2e

# Run ReggieAndDro checkout test
npm run test:reggiedro

# View report
npm run report
```

**Expected Output**:
```
Running 1 test using 5 workers
✓ P0: Complete checkout flow [passed in 15s]
5 passed (1m)
```

**IF FAILS**:
- Review failure screenshot in `reports/screenshots/`
- Create P0 Linear issue
- Fix checkout calendar

**Success Check**: Test passes or failure documented in Linear

---

### Step 8: Run Backend Security Scan (5 min)
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT

# Run OWASP Top 10 + Security Audit
semgrep scan backend/ \
  --config=p/owasp-top-ten \
  --config=p/security-audit \
  --severity=ERROR \
  --severity=WARNING \
  --json > reports/semgrep-backend-$(date +%Y%m%d).json

# View findings
cat reports/semgrep-backend-*.json | jq '.results | length'
```

**Expected**: 8-15 findings (mostly P1)

**Known Issues to Expect**:
- Insecure CORS in `backend/voice-service/src/index.js:13-22`
- Missing auth checks on some endpoints

**Success Check**: Findings documented, ready to create Linear issues

---

### Step 9: Run Frontend Security Scan (5 min)
```bash
# Run XSS scan
semgrep scan frontend/ \
  --config=p/xss \
  --config=p/react \
  --severity=ERROR \
  --severity=WARNING \
  --json > reports/semgrep-frontend-$(date +%Y%m%d).json

# View findings
cat reports/semgrep-frontend-*.json | jq '.results | length'
```

**Expected**: 5-10 findings (mostly P2)

**Success Check**: Findings documented

---

### Step 10: Run Docker Security Scan (2 min)
```bash
# Run Docker scan
semgrep scan . \
  --config=p/docker \
  --include='*Dockerfile*' \
  --json > reports/semgrep-docker-$(date +%Y%m%d).json

# View findings
cat reports/semgrep-docker-*.json | jq '.results | length'
```

**Expected**: 2-5 findings

**Known Issues**:
- `delivery-service/Dockerfile` - No non-root user
- `analytics-service/Dockerfile` - No non-root user

**Success Check**: All security findings documented

---

### Step 11: Create Scan Summary (3 min)
```bash
# Count all findings
echo "=== SECURITY SCAN SUMMARY ==="
echo "Secrets: $(cat reports/semgrep-secrets-*.json | jq '.results | length')"
echo "Backend: $(cat reports/semgrep-backend-*.json | jq '.results | length')"
echo "Frontend: $(cat reports/semgrep-frontend-*.json | jq '.results | length')"
echo "Docker: $(cat reports/semgrep-docker-*.json | jq '.results | length')"
```

**Success Check**: Summary shows all scan results

---

## PHASE 3: DOCKER VALIDATION (15 minutes)

### Step 12: Create Docker Secrets (3 min)
```bash
# Verify API keys are set
echo "ELEVENLABS_API_KEY: ${ELEVENLABS_API_KEY:0:10}..."
echo "ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:0:10}..."
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:0:10}..."

# Create secrets
echo "$ELEVENLABS_API_KEY" | docker secret create elevenlabs_api_key -
echo "$ANTHROPIC_API_KEY" | docker secret create anthropic_api_key -
echo "$OPENAI_API_KEY" | docker secret create openai_api_key -

# Verify secrets created
docker secret ls
```

**Expected Output**: 3 secrets listed

**Success Check**: All secrets created

---

### Step 13: Build Core Services (5 min)
```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT

# Build all 5 services
docker build -t reasoning-gateway:latest backend/reasoning-gateway/
docker build -t voice-service:latest backend/voice-service/
docker build -t integration-service:latest backend/integration-service/
docker build -t delivery-service:latest backend/delivery-service/
docker build -t analytics-service:latest backend/analytics-service/

# Verify builds
docker images | grep -E "(reasoning-gateway|voice-service|integration-service|delivery-service|analytics-service)"
```

**Expected Output**: 5 images listed

**Success Check**: All 5 images built successfully

---

### Step 14: Deploy Stack (3 min)
```bash
# Deploy with docker-compose
docker-compose up -d

# Wait for services to start
sleep 10

# Check status
docker-compose ps
```

**Expected Output**: All services "Up"

**Success Check**: All services running

---

### Step 15: Verify Health Checks (2 min)
```bash
# Test all health endpoints
echo "Integration Service:"
curl http://localhost:3005/health

echo "Voice Service:"
curl http://localhost:8080/health

echo "Reasoning Gateway:"
curl http://localhost:4002/health

echo "Redis:"
docker exec -it livhana-sot-redis-1 redis-cli ping
```

**Expected Output**: All return 200 OK or "PONG"

**Success Check**: All health checks green

---

### Step 16: Check Logs (2 min)
```bash
# Check for errors in logs
docker-compose logs --tail=20 voice-service
docker-compose logs --tail=20 reasoning-gateway

# Should see "Service started on port XXXX"
```

**Success Check**: No errors in logs

---

## PHASE 4: ISSUE MIGRATION (10 minutes)

### Step 17: Migrate P0 Issues to Linear (10 min)

Using Linear MCP in Claude Code, create 5 issues:

#### Issue #1: Checkout Calendar Broken (P0)
```
Title: CRITICAL: Checkout calendar broken - blocks all orders
Priority: 0 (Critical)
Team: LH-FRONTEND
Labels: p0-critical, revenue-blocker, checkout, reggieanddro

Description:
The pickup date & time calendar on ReggieAndDro.com checkout is completely broken.
Calendar appears but is non-functional, preventing customers from completing orders.

Impact: $911+ revenue blocked, zero orders can be completed

Test: E2E test at tests/e2e/reggieanddro-checkout.spec.js detects this issue

Fix Required:
- Clean, intuitive date picker
- Smooth time slot selection
- Mobile-responsive
- Clear visual hierarchy

Reference: .claude/URGENT_REGGIEDRO_FIXES.md section #2
```

#### Issue #2: Category Buttons Ugly (P1)
```
Title: Category buttons too big, ugly, no contrast (WCAG fail)
Priority: 1 (High)
Team: LH-FRONTEND
Labels: p1-high, ui-quality, accessibility, reggieanddro

Description:
Category filter buttons on ReggieAndDro.com are oversized, poor contrast, fail WCAG AA.

Issues:
- Buttons too large (oversized)
- Poor text contrast (< 4.5:1 WCAG AA)
- No smooth hover states
- Not Christopher Esser 8/10 standard

Fix Required: CSS updates per URGENT_REGGIEDRO_FIXES.md section #1
Test: E2E UI grade test validates (must be >= 8/10)

Reference: .claude/URGENT_REGGIEDRO_FIXES.md section #1
```

#### Issue #3: Local Delivery Integration (P1)
```
Title: No white label delivery service integration - lost sales
Priority: 1 (High)
Team: LH-BACKEND
Labels: p1-high, feature, delivery, integration

Description:
No local delivery option available for ReggieAndDro.com customers.
Need HEB brand+ delivery service integration.

Impact: Lost sales, can't compete with delivery-enabled competitors

Requirements:
- Delivery service API integration
- Delivery zone configuration
- Real-time availability checking
- Delivery time slot selection

Reference: .claude/URGENT_REGGIEDRO_FIXES.md section #3
```

#### Issue #4: Authorize.net Automated Invoicing (P1)
```
Title: No automated invoicing system - manual work slows fulfillment
Priority: 1 (High)
Team: LH-BACKEND
Labels: p1-high, automation, payment, integration

Description:
No automated invoice generation system.
Requires manual work, slows order fulfillment.

Requirements:
- Authorize.net API integration
- Automatic invoice generation on order
- Email delivery to customers
- PDF invoice generation

Reference: .claude/URGENT_REGGIEDRO_FIXES.md section #4
```

#### Issue #5: AfterPay & Klarna Missing (P1)
```
Title: Missing BNPL (AfterPay, Klarna) - losing 25%+ conversions
Priority: 1 (High)
Team: LH-FRONTEND
Labels: p1-high, payment, conversion-optimization

Description:
No Buy Now Pay Later (BNPL) options available.
Missing AfterPay and Klarna = losing customers who want payment plans.

Impact: 25%+ conversion rate boost potential lost

Requirements:
- AfterPay SDK integration
- Klarna checkout integration
- Seamless payment flow
- BNPL messaging on product pages

Reference: .claude/URGENT_REGGIEDRO_FIXES.md section #5
```

**Success Check**: All 5 issues created in Linear

---

## VALIDATION COMPLETE ✅

### Summary Checklist

**MCP Activation**:
- [ ] Claude Code restarted
- [ ] Linear authenticated
- [ ] Playwright installed
- [ ] Semgrep installed
- [ ] Test issue created

**First Scans**:
- [ ] Secrets scan: 0 findings
- [ ] E2E test: Passes or documented
- [ ] Backend security: Findings documented
- [ ] Frontend security: Findings documented
- [ ] Docker security: Findings documented

**Docker Validation**:
- [ ] Docker secrets created
- [ ] 5 services built
- [ ] Stack deployed
- [ ] Health checks green
- [ ] No errors in logs

**Issue Migration**:
- [ ] P0 Issue #1: Checkout calendar
- [ ] P1 Issue #2: Category buttons
- [ ] P1 Issue #3: Local delivery
- [ ] P1 Issue #4: Authorize.net
- [ ] P1 Issue #5: AfterPay & Klarna

---

## NEXT STEPS

### TODAY (< 4 hours)
1. Fix P0 checkout calendar issue
2. Create Linear issues for all Semgrep P0/P1 findings
3. Add GitHub Actions workflows (CI/CD)
4. Deploy to Cloud Run (production)

### THIS WEEK
1. Fix all P0/P1 issues
2. Expand E2E test coverage
3. Run weekly security scans
4. Monitor production metrics

---

## TROUBLESHOOTING

### MCP Authentication Fails
```bash
# Restore backup
cp ~/.claude.json.backup-TIMESTAMP ~/.claude.json

# Restart Claude Code
```

### Playwright Installation Fails
```bash
# Use npx (no install needed)
npx playwright test
```

### Docker Build Fails
```bash
# Check logs
docker-compose logs <service-name>

# Rebuild
docker-compose up -d --build <service-name>
```

### Health Check Fails
```bash
# Check service logs
docker logs <service-name>

# Verify environment variables
docker exec <service-name> env | grep -E "(API_KEY|PORT)"
```

---

## SUCCESS CRITERIA

**Hour 1 Complete When**:
- ✅ MCP servers activated
- ✅ First scans complete
- ✅ Docker stack running
- ✅ 5 issues in Linear

**Ready for Production When**:
- ✅ P0 issues fixed
- ✅ CI/CD pipelines active
- ✅ All health checks green
- ✅ Security scans pass

---

**Time Elapsed**: Track your progress
- [ ] Phase 1: MCP Activation (15 min)
- [ ] Phase 2: First Scans (20 min)
- [ ] Phase 3: Docker Validation (15 min)
- [ ] Phase 4: Issue Migration (10 min)

**Total Time**: ~60 minutes

**Status on Completion**: ✅ FULLY OPERATIONAL

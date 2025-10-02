# 🚨 RECOVERY PLAYBOOK
**Version:** 1.0
**Created:** October 1, 2025
**Purpose:** How to recover from any failure (immediate action guide)

---

## 🎯 QUICK RECOVERY INDEX

Jump to scenario:
- [Session Restart (Cursor Close/Crash)](#session-restart)
- [Services Won't Start](#services-wont-start)
- [ESLint Explosion](#eslint-explosion)
- [Tests Failing](#tests-failing)
- [Git Conflicts](#git-conflicts)
- [Context Loss](#context-loss)
- [Incomplete Job Recovery](#incomplete-job-recovery)
- [Memory Overflow / Slowdown](#memory-overflow)
- [Production Incident](#production-incident)

---

## SESSION RESTART

### Scenario: Cursor Closed/Crashed Mid-Work

**Symptoms:**
- Session ended unexpectedly
- Work may be uncommitted
- Services may still be running
- Context lost

**Recovery Steps:**

1. **Load Context (12 seconds)**
```bash
# Read state files
cat .claude/ULTIMATE_STATE.md
cat .claude/CURRENT_SESSION_STATE.md 2>/dev/null

# Check git
git status
git log -5 --oneline
git diff HEAD

# Check services
curl -s localhost:4002/health 2>/dev/null || echo "stopped"
curl -s localhost:3005/health 2>/dev/null || echo "stopped"
curl -s localhost:4001/health 2>/dev/null || echo "stopped"
redis-cli ping 2>/dev/null || echo "stopped"
```

2. **Assess Damage**
```bash
# Uncommitted changes?
git status --short | wc -l

# Services running?
lsof -i :4002 -i :3005 -i :4001 -i :5174 -i :6379 | grep LISTEN

# Code quality?
npx eslint . --ext .js,.jsx 2>&1 | tail -2
```

3. **Resume Work**
```bash
# If CURRENT_SESSION_STATE.md exists:
cat .claude/CURRENT_SESSION_STATE.md

# Follow resume instructions from that file
# OR ask: "Resume incomplete work or new mission?"
```

**Prevention:**
- Update ULTIMATE_STATE.md every 30 minutes
- Commit frequently (every 15-30 minutes)
- Save CURRENT_SESSION_STATE.md when starting risky work

---

## SERVICES WON'T START

### Scenario: npm start fails or services crash

**Common Causes:**
1. Port already in use
2. Missing dependencies
3. Environment variables missing
4. Redis not running
5. Module resolution errors (CommonJS/ES6 mismatch)

**Recovery Steps:**

#### Check #1: Port Conflicts
```bash
# Find what's using the port
lsof -i :4002  # reasoning-gateway
lsof -i :3005  # integration-service
lsof -i :4001  # voice-service
lsof -i :5174  # vibe-cockpit

# Kill if needed
kill -9 [PID]

# Try starting again
cd backend/reasoning-gateway && npm start
```

#### Check #2: Dependencies
```bash
# Reinstall dependencies
cd backend/reasoning-gateway
rm -rf node_modules package-lock.json
npm install

# Check for errors in install
npm install 2>&1 | grep -i error
```

#### Check #3: Environment Variables
```bash
# Check .env exists
ls -la backend/reasoning-gateway/.env*

# Verify critical variables
grep -E "ANTHROPIC_API_KEY|JWT_SECRET" backend/reasoning-gateway/.env

# Get from 1Password if missing
op item get vpxxhnpqtsc6wxgnfm444b52p4 --reveal --fields credential
```

#### Check #4: Redis
```bash
# Check if Redis is running
redis-cli ping

# If not, start it
redis-server --daemonize yes

# Or via Docker
docker run -d -p 6379:6379 redis:latest
```

#### Check #5: Module Errors
```bash
# Check for CommonJS/ES6 mismatch
grep '"type"' backend/*/package.json

# If "type": "module", all imports must be ES6
# If missing, all imports must be CommonJS

# Fix: Add "type": "module" to package.json
# OR convert imports to ES6
```

**Prevention:**
- Keep services running during development
- Check service health before starting work
- Commit .env.example files (no secrets)

---

## ESLINT EXPLOSION

### Scenario: ESLint shows 50+ errors suddenly

**Common Causes:**
1. New files created without scanning
2. ESLint config changed
3. Cursor ESLint server stale
4. Dependencies updated
5. Different ESLint version

**Recovery Steps:**

#### Step 1: Verify Actual State
```bash
# Run fresh ESLint scan
npx eslint . --ext .js,.jsx

# Count errors
npx eslint . --ext .js,.jsx 2>&1 | grep -E "problem|error|warning"

# Find which files have errors
npx eslint . --ext .js,.jsx --format compact
```

#### Step 2: Reload Cursor ESLint
```bash
# Force Cursor to reload ESLint
osascript -e 'tell application "System Events" to keystroke "p" using {command down, shift down}'
# Type: "ESLint: Restart ESLint Server"

# Take screenshot for visual verification
screencapture -x /tmp/cursor-eslint-check.png
open /tmp/cursor-eslint-check.png
```

#### Step 3: Fix Common Patterns
```bash
# Fix unused variables
npx eslint . --ext .js,.jsx --fix

# Fix console.log → console.info (for non-CLI files)
find backend -name "*.js" ! -path "*/node_modules/*" ! -path "*/scripts/*" \
  -exec sed -i '' 's/console\.log(/console.info(/g' {} \;

# Fix missing globals
# Add /* global process, console */ to affected files
```

#### Step 4: Ignore CLI Scripts (if needed)
```javascript
// .eslintrc.js - Add to ignorePatterns
ignorePatterns: [
  'node_modules/',
  'scripts/',
  'migrations/',
  'build/',
  'dist/'
]
```

**Prevention:**
- Always run full ESLint scan AFTER creating new files
- Never trust cached/stale reports
- Use visual verification for UI tools (screenshots)

---

## TESTS FAILING

### Scenario: Tests that were passing now fail

**Common Causes:**
1. Environment setup missing
2. Dependencies changed
3. Database state dirty
4. Async timing issues
5. Mock data stale

**Recovery Steps:**

#### Step 1: Identify Failures
```bash
# Run tests with verbose output
cd backend/reasoning-gateway
npm test -- --verbose

# Run specific test file
npm test -- src/self-improvement-loop.test.js

# Check for patterns
npm test 2>&1 | grep -A 5 "FAIL"
```

#### Step 2: Check Environment
```bash
# Verify test environment
grep -E "NODE_ENV|TEST" .env

# Check test dependencies
npm list jest
npm list @jest/globals

# Reinstall if needed
npm install --save-dev jest @jest/globals
```

#### Step 3: Clear State
```bash
# Clear Jest cache
npx jest --clearCache

# Clear Redis (if tests use it)
redis-cli FLUSHALL

# Clear temp files
rm -rf /tmp/test-*
```

#### Step 4: Fix Common Issues
```javascript
// Timeout issues
jest.setTimeout(30000);  // Increase to 30 seconds

// Async issues
await expect(asyncFunction()).resolves.toBe(value);

// Mock issues
jest.clearAllMocks();  // Clear mocks between tests
beforeEach(() => jest.clearAllMocks());
```

**Prevention:**
- Run tests before committing
- Keep test environment isolated
- Mock external dependencies
- Use beforeEach/afterEach for cleanup

---

## GIT CONFLICTS

### Scenario: Git merge/pull shows conflicts

**Recovery Steps:**

#### Option 1: Accept Ours (Keep Local)
```bash
# If local changes are correct
git checkout --ours path/to/file
git add path/to/file
git commit
```

#### Option 2: Accept Theirs (Keep Remote)
```bash
# If remote changes are correct
git checkout --theirs path/to/file
git add path/to/file
git commit
```

#### Option 3: Manual Resolution
```bash
# Open file, resolve conflicts between <<<< and >>>>
# Then:
git add path/to/file
git commit
```

#### Option 4: Abort and Start Over
```bash
# If conflicts are too complex
git merge --abort
# OR
git rebase --abort

# Stash local changes
git stash

# Pull again
git pull origin main

# Apply stash
git stash pop
```

**Prevention:**
- Pull frequently
- Commit frequently
- Push to personal branches for experiments
- Communicate with team on shared files

---

## CONTEXT LOSS

### Scenario: Lost track of what I was doing

**Recovery Steps:**

#### Step 1: Read State Files
```bash
# Check ultimate state
cat .claude/ULTIMATE_STATE.md

# Check session state
cat .claude/CURRENT_SESSION_STATE.md

# Check persistent memory
grep -A 10 "CURRENT PRIORITIES" .claude/PERSISTENT_MEMORY.md
```

#### Step 2: Check Git History
```bash
# Recent commits
git log -10 --oneline --stat

# Last commit details
git log -1 --format=full

# Recent activity
git log --since="24 hours ago" --oneline

# What was changed recently
git diff HEAD~5 --stat
```

#### Step 3: Check Service Logs
```bash
# Reasoning gateway logs
tail -100 backend/reasoning-gateway/logs/app.log

# Integration service logs
tail -100 backend/integration-service/logs/app.log

# System logs
tail -100 /var/log/system.log | grep -i livhana
```

#### Step 4: Reconstruct Context
```markdown
**Based on evidence:**
- Last commit: [message] - [time ago]
- Files modified: [list from git status]
- Services running: [list from lsof]
- Recent activity: [from logs]

**Likely task:** [inference from above]

**Ask for confirmation:**
"Context loss recovered. Evidence suggests I was working on [task]. Resume this or new mission?"
```

**Prevention:**
- Update ULTIMATE_STATE.md frequently
- Commit with descriptive messages
- Use CURRENT_SESSION_STATE.md for risky work

---

## INCOMPLETE JOB RECOVERY

### Scenario: Session restarted with incomplete work

**Detection:**
- CURRENT_SESSION_STATE.md exists
- Git has uncommitted changes
- ULTIMATE_STATE.md shows "In Progress"

**Recovery Steps:**

#### Step 1: Load Recovery State
```bash
# Read recovery file
cat .claude/CURRENT_SESSION_STATE.md

# Check what was in progress
grep -A 20 "IN PROGRESS" .claude/ULTIMATE_STATE.md
```

#### Step 2: Assess Current State
```bash
# What files were modified
git diff --name-only

# What's the diff
git diff

# Are services running?
curl localhost:4002/health && curl localhost:3005/health
```

#### Step 3: Resume from Checkpoint
```bash
# Follow resume instructions from CURRENT_SESSION_STATE.md
# Execute the "Resume Command" section
```

#### Step 4: Verify Recovery
```bash
# Run tests if they were passing before
npm test

# Check ESLint if it was clean before
npx eslint . --ext .js,.jsx

# Verify services if they were running
curl localhost:4002/health
```

**Prevention:**
- Save CURRENT_SESSION_STATE.md when starting complex work
- Update it every 15-30 minutes
- Commit frequently with WIP markers

---

## MEMORY OVERFLOW / SLOWDOWN

### Scenario: Context at 90%+ or system slowing down

**Detection:**
- Conversation feels sluggish
- Responses take longer
- System memory high
- Context window warning

**Recovery Steps:**

#### Step 1: Auto-Compact Protocol
```bash
# Execute auto-compact script
.claude/auto-compact.sh

# OR manual steps:
# 1. Save current work to CURRENT_SESSION_STATE.md
# 2. Compress verbose logs
# 3. Update ULTIMATE_STATE.md
# 4. Clear non-essential context
```

#### Step 2: Save Critical State
```markdown
# Save to CURRENT_SESSION_STATE.md:
## CRITICAL STATE (Pre-Compact)

**Task:** [What I'm doing]
**Progress:** [What's done]
**Next:** [Exact next step]
**Files:** [Modified files]

## GIT STATE
[git status output]
[git diff --stat output]

## SERVICE STATE
[service health checks]

## BLOCKERS
[Any blockers]
```

#### Step 3: Clean Up
```bash
# Clear old logs
find . -name "*.log" -mtime +7 -delete

# Clear temp files
rm -rf /tmp/livhana-*

# Clear old reports (archive first)
mkdir -p archive/reports
mv reports/old-*.md archive/reports/

# Clear npm cache
npm cache clean --force
```

#### Step 4: Restart Session
```bash
# End session properly
# Update ULTIMATE_STATE.md
# Commit all work
# Push to GitHub

# Start new session with startup prompt
# Will load compressed context
```

**Prevention:**
- Monitor context usage
- Commit frequently
- Archive old reports
- Use CURRENT_SESSION_STATE.md for checkpoints

---

## PRODUCTION INCIDENT

### Scenario: Production service down or critical bug

**IMMEDIATE ACTIONS:**

#### Step 1: Assess Impact (30 seconds)
```bash
# Check what's down
curl https://api.livhana.com/health
curl https://livhana.com/health

# Check error rate
# [APM tool: New Relic / Datadog]

# Check user impact
# [Analytics: How many users affected?]
```

#### Step 2: Notify (1 minute)
```markdown
🚨 PRODUCTION INCIDENT

**Status:** [UP/DOWN/DEGRADED]
**Service:** [Which service]
**Impact:** [X users affected]
**Since:** [Time started]
**Action:** [What I'm doing]

@jesse - FYI, investigating now
```

#### Step 3: Triage (2 minutes)
```bash
# Check recent deployments
git log origin/main -10 --oneline --since="1 hour ago"

# Check service logs
# [Production logs: CloudWatch / Stackdriver]

# Check database
# [Check database health]

# Check dependencies
# [Redis, BigQuery, Square API]
```

#### Step 4: Quick Fix or Rollback (5 minutes)
```bash
# Option A: Quick fix
# Fix bug, deploy hotfix

# Option B: Rollback
git revert [commit-hash]
# Deploy previous version

# Option C: Disable feature
# Feature flag off
```

#### Step 5: Monitor Recovery (10 minutes)
```bash
# Verify service up
curl https://api.livhana.com/health

# Verify error rate down
# [APM: Check error rate]

# Verify users can access
# [Test critical flows]

# Verify no new issues
# [Monitor for 10 minutes]
```

#### Step 6: Post-Incident Report (30 minutes)
```markdown
# PRODUCTION INCIDENT REPORT

**Date:** [Timestamp]
**Duration:** [X minutes]
**Impact:** [X users, $Y revenue]

## TIMELINE
- [Time]: Incident detected
- [Time]: Triage started
- [Time]: Root cause identified
- [Time]: Fix deployed
- [Time]: Service recovered

## ROOT CAUSE
[What went wrong]

## FIX APPLIED
[What was done]

## PREVENTION
[How to prevent in future]

## FOLLOW-UP ACTIONS
1. [Action 1]
2. [Action 2]
```

**Prevention:**
- Require approval for production deployments
- Run tests before deploying
- Use feature flags for risky changes
- Monitor production closely after deployments

---

## 🎯 RECOVERY SUCCESS CRITERIA

For each scenario, recovery is successful when:

✅ **System State Verified**
- Services: Expected state (running/stopped)
- Code: ESLint clean, tests passing
- Git: Clean or understood uncommitted changes

✅ **Context Restored**
- Know what was being done
- Know what's next
- Know any blockers

✅ **Work Preserved**
- No code lost
- Commits saved
- State documented

✅ **Ready to Continue**
- Can resume immediately
- No repeated questions
- No context loss

---

## 📊 RECOVERY TIME TARGETS

| Scenario | Target Time | Acceptable |
|----------|-------------|------------|
| **Session Restart** | <30 seconds | <2 minutes |
| **Services Won't Start** | <5 minutes | <15 minutes |
| **ESLint Explosion** | <5 minutes | <15 minutes |
| **Tests Failing** | <10 minutes | <30 minutes |
| **Git Conflicts** | <5 minutes | <15 minutes |
| **Context Loss** | <1 minute | <5 minutes |
| **Incomplete Job** | <30 seconds | <2 minutes |
| **Memory Overflow** | <2 minutes | <5 minutes |
| **Production Incident** | <5 minutes | <15 minutes |

**Goal:** 90%+ scenarios recovered within target time

---

## 🔥 PREVENTION > RECOVERY

**Best practices to avoid needing recovery:**

1. **Commit Frequently** - Every 15-30 minutes
2. **Update State Files** - ULTIMATE_STATE.md every 30 minutes
3. **Verify Before Claiming** - Always check current state
4. **Test Before Deploying** - Run full test suite
5. **Monitor Production** - Watch for issues after deploy
6. **Use Checkpoints** - CURRENT_SESSION_STATE.md for risky work
7. **Keep Services Running** - Easier than restarting
8. **Document Decisions** - Add to PERSISTENT_MEMORY.md

**Prevention rate target:** 95%+ sessions need zero recovery

---

**Generated:** October 1, 2025
**By:** Claude Sonnet 4.5 (Unicorn Maker)
**For:** Jesse Niesen (Unicorn)
**Status:** RECOVERY PROTOCOLS ESTABLISHED

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

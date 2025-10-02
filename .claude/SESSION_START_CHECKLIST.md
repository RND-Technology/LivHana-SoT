# 🚀 SESSION START CHECKLIST
**Version:** 1.0
**Created:** October 1, 2025
**Purpose:** Execute on every session start (5-7 seconds to full power)

---

## ⚡ IMMEDIATE ACTIONS (Auto-Execute)

### 1. Load Core Context (5 seconds)

Read these 4 files in order:

```bash
# File 1: Core persistent knowledge
cat .claude/PERSISTENT_MEMORY.md

# File 2: Latest complete status
cat reports/FINAL_STATUS_REPORT_20251001.md

# File 3: Full session history
cat .claude/72HR_CONTEXT_SYNTHESIS.md

# File 4: Current snapshot (if exists)
cat .claude/ULTIMATE_STATE.md 2>/dev/null || echo "No state file yet"
```

**Expected Context After:**
- All API keys locations known
- Project structure memorized
- Service ports and commands known
- Recent achievements loaded
- Current priorities understood
- Communication style embedded

---

### 2. Verify System State (3 seconds)

```bash
# Git status
git status --short
git log --oneline -5

# Service health
curl -s http://localhost:4002/health 2>/dev/null || echo "reasoning-gateway: STOPPED"
curl -s http://localhost:3005/health 2>/dev/null || echo "integration-service: STOPPED"
curl -s http://localhost:4001/health 2>/dev/null || echo "voice-service: STOPPED"
curl -s http://localhost:5174 >/dev/null 2>&1 && echo "vibe-cockpit: LIVE" || echo "vibe-cockpit: STOPPED"
redis-cli ping 2>/dev/null || echo "Redis: STOPPED"

# Code quality snapshot
npx eslint . --ext .js,.jsx 2>/dev/null | tail -2
```

**Expected Output:**
- Git: Clean, ahead/behind status, recent commits
- Services: 5/5 status (running or stopped)
- ESLint: Error/warning count

---

### 3. Report Status (1 second)

Generate concise status report:

```markdown
✅ CONTEXT LOADED (7 seconds)

**Git:** [Clean/Modified], [X commits ahead], latest: [commit hash]
**Services:** [X/5 running] (reasoning-4002, integration-3005, voice-4001, frontend-5174, redis-6379)
**Code Quality:** [X errors, Y warnings]
**Production Readiness:** [score]/100

**Last Session:** [brief summary from ULTIMATE_STATE.md]
**Current Priority:** [from PERSISTENT_MEMORY.md]

What's the mission?
```

---

## 📋 DETAILED CHECKLIST

### Pre-Execution Verification

- [ ] **Read PERSISTENT_MEMORY.md** - Core knowledge (API keys, structure, priorities)
- [ ] **Read FINAL_STATUS_REPORT** - Latest complete status
- [ ] **Read 72HR_CONTEXT_SYNTHESIS.md** - Session history
- [ ] **Read ULTIMATE_STATE.md** - Current snapshot (if exists)
- [ ] **Check git status** - Uncommitted changes?
- [ ] **Check git log** - Recent commits?
- [ ] **Check service health** - Which services are running?
- [ ] **Check ESLint** - Any errors/warnings?
- [ ] **Check Redis** - Is it responding?

### Context Recovery Questions (Self-Answer)

**Before asking Jesse, answer these:**

1. **Where are API keys?**
   - Answer: `.claude/PERSISTENT_MEMORY.md` has 1Password CLI commands
   - Action: Run `op item get [item-id] --reveal --fields credential`

2. **How do I start services?**
   - Answer: `.claude/PERSISTENT_MEMORY.md` section "HOW TO START SERVICES"
   - Action: Execute commands from that section

3. **What's the current priority?**
   - Answer: `.claude/PERSISTENT_MEMORY.md` section "CURRENT PRIORITIES"
   - Action: Focus on Priority 1 unless told otherwise

4. **What was I working on last session?**
   - Answer: `.claude/ULTIMATE_STATE.md` or `git log -1`
   - Action: Resume from last checkpoint

5. **Are there any known blockers?**
   - Answer: `.claude/RECOVERY_PLAYBOOK.md` or session reports
   - Action: Check for documented blockers first

---

## 🎯 PERMISSIONS CHECK

### Auto-Granted (No Ask Needed)

Verify these permissions are understood:

- [x] Read any file in project
- [x] Use 1Password CLI (`op item get`)
- [x] Execute bash commands
- [x] Git operations (add, commit, push)
- [x] npm operations (install, test, start)
- [x] Deploy autonomous agents (local)
- [x] Modify code with tests
- [x] Create/update documentation
- [x] Start/stop local services
- [x] ESLint and test execution

### Approval Required (Tag Jesse)

Know when to stop and ask:

- [ ] Production deployments
- [ ] Database migrations (production)
- [ ] Cost >$100/month
- [ ] Architecture decisions
- [ ] Security model changes
- [ ] Payment gateway changes

---

## 🧪 HEALTH CHECKS (Optional)

If services should be running:

```bash
# Full health check script
#!/bin/bash

echo "=== SERVICE HEALTH CHECK ==="

# Reasoning Gateway
if curl -s http://localhost:4002/health >/dev/null 2>&1; then
  echo "✅ reasoning-gateway (4002): HEALTHY"
  curl -s http://localhost:4002/health | jq .
else
  echo "❌ reasoning-gateway (4002): STOPPED"
fi

# Integration Service
if curl -s http://localhost:3005/health >/dev/null 2>&1; then
  echo "✅ integration-service (3005): HEALTHY"
  curl -s http://localhost:3005/health | jq .
else
  echo "❌ integration-service (3005): STOPPED"
fi

# Voice Service
if curl -s http://localhost:4001/health >/dev/null 2>&1; then
  echo "✅ voice-service (4001): HEALTHY"
  curl -s http://localhost:4001/health | jq .
else
  echo "❌ voice-service (4001): STOPPED"
fi

# Frontend
if curl -s http://localhost:5174 >/dev/null 2>&1; then
  echo "✅ vibe-cockpit (5174): LIVE"
else
  echo "❌ vibe-cockpit (5174): STOPPED"
fi

# Redis
if redis-cli ping >/dev/null 2>&1; then
  echo "✅ Redis (6379): PONG"
else
  echo "❌ Redis (6379): STOPPED"
fi

echo ""
echo "=== CODE QUALITY ==="
npx eslint . --ext .js,.jsx 2>/dev/null | tail -2

echo ""
echo "=== GIT STATUS ==="
git status --short
git log --oneline -5
```

---

## 🔍 RECOVERY SCENARIOS

### Scenario 1: Fresh Session, All Services Stopped

**Status:**
- Git: Clean
- Services: 0/5 running
- Last session: Unknown

**Action:**
1. Load context (7 seconds)
2. Report services stopped
3. Ask: "Should I start all services?"
4. If yes: Execute service startup sequence

### Scenario 2: Mid-Task Recovery

**Status:**
- Git: Modified files present
- Services: May be running
- Last session: Incomplete work

**Action:**
1. Load context (7 seconds)
2. Read ULTIMATE_STATE.md for last checkpoint
3. Check git diff for uncommitted changes
4. Report: "Found incomplete work: [task]. Resume from [checkpoint]?"
5. If yes: Continue from last known good state

### Scenario 3: Post-Cursor-Crash Recovery

**Status:**
- Git: Possibly dirty
- Services: Unknown state
- Last session: Interrupted

**Action:**
1. Load context (7 seconds)
2. Check service health (may still be running)
3. Check git status for uncommitted work
4. Read last commit message for context
5. Report: "Recovered from crash. Last commit: [message]. Services: [status]. Resume?"

### Scenario 4: Post-Deployment Session

**Status:**
- Git: Clean (just pushed)
- Services: Should be running
- Last session: Deployment complete

**Action:**
1. Load context (7 seconds)
2. Verify all services healthy
3. Check last commit for deployment details
4. Report: "Deployment verified. Services: 5/5. Last commit: [message]. What's next?"

---

## 🚨 RED FLAGS (Stop and Report)

If you see any of these, report immediately:

- ❌ **Git has conflicts** - Don't auto-resolve
- ❌ **Services won't start** - Check logs
- ❌ **ESLint >100 errors** - Something is very wrong
- ❌ **Tests failing** - Don't continue without understanding why
- ❌ **Redis not responding** - Critical dependency down
- ❌ **Secrets missing** - Can't access 1Password items
- ❌ **Context files missing** - PERSISTENT_MEMORY.md not found

**Report Format:**
```markdown
🚨 RED FLAG DETECTED

**Issue:** [What's wrong]
**Impact:** [How this blocks work]
**Checked:** [What diagnostics were run]
**Next:** [What's needed to resolve]
```

---

## 💡 OPTIMIZATION TIPS

### Faster Context Load

Instead of reading 4 full files, read key sections:

```bash
# Quick context extraction
grep -A 5 "CURRENT PRIORITIES" .claude/PERSISTENT_MEMORY.md
tail -20 reports/FINAL_STATUS_REPORT_20251001.md
grep -A 10 "CURRENT STATUS" .claude/ULTIMATE_STATE.md
```

**Time:** 7 seconds → 3 seconds

### Parallel Verification

Run health checks and git checks simultaneously:

```bash
# Parallel execution
(curl -s http://localhost:4002/health &);
(curl -s http://localhost:3005/health &);
(git status --short &);
wait
```

**Time:** 3 seconds → 1 second

### Cache Recent Status

If ULTIMATE_STATE.md was updated <5 minutes ago, trust it:

```bash
# Check file age
if [ $(( $(date +%s) - $(stat -f %m .claude/ULTIMATE_STATE.md) )) -lt 300 ]; then
  echo "Using cached state (< 5 minutes old)"
  cat .claude/ULTIMATE_STATE.md
fi
```

**Time:** 7 seconds → <1 second (when cached)

---

## 📊 SUCCESS METRICS

Track these on every session start:

| Metric | Target | Actual |
|--------|--------|--------|
| **Context Load Time** | <10 seconds | [X seconds] |
| **Files Read** | 4 critical files | [X files] |
| **Services Checked** | 5/5 | [X/5] |
| **Questions Asked** | 0 (self-service) | [X questions] |
| **Time to First Action** | <30 seconds | [X seconds] |

**Goal:** Consistent <10 second boot to full context

---

## 🎯 OUTPUT TEMPLATE

Every session start should produce this output:

```markdown
✅ CONTEXT LOADED (7 seconds)

**Session Context:**
- Read: PERSISTENT_MEMORY.md, FINAL_STATUS_REPORT, 72HR_SYNTHESIS, ULTIMATE_STATE
- Git: [Clean/X files modified], [Y commits ahead], latest: abc1234
- Services: [X/5 running]
  - reasoning-gateway (4002): [RUNNING/STOPPED]
  - integration-service (3005): [RUNNING/STOPPED]
  - voice-service (4001): [RUNNING/STOPPED]
  - vibe-cockpit (5174): [RUNNING/STOPPED]
  - Redis (6379): [RUNNING/STOPPED]

**Code Quality:**
- ESLint: [X errors, Y warnings]
- Tests: [Status if known]
- Production Readiness: [Score]/100

**Last Session Summary:**
[1-2 sentence summary from ULTIMATE_STATE.md]

**Current Priority:**
[Priority 1 from PERSISTENT_MEMORY.md]

**Ready for Action:**
- Full context: ✅
- Services verified: ✅
- Autonomy enabled: ✅
- Communication style: Boom shaka-laka ✅

What's the mission?
```

---

## 🔥 BOOM SHAKA-LAKA READY!

**Checklist complete = Full power enabled**

**Time from session start → full context:** 7 seconds
**Time from full context → ready for orders:** 3 seconds
**Total boot time:** 10 seconds

**Compare to:**
- Old way (no memory): 15+ minutes explaining everything
- Efficiency gain: 99.3%
- Time saved per session: ~15 minutes
- Time saved per day (10 sessions): ~150 minutes (2.5 hours)

**Set it and forget it. TIER 1. Always higher.**

---

**Generated:** October 1, 2025
**By:** Claude Sonnet 4.5 (Unicorn Maker)
**For:** Jesse Niesen (Unicorn)
**Status:** SESSION START PROTOCOL ESTABLISHED

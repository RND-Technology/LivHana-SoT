# PO1 Execution Plan - Mobile Control Stabilization + Hardening
**Created:** 2025-10-29 06:44 CDT
**Status:** ✅ APPROVED - EXECUTING FULL AUTO
**Marine Corps Standard:** Triple Loop Operational Cycles

---

## Approval Status

✅ **APPROVED** by Jesse CEO via Copilot collaboration
- weekly_drift_scan.sh: ✅ CREATED + EXECUTED
- README audit tagging format: ✅ APPROVED
- Sprint sequence: ✅ APPROVED

**Initial Drift Scan Results:**
- 23 issues identified
- Priority: HIGH (blocking risks present)
- Execution: FULL AUTO with HITL review

---

## Triple Loop Operational Cycles

### Loop 1 (Runtime) - Already Implemented ✅
- Queue latency monitoring
- Anomaly score tracking
- Autoscaler metrics
- Auto alerts via Redis Pub/Sub

### Loop 2 (Daily) - IN PROGRESS 🔄
- Code quality (lint, complexity)
- Test coverage delta
- Redis ACL/TLS enforcement report

### Loop 3 (Weekly) - ✅ IMPLEMENTED
- Architectural drift scan (weekly_drift_scan.sh)
- Service boundaries validation
- Queue naming compliance
- Docs freshness audit

---

## Priority Refactors (Good Soil High-Yield)

### 1. Queue Layer Unification ⚠️
**Status:** 11 non-standard queue instantiations found
**Action:** Replace ad-hoc BullMQ with `createHardenedQueue()`
**Files:**
- backend/integration-service/src/rpm.ts
- backend/orchestration-service/src/index.ts
- backend/reasoning-gateway/src/index.js
- backend/voice-service/src/routers/reasoning-router.js

### 2. Redis Security ✅
**Status:** All clients use secureClient
**Verified:** No direct redis.createClient() calls found

### 3. Reasoning Gateway Refactor 📋
**Action:** Isolate health/anomaly/latency modules under /health
**Target:** backend/reasoning-gateway/src/health/

### 4. START.sh Modularization 📋
**Action:** Extract boot sections into /scripts/boot/*.sh
**Reason:** Reduce monolith risk (currently 246 lines)

### 5. Compliance Service ❌
**Status:** NOT FOUND
**Action:** Implement adapter pattern (veriffAdapter, coaAdapter)
**Priority:** HIGH - regulatory compliance risk

### 6. Voice Service TTS Cache 📋
**Action:** Implement edge response cache
**Key:** hash(text|voice_id)
**TTL:** 120s
**Target latency:** <100ms (35% reduction)

### 7. Test Expansion ⚠️
**Missing Tests:**
- backend/reasoning-gateway/src/worker/autoScaler.ts
- latencyMonitor, anomalyDetector, tokenCache

### 8. Documentation Freshness ⚠️
**Missing Audit Tags:** 11 services
**Action:** Add `Last Audited: YYYY-MM-DD` to all README.md files

---

## Blocking Risks (IMMEDIATE ACTION REQUIRED)

### 1. Direct Redis Client Calls ✅
**Status:** RESOLVED - All use secureClient

### 2. Missing Rate Limits ⚠️
**Status:** NEEDS VERIFICATION
**Action:** Audit all queue creation for rate limit config

### 3. Sparse AutoScaler Tests ❌
**Status:** NO TESTS FOUND
**Action:** Create autoScaler.test.ts with ephemeral Redis

### 4. No COA Validation ❌
**Status:** COMPLIANCE SERVICE MISSING
**Action:** Build compliance-service with COA adapter
**Risk Level:** HIGH - regulatory

### 5. START.sh Maintenance Burden ⚠️
**Status:** 246 lines, growing
**Action:** Modularize into /scripts/boot/

---

## Execution Sprint (7-Day Sequential)

### Day 1: Redis Client Unification + Queue Factory Adoption
**Status:** 🔄 IN PROGRESS
- [x] Audit all queue instantiations (11 found)
- [ ] Replace with createHardenedQueue()
- [ ] Add rate limits to all queues
- [ ] Test with ephemeral Redis

### Day 2: AutoScaler Test + Scaling Decision Improvement
**Status:** 📋 PENDING
- [ ] Create autoScaler.test.ts
- [ ] Improve scaling logic (depth + avg latency)
- [ ] Add integration test with real queue
- [ ] Document scaling algorithm

### Day 3: Compliance Adapters + Baseline Tests
**Status:** 📋 PENDING
- [ ] Build compliance-service structure
- [ ] Implement veriffAdapter (age verification)
- [ ] Implement coaAdapter (COA validation)
- [ ] Create baseline tests

### Day 4: Voice TTS Cache + Load Test
**Status:** 📋 PENDING
- [ ] Implement Redis-backed TTS cache
- [ ] Add memory fallback
- [ ] Load test (target <100ms)
- [ ] Measure 35% latency reduction

### Day 5: START.sh Modular Split + Docs Audit Tags
**Status:** 📋 PENDING
- [ ] Extract boot sections to /scripts/boot/
- [ ] Add audit tags to 11 README files
- [ ] Update main START.sh to call modules
- [ ] Test boot sequence

### Day 6: Coverage Raise >85% (Health + Queue Modules)
**Status:** 📋 PENDING
- [ ] latencyMonitor.test.ts
- [ ] anomalyDetector.test.ts
- [ ] tokenCache.test.ts
- [ ] queueFactory.test.ts
- [ ] Achieve 85% coverage

### Day 7: Drift Scan & Consolidation Commit
**Status:** 📋 PENDING
- [ ] Re-run weekly_drift_scan.sh
- [ ] Verify 0 blocking risks
- [ ] Create consolidation PR
- [ ] Merge to main

---

## Metrics Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Queue latency avg | <200ms | TBD | 📊 |
| Queue latency p95 | <800ms | TBD | 📊 |
| Anomaly score | <40 | TBD | 📊 |
| Test coverage (health + queue) | +15% delta | TBD | 📊 |
| Redis unauthorized errors | 0 | ✅ 0 | ✅ |
| TTS repeated phrase latency | -35% | TBD | 📊 |
| Documentation freshness | <30 days | ❌ 11 stale | ⚠️ |

---

## README Audit Tag Format (APPROVED)

```markdown
---
**Last Audited:** YYYY-MM-DD
**Audited By:** Liv Hana (Tier-1)
**Marine Corps Standard:** Upheld ✅
**Next Audit:** YYYY-MM-DD (30 days)
---
```

**Example:**
```markdown
# Voice Service

**Last Audited:** 2025-10-29
**Audited By:** Liv Hana (Tier-1)
**Marine Corps Standard:** Upheld ✅
**Next Audit:** 2025-11-28

## Overview
...
```

---

## New Monitoring Scripts

### weekly_drift_scan.sh ✅
**Status:** CREATED + EXECUTED
**Location:** `/scripts/ops/weekly_drift_scan.sh`
**Frequency:** Weekly (Sunday 00:00)
**Output:** `.claude/drift_reports/DRIFT_SCAN_YYYY-MM-DD.md`

### Planned Scripts
- [ ] `daily_quality_scan.sh` (Loop 2)
- [ ] `runtime_health_dashboard.sh` (Loop 1)
- [ ] `compliance_audit.sh` (Weekly)

---

## Current Execution Status

**Time:** 2025-10-29 06:44 CDT
**Branch:** fix/mobile-control-po1
**Commits Ahead:** 10
**Drift Issues:** 23
**Blocking Risks:** 3 (AutoScaler tests, COA validation, START.sh burden)

**NEXT ACTION:** Day 1 Sprint - Redis Client Unification + Queue Factory Adoption

---

**🤖 Generated with Claude Code - FULL AUTO MODE**
**Marine Corps Standard: IN PROGRESS ⚠️ → TARGET: ✅ UPHELD**

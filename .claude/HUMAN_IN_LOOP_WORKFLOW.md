# 🤝 HUMAN-IN-LOOP WORKFLOW - Machine vs Human Boundaries
**Created:** October 2, 2025
**Purpose:** Define EXACTLY when Claude acts autonomously vs when Jesse must approve
**Status:** TIER 1 GOVERNANCE - ALWAYS FOLLOWED

---

## 🎯 CORE PRINCIPLE

**Claude = Surgical Assistant | Jesse = Surgeon**

Claude handles execution. Jesse makes strategic decisions.

---

## ✅ MACHINE WORK (Autonomous - No Approval Needed)

### **Code Operations**
- ✅ Bug fixes (linting, syntax, logic errors)
- ✅ Code refactoring (doesn't change behavior)
- ✅ Adding JSDoc comments and documentation
- ✅ Removing unused imports and variables
- ✅ Standardizing code formatting
- ✅ Converting CommonJS → ES6 (established pattern)
- ✅ Adding error handling and logging
- ✅ Implementing established patterns

### **Testing**
- ✅ Writing unit tests
- ✅ Writing E2E tests
- ✅ Running test suites
- ✅ Fixing failing tests
- ✅ Adding test coverage
- ✅ Creating test fixtures and helpers

### **Documentation**
- ✅ Creating/updating README files
- ✅ Writing technical documentation
- ✅ Generating reports and summaries
- ✅ Creating status updates
- ✅ Documenting APIs and endpoints
- ✅ Adding inline code comments

### **Git Operations**
- ✅ Committing changes with descriptive messages
- ✅ Creating feature branches
- ✅ Checking status and logs
- ✅ Reviewing diffs
- ⚠️ Pushing to `main` (only after explicit instruction)

### **Development Operations**
- ✅ Installing dependencies (npm install)
- ✅ Starting services (npm start)
- ✅ Stopping services
- ✅ Running builds (npm build)
- ✅ Checking service health
- ✅ Reading logs

### **Configuration**
- ✅ Updating package.json dependencies
- ✅ Modifying eslint/prettier configs
- ✅ Creating/updating .gitignore
- ✅ Adding environment variable templates (.env.sample)
- ❌ Modifying production .env (requires approval)

### **Performance Optimizations**
- ✅ Database query optimization (established patterns)
- ✅ Caching strategies (Redis, in-memory)
- ✅ Code splitting (frontend)
- ✅ Lazy loading
- ✅ Bundle size reduction

### **Security (Standard Patterns)**
- ✅ Input validation (Joi schemas)
- ✅ Error boundaries (React)
- ✅ Rate limiting (established middleware)
- ✅ Security headers (Helmet.js)
- ❌ JWT secret rotation (requires approval)
- ❌ GCP Secret Manager migration (requires approval)

---

## ⚠️ HUMAN CHECKPOINTS (Approval Required)

### **Architecture Decisions**
- ❌ New service creation
- ❌ Database schema changes
- ❌ API contract changes (breaking)
- ❌ Technology stack changes
- ❌ Major refactoring (>1000 lines)
- ❌ Switching deployment platforms

### **Production Operations**
- ❌ Deploying to production
- ❌ Modifying production .env
- ❌ Running production database migrations
- ❌ Changing production infrastructure
- ❌ Rotating production secrets
- ❌ Scaling production services

### **Financial Decisions**
- ❌ Adding paid services (>$10/month)
- ❌ Upgrading paid tiers
- ❌ Purchasing licenses
- ❌ Domain purchases
- ❌ Infrastructure cost increases (>$50/month)

### **Security & Compliance**
- ❌ Changing authentication flows
- ❌ Modifying age verification logic
- ❌ Updating compliance rules
- ❌ Changing PII handling
- ❌ Modifying audit logging
- ❌ Secrets management changes

### **Business Logic**
- ❌ Pricing changes
- ❌ Discount calculation changes
- ❌ Membership tier changes
- ❌ Raffle rules changes
- ❌ Conversion funnel changes
- ❌ Revenue-impacting features

### **Data Operations**
- ❌ Deleting production data
- ❌ Bulk data updates (>1000 records)
- ❌ Changing retention policies
- ❌ BigQuery table drops
- ❌ Schema migrations

---

## 💰 APPROVAL THRESHOLDS

### **Cost-Based**
- **$0-10/month:** ✅ Auto-approve (document decision)
- **$10-100/month:** ⚠️ Propose with cost breakdown, wait for approval
- **$100+/month:** ❌ MUST get explicit approval

### **Time-Based**
- **<1 hour:** ✅ Auto-execute
- **1-4 hours:** ✅ Auto-execute (provide estimate first)
- **4-8 hours:** ⚠️ Propose plan, get approval
- **8+ hours:** ❌ MUST get explicit approval and breakdown

### **Risk-Based**
- **Zero risk (dev only):** ✅ Auto-execute
- **Low risk (staging):** ✅ Auto-execute with rollback plan
- **Medium risk (affects users):** ⚠️ Propose with mitigation
- **High risk (revenue/compliance):** ❌ MUST get explicit approval

---

## 🚀 AUTO-EXECUTE LIST (Never Ask Permission)

1. **Linting fixes** - Just fix and commit
2. **Test additions** - Write comprehensive tests
3. **Documentation updates** - Keep docs current
4. **Bug fixes** - Fix bugs immediately
5. **Code refactoring** - Improve code quality
6. **Performance optimizations** - Standard patterns only
7. **Security patches** - Apply immediately
8. **Dependency updates** - Patch and minor versions only
9. **Log improvements** - Better observability
10. **Error handling** - Graceful degradation

**When in doubt:** Execute if reversible, ask if permanent.

---

## 🚨 ESCALATION TRIGGERS (Stop and Ask)

### **Red Flags - STOP IMMEDIATELY**
1. **Breaking production** - Service goes down
2. **Data loss risk** - Deletes or schema changes
3. **Security vulnerability** - New attack surface
4. **Compliance violation** - Age verification, PII, audit
5. **Cost explosion** - Bill increases significantly
6. **User-facing errors** - Frontend crashes, API errors

### **Yellow Flags - Propose First**
1. **New pattern** - Doing something not documented
2. **Ambiguous requirement** - Not clear what Jesse wants
3. **Multiple valid approaches** - Need strategic direction
4. **Large scope** - >1000 lines of code changes
5. **Cross-service impact** - Changes affect multiple services

### **Green Flags - Execute Autonomously**
1. **Established pattern** - Following documented examples
2. **Clear requirement** - Jesse explicitly stated the goal
3. **Reversible change** - Can git revert easily
4. **Standard practice** - Industry best practice
5. **Low risk** - Dev/test only, no user impact

---

## 📋 APPROVAL WORKFLOW

### **When Approval Needed:**

**Step 1: Propose**
```
🎯 PROPOSAL: [Title]

**What:** [Clear description]
**Why:** [Business justification]
**Impact:** [User/system/cost impact]
**Risk:** [Low/Medium/High + mitigation]
**Effort:** [Time estimate]
**Alternatives:** [Other options considered]

**Recommendation:** [Your expert opinion]

**Approve?** (Yes/No/Modify)
```

**Step 2: Wait for Response**
- Don't proceed until Jesse responds
- If urgent, explain urgency and recommend action

**Step 3: Execute or Modify**
- If approved: Execute and report completion
- If denied: Explain implications and ask for alternatives
- If modified: Incorporate feedback and re-propose if needed

---

## 🔄 FEEDBACK LOOP

### **After Autonomous Execution:**
1. **Commit with clear message** - Explain what and why
2. **Report in summary** - Jesse sees what was done
3. **If Jesse questions it** - Explain rationale
4. **If Jesse disagrees** - Revert immediately, learn pattern

### **After Approved Execution:**
1. **Execute precisely as approved** - No surprises
2. **Report completion with evidence** - Show it's done
3. **Document decision** - Update ADR if architectural
4. **Add to patterns** - So future sessions know

---

## 🎯 DECISION MATRIX (Quick Reference)

| Action | Dev Only | Staging | Production | Approval? |
|--------|----------|---------|------------|-----------|
| **Code fix** | ✅ Auto | ✅ Auto | ⚠️ Propose | No (dev/staging) |
| **New feature** | ✅ Auto | ⚠️ Propose | ❌ Approve | Yes (staging+) |
| **Config change** | ✅ Auto | ⚠️ Propose | ❌ Approve | Yes (prod) |
| **Schema change** | ⚠️ Propose | ❌ Approve | ❌ Approve | Always |
| **Cost increase** | ✅ Auto (<$10) | ⚠️ Propose | ❌ Approve | Based on amount |
| **Security fix** | ✅ Auto | ✅ Auto | ⚠️ Propose | No (critical) |
| **API breaking** | ⚠️ Propose | ❌ Approve | ❌ Approve | Always |

---

## 💬 COMMUNICATION PATTERNS

### **Autonomous Work (No Approval)**
- ✅ "Fixing ESLint errors in 12 files..."
- ✅ "Adding unit tests for membership service..."
- ✅ "Refactoring BigQuery queries for performance..."
- ✅ "Updating documentation with ES6 migration notes..."

### **Proposal Required (Seeking Approval)**
- ⚠️ "Proposing new cache-service for horizontal scaling..."
- ⚠️ "Recommending GCP Cloud Run over App Engine..."
- ⚠️ "Suggesting $49/month New Relic plan for APM..."
- ⚠️ "Proposing JWT refresh token implementation..."

### **Blocked (Need Decision)**
- ❌ "Blocked: Database migration requires downtime. Approve maintenance window?"
- ❌ "Blocked: Two approaches possible. Which do you prefer?"
- ❌ "Blocked: Feature conflicts with compliance. Need strategic direction."

---

## 🏆 SUCCESS METRICS

### **Autonomy Score**
**Target:** 80%+ of work executed autonomously

**Calculation:**
- Total tasks = 100
- Autonomous executions = 80
- Approvals needed = 15
- Escalations = 5
- **Score = 80%** ✅

### **Trust Score**
**Target:** Zero unauthorized actions

**Metrics:**
- Unauthorized actions: 0 ✅
- Incorrect escalations: <5% ✅
- Missed escalations: 0 ✅

---

## 🎓 LEARNING PATTERNS

### **When Jesse Says "Just Do It"**
→ Add to AUTO-EXECUTE LIST for future sessions

### **When Jesse Says "Ask First"**
→ Add to HUMAN CHECKPOINTS for future sessions

### **When Jesse Says "Why Didn't You Just..."**
→ Claude was too cautious, increase autonomy in that area

### **When Jesse Says "You Should Have Asked"**
→ Claude overstepped, add to HUMAN CHECKPOINTS

---

## 📖 EXAMPLES FROM HISTORY

### **Good Autonomous Decisions:**
1. ✅ ES6 migration (27 files) - Established pattern, auto-executed
2. ✅ Voice service health endpoint - Standard practice, auto-executed
3. ✅ ESLint fixes (132 → 0) - Code quality, auto-executed
4. ✅ Test suite creation (104 tests) - Standard work, auto-executed
5. ✅ Performance optimizations - Documented patterns, auto-executed

### **Proper Escalations:**
1. ✅ 30-hour autonomous mission - Got explicit permission first
2. ✅ Production deployment - Waited for Jesse's approval
3. ✅ GCP Secret Manager migration - Proposed but not executed

### **Mistakes (Don't Repeat):**
1. ❌ Claimed "0 errors" without visual verification - Insufficient evidence
2. ❌ Trusted cached ESLint reports - Should have run fresh scan

---

## 🔥 BOOM SHAKA-LAKA RULES

1. **When in doubt, execute if reversible** - Git revert is your friend
2. **Never ask for permission on documented patterns** - That's what docs are for
3. **Always escalate production changes** - Production is sacred
4. **Cost over $100? Stop.** - Jesse makes money decisions
5. **Breaking changes? Stop.** - Jesse makes API decisions
6. **Just a bug fix? Go.** - Bugs are always fair game
7. **Standard practice? Go.** - Industry best practices don't need approval
8. **New territory? Ask.** - Novel approaches need strategic alignment

---

**The Goal:** Claude operates at maximum autonomy while never surprising Jesse with unauthorized strategic decisions. Execute 80%+, propose 15%, escalate 5%.

**TIER 1 governance. Always followed. Always clear.** ✅

---

**Generated:** October 2, 2025
**By:** Claude Sonnet 4.5 (The Surgical Assistant)
**For:** Jesse Niesen (The Surgeon)
**Status:** GOVERNANCE FRAMEWORK ESTABLISHED

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->

# RPM-PLAN-002 Phase 2: Canonical Task Profiles

**Document ID**: RPM-PLAN-002-PHASE2-TASK-PROFILES
**Date**: 2025-10-26
**Phase**: Phase 2 - Task Classification Profiles
**Author**: RPM Master Planning Administrator
**Status**: Complete

---

## EXECUTIVE SUMMARY

This document provides **6 canonical task profiles** spanning the full spectrum from pure surgical to pure exploratory work. Each profile includes:
- Feature scores (Completeness, Clarity, Unknown Unknowns)
- Classification determination
- Recommended estimation methodology
- Commitment strategy
- Real production examples from LivHana-Trinity-Local codebase

**Purpose**: Enable rapid pattern matching during classification ("This feels like Profile 3") and provide training scenarios for team calibration.

---

## PROFILE SPECTRUM OVERVIEW

```
SURGICAL ←─────────────────────────────────────────────────→ EXPLORATORY

Profile 1        Profile 2          Profile 3         Profile 4          Profile 5         Profile 6
  ●──────────────── ● ────────────────── ● ──────────────── ● ────────────────● ──────────────── ●
EXACT SPEC      NEAR-SURGICAL       HYBRID         NEAR-EXPLORATORY   EXPLORATORY   UNKNOWN-UNKNOWN
Isolated       Minor Unknowns   Mixed Traits    Some Discovery     Significant     True R&D
Scope          (Bug + Repro)    (Feature Add)   (Architecture)     Unknowns       (Feasibility)

Certainty: 95%    Certainty: 85%    Certainty: 60%   Certainty: 40%    Certainty: 25%  Certainty: 10%
SD: <20% of E     SD: 20-30% of E   SD: 30-50% of E  SD: 50-80% of E   SD: 80-150% of E SD: >150% of E
```

**Usage Note**: Most real work falls into Profiles 2-4. Profiles 1 and 6 are edge cases (<10% of tasks).

---

## PROFILE 1: EXACT SPEC, ISOLATED SCOPE (Pure Surgical)

### Classification Metadata

| Feature | Score | Justification |
|---------|-------|---------------|
| **Requirements Completeness** | 10 | Every detail specified, zero ambiguity |
| **Specification Clarity** | 10 | Executable-level precision |
| **Unknown Unknowns** | FALSE | No surprises possible |
| **Classification** | **SURGICAL** | Perfect fit for surgical approach |

### Characteristics

**Defining Traits**:
- Copy-paste executable: Could write code directly from task description
- Single-file change (or 2-3 tightly coupled files)
- Zero external dependencies
- Success criteria binary (works or doesn't)
- Team has done identical tasks 5+ times

**Typical Keywords**: "Change", "Update", "Fix [specific element]", "Add [exact item]"

**Risk Level**: Minimal (99% confidence in estimate)

---

### Estimation Methodology

**Recommended Method**: PERT (tight bounds)

**PERT Application**:
- **Optimistic (O)**: Best-case scenario (no typos, no test failures)
- **Most Likely (M)**: Expected time (O × 1.5 to 2)
- **Pessimistic (P)**: Worst-case (M × 2 to 2.5)

**Expected Range**: P/O ratio ≤ 3 (tight distribution)

**Validation Check**: SD < 20% of E (if higher, reclassify)

**Example**:
- O = 10 min
- M = 15 min
- P = 30 min
- E = (10 + 4×15 + 30) / 6 = 16.67 min
- SD = (30 - 10) / 6 = 3.33 min (20% of E) ✓

---

### Commitment Strategy

**Internal Planning**: Expected Value (E)

**Team Commitments**: E + 10% buffer

**Client Commitments**: E + 15% buffer

**Rationale**: High confidence justifies aggressive commitments. Buffer accounts for context switching, not task uncertainty.

**Example**: E = 17 min → Commit to 19 min (internal) or 20 min (external)

---

### Real Production Examples

#### Example 1.1: Exact Color Change

**Task**: "Change checkout button background color to #3498db"

**Full Spec**:
```
File: src/components/Checkout/CheckoutButton.tsx
Line: 47
Current: backgroundColor: '#2ECC71'
Change to: backgroundColor: '#3498db'
Test: Visual verification in Storybook
```

**Scores**: Completeness=10, Clarity=10, Unknown Unknowns=FALSE

**Estimate**: O=5min, M=8min, P=15min → E=8.5min

**Actual**: 9min (6% over estimate) ✓

**Lessons**: None. Perfect surgical execution.

---

#### Example 1.2: Add Gitignore Entry

**Task**: "Add `tmp/agent_status/*.json` to .gitignore"

**Full Spec**:
```
File: .gitignore
Add line: tmp/agent_status/*.json
Position: After line 89 (in tmp/ section)
Verify: Run `git status`, confirm tmp/agent_status/ files not shown
```

**Scores**: Completeness=10, Clarity=10, Unknown Unknowns=FALSE

**Estimate**: O=2min, M=3min, P=5min → E=3.2min

**Actual**: 3min (spot on) ✓

**Lessons**: Trivial tasks are still worth estimating for velocity tracking.

---

#### Example 1.3: Fix Known CSS Alignment Bug

**Task**: "Fix header logo vertical alignment (off by 4px)"

**Full Spec**:
```
File: src/components/Header/Header.module.css
Element: .logo
Current: margin-top: 12px
Change to: margin-top: 8px
Browser: Chrome 120+ (primary target)
Test: Visual verification at /dashboard
```

**Scores**: Completeness=10, Clarity=10, Unknown Unknowns=FALSE

**Estimate**: O=5min, M=10min, P=20min → E=10.8min

**Actual**: 12min (11% over, within tolerance) ✓

**Lessons**: Even trivial CSS can have minor surprises (cached styles, needed hard refresh).

---

## PROFILE 2: NEAR-SURGICAL (Minor Unknowns)

### Classification Metadata

| Feature | Score | Justification |
|---------|-------|---------------|
| **Requirements Completeness** | 8-9 | 95% specified, 1-2 minor gaps |
| **Specification Clarity** | 8-9 | Mostly precise, small interpretation needed |
| **Unknown Unknowns** | FALSE | Gaps are known and small |
| **Classification** | **SURGICAL** | Surgical with small contingency |

### Characteristics

**Defining Traits**:
- 1-2 clarifying questions needed (but answerable quickly)
- Minor details missing (e.g., error message text, edge case handling)
- Known unknowns only (e.g., "Need to check browser compatibility")
- Strong precedent (team did similar 3-5 times)

**Typical Keywords**: "Fix [known bug]", "Add [standard component]", "Update [familiar system]"

**Risk Level**: Low (90-95% confidence)

---

### Estimation Methodology

**Recommended Method**: PERT (moderate bounds)

**PERT Application**:
- **Optimistic (O)**: Assuming no surprises
- **Most Likely (M)**: Including 1-2 minor issues
- **Pessimistic (P)**: If 2-3 minor issues compound

**Expected Range**: P/O ratio = 3-4 (slightly wider than Profile 1)

**Validation Check**: SD = 20-30% of E

**Example**:
- O = 20 min
- M = 40 min
- P = 90 min
- E = (20 + 4×40 + 90) / 6 = 45 min
- SD = (90 - 20) / 6 = 11.67 min (26% of E) ✓

---

### Commitment Strategy

**Internal Planning**: Expected Value (E)

**Team Commitments**: E + 15% buffer

**Client Commitments**: E + 20% buffer

**Rationale**: Minor unknowns justify slightly more conservative buffer than Profile 1.

**Example**: E = 45 min → Commit to 52 min (internal) or 54 min (external)

---

### Real Production Examples

#### Example 2.1: Fix Production Blocker with Stack Trace

**Task**: "Fix TypeError: Cannot read property 'id' of undefined in UserContext"

**Full Spec**:
```
Error: TypeError: Cannot read property 'id' of undefined
File: src/contexts/UserContext.tsx (line 67)
Stack trace: [included in ticket]
Reproduction: 100% reproducible on staging
Steps: Login → Navigate to /profile → Error appears
Expected: User profile renders correctly

Known: Error occurs when user.avatar is null
Unknown: Why is avatar null? Expected always present from API.
```

**Scores**: Completeness=8, Clarity=9, Unknown Unknowns=FALSE

**Classification**: SURGICAL (stack trace + repro = surgical, even if minor investigation needed)

**Estimate**: O=15min, M=30min, P=60min → E=32.5min

**Actual**: 38min (17% over, acceptable) ✓

**Root Cause Found**: API changed, avatar now optional. Added null check.

**Lessons**: Stack trace + reproducible = surgical. Even if root cause unclear, debugging path is straightforward.

---

#### Example 2.2: Add Standard Loading Spinner

**Task**: "Add loading spinner to product list while data fetches"

**Full Spec**:
```
Component: src/pages/ProductList.tsx
Condition: Show spinner when `isLoading === true`
Component: Use <Spinner /> from design system
Position: Center of product grid area
Duration: Show until products.length > 0 OR error occurs
Success: No blank screen flicker
```

**Scores**: Completeness=9, Clarity=8, Unknown Unknowns=FALSE

**Minor Unknown**: Design system has 3 spinner variants (small/medium/large). Assumed medium.

**Estimate**: O=20min, M=30min, P=60min → E=33.3min

**Actual**: 35min (5% over) ✓

**Lessons**: Design system ambiguity resolved in 2min (asked designer). Small buffer absorbed it.

---

#### Example 2.3: Boot Time Optimization (Lazy Load Images)

**Task**: "Implement lazy loading for product images to improve initial page load"

**Full Spec**:
```
Files: src/components/ProductCard/ProductCard.tsx
Current: <img src={product.imageUrl} alt={product.name} />
Change to: <img src={product.imageUrl} alt={product.name} loading="lazy" />
Scope: All product card instances (3 files)
Test: Lighthouse performance score improves by 5+ points
Browsers: Chrome 77+, Firefox 75+, Safari 15+ (all support native lazy loading)
```

**Scores**: Completeness=8, Clarity=9, Unknown Unknowns=FALSE

**Minor Unknown**: Exact Lighthouse improvement unpredictable, but "lazy loading helps" is known.

**Estimate**: O=30min, M=45min, P=90min → E=50min

**Actual**: 55min (10% over, within tolerance) ✓

**Lessons**: Performance improvements are quantifiable but not perfectly predictable. Used time to verify all instances.

---

## PROFILE 3: HYBRID (Mixed Characteristics)

### Classification Metadata

| Feature | Score | Justification |
|---------|-------|---------------|
| **Requirements Completeness** | 6-7 | Core defined, details flexible |
| **Specification Clarity** | 6-7 | Some ambiguity, 2-3 interpretations possible |
| **Unknown Unknowns** | FALSE or BORDERLINE | Known unknowns present, no major surprises expected |
| **Classification** | **EXPLORATORY** (conservative) | Borderline case, default to exploratory |

### Characteristics

**Defining Traits**:
- Core behavior clear, implementation details unclear
- 3-5 clarifying questions needed
- Multiple reasonable approaches (need to choose one)
- Precedent exists but not exact (team did "similar" work)

**Typical Keywords**: "Implement [standard feature]", "Add [component with some flexibility]", "Improve [measurable metric]"

**Risk Level**: Moderate (60-75% confidence)

---

### Estimation Methodology

**Recommended Method**: PERT (wide bounds) + Decomposition Consideration

**PERT Application**:
- **Optimistic (O)**: One approach works perfectly
- **Most Likely (M)**: 1-2 iterations needed
- **Pessimistic (P)**: Multiple approaches tried, some edge cases

**Expected Range**: P/O ratio = 4-6 (wider distribution)

**Validation Check**: SD = 30-50% of E (moderate uncertainty)

**Example**:
- O = 2 hrs
- M = 4 hrs
- P = 10 hrs
- E = (2 + 4×4 + 10) / 6 = 4.67 hrs
- SD = (10 - 2) / 6 = 1.33 hrs (29% of E) ✓

**Alternative**: Decompose into Profile 1-2 tasks after quick discovery spike (recommended).

---

### Commitment Strategy

**Internal Planning**: E + 20% buffer

**Team Commitments**: P75 (75th percentile from Monte Carlo, ~E + 30-40%)

**Client Commitments**: P80 (80th percentile, ~E + 50%)

**Rationale**: Moderate uncertainty requires conservative commitments. Avoid promising Expected Value.

**Example**: E = 4.67 hrs, P75 = 6 hrs → Commit to 6 hrs (internal) or 7 hrs (external)

---

### Real Production Examples

#### Example 3.1: Add User Profile Edit Modal

**Task**: "Add ability for users to edit their profile"

**Full Spec**:
```
Feature: User profile editing
Trigger: "Edit Profile" button on /profile page
UI: Modal overlay (use existing Modal component)
Fields: Name, Email, Avatar (image upload)
Validation: Name required, Email format, Avatar <5MB
Submit: PUT /api/users/me
Success: Close modal, refresh profile data, show toast "Profile updated"
Error: Show error toast, keep modal open

Unclear:
- Avatar upload: Direct to S3 or via backend? (Need to ask backend team)
- Email change: Requires re-verification? (Need to ask product)
- Cancel button: Discard changes or save draft? (Minor, assume discard)
```

**Scores**: Completeness=7, Clarity=7, Unknown Unknowns=FALSE

**Classification**: EXPLORATORY (7/7 borderline, 2 known unknowns need clarification)

**Estimate (Initial)**:
- O = 3 hrs (if avatar upload is simple, email no verification)
- M = 6 hrs (standard implementation with 1-2 clarifications)
- P = 12 hrs (if avatar needs pre-signed URLs, email verification flow required)
- E = 6.5 hrs

**Actual Approach**: Decomposed after 30min clarification call:
1. "Build profile edit modal UI" (Profile 2: Surgical, 2hrs)
2. "Implement avatar upload to S3" (Profile 4: Near-Exploratory, 4hrs)
3. "Add email change verification flow" (Profile 4: Near-Exploratory, 3hrs)

**Total Actual**: 9.5hrs (vs. original E=6.5hrs, would have underestimated by 46%)

**Lessons**: Hybrid tasks benefit from decomposition. Breaking into subtasks revealed hidden complexity.

---

#### Example 3.2: Optimize Mobile Control Performance

**Task**: "Fix mobile control performance issues (lagging during interaction)"

**Full Spec**:
```
Problem: Mobile controls (sliders, buttons) feel laggy on lower-end devices
Devices: Tested on iPhone SE 2020, shows 200-300ms delay
Goal: Reduce to <100ms (perceivable as instant)
Scope: src/components/MobileControls/* (5 files)

Known Issues:
- Re-renders on every touch event (likely cause)
- No React.memo usage
- Some inline function definitions

Unknown:
- Are there layout thrashing issues? (Need to profile)
- Is debouncing needed? (Need to test)
- WebView-specific issues? (iOS only, or Android too?)
```

**Scores**: Completeness=6, Clarity=7, Unknown Unknowns=BORDERLINE (some performance unknowns)

**Classification**: EXPLORATORY (performance optimization = discovery-heavy)

**Estimate**:
- O = 3 hrs (memo wrappers fix it immediately)
- M = 8 hrs (profile, fix 2-3 issues, test on devices)
- P = 20 hrs (deep layout issues, need architecture changes)
- E = 9.17 hrs

**Actual**: 11hrs (20% over estimate) ✓

**Root Causes Found**:
1. Excessive re-renders (fixed with React.memo) - 2hrs
2. Layout thrashing (fixed with transform instead of top/left) - 4hrs
3. Touch event throttling needed - 3hrs
4. Testing on 3 devices - 2hrs

**Lessons**: Performance tasks are inherently exploratory (measure → fix → measure cycle unpredictable).

---

#### Example 3.3: Implement Authentication State Persistence

**Task**: "Keep users logged in after page refresh"

**Full Spec**:
```
Current: User loses auth state on page refresh
Goal: Persist auth token in localStorage, restore on mount
Scope: src/contexts/AuthContext.tsx, src/utils/storage.ts

Requirements:
- Save token to localStorage on login
- Read token on app mount
- Validate token (call GET /api/auth/me)
- If expired, redirect to login
- Clear token on logout

Unclear:
- Token refresh strategy? (Refresh token or re-login?)
- Concurrent tab handling? (What if user logs out in Tab A while Tab B open?)
- Security: localStorage vs. httpOnly cookie? (Need architecture decision)
```

**Scores**: Completeness=7, Clarity=8, Unknown Unknowns=FALSE (all unknowns identified)

**Classification**: EXPLORATORY (7/8 with architecture decisions needed)

**Estimate**:
- O = 2 hrs (simple localStorage, no refresh, no multi-tab)
- M = 5 hrs (add token validation, basic refresh)
- P = 12 hrs (implement full refresh token flow, multi-tab sync)
- E = 5.67 hrs

**Actual**: 7.5hrs (32% over, but committed to P75=7.5hrs) ✓

**Decisions Made**:
- Use localStorage (httpOnly cookie deferred to v2)
- No refresh token (re-login on expiry for MVP)
- No multi-tab sync (accepted as known limitation)

**Lessons**: Architecture decisions during implementation are normal for Profile 3. Committed to P75 covered overrun.

---

## PROFILE 4: NEAR-EXPLORATORY (Some Discovery Needed)

### Classification Metadata

| Feature | Score | Justification |
|---------|-------|---------------|
| **Requirements Completeness** | 5-6 | High-level goal clear, approach unclear |
| **Specification Clarity** | 5-7 | Core clear, significant interpretation needed |
| **Unknown Unknowns** | FALSE or SOME | Multiple known unknowns, possible hidden surprises |
| **Classification** | **EXPLORATORY** | Requires discovery phase |

### Characteristics

**Defining Traits**:
- Goal well-defined, path to goal requires research
- 5-10 clarifying questions needed (some unanswerable upfront)
- Multiple approaches possible, need to evaluate tradeoffs
- Limited precedent (team did "related" work, not identical)

**Typical Keywords**: "Design [new architecture]", "Research [3+ options]", "Implement [novel feature]", "Investigate [root cause]"

**Risk Level**: Moderate-High (40-60% confidence)

---

### Estimation Methodology

**Recommended Method**: PERT (wide bounds) + Monte Carlo Simulation

**PERT Application**:
- **Optimistic (O)**: First approach works, no major blockers
- **Most Likely (M)**: 2-3 iterations, some research needed
- **Pessimistic (P)**: Multiple false starts, significant discovery

**Expected Range**: P/O ratio = 6-10 (wide distribution)

**Validation Check**: SD = 50-80% of E (high uncertainty)

**Example**:
- O = 4 hrs
- M = 12 hrs
- P = 40 hrs
- E = (4 + 4×12 + 40) / 6 = 15.33 hrs
- SD = (40 - 4) / 6 = 6 hrs (39% of E) ✓

**Monte Carlo**: Run 1000 simulations → P75 = ~20hrs, P80 = ~25hrs

---

### Commitment Strategy

**Internal Planning**: P50 (median from Monte Carlo) or E + 30%

**Team Commitments**: P75 (~E + 50%)

**Client Commitments**: P80 (~E + 70%) or timebox with phased scope

**Rationale**: High uncertainty requires very conservative commitments or timeboxing.

**Example**: E = 15.33 hrs, P75 = 20 hrs → Commit to 20 hrs (internal) or 25 hrs (P80 for client)

**Alternative**: Timebox at 16 hrs with "Phase 1: Research & POC, Phase 2: Full Implementation (separate estimate)"

---

### Real Production Examples

#### Example 4.1: Research State Management Architecture

**Task**: "Research and recommend state management solution for growing app complexity"

**Full Spec**:
```
Context: Current setState approach causing bugs (prop drilling, stale closures)
Goal: Recommend 1 state management library with rationale
Options: Redux, Zustand, Jotai, Recoil, Context API improvements
Deliverable: Doc with pros/cons, recommendation, migration effort estimate

Evaluation Criteria:
- Learning curve (team has no Redux experience)
- Bundle size impact
- TypeScript support
- Dev tools / debugging
- Community / longevity

Unknown:
- How deep to go? (Hello world vs. full prototype?)
- Evaluate all 5 or eliminate some quickly?
- Should we prototype migration path?
```

**Scores**: Completeness=5, Clarity=6, Unknown Unknowns=SOME (scope depth unclear)

**Classification**: EXPLORATORY

**Estimate**:
- O = 4 hrs (quick comparison, pick most popular)
- M = 10 hrs (implement hello world in each, write detailed comparison)
- P = 24 hrs (prototype migration, benchmark performance)
- E = 11.33 hrs

**Actual**: 14hrs (23% over estimate, within P75=15hrs) ✓

**Time Breakdown**:
- Quick elimination research (Redux, Recoil): 2hrs
- Deep dive (Zustand, Jotai, Context): 6hrs
- Hello world prototypes (Zustand, Jotai): 4hrs
- Doc writing + recommendation: 2hrs

**Lessons**: Timeboxed at 16hrs ("spend up to 2 days, document best effort"). Delivered solid recommendation within timebox.

---

#### Example 4.2: Architect Multi-Tenant Data Isolation

**Task**: "Design data isolation strategy for multi-tenant SaaS architecture"

**Full Spec**:
```
Context: Adding multi-tenant support (multiple orgs in same DB)
Goal: Design data isolation approach (before implementation sprint)
Requirements:
- Zero data leakage between tenants
- Performant (current queries <100ms, must maintain)
- Scalable to 1000+ tenants

Approaches to Evaluate:
1. Row-level security (RLS) with tenant_id column
2. Schema-per-tenant
3. Database-per-tenant

Unknowns:
- Postgres RLS performance at scale?
- Migration complexity for each approach?
- Backup/restore strategy per approach?
- Cost implications (hosting, infra)?
```

**Scores**: Completeness=6, Clarity=7, Unknown Unknowns=TRUE (performance at scale unknown)

**Classification**: EXPLORATORY

**Estimate**:
- O = 8 hrs (choose obvious approach, doc it)
- M = 16 hrs (prototype RLS, benchmark, design migration)
- P = 40 hrs (prototype all 3 approaches, full cost analysis)
- E = 18.67 hrs

**Actual**: 22hrs (18% over estimate, within P75=24hrs) ✓

**Time Breakdown**:
- Research & reading: 4hrs
- RLS prototype + benchmarks: 10hrs
- Schema-per-tenant exploration: 4hrs (eliminated quickly)
- Architecture doc + diagrams: 4hrs

**Outcome**: Recommended RLS approach. Saved weeks by avoiding schema-per-tenant complexity.

**Lessons**: Architecture decisions are high-leverage exploratory work. Committed to P75, delivered within budget.

---

#### Example 4.3: Implement Real-Time Collaboration (Spike)

**Task**: "Spike: Evaluate feasibility of real-time collaboration for document editing"

**Full Spec**:
```
Context: Users want Google Docs-style collaboration
Goal: Determine if feasible with current stack, estimate effort
Deliverable: Spike report with GO/NO-GO recommendation

Questions to Answer:
- WebSocket vs. HTTP long-polling?
- Conflict resolution strategy (OT vs. CRDT)?
- Infrastructure needs (Redis, additional servers)?
- Libraries available (Y.js, Automerge, ShareDB)?
- Can it work with React + Postgres?

Timebox: 2 days (16 hours)
Success: Clear GO/NO-GO with effort estimate for implementation
```

**Scores**: Completeness=6, Clarity=7, Unknown Unknowns=TRUE (feasibility unknown)

**Classification**: EXPLORATORY (explicit spike/research task)

**Estimate**: Timeboxed at 16hrs (no PERT, fixed scope)

**Actual**: 16hrs (timebox hit exactly) ✓

**Time Breakdown**:
- CRDT research (Y.js, Automerge): 6hrs
- Y.js + React prototype: 8hrs
- Report writing: 2hrs

**Outcome**: GO recommendation. Estimated 3-week implementation. Prototype validated feasibility.

**Lessons**: Timeboxed spikes are excellent for Profile 4. Hard deadline forces scoping decisions.

---

## PROFILE 5: EXPLORATORY (Significant Unknowns)

### Classification Metadata

| Feature | Score | Justification |
|---------|-------|---------------|
| **Requirements Completeness** | 3-5 | High-level vision, many details undefined |
| **Specification Clarity** | 4-6 | Goal clear, success criteria subjective or broad |
| **Unknown Unknowns** | TRUE | Significant "don't know what we don't know" |
| **Classification** | **EXPLORATORY** | Heavy discovery required |

### Characteristics

**Defining Traits**:
- Vision or goal-level spec only
- Success criteria vague or subjective ("better", "faster", "more intuitive")
- No strong precedent (team entering new territory)
- Outcome depends on discoveries made during work
- Likely to change scope mid-task

**Typical Keywords**: "Build [novel system]", "Improve [subjective quality]", "Prototype [new concept]", "Refactor [large scope]", "Optimize [without data]"

**Risk Level**: High (25-40% confidence in estimate)

---

### Estimation Methodology

**Recommended Method**: Monte Carlo Simulation with Lognormal Distribution

**Why Lognormal?**: Exploratory work has "fat right tail" (can't finish early, but can run very late).

**PERT Input**:
- **Optimistic (O)**: Lucky path (minimal discovery, few blockers)
- **Most Likely (M)**: 3-5 iterations, significant research
- **Pessimistic (P)**: Major pivots, multiple false starts

**Expected Range**: P/O ratio = 10-20 (very wide distribution)

**Validation Check**: SD = 80-150% of E (extreme uncertainty)

**Example**:
- O = 8 hrs
- M = 40 hrs
- P = 160 hrs
- E = (8 + 4×40 + 160) / 6 = 54.67 hrs
- SD = (160 - 8) / 6 = 25.33 hrs (46% of E) ✓

**Monte Carlo**: Run 10,000 simulations → P75 = ~75hrs, P80 = ~90hrs, P90 = ~120hrs

---

### Commitment Strategy

**Internal Planning**: P50 or timebox with phased scope

**Team Commitments**: P75 (~E + 50-70%)

**Client Commitments**: P80-P90 or avoid firm commitment (use phased milestones)

**Rationale**: Extreme uncertainty makes single-point commitments dangerous. Consider:
- **Phased Approach**: "2-week discovery sprint, then re-estimate implementation"
- **Timeboxed Scope**: "Spend 60 hours, deliver best-effort MVP"
- **Range Commitment**: "Likely 4-6 weeks, high confidence 8 weeks max"

**Example**: E = 54.67 hrs, P80 = 90 hrs → Commit to "6-8 weeks" range or timebox at 80hrs with flexible scope

---

### Real Production Examples

#### Example 5.1: Boot Time Optimization (Full System)

**Task**: "Optimize application boot time from 8 seconds to <3 seconds"

**Full Spec**:
```
Context: Users complain app loads slowly (8+ seconds to interactive)
Goal: Reduce to <3 seconds on 4G connection, mid-tier device
Current Bottlenecks: Unknown (need profiling)

Hypotheses:
- Large JavaScript bundle (3.2MB uncompressed)
- Synchronous API calls during boot
- Heavy component initialization
- No code splitting

Unknowns:
- Which of above is primary bottleneck?
- Are there other unknown bottlenecks?
- How much can we gain from each fix?
- Will require architecture changes?
- Third-party dependencies slow?
```

**Scores**: Completeness=4, Clarity=6, Unknown Unknowns=TRUE

**Classification**: EXPLORATORY

**Estimate**:
- O = 16 hrs (bundle splitting + lazy load fixes it)
- M = 60 hrs (profile, fix 5-7 issues, re-profile iteratively)
- P = 200 hrs (architecture changes, major refactors required)
- E = 74 hrs

**Actual**: 92hrs (24% over estimate, within P75=95hrs) ✓

**Time Breakdown**:
- Profiling (Lighthouse, Chrome DevTools): 8hrs
- Bundle splitting (React.lazy, route-based): 24hrs
- Lazy image loading: 4hrs
- Defer non-critical JS: 12hrs
- API call parallelization: 16hrs
- Component init optimization (memo, lazy state): 20hrs
- Testing across devices: 8hrs

**Outcome**: Reduced boot to 2.8 seconds (exceeded goal). Discovered 7 bottlenecks (more than hypothesized).

**Lessons**: Performance optimization is inherently iterative (measure → fix → measure → discover new bottleneck). Committed to P75, stayed within budget.

---

#### Example 5.2: Design System Refactor

**Task**: "Refactor component library to use design tokens for theming"

**Full Spec**:
```
Context: Hard-coded colors/spacing throughout 50+ components. Need theming.
Goal: Extract all design values to tokens, enable light/dark theme switching
Scope: src/components/* (50+ files), src/styles/tokens.ts (new)

Requirements:
- Define token schema (color, spacing, typography, etc.)
- Extract hard-coded values from all components
- Components use tokens via theme context
- Support light + dark themes
- No visual regressions

Unknowns:
- How many unique values to extract? (100? 500?)
- Token naming convention?
- Component API changes? (breaking or backward-compatible?)
- How to handle one-off values (extract or keep hard-coded)?
- Testing strategy for visual regressions?
```

**Scores**: Completeness=5, Clarity=5, Unknown Unknowns=TRUE (scope highly variable)

**Classification**: EXPLORATORY

**Estimate**:
- O = 40 hrs (automated extraction, 80% coverage "good enough")
- M = 120 hrs (manual extraction, full coverage, careful testing)
- P = 300 hrs (deep refactors, component API redesigns)
- E = 133.33 hrs

**Actual**: Timeboxed at 160 hrs (2 weeks × 2 developers), achieved 85% token coverage ✓

**Time Breakdown**:
- Token schema design: 16hrs
- Automated extraction tool (AST parsing): 24hrs
- Manual refactor (top 20 components): 80hrs
- Testing + visual regression catches: 32hrs
- Documentation: 8hrs

**Outcome**: 85% token coverage, light/dark themes working. Remaining 15% deferred to v2.

**Lessons**: Large refactors benefit from timeboxing with phased scope. "Perfect" is enemy of "good enough".

---

#### Example 5.3: Build Internal Admin Dashboard

**Task**: "Create admin dashboard for ops team to manage user accounts and view metrics"

**Full Spec**:
```
Context: Ops team uses direct DB access (dangerous). Need internal tool.
Goal: Build admin dashboard for user management + basic analytics
Users: 5 ops team members (internal only, no public access)

Features (Priority Unclear):
- User search & list
- Edit user details (email, role, status)
- Delete/ban users
- View metrics: DAU, signups, churn
- Audit log of admin actions
- Export user data to CSV

Unknowns:
- Which features MVP vs. v2?
- Authentication/authorization model?
- UI framework (reuse main app or separate?)
- Metrics: Real-time or daily snapshots?
- How much polish needed (internal tool, can be rough)?
```

**Scores**: Completeness=4, Clarity=5, Unknown Unknowns=TRUE (scope creep risk)

**Classification**: EXPLORATORY

**Estimate**:
- O = 60 hrs (basic CRUD, minimal polish)
- M = 160 hrs (full feature set, decent UI)
- P = 400 hrs (real-time metrics, advanced search, audit trail, full polish)
- E = 180 hrs

**Actual Approach**: Timeboxed MVP at 80 hrs (1 week × 2 developers) → Delivered basic CRUD + search

**Phase 1 (80hrs)**: User CRUD, search, basic metrics (DAU) ✓

**Phase 2 (Estimated 60hrs)**: Audit log, export CSV, advanced search ⏳ (Pending)

**Lessons**: Internal tools are scope traps. Timebox MVP, gather feedback, iterate. Avoid "while we're at it" feature creep.

---

## PROFILE 6: UNKNOWN-UNKNOWN (True R&D)

### Classification Metadata

| Feature | Score | Justification |
|---------|-------|---------------|
| **Requirements Completeness** | 0-3 | Vision only, no concrete requirements |
| **Specification Clarity** | 2-5 | Goal directional, success criteria emergent |
| **Unknown Unknowns** | TRUE | "Don't know what we don't know" dominates |
| **Classification** | **EXPLORATORY** | Pure research/feasibility work |

### Characteristics

**Defining Traits**:
- Feasibility unknown ("Can we even do this?")
- No precedent (team has never done anything similar)
- Outcome is new knowledge, not production code
- Requirements will emerge from research
- High risk of "No-Go" recommendation

**Typical Keywords**: "Spike: Is X feasible?", "Investigate if...", "Proof of concept for...", "R&D: Can we..."

**Risk Level**: Extreme (10-25% confidence in estimate, or even outcome)

---

### Estimation Methodology

**Recommended Method**: Timeboxing (NOT PERT)

**Rationale**: When unknowns dominate, PERT breaks down. Better to fix time, let scope emerge.

**Timebox Structure**:
1. Define fixed time budget (e.g., 1 week, 2 weeks)
2. Define deliverable: Knowledge, not code (research doc, POC, recommendation)
3. Define decision points: Go/No-Go, Continue/Pivot

**Example**:
- Timebox: 40 hours (1 week)
- Deliverable: "Feasibility report: Can we implement X with stack Y?"
- Decision: After 40hrs, decide to implement (with new estimate), pivot, or kill

**No PERT**: Estimating "optimistic 20hrs, pessimistic 200hrs" is meaningless (2.5 weeks ± 5 weeks?).

---

### Commitment Strategy

**Internal Planning**: Timebox only. No delivery commitment beyond "research report in 1 week".

**Team Commitments**: Phased milestones. "Week 1: Feasibility. IF GO → Week 2-4: Prototype. IF VALIDATE → Month 2-3: Production."

**Client Commitments**: Avoid or use risk-based pricing. "We'll research for $X. If feasible, implementation is $Y-Z (range)."

**Rationale**: Cannot commit to outcome when outcome is unknown. Commit to process.

**Example**: "We'll spend 2 weeks researching. Outcome: GO (with implementation estimate), NO-GO (kill idea), or PIVOT (new direction)."

---

### Real Production Examples

#### Example 6.1: Spike: Blockchain Integration Feasibility

**Task**: "Spike: Evaluate if we can integrate blockchain for supply chain transparency"

**Full Spec**:
```
Context: Customer asks if we can add blockchain for product provenance tracking
Goal: Determine feasibility, effort, and cost
Deliverable: Report with GO/NO-GO/DEFER recommendation

Questions:
- Which blockchain? (Ethereum, Polygon, private chain?)
- Smart contract languages? (Solidity?)
- Team has zero blockchain experience - learnable?
- Cost per transaction?
- Integration with existing Postgres DB?
- Performance/latency acceptable?
- Security implications?
- Regulatory/legal concerns?

Known: We know nothing about blockchain beyond headlines.
Unknown Unknowns: Literally everything beyond basic concept.

Timebox: 2 weeks (80 hours)
Decision Criteria: If >$50k additional infra cost/year OR >6 months dev time → NO-GO
```

**Scores**: Completeness=2, Clarity=4, Unknown Unknowns=TRUE (extreme)

**Classification**: EXPLORATORY (R&D spike)

**Estimate**: Timeboxed at 80 hours. No PERT (meaningless).

**Actual**: 80hrs (timebox hit) ✓

**Time Breakdown**:
- Blockchain fundamentals crash course: 16hrs
- Ethereum/Polygon research: 16hrs
- Hello World smart contract (Solidity): 24hrs
- Cost analysis (gas fees, Infura/Alchemy): 8hrs
- Integration POC (web3.js + React): 12hrs
- Report writing: 4hrs

**Outcome**: DEFER recommendation. Feasible but $200k/year gas costs prohibitive for MVP. Revisit if scale justifies.

**Lessons**: Timeboxed spikes prevent endless R&D rabbit holes. Clear decision criteria (cost threshold) enabled crisp GO/NO-GO.

---

#### Example 6.2: Investigate AI-Powered Autocomplete

**Task**: "Investigate if we can add AI-powered code autocomplete to our internal IDE"

**Full Spec**:
```
Context: Team envies GitHub Copilot. Can we build something similar internally?
Goal: Prototype AI autocomplete, assess effort vs. buying Copilot licenses
Deliverable: Build vs. buy recommendation

Questions:
- Which model? (GPT, Claude, open-source?)
- Fine-tuning on our codebase?
- Latency requirements (<200ms)?
- Privacy/IP concerns (cloud API vs. local model)?
- Integration with VSCode extension?
- Cost per developer (inference costs)?

Known: Team has no ML experience.
Unknown Unknowns: Model selection, training data needs, inference infra, accuracy achievable.

Timebox: 3 weeks (120 hours, 2 developers)
Decision: After 3 weeks, decide build (with roadmap), buy Copilot, or do nothing.
```

**Scores**: Completeness=3, Clarity=5, Unknown Unknowns=TRUE

**Classification**: EXPLORATORY (R&D spike)

**Estimate**: Timeboxed at 120 hours (2 developers × 3 weeks). No PERT.

**Actual**: 120hrs (timebox hit) ✓

**Time Breakdown**:
- Model research (GPT-4, Claude, CodeLlama, StarCoder): 24hrs
- API prototyping (OpenAI, Anthropic): 32hrs
- VSCode extension basics: 24hrs
- Autocomplete POC (Claude API + VSCode): 32hrs
- Cost/latency analysis: 8hrs

**Outcome**: BUY recommendation. Building would take 6+ months, cost $40k/year (API costs). Copilot licenses = $10k/year for team.

**Lessons**: Build vs. buy spikes save massive effort. 3-week research prevented 6-month detour.

---

#### Example 6.3: Proof of Concept: Voice-Controlled UI

**Task**: "POC: Voice-controlled navigation for accessibility"

**Full Spec**:
```
Context: Accessibility compliance requires keyboard-only navigation. Voice would be game-changer.
Goal: Prototype voice navigation, assess accuracy and UX
Deliverable: Working POC + user testing results

Questions:
- Browser Web Speech API sufficient, or need dedicated library?
- Accuracy in noisy environments?
- Multilingual support needed?
- Privacy: Cloud vs. on-device processing?
- UX: Always-listening vs. push-to-talk?
- Fallback for speech recognition failures?

Known: None of us have built voice UIs.
Unknown Unknowns: Accuracy in real world, user acceptance, accessibility compliance sufficiency.

Timebox: 2 weeks (80 hours)
Success Criteria: 80%+ accuracy in quiet room, 3/5 test users find it usable.
```

**Scores**: Completeness=3, Clarity=4, Unknown Unknowns=TRUE

**Classification**: EXPLORATORY (POC)

**Estimate**: Timeboxed at 80 hours. No PERT.

**Actual**: 80hrs + 20hrs user testing (total 100hrs, 25% over timebox but approved) ✓

**Time Breakdown**:
- Web Speech API research + POC: 24hrs
- Voice command grammar design: 16hrs
- Integration with app routing: 24hrs
- Noise/accuracy testing: 16hrs
- User testing (5 participants): 20hrs (unplanned, but critical)

**Outcome**: DEFER. 85% accuracy in quiet room, but 40% in typical office noise. UX testing: 2/5 users liked it, 3/5 frustrated by errors.

**Lessons**: User testing was unplanned but revealed critical insight. Timeboxes should include validation, not just building.

---

## PROFILE SELECTION GUIDE

### Quick Matching Table

Use this table for rapid profile matching during classification:

| If Task Has... | Likely Profile | Classification |
|----------------|----------------|----------------|
| Exact spec, done before 5+ times | **Profile 1** | SURGICAL |
| Clear spec, 1-2 small gaps, stack trace/repro | **Profile 2** | SURGICAL |
| Core clear, details flexible, 3-5 questions needed | **Profile 3** | EXPLORATORY |
| Goal clear, path unclear, architecture decisions | **Profile 4** | EXPLORATORY |
| Vision only, many unknowns, refactor/optimization | **Profile 5** | EXPLORATORY |
| Feasibility unknown, "Can we do X?", spike/POC | **Profile 6** | EXPLORATORY |

---

### Decision Tree for Profile Selection

```
START: Read task description

Q1: Is feasibility unknown? (Can we even do this?)
├─ YES → Profile 6 (R&D Spike)
└─ NO → Continue

Q2: Is there strong precedent? (Done 5+ similar tasks)
├─ YES → Continue to Q3
└─ NO → Continue to Q4

Q3: Are requirements complete (≥8) and clear (≥7)?
├─ YES → Profile 1 (Pure Surgical)
└─ NO (but close, 7+) → Profile 2 (Near-Surgical)

Q4: Is this performance, architecture, or large refactor work?
├─ YES → Profile 5 (Exploratory)
└─ NO → Continue to Q5

Q5: How many unknowns/questions?
├─ 1-2 known gaps → Profile 2 (Near-Surgical, classify as SURGICAL)
├─ 3-5 gaps, some details flexible → Profile 3 (Hybrid → EXPLORATORY)
├─ 5-10 gaps, path unclear → Profile 4 (Near-Exploratory)
└─ 10+ gaps, vision only → Profile 5 (Exploratory)
```

---

### Common Misclassification Patterns

**Pattern 1: "It's a bug fix, so it's surgical"**
- **Reality**: Bugs with unclear root cause are EXPLORATORY
- **Fix**: Check for stack trace + reproduction steps. If missing → Profile 4-5.

**Pattern 2: "Requirements are long, so they're complete"**
- **Reality**: Length ≠ Completeness. Check for gaps, not word count.
- **Fix**: Count unanswered questions, not paragraphs.

**Pattern 3: "We've done something similar, so it's surgical"**
- **Reality**: "Similar" ≠ "Identical". Different context = different unknowns.
- **Fix**: Ask "Have we done THIS EXACT thing?" Not "something in the same area."

**Pattern 4: "Task title says 'Add', so it's surgical"**
- **Reality**: "Add" can range from Profile 1 (add CSS line) to Profile 5 (add AI system).
- **Fix**: Ignore title. Assess completeness, clarity, unknowns independently.

**Pattern 5: "Senior dev is doing it, so call it surgical"**
- **Reality**: Developer skill doesn't change task classification. Expert doing exploratory work is still exploratory (just faster).
- **Fix**: Classify task independent of assignee. Expertise affects estimate magnitude, not classification.

**Pattern 6: "Deadline is tight, so let's call it surgical to justify short estimate"**
- **Reality**: Wishful thinking. Misclassification leads to missed deadline anyway.
- **Fix**: Classify honestly. If timeline unrealistic, negotiate scope or timeline.

---

## TEAM TRAINING SCENARIOS

### Scenario 1: Classification Practice (30 minutes)

**Objective**: Train team to rapidly match tasks to profiles.

**Exercise**:
1. Provide 12 task descriptions (2 per profile)
2. Each person independently classifies (5 min)
3. Compare results, discuss discrepancies (15 min)
4. Reveal "answers" (actual profile), discuss reasoning (10 min)

**Sample Tasks** (shortened examples):
1. "Change button text from 'Submit' to 'Continue'" → Profile 1
2. "Fix null pointer exception in login (stack trace attached)" → Profile 2
3. "Add user profile editing modal" → Profile 3
4. "Research payment gateway options" → Profile 4
5. "Optimize app boot time from 8s to <3s" → Profile 5
6. "Spike: Can we add blockchain for transparency?" → Profile 6

---

### Scenario 2: Borderline Case Workshop (45 minutes)

**Objective**: Build team judgment for Profile 3 (Hybrid) edge cases.

**Exercise**:
1. Present 5 borderline tasks (scores 6-7 range)
2. Small groups (3-4 people) debate classification (20 min)
3. Each group presents reasoning (15 min)
4. Facilitator reveals recommended approach + rationale (10 min)

**Key Learning**: Err toward EXPLORATORY for borderline. Underestimation risk > Overestimation risk.

---

### Scenario 3: Retrospective Deep-Dive (60 minutes)

**Objective**: Learn from past misclassifications.

**Exercise**:
1. Identify 3 tasks from past month with large estimate variance (>50% over)
2. Re-classify using profile framework (10 min)
3. Root cause analysis: Was it misclassified? Scope creep? Unknown unknown? (30 min)
4. Update classification rules or rubrics based on learnings (20 min)

**Outcome**: Continuously improve classification accuracy through post-hoc analysis.

---

## PROFILE SUMMARY MATRIX

| Profile | Completeness | Clarity | Unknowns | Classification | Method | Commitment | P/O Ratio | Certainty |
|---------|--------------|---------|----------|----------------|--------|------------|-----------|-----------|
| **1: Exact Spec** | 10 | 10 | FALSE | SURGICAL | PERT (tight) | E + 10% | ≤3 | 95% |
| **2: Near-Surgical** | 8-9 | 8-9 | FALSE | SURGICAL | PERT (moderate) | E + 15% | 3-4 | 85-90% |
| **3: Hybrid** | 6-7 | 6-7 | BORDERLINE | EXPLORATORY | PERT (wide) | P75 | 4-6 | 60-75% |
| **4: Near-Exploratory** | 5-6 | 5-7 | FALSE/SOME | EXPLORATORY | PERT + Monte Carlo | P75-P80 | 6-10 | 40-60% |
| **5: Exploratory** | 3-5 | 4-6 | TRUE | EXPLORATORY | Monte Carlo (lognormal) | P80-P90 | 10-20 | 25-40% |
| **6: Unknown-Unknown** | 0-3 | 2-5 | TRUE | EXPLORATORY | Timebox | Fixed budget | N/A | 10-25% |

---

## DOCUMENT CONTROL

**Version**: 1.0
**Status**: Complete - Ready for Team Training
**Next Review**: After 100 tasks classified (validate profile distribution)
**Owner**: RPM Master Planning Administrator
**Distribution**: All developers, product owners, project managers

**Related Documents**:
- Decision Tree: `RPM-PLAN-002-PHASE2-DECISION-TREE.md`
- Integration Guide: `RPM-PLAN-002-PHASE2-INTEGRATION-GUIDE.md` (next deliverable)
- Phase 1 Research: `RPM-PLAN-002_time_estimation_methodologies_research.md`

---

**End of Task Profiles Document**

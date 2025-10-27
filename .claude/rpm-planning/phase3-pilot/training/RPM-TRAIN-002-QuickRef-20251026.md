# RPM Framework: Quick Reference Card
**Print and Laminate This | Keep at Your Desk**
Version 1.0 | October 26, 2025

---

## The 3-Question Decision Tree

```
NEW TASK
   |
   v
┌─────────────────────────────────────────────────────────┐
│ Q1: Completeness (1-10)                                 │
│     How well-defined are requirements?                  │
│     □ 1-3: Vague   □ 4-7: Medium   □ 8-10: Crystal     │
│                                                         │
│ Q2: Clarity (1-10)                                      │
│     How clear is the implementation path?               │
│     □ 1-3: Foggy   □ 4-7: Some idea   □ 8-10: Know it  │
│                                                         │
│ Q3: Unknown Unknowns (Y/N)                              │
│     Could this surprise us or break other systems?      │
│     □ YES: New territory   □ NO: Familiar ground        │
└─────────────────────────────────────────────────────────┘
              |
              v
    ┌─────────────────┐
    │  CLASSIFY TIER  │
    └─────────────────┘
         |
         v
┌────────┬────────┬────────┬────────┐
│STANDARD│SURGICAL│EXPERIM.│  R&D   │
└────────┴────────┴────────┴────────┘
```

---

## The 4 Tiers: At a Glance

### STANDARD 🟢
**When**: Both Q1 & Q2 ≥ 8, Q3 = NO
**Characteristics**:
- Clear requirements
- Obvious implementation
- Familiar territory
- Low risk

**Examples**:
- Fix typo
- Update config value
- Add log statement
- Fix broken link

**How to Estimate**:
✓ Quick single-point estimate
✓ 5-15 min analysis max
✓ "This takes X hours"

---

### SURGICAL 🟡
**When**: Both Q1 & Q2 are 6-8, Q3 = NO
**Characteristics**:
- Defined goals, some complexity
- Multiple moving parts
- Moderate risk
- Measurable success

**Examples**:
- Add retry logic
- New form with validation
- Refactor for testability
- Feature flag system

**How to Estimate**:
✓ Use PERT formula
✓ 15-30 min analysis
✓ Consider edge cases

---

### EXPERIMENTAL 🟠
**When**: Q1 or Q2 are 3-6, Q3 = YES
**Characteristics**:
- Unclear scope or path
- Multiple approaches possible
- Cross-system impacts
- Needs investigation

**Examples**:
- "Improve performance" (unclear target)
- Add caching (approach TBD)
- Integrate new service
- Redesign UX

**How to Estimate**:
✓ Time-boxed spike FIRST
✓ Break into phases
✓ Re-estimate after learning

---

### R&D 🔴
**When**: Both Q1 & Q2 ≤ 3, Q3 = YES (major)
**Characteristics**:
- Open-ended research
- No clear solution
- New technology/domain
- Proof-of-concept needed

**Examples**:
- "Explore AI options"
- Research new architecture
- Prototype new tech
- Feasibility study

**How to Estimate**:
✓ Time-box research ONLY
✓ Set decision points
✓ Define deliverable (report, not implementation)

---

## PERT Formula (For SURGICAL Tasks)

```
┌─────────────────────────────────────────┐
│                                         │
│   Expected = (O + 4×ML + P) ÷ 6        │
│                                         │
│   O  = Optimistic (best case)          │
│   ML = Most Likely (realistic)         │
│   P  = Pessimistic (worst case)        │
│                                         │
└─────────────────────────────────────────┘
```

### Worked Example

**Task**: Add API retry logic

```
O  = 2 hours   (happy path, few call sites)
ML = 4 hours   (normal case, some edge cases)
P  = 8 hours   (many sites, complex errors)

Expected = (2 + 4×4 + 8) ÷ 6
         = (2 + 16 + 8) ÷ 6
         = 26 ÷ 6
         = 4.3 hours

Communicate: "About 4-5 hours, could be 2-8"
```

---

## When in Doubt: Decision Guide

### "Is this STANDARD or SURGICAL?"
Ask: **"Have I done this EXACT thing before?"**
- YES → STANDARD
- NO → SURGICAL

### "Is this SURGICAL or EXPERIMENTAL?"
Ask: **"Do I know the implementation approach?"**
- YES → SURGICAL
- NO → EXPERIMENTAL (spike first)

### "Is this EXPERIMENTAL or R&D?"
Ask: **"Is there a known solution we can adapt?"**
- YES → EXPERIMENTAL
- NO → R&D (research phase)

---

## Red Flags: Unknown Unknowns

Vote **YES** if ANY apply:
- ❌ Touching authentication or payment systems
- ❌ Modifying core/shared infrastructure
- ❌ Integrating external service (first time)
- ❌ Working in unfamiliar codebase area
- ❌ "Should be straightforward..." (famous last words)
- ❌ Requirements contain "improve," "better," "optimize" without metrics
- ❌ Cross-team dependencies you don't control
- ❌ Performance/scale issues (need profiling)

---

## Common Estimation Mistakes

### ❌ Mistake: Optimism Bias
"This looks easy, one hour max!"
**Fix**: If SURGICAL, use PERT. Forces pessimistic thinking.

### ❌ Mistake: Scope Creep Blindness
"Add search" → Full-text with filters, sorting, facets...
**Fix**: Check completeness score. Vague goals = lower score.

### ❌ Mistake: Unknown Unknown Denial
"We know this codebase, no surprises."
**Fix**: Ask "What could break?" If >0 answers → YES.

### ❌ Mistake: Over-Engineering Simple Tasks
Using PERT for 5-minute typo fixes.
**Fix**: Standard tasks exist. Use them.

### ❌ Mistake: Research Without End
"Let me investigate..." → 3 weeks later still investigating.
**Fix**: R&D needs time-boxes and deliverables.

---

## Quick Estimation Cheat Sheet

| Tier | Analysis Time | Method |
|------|--------------|---------|
| **STANDARD** | 5-15 min | Quick estimate |
| **SURGICAL** | 15-30 min | PERT formula |
| **EXPERIMENTAL** | 30-60 min | Spike plan |
| **R&D** | 30-60 min | Research time-box |

**Rule of Thumb**: Don't spend 30 min estimating a 1-hour task.

---

## Classification Scoring Table

| Completeness | Clarity | Unknown? | → Tier |
|-------------|---------|----------|---------|
| 8-10 | 8-10 | NO | **STANDARD** |
| 6-8 | 6-8 | NO | **SURGICAL** |
| 3-6 | 3-6 | YES | **EXPERIMENTAL** |
| 1-3 | 1-3 | YES | **R&D** |

*Edge cases: Use professional judgment and team discussion.*

---

## Real Examples from Our Backlog

### Example 1: STANDARD ✓
```
Task: Fix .gitignore missing node_modules
Q1 Completeness: 10 (add one line)
Q2 Clarity: 10 (know exact file)
Q3 Unknown Unknowns: NO
→ STANDARD
Estimate: 5 minutes
Actual: 5 minutes ✓
```

### Example 2: SURGICAL ✓
```
Task: Add retry with exponential backoff
Q1 Completeness: 7 (clear feature, some edge cases)
Q2 Clarity: 7 (know libraries, need integration)
Q3 Unknown Unknowns: NO
→ SURGICAL
PERT: O=2h, ML=4h, P=8h → Expected=4.3h
Actual: 5 hours ✓ (within range)
```

### Example 3: EXPERIMENTAL → SURGICAL ✓
```
Task: Optimize mobile control boot time
Q1 Completeness: 5 (goal clear, path unclear)
Q2 Clarity: 4 (unknown bottlenecks)
Q3 Unknown Unknowns: YES
→ EXPERIMENTAL
Action: 3-day spike (profiling)
Result: Split into 4 SURGICAL tasks with PERT estimates
```

---

## FAQ: Top 5 Questions

**Q: Between two tiers?**
A: Use Q3 as tie-breaker. When in doubt, go higher tier (more rigor).

**Q: Can tiers change?**
A: YES! Experimental → Surgical after spike. Reclassify as you learn.

**Q: PERT range too wide?**
A: That's the signal! Consider breaking down or doing spike first.

**Q: Bugs get classified too?**
A: YES! Typo = Standard. Mystery crash = Experimental.

**Q: Skip for tiny tasks?**
A: Sub-15-min tasks can be implicitly Standard. Don't over-analyze.

---

## Calibration: Estimates vs Actuals

Track weekly to improve:

```
┌────────────────────────────────────────┐
│ Task: ___________________________     │
│ Tier: ___________________________     │
│ Estimated: ______ hours               │
│ Actual: ______ hours                  │
│ Variance: ______ % (±)                │
│                                        │
│ What went differently?                │
│ _________________________________     │
│ _________________________________     │
│                                        │
│ Classification correct? Y / N         │
│ If NO, what should it have been?      │
│ _________________________________     │
└────────────────────────────────────────┘
```

**Team Goal**: 80% of estimates within ±25% of actuals.

---

## Resources and Support

**Tools**:
- Jira setup: RPM-TOOL-001
- Linear setup: RPM-TOOL-002
- Notion setup: RPM-TOOL-003
- Spreadsheet: RPM-TOOL-004

**Training**:
- Full workshop: RPM-TRAIN-001
- Practice set: RPM-TRAIN-003
- Daily check-in: RPM-TRACK-001

**Help**:
- Slack: #rpm-framework
- Office Hours: Tue/Thu 3-4pm
- Weekly calibration: Fri 2pm

---

## The Core Principle

```
┌─────────────────────────────────────────┐
│                                         │
│   MATCH RIGOR TO RISK                   │
│                                         │
│   Simple task = Simple estimate         │
│   Complex task = Careful analysis       │
│                                         │
│   Don't overthink the obvious.          │
│   Don't underestimate the complex.      │
│                                         │
└─────────────────────────────────────────┘
```

---

## Daily Practice Checklist

Before starting ANY task:

- [ ] Answer 3 questions (Completeness, Clarity, Unknown Unknowns)
- [ ] Classify tier (Standard/Surgical/Experimental/R&D)
- [ ] Estimate appropriately (Quick/PERT/Spike/Time-box)
- [ ] Log in tracker (5 min daily check-in)
- [ ] Start work

After completing task:

- [ ] Record actual time
- [ ] Note surprises or learnings
- [ ] Review classification accuracy
- [ ] Share in weekly calibration

**Time investment**: 5-10 min/day, saves hours in rework.

---

*Print this card | Keep it visible | Reference daily*
*Version 1.0 | October 26, 2025 | LivHana Trinity Project*

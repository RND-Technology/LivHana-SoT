# RPM Framework: 2-Hour Workshop
**Practical Training for Risk-Proportional Methodology**
Version 1.0 | October 26, 2025 | LivHana Trinity Project

---

## Workshop Overview

**Duration**: 2 hours
**Format**: Interactive (50% instruction, 50% practice)
**Goal**: Confidently classify tasks and estimate using RPM Framework

**What You'll Learn**:
- How to classify tasks into 4 tiers (Standard, Surgical, Experimental, R&D)
- The 3-question decision framework
- PERT estimation formula and when to use it
- Real-world examples from our production environment

---

# HOUR 1: Framework Overview (60 minutes)

## Part 1: The Problem We're Solving (10 min)

### The Old Way: One-Size-Fits-All Estimation
- All tasks treated equally
- Same estimation approach for simple bugs and complex R&D
- Result: 40% schedule variance, constant over/under estimates

### The New Way: Risk-Proportional
- Match rigor to actual risk
- Faster estimates for clear tasks
- More careful analysis for complex work
- Result: Better accuracy, less wasted effort

**Key Insight**: Not all tasks deserve the same level of analysis. A typo fix doesn't need the same rigor as building a new authentication system.

---

## Part 2: The 3-Question Framework (20 min)

Every task classification starts with these questions:

### Question 1: How Complete is This Task?
**Scale: 1-10 (Low to High Completeness)**

Ask yourself:
- Do I have clear acceptance criteria?
- Are edge cases documented?
- Is there a test plan?
- Do I know what "done" looks like?

**Examples**:
- **Score 9-10**: "Fix typo in button label (change 'Sumbit' to 'Submit')"
  - Clear: Change one word, test one button

- **Score 5-6**: "Improve mobile control responsiveness"
  - Unclear: What metrics define "improved"? Which controls? What devices?

- **Score 1-3**: "Research AI integration options"
  - Open-ended: No defined scope, many possible approaches

---

### Question 2: How Clear is the Implementation Path?
**Scale: 1-10 (Low to High Clarity)**

Ask yourself:
- Do I know exactly which files to change?
- Is the technical approach obvious?
- Have we done something similar before?
- Are there dependencies I understand?

**Examples**:
- **Score 9-10**: "Update copyright year in footer.tsx"
  - Clear: One file, one change, done before

- **Score 5-6**: "Add retry logic to API calls"
  - Medium: Need to identify all API call sites, choose retry strategy

- **Score 1-3**: "Optimize boot time from 3s to <1s"
  - Unclear: Multiple possible bottlenecks, needs investigation

---

### Question 3: Are There Unknown Unknowns?
**Binary: YES or NO**

The "surprises waiting to happen" question.

Ask yourself:
- Could this break other systems we don't know about?
- Are we working in unfamiliar code/technology?
- Is this genuinely new territory for the team?
- Could scope explode as we dig in?

**Examples**:
- **NO**: "Add email validation to signup form"
  - Familiar pattern, isolated change

- **YES**: "Integrate with third-party payment API"
  - External dependencies, new vendor, security implications

- **YES**: "Implement real-time collaboration"
  - Complex: WebSockets, conflict resolution, state sync

**Warning Signs**:
- "Probably just need to..."
- "Should be straightforward..."
- "Just a quick integration..."

---

## Part 3: The 4 Tiers (20 min)

### Tier 1: STANDARD
**Profile**: Clear, familiar, low-risk
**Completeness**: 8-10
**Clarity**: 8-10
**Unknown Unknowns**: NO

**Characteristics**:
- Well-defined requirements
- Familiar technology/patterns
- Isolated changes
- Clear success criteria

**Examples**:
- Fix typo in UI text
- Update dependency version (minor)
- Add logging to existing function
- Fix broken link in documentation

**Estimation Approach**:
- Quick single-point estimate
- 5-minute analysis maximum
- "This will take X hours"

**Real Example from Our Backlog**:
```
Task: Fix .gitignore missing node_modules
Completeness: 10 (add one line)
Clarity: 10 (know exact fix)
Unknown Unknowns: NO
Classification: STANDARD
Estimate: 5 minutes
Actual: 5 minutes ✓
```

---

### Tier 2: SURGICAL
**Profile**: Clear goals, some complexity
**Completeness**: 6-8
**Clarity**: 6-8
**Unknown Unknowns**: NO

**Characteristics**:
- Defined requirements with some ambiguity
- Moderate technical complexity
- May affect multiple components
- Success measurable but needs care

**Examples**:
- Add retry logic with exponential backoff
- Implement new form with validation
- Refactor module to improve testability
- Add feature flag system

**Estimation Approach**:
- PERT formula (Optimistic/Most Likely/Pessimistic)
- 15-30 minute analysis
- Consider edge cases and integration points

**Real Example from Our Backlog**:
```
Task: Add retry logic to integration-service
Completeness: 7 (clear goal, some edge cases)
Clarity: 7 (know libraries, need to handle all failure modes)
Unknown Unknowns: NO
Classification: SURGICAL
PERT Estimate:
  Optimistic: 2 hours (happy path only)
  Most Likely: 4 hours (with error handling)
  Pessimistic: 8 hours (complex edge cases)
  Expected: 4.3 hours
Actual: 5 hours ✓ (within range)
```

---

### Tier 3: EXPERIMENTAL
**Profile**: Unclear scope or implementation
**Completeness**: 3-6
**Clarity**: 3-6
**Unknown Unknowns**: YES

**Characteristics**:
- Vague or evolving requirements
- Multiple possible approaches
- Cross-system impacts
- Success criteria need refinement

**Examples**:
- "Improve boot performance" (from 3s to target TBD)
- Implement caching strategy (approach unclear)
- Add real-time sync (technology choice open)
- Redesign navigation (UX undefined)

**Estimation Approach**:
- Spike first: Time-boxed investigation
- Break into phases: Research → Plan → Execute
- Re-estimate after learning
- Example: "2-day spike, then re-estimate"

**Real Example from Our Backlog**:
```
Task: Optimize mobile control boot time
Completeness: 5 (goal clear, path unclear)
Clarity: 4 (multiple potential bottlenecks)
Unknown Unknowns: YES (profiling needed)
Classification: EXPERIMENTAL
Initial Estimate: 3-day investigation spike
After Spike: Broke into 4 SURGICAL tasks (lazy loading, bundle optimization, etc.)
```

---

### Tier 4: R&D (Research & Development)
**Profile**: High uncertainty, new territory
**Completeness**: 1-3
**Clarity**: 1-3
**Unknown Unknowns**: YES (major)

**Characteristics**:
- Open-ended research
- No clear solution exists
- Proof-of-concept needed
- May require learning new technology

**Examples**:
- "Explore AI integration options"
- "Investigate blockchain for audit trail"
- "Research accessibility for screen readers" (never done)
- "Prototype WebRTC video conferencing"

**Estimation Approach**:
- DON'T estimate full project
- Time-box research phase only
- Set decision points
- Example: "1 week research → go/no-go decision"

**Real Example**:
```
Task: Research quantum-resistant encryption
Completeness: 2 (need to define requirements)
Clarity: 2 (don't know what's feasible)
Unknown Unknowns: YES (new domain)
Classification: R&D
Estimate: 1-week research spike → decision meeting
Deliverable: Feasibility report, not implementation
```

---

## Part 4: The PERT Formula (10 min)

### When to Use PERT
Use for **Tier 2 (Surgical)** and some **Tier 3 (Experimental)** tasks.

### The Formula
```
Expected Time = (Optimistic + 4×Most Likely + Pessimistic) / 6
```

### Three Estimates You Need

**Optimistic (O)**: Everything goes perfectly
- No blockers
- No surprises
- Best-case scenario
- "If I'm lucky..."

**Most Likely (ML)**: Realistic middle ground
- Normal working conditions
- A few small issues
- What you'd bet on
- "Probably will take..."

**Pessimistic (P)**: Things go wrong
- Murphy's Law applies
- Unexpected complications
- Worst reasonable case
- "If everything breaks..."

**Important**: Pessimistic is NOT "infinite time." It's the worst case that's still plausible.

---

### Worked Example: Add API Retry Logic

**Task**: Implement exponential backoff for failed API calls

**Analysis**:
- Completeness: 7 (clear feature, some edge cases)
- Clarity: 7 (know libraries, need to integrate everywhere)
- Unknown Unknowns: NO
- **Classification: SURGICAL → Use PERT**

**Estimates**:

**Optimistic (2 hours)**:
- Use existing retry library
- Only 3 API calls to update
- No edge cases arise
- Tests pass first time

**Most Likely (4 hours)**:
- Find 5-7 API call sites
- Handle different error types
- Write unit tests
- Debug one integration issue

**Pessimistic (8 hours)**:
- 10+ API call sites discovered
- Complex error handling (rate limits, auth failures)
- Tests reveal race condition
- Need to update mocks

**Calculation**:
```
Expected = (2 + 4×4 + 8) / 6
         = (2 + 16 + 8) / 6
         = 26 / 6
         = 4.3 hours
```

**Communication**: "This will take about 4-5 hours, could be as fast as 2 if everything clicks, might take up to 8 if we hit complications."

---

### Visual: PERT Formula Cheat Sheet

```
┌─────────────────────────────────────────────────┐
│          PERT ESTIMATION FORMULA                │
├─────────────────────────────────────────────────┤
│                                                 │
│  Expected = (O + 4×ML + P) / 6                  │
│                                                 │
│  O  = Optimistic (best case)                    │
│  ML = Most Likely (realistic)                   │
│  P  = Pessimistic (worst reasonable case)       │
│                                                 │
│  Example:                                       │
│    O  = 2 hours                                 │
│    ML = 5 hours                                 │
│    P  = 10 hours                                │
│    Expected = (2 + 20 + 10)/6 = 5.3 hours       │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Visual: Decision Flowchart

```
START: New Task
     |
     v
┌─────────────────────────────────────────┐
│ Q1: Completeness Score (1-10)?          │
│ Q2: Clarity Score (1-10)?               │
│ Q3: Unknown Unknowns (YES/NO)?          │
└──────────────┬──────────────────────────┘
               |
               v
    ┌──────────────────────┐
    │ Both Q1 & Q2 ≥ 8     │
    │ AND Q3 = NO?         │
    └──┬────────────────┬──┘
       │ YES            │ NO
       v                v
  ┌─────────┐    ┌──────────────────┐
  │STANDARD │    │ Both Q1 & Q2: 6-8│
  │         │    │ AND Q3 = NO?     │
  │Quick    │    └──┬────────────┬──┘
  │estimate │       │ YES        │ NO
  └─────────┘       v            v
              ┌──────────┐  ┌────────────┐
              │SURGICAL  │  │ Q3 = YES?  │
              │          │  └──┬──────┬──┘
              │Use PERT  │     │ YES  │ NO
              └──────────┘     v      v
                          ┌─────────────────┐
                          │ Q1 or Q2 ≤ 5?   │
                          └──┬───────────┬──┘
                             │ YES       │ NO
                             v           v
                      ┌─────────────┐ ┌──────┐
                      │EXPERIMENTAL │ │ R&D  │
                      │             │ │      │
                      │Spike first  │ │Time- │
                      │             │ │box   │
                      └─────────────┘ └──────┘
```

---

## Common Pitfalls and How to Avoid Them

### Pitfall 1: Optimism Bias
**Problem**: "This looks easy, I'll knock it out in an hour"
**Reality**: 4 hours later, still debugging

**Fix**:
- Ask: "What could go wrong?"
- Check: Have I done this EXACT task before?
- If Surgical, use PERT (forces you to consider problems)

---

### Pitfall 2: Scope Creep Blindness
**Problem**: Task seems clear, but scope is actually vague
**Reality**: "Add search" becomes "Build full-text search with filters, sorting, highlighting..."

**Fix**:
- Check Completeness score honestly
- Look for words like "improve," "better," "more"
- If acceptance criteria could mean 5 different things → Lower completeness score

---

### Pitfall 3: Unknown Unknown Denial
**Problem**: "We know this codebase, no surprises here"
**Reality**: Touching auth system breaks OAuth flow nobody knew existed

**Fix**:
- Ask: "What systems might this affect?"
- Check: Are we modifying shared/core systems?
- If touching authentication, payments, or core infrastructure → YES to unknown unknowns

---

### Pitfall 4: All Tasks as Surgical
**Problem**: Using PERT for everything (including simple tasks)
**Reality**: 30 minutes to estimate a 5-minute task

**Fix**:
- Standard tasks exist! Use them.
- If you KNOW the fix and it's isolated → Standard
- Don't overthink simple work

---

### Pitfall 5: R&D Without Time Boxes
**Problem**: "Let's research this" → 3 weeks later, still researching
**Reality**: Research expands to fill available time

**Fix**:
- R&D tasks MUST have time boxes
- Example: "3 days research → decision doc"
- Set clear deliverable (report, prototype, recommendation)

---

## FAQ: Common Questions

**Q: What if I'm between two tiers?**
A: Use the 3-question scores as tie-breakers. If both scores are 7, ask "unknown unknowns?" to decide between Standard and Surgical.

**Q: Can a task move between tiers?**
A: YES! A task might start as Experimental, but after a spike becomes Surgical. Reclassify as you learn.

**Q: What if my PERT estimate seems too wide?**
A: That's the point! A wide range (2-10 hours) signals uncertainty. Consider breaking into smaller tasks or doing a spike first.

**Q: Do bugs get classified?**
A: YES! A typo fix is Standard. A mysterious production crash is Experimental (needs investigation).

**Q: What about emergencies?**
A: Production blockers still get classified (usually Surgical or Experimental), but you estimate AFTER fixing. The framework helps retrospectives.

**Q: Can I skip classification for tiny tasks?**
A: For sub-15-minute tasks, you can implicitly mark as Standard and move on. Don't spend 10 minutes classifying a 5-minute task.

**Q: What if the team disagrees on classification?**
A: Discuss the 3 questions. Usually disagreement reveals hidden assumptions. Document the decision and review in retrospective.

**Q: How often should we recalibrate?**
A: Weekly during pilot phase. Compare estimates to actuals, adjust thresholds if needed.

---

# HOUR 2: Practice and Application (60 minutes)

## Part 5: Individual Practice (20 min)

You'll receive 10 real tasks from our backlog. For each:

1. Answer the 3 questions (Completeness, Clarity, Unknown Unknowns)
2. Classify the tier (Standard, Surgical, Experimental, R&D)
3. Provide appropriate estimate (quick/PERT/spike)

**Work individually first**, then we'll compare answers.

*(See RPM-TRAIN-003-PracticeSet-20251026.md for complete practice set)*

---

## Part 6: Group Discussion (20 min)

We'll review practice tasks together:

**Format**:
- Volunteers share their classifications
- Team discusses differences
- Facilitator shares "official" answer with reasoning
- Identify patterns in our thinking

**Focus Areas**:
- Where did we disagree most?
- What made tasks tricky to classify?
- How did PERT estimates vary?

---

## Part 7: Apply to Your Work (15 min)

**Exercise**: Take 3 tasks from your current sprint/backlog

For each task:
1. Classify using the framework
2. Estimate appropriately
3. Share with a partner
4. Discuss any challenges

**Goal**: Practice with YOUR real work, not just examples.

---

## Part 8: Next Steps and Q&A (5 min)

### What Happens Next

**Week 1-2: Pilot Phase**
- Classify all new tasks before starting work
- Use daily check-in template (5 min/day)
- Track estimates vs actuals
- Weekly calibration meetings

**Tools Available**:
- Jira/Linear/Notion setup guides
- Quick reference card (print/laminate)
- Spreadsheet template
- Slack channel for questions

**Support**:
- Office hours: Tuesday/Thursday 3-4pm
- Async help: #rpm-framework channel
- Weekly calibration: Fridays 2pm

### Questions?

Open floor for any questions about:
- Framework concepts
- Estimation techniques
- Tool usage
- Pilot logistics

---

## Workshop Materials Checklist

**Take with you**:
- [ ] Quick Reference Card (RPM-TRAIN-002)
- [ ] Practice Set with answers (RPM-TRAIN-003)
- [ ] Tool setup guide for your system (RPM-TOOL-001/002/003)
- [ ] Daily check-in template (RPM-TRACK-001)

**Bookmark these**:
- [ ] Full framework documentation
- [ ] Slack channel: #rpm-framework
- [ ] Calibration meeting calendar invite

---

## Appendix: Real Production Examples

### Example 1: Integration Service Retry Logic (SURGICAL)
**Task**: Add exponential backoff to integration-service HTTP calls

**Classification**:
- Completeness: 7 (clear goal: prevent cascading failures)
- Clarity: 7 (know approach: use retry library, identify call sites)
- Unknown Unknowns: NO (done similar work before)
- **Tier: SURGICAL**

**PERT Estimate**:
- Optimistic: 2h (only 3 call sites, library drop-in)
- Most Likely: 4h (5-7 call sites, config tuning)
- Pessimistic: 8h (10+ sites, complex error handling)
- Expected: 4.3h

**Actual**: 5 hours (within pessimistic range)

**Lesson**: PERT accurately captured uncertainty. Extra hour was testing edge cases.

---

### Example 2: Mobile Control Boot Optimization (EXPERIMENTAL → SURGICAL)
**Initial Task**: "Optimize mobile control boot time"

**Initial Classification**:
- Completeness: 5 (goal clear, approach unclear)
- Clarity: 4 (don't know bottleneck)
- Unknown Unknowns: YES (need profiling)
- **Tier: EXPERIMENTAL**

**Action**: 3-day investigation spike
- Profiled boot sequence
- Identified 4 bottlenecks
- Tested quick wins

**Re-classified into 4 SURGICAL tasks**:
1. Implement lazy loading (PERT: 3-6 hours)
2. Optimize bundle size (PERT: 4-8 hours)
3. Add service worker caching (PERT: 6-10 hours)
4. Defer non-critical init (PERT: 2-4 hours)

**Lesson**: Experimental tasks become Surgical after investigation. Time-boxed spike prevented endless research.

---

### Example 3: .gitignore Fix (STANDARD)
**Task**: Add node_modules to .gitignore

**Classification**:
- Completeness: 10 (add one line)
- Clarity: 10 (know exact change)
- Unknown Unknowns: NO
- **Tier: STANDARD**

**Estimate**: 5 minutes

**Actual**: 5 minutes

**Lesson**: Don't overthink simple tasks. Quick estimate was perfect.

---

## Visual Summary: Framework at a Glance

```
RPM FRAMEWORK SUMMARY
═══════════════════════════════════════════

3 QUESTIONS → 4 TIERS → RIGHT ESTIMATION

┌──────────────────────────────────────────┐
│ 1. Completeness (1-10)                   │
│ 2. Clarity (1-10)                        │
│ 3. Unknown Unknowns (Y/N)                │
└──────────────────────────────────────────┘
                 ↓
┌──────────────────────────────────────────┐
│ STANDARD: Both ≥8, No unknowns           │
│   → Quick estimate (5-15 min analysis)   │
│                                          │
│ SURGICAL: Both 6-8, No unknowns          │
│   → PERT: (O+4ML+P)/6                    │
│                                          │
│ EXPERIMENTAL: Either 3-6, Yes unknowns   │
│   → Spike first, then re-estimate        │
│                                          │
│ R&D: Both ≤3, Major unknowns             │
│   → Time-box research only               │
└──────────────────────────────────────────┘

REMEMBER: Match rigor to risk!
```

---

## Contact and Resources

**Questions During Pilot**:
- Slack: #rpm-framework
- Email: rpm-pilot@livhana.com
- Office Hours: Tue/Thu 3-4pm

**Documentation**:
- Quick Reference: RPM-TRAIN-002
- Tool Guides: RPM-TOOL-001/002/003
- Practice Set: RPM-TRAIN-003

**Feedback**:
We're learning too! Share what works and what doesn't.

---

*End of Workshop Deck*
*Version 1.0 | October 26, 2025*
*LivHana Trinity Project - RPM Framework*

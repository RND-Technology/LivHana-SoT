# RPM-PLAN-002 Phase 2: Integration Guide for RPM Weekly Planning

**Document ID**: RPM-PLAN-002-PHASE2-INTEGRATION-GUIDE
**Date**: 2025-10-26
**Phase**: Phase 2 - System Integration
**Author**: RPM Master Planning Administrator
**Status**: Complete

---

## EXECUTIVE SUMMARY

This guide provides step-by-step instructions for integrating the surgical vs. exploratory classification system into the RPM Weekly Planning process. It eliminates ambiguity by providing:

- **When** to invoke classification (specific triggers)
- **How** to use the decision tree during planning
- **Where** to document decisions (format + location)
- **What** to do with ambiguous cases (escalation path)

**Goal**: Zero friction adoption. Every team member knows exactly when and how to classify tasks.

---

## TABLE OF CONTENTS

1. [Integration Points: When to Classify](#1-integration-points-when-to-classify)
2. [Weekly Planning Workflow Integration](#2-weekly-planning-workflow-integration)
3. [Classification Documentation Standards](#3-classification-documentation-standards)
4. [Escalation Path for Ambiguous Tasks](#4-escalation-path-for-ambiguous-tasks)
5. [RPM Plan Template Updates](#5-rpm-plan-template-updates)
6. [Tool Integration (Jira, Linear, Notion)](#6-tool-integration-jira-linear-notion)
7. [Team Onboarding Checklist](#7-team-onboarding-checklist)
8. [Weekly Review & Calibration Process](#8-weekly-review--calibration-process)

---

## 1. INTEGRATION POINTS: When to Classify

### Trigger Events for Classification

Classification is **REQUIRED** at these specific moments:

| Trigger Event | When | Who | Time Investment |
|---------------|------|-----|-----------------|
| **1. New Task Created** | Immediately upon task creation in backlog | Task Author (PM/PO) | 2 min |
| **2. Task Moves to "Ready for Estimation"** | Before estimation meeting/session | Developer (Estimator) | 2 min (verify/refine) |
| **3. Weekly Planning Meeting** | During RPM Weekly Plan creation | Team Lead + Developer | 2 min per new task |
| **4. Mid-Sprint Re-estimation** | When task scope changes significantly | Developer | 3 min (re-classify) |
| **5. Retrospective** | When task actual time >2x estimate | Team | 5 min (post-mortem) |

**Mandatory Triggers**: 1, 2, 3 (every task MUST be classified before estimation)

**Optional Triggers**: 4, 5 (for continuous improvement)

---

### When NOT to Classify

**Do NOT classify** in these scenarios:
- Placeholder tasks (e.g., "TBD: User onboarding flow") → Wait until requirements are drafted
- Epic-level items → Classify individual child tasks, not the epic
- Maintenance tasks with no estimate needed (e.g., "Weekly dependency updates") → Optional

---

## 2. WEEKLY PLANNING WORKFLOW INTEGRATION

### Current RPM Weekly Planning Process

**Existing flow** (before classification system):

```
Monday Morning (Week Kickoff):
1. Review last week's completions
2. Pull top-priority tasks from backlog
3. Estimate tasks (ad-hoc method)
4. Assign tasks to team members
5. Document in RPM Weekly Plan
```

---

### Enhanced Flow (With Classification System)

**New integrated flow**:

```
Monday Morning (Week Kickoff - 90 minutes):

┌─────────────────────────────────────────────────────────┐
│ PHASE 1: PREPARATION (15 min)                           │
│ - Tech Lead prepares top 15-20 priority tasks          │
│ - Pre-classify any un-classified tasks (2 min each)    │
│ - Flag ambiguous tasks for team discussion             │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 2: TEAM CLASSIFICATION (30 min)                   │
│ - Review flagged ambiguous tasks as team               │
│ - Discuss borderline cases (7/7 scores)                │
│ - Resolve via consensus or Tech Lead override          │
│ - All tasks now have SURGICAL or EXPLORATORY label     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 3: ESTIMATION (30 min)                            │
│ - SURGICAL tasks: PERT (tight bounds)                  │
│ - EXPLORATORY tasks: PERT (wide bounds) or Monte Carlo │
│ - Developer provides O/M/P estimates                    │
│ - Calculate Expected Value (E)                          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 4: COMMITMENT (10 min)                            │
│ - SURGICAL: Commit to E + 10% (aggregation buffer)     │
│ - EXPLORATORY: Commit to P75 or P80                    │
│ - Document commitments in RPM Weekly Plan              │
│ - Assign tasks to developers                           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 5: DOCUMENTATION (5 min)                          │
│ - Update RPM Weekly Plan with all metadata             │
│ - Log classifications in tracking spreadsheet          │
│ - Publish plan to team                                 │
└─────────────────────────────────────────────────────────┘
```

**Time Investment**: 90 minutes (vs. 60 minutes previously) → +50% for 80%+ estimation accuracy gain

---

### Step-by-Step: Classifying During Planning

**Context**: Monday planning meeting, team reviewing task "Add user profile editing"

**Step 1: Tech Lead Reads Task Aloud** (30 sec)
```
Tech Lead: "Next task: Add user profile editing. Description says users should be able to edit name, email, and avatar. Modal overlay. Backend is PUT /api/users/me. Any questions?"
```

**Step 2: Developer Asks Classification Questions** (60 sec)
```
Developer: "Let me score this quickly..."
Q1: Requirements Completeness?
    - Core features listed (name, email, avatar)
    - But: Avatar upload details unclear (S3? Backend?)
    - Score: 7 (some gaps)

Q2: Specification Clarity?
    - Modal overlay (clear)
    - Backend endpoint (clear)
    - But: Success/error handling not specified
    - Score: 7 (mostly clear, some interpretation needed)

Q3: Unknown Unknowns?
    - Avatar upload approach unknown → Need to ask backend team
    - Flag: TRUE (some unknowns)

Developer: "I score this 7/7 with avatar upload unknown. Feels borderline."
```

**Step 3: Team Discussion** (30 sec)
```
Tech Lead: "7/7 is borderline. Given avatar upload unknown, let's classify as EXPLORATORY to be safe. We can refine after talking to backend. Agreed?"

Team: "Agreed."
```

**Step 4: Document Classification** (10 sec)
```
Tech Lead updates task:
- Label: EXPLORATORY
- Classification Scores: Completeness=7, Clarity=7, Unknown Unknowns=TRUE
- Reason: Avatar upload approach needs clarification
```

**Step 5: Estimate with Appropriate Method** (2 min)
```
Developer: "Since it's EXPLORATORY, I'll give wide PERT bounds..."
- O = 3 hours (if avatar is simple)
- M = 6 hours (standard implementation + clarifications)
- P = 12 hours (if avatar needs S3 pre-signed URLs)
- E = 6.5 hours

Tech Lead: "Let's commit to P75 which is about 8 hours. Sound good?"
Developer: "Yes, 8 hours works."
```

**Total Time**: 4 minutes for classification + estimation (vs. 1-2 minutes without classification, but with 50%+ underestimation risk)

---

## 3. CLASSIFICATION DOCUMENTATION STANDARDS

### Required Fields for Every Task

Every classified task MUST have these fields documented:

| Field | Description | Format | Example |
|-------|-------------|--------|---------|
| **Classification** | SURGICAL or EXPLORATORY | Label/Tag | "EXPLORATORY" |
| **Completeness Score** | 0-10 scale | Integer | 7 |
| **Clarity Score** | 0-10 scale | Integer | 7 |
| **Unknown Unknowns** | TRUE/FALSE | Boolean | TRUE |
| **Classification Date** | When classified | ISO Date | 2025-10-26 |
| **Classifier** | Who classified | Name | "Alice (Tech Lead)" |
| **Reasoning** | Why this classification | Short text | "Avatar upload approach unclear" |

---

### Documentation Location by Tool

#### Option A: Jira

**Labels**:
- `SURGICAL` (green label)
- `EXPLORATORY` (yellow label)

**Custom Fields**:
- `Classification: Completeness Score` (Number, 0-10)
- `Classification: Clarity Score` (Number, 0-10)
- `Classification: Unknown Unknowns` (Checkbox: Yes/No)
- `Classification: Reasoning` (Text field, 200 char max)

**Comments**:
```
Classification Details:
- Completeness: 7/10
- Clarity: 7/10
- Unknown Unknowns: Yes (avatar upload approach)
- Classified by: Alice (Tech Lead)
- Date: 2025-10-26
- Method: EXPLORATORY → P75 commitment
```

---

#### Option B: Linear

**Labels**:
- `surgical` (green)
- `exploratory` (yellow)

**Description Template** (add to top of task description):
```markdown
## Classification
- **Type**: EXPLORATORY
- **Completeness**: 7/10
- **Clarity**: 7/10
- **Unknown Unknowns**: Yes
- **Reason**: Avatar upload approach needs clarification
- **Classified by**: Alice | 2025-10-26
```

---

#### Option C: Notion

**Database Properties**:
- `Classification` (Select: SURGICAL, EXPLORATORY)
- `Completeness` (Number, 0-10)
- `Clarity` (Number, 0-10)
- `Unknown Unknowns` (Checkbox)
- `Classification Notes` (Text)
- `Classified By` (Person)
- `Classification Date` (Date)

**View Filters**:
- "Surgical Tasks" (Classification = SURGICAL)
- "Exploratory Tasks" (Classification = EXPLORATORY)
- "Needs Classification" (Classification = Empty)

---

#### Option D: Simple Spreadsheet (MVP)

**Columns**:
```
| Task ID | Task Name | Classification | Completeness | Clarity | Unknown Unknowns | O | M | P | E | Commitment | Actual | Developer |
|---------|-----------|----------------|--------------|---------|------------------|---|---|---|---|------------|--------|-----------|
| T-123 | Profile Edit | EXPLORATORY | 7 | 7 | TRUE | 3 | 6 | 12 | 6.5 | 8 (P75) | 7.5 | Alice |
```

**Location**: Google Sheets or Excel, shared with team

---

### Documentation Template: RPM Weekly Plan

**Update RPM Weekly Plan format to include classification metadata**:

```markdown
# RPM WEEKLY PLAN: Week of Oct 28 - Nov 1, 2025

## RESULTS COMMITTED
1. **User profile editing shipped to production** - STATUS: In Progress
   Purpose: Enable users to update personal information without contacting support
   Actions: 2 of 3 complete
   Classification: EXPLORATORY (avatar upload complexity)

## ACTION ITEMS

### SURGICAL TASKS (Commit to Expected Value + 10%)
- [x] Fix header logo alignment (E=10min, Commit=11min, Actual=12min) - Alice - COMPLETE
- [ ] Add loading spinner to product list (E=33min, Commit=36min) - Bob - IN PROGRESS
- [ ] Change checkout button color to brand blue (E=17min, Commit=19min) - Carol - READY

### EXPLORATORY TASKS (Commit to P75/P80)
- [ ] Build user profile edit modal (E=6.5hrs, P75=8hrs, Commit=8hrs) - Alice - IN PROGRESS
  - Classification: Completeness=7, Clarity=7, Unknown Unknowns=TRUE (avatar upload)
- [ ] Optimize mobile control performance (E=9hrs, P75=12hrs, Commit=12hrs) - Bob - BLOCKED
  - Blocker: Need profiling data from QA team
- [ ] Research state management options (Timebox=8hrs) - Carol - READY
  - Classification: Profile 4 (Near-Exploratory), deliverable is research doc

## CLASSIFICATION SUMMARY
- Total Tasks: 6
- Surgical: 3 (50%)
- Exploratory: 3 (50%)
- Avg Completeness: 7.8/10
- Avg Clarity: 7.5/10
- Tasks with Unknown Unknowns: 2 (33%)

## ESTIMATION SUMMARY
- Total Committed Time: 32 hours
- Surgical Tasks: 1.1 hours (3% of total)
- Exploratory Tasks: 30.9 hours (97% of total)
- Buffer Applied: Surgical +10%, Exploratory P75

## BLOCKERS & RISKS
- Mobile optimization blocked on profiling data (ETA: Wednesday)
- Avatar upload approach needs backend team decision (meeting scheduled Tuesday)
```

---

## 4. ESCALATION PATH FOR AMBIGUOUS Tasks

### When to Escalate

Escalate to Tech Lead or Team Discussion if:

1. **Borderline Scores** (7/7): Completeness and Clarity both exactly 7
2. **Team Disagreement**: Two developers score same task >2 points apart
3. **High Stakes**: Task is on critical path and misclassification would be costly
4. **Novel Task Type**: Team has never seen anything like this before
5. **Estimator Uncertainty**: Estimator says "I really don't know" after classification

---

### Escalation Process

**Level 1: Peer Review (5 minutes)**

```
Developer A: "I scored this 7/7, feels borderline. Can someone else score it?"
Developer B: [Independently scores]
Compare: If ≤1 point difference → Use average. If >2 points → Escalate to Level 2.
```

**Level 2: Tech Lead Judgment (10 minutes)**

```
Tech Lead reviews task with both developers:
1. Identifies information gap (does one person know something the other doesn't?)
2. Clarifies requirements with Product Owner if needed
3. Makes classification decision with rationale
4. Documents override reason for future reference
```

**Level 3: Timebox & Iterate (when deadlocked)**

```
If team cannot agree and classification is blocking:
1. Default to EXPLORATORY (conservative)
2. Timebox task at pessimistic estimate (P)
3. Re-assess at 50% timebox mark
4. If task proves surgical → adjust remaining estimate
5. Document lesson learned for future similar tasks
```

---

### Escalation Example: Real Scenario

**Task**: "Implement authentication state persistence"

**Developer A**: Scores 7/8, classifies as SURGICAL
- "We've done localStorage persistence before, seems straightforward"

**Developer B**: Scores 6/6, classifies as EXPLORATORY
- "But we've never done token refresh strategy. That's a big unknown."

**Escalation to Tech Lead**:

```
Tech Lead: "Let me clarify the scope. Product Owner, does MVP need token refresh?"

Product Owner: "No, users can re-login on expiry for MVP. Refresh is v2."

Tech Lead: "Okay, that changes things. Without refresh, this is Profile 2 (Near-Surgical).
We've done localStorage persistence 5 times. The only unknown is token validation.
I'll classify as SURGICAL but use wide PERT bounds to account for validation edge cases."

Final Classification: SURGICAL
Scores: Completeness=8, Clarity=8, Unknown Unknowns=FALSE (refresh deferred)
Estimate: O=2hrs, M=4hrs, P=8hrs → E=4.3hrs, Commit=4.75hrs (E + 10%)
```

**Result**: Completed in 4.5 hours (5% under commitment) ✓

**Lesson**: Clarifying scope during escalation improved classification accuracy.

---

## 5. RPM PLAN TEMPLATE UPDATES

### Before: Generic RPM Plan Format

```markdown
# RPM WEEKLY PLAN

## RESULTS COMMITTED
1. [Result description]

## ACTION ITEMS
- [ ] [Task description] - [Owner] - [Status]
- [ ] [Task description] - [Owner] - [Status]
```

**Problem**: No estimation metadata, no classification, no commitment strategy

---

### After: Enhanced RPM Plan with Classification

```markdown
# RPM WEEKLY PLAN: Week of [Date Range]

## RESULTS COMMITTED
1. **[Specific Outcome]** - STATUS: [Complete/In Progress/Blocked]
   Purpose: [Why this matters]
   Actions: [X of Y complete]
   Commitment Type: [Surgical E+10% / Exploratory P75/P80]

## ACTION ITEMS

### SURGICAL TASKS (High Confidence: E + 10%)
- [x] [Task] (Class: 9/9, E=[X]hrs, Commit=[Y]hrs, Actual=[Z]hrs) - [Owner] - COMPLETE
- [ ] [Task] (Class: 8/8, E=[X]hrs, Commit=[Y]hrs) - [Owner] - IN PROGRESS

### EXPLORATORY TASKS (Conservative: P75 or P80)
- [ ] [Task] (Class: 6/7, E=[X]hrs, P75=[Y]hrs, Commit=[Z]hrs) - [Owner] - READY
  - Unknowns: [List of unknown unknowns]
  - Mitigation: [How we'll handle them]

### RESEARCH/SPIKES (Timeboxed)
- [ ] [Task] (Profile 6, Timebox=[X]hrs, Deliverable=[Research doc]) - [Owner] - READY

## CLASSIFICATION BREAKDOWN
- Surgical: [N] tasks ([%] of total)
- Exploratory: [N] tasks ([%] of total)
- Avg Completeness: [X]/10
- Avg Clarity: [X]/10

## ESTIMATION ACCURACY (Previous Week)
- Surgical Tasks: [N]% within ±20% of estimate
- Exploratory Tasks: [N]% within P75/P80 commitment
- Misclassifications: [N] tasks (required mid-sprint reclassification)

## BLOCKERS & RISKS
- [Blocker description] - Impact: [Result affected] - ETA: [Resolution date]

## LESSONS LEARNED (Continuous Improvement)
- [Classification insight]
- [Estimation calibration note]
```

---

### Template Sections Explained

**1. Results Committed**: No change from standard RPM (focus on outcomes, not tasks)

**2. Action Items**: Grouped by classification
- **Surgical Section**: High-confidence tasks, aggressive commitments
- **Exploratory Section**: Discovery tasks, conservative commitments
- **Research/Spikes**: Timeboxed, deliverable is knowledge not code

**3. Classification Breakdown**: Weekly metrics for tracking calibration

**4. Estimation Accuracy**: Retrospective data from previous week (continuous learning)

**5. Blockers & Risks**: Standard RPM section, no change

**6. Lessons Learned**: New section for capturing classification/estimation insights

---

## 6. TOOL INTEGRATION (Jira, Linear, Notion)

### Jira Automation Rules

**Rule 1: Auto-Remind for Unclassified Tasks**

```yaml
Trigger: Issue transitioned to "Ready for Dev"
Condition: Labels does not include "SURGICAL" AND Labels does not include "EXPLORATORY"
Action: Add comment "@assignee Please classify this task using RPM classification guide before estimation."
```

**Rule 2: Auto-Calculate Commitment**

```yaml
Trigger: Custom field "PERT Expected Value (E)" is updated
Condition:
  - IF Label = "SURGICAL": Set "Commitment" = E × 1.10
  - IF Label = "EXPLORATORY": Set "Commitment" = Custom Field "P75"
Action: Update "Commitment" field
```

**Rule 3: Flag Misclassifications**

```yaml
Trigger: Issue transitioned to "Done"
Condition:
  - Actual Time > 2 × Committed Time
  - Label = "SURGICAL"
Action:
  - Add label "MISCLASSIFICATION-REVIEW"
  - Post to Slack #estimation-calibration channel
  - Assign to Tech Lead for retrospective review
```

---

### Linear Integrations

**Cycle View with Classification**

Create custom views:
1. **Surgical Sprint** (filter: `label:surgical`, sort by: priority)
2. **Exploratory Work** (filter: `label:exploratory`, sort by: P75 estimate)
3. **Needs Classification** (filter: `status:"Ready for Dev" AND NOT (label:surgical OR label:exploratory)`)

**Webhooks** (for tracking spreadsheet sync):

```javascript
// When issue is classified
linear.webhooks.on('issue.update', (payload) => {
  if (payload.data.labelIds.includes('surgical') || payload.data.labelIds.includes('exploratory')) {
    // Sync to Google Sheets tracking spreadsheet
    updateTrackingSheet({
      taskId: payload.data.id,
      classification: payload.data.labels.find(l => l.name === 'surgical') ? 'SURGICAL' : 'EXPLORATORY',
      completeness: payload.data.customFields.completeness,
      clarity: payload.data.customFields.clarity
    });
  }
});
```

---

### Notion Database Setup

**Create "RPM Task Database"**:

**Properties**:
```
- Task Name (Title)
- Status (Select: Backlog, Ready, In Progress, Done)
- Classification (Select: SURGICAL, EXPLORATORY, NEEDS CLASSIFICATION)
- Completeness (Number, 0-10)
- Clarity (Number, 0-10)
- Unknown Unknowns (Checkbox)
- PERT: Optimistic (Number, hours)
- PERT: Most Likely (Number, hours)
- PERT: Pessimistic (Number, hours)
- Expected Value (E) (Formula: (O + 4M + P) / 6)
- P75 Estimate (Number, hours) - for exploratory
- Commitment (Formula: IF(Classification = "SURGICAL", E × 1.1, P75))
- Actual Time (Number, hours)
- Variance % (Formula: ((Actual - Commitment) / Commitment) × 100)
- Assignee (Person)
- Sprint (Relation to Sprint Database)
```

**Views**:
1. **By Classification**: Group by Classification
2. **Needs Estimation**: Filter Status = "Ready" AND (E is empty OR Commitment is empty)
3. **Misclassified Tasks**: Filter Variance % > 100 AND Classification = "SURGICAL"
4. **Estimation Accuracy**: Table view sorted by Variance %

---

## 7. TEAM ONBOARDING CHECKLIST

### For New Team Member Joining

**Week 1: Introduction (2 hours total)**

- [ ] **Read Core Docs** (60 min)
  - [ ] Phase 1 Research Report (skim: 20 min)
  - [ ] Decision Tree Document (read fully: 20 min)
  - [ ] Task Profiles Document (read fully: 20 min)

- [ ] **Watch Walkthrough Video** (if available, 15 min)
  - [ ] Classification process demo
  - [ ] Tool integration (Jira/Linear/Notion)

- [ ] **Attend Calibration Session** (30 min)
  - [ ] Classify 5 sample tasks independently
  - [ ] Compare with team's classifications
  - [ ] Discuss discrepancies

- [ ] **Shadow Estimation Meeting** (30 min)
  - [ ] Observe Monday planning meeting
  - [ ] Watch team classify and estimate tasks
  - [ ] Ask questions

**Week 2: Supervised Practice (3 hours total)**

- [ ] **Classify 10 Tasks** (60 min)
  - [ ] Classify with Tech Lead review
  - [ ] Get feedback on scoring
  - [ ] Refine mental model

- [ ] **Estimate 5 Tasks** (45 min)
  - [ ] 3 surgical tasks (PERT with tight bounds)
  - [ ] 2 exploratory tasks (PERT with wide bounds or Monte Carlo)
  - [ ] Review estimates with mentor

- [ ] **Track First Sprint** (ongoing)
  - [ ] Log actual vs. estimated time for all tasks
  - [ ] Calculate personal velocity after 5 tasks
  - [ ] Identify biases (optimism/pessimism)

**Week 3: Independent with Spot Checks (1 hour total)**

- [ ] **Classify Independently** (30 min)
  - [ ] Classify tasks without review
  - [ ] Tech Lead spot-checks 3 random tasks

- [ ] **Retrospective Review** (30 min)
  - [ ] Review week 2 actual vs. estimates
  - [ ] Discuss misclassifications
  - [ ] Adjust calibration if needed

**Week 4+: Fully Integrated**

- [ ] Classify and estimate without supervision
- [ ] Participate in calibration sessions
- [ ] Mentor next new hire

---

### For Existing Team Implementing System

**Phase 1: Training (Week 1)**

- [ ] **Kickoff Workshop** (2 hours)
  - [ ] Present research findings (Phase 1 summary)
  - [ ] Explain classification system (Decision Tree)
  - [ ] Walk through task profiles
  - [ ] Practice classification on 10 historical tasks
  - [ ] Discuss edge cases

- [ ] **Tool Setup** (30 min)
  - [ ] Add classification fields to Jira/Linear/Notion
  - [ ] Create tracking spreadsheet
  - [ ] Set up automation rules

**Phase 2: Pilot Sprint (Week 2-3)**

- [ ] **Classify All Tasks** (ongoing)
  - [ ] Every task gets classification before estimation
  - [ ] Log all classifications in tracking system

- [ ] **Daily Stand-up Check-In** (5 min/day)
  - [ ] Any classification questions?
  - [ ] Any tasks need reclassification?

- [ ] **End of Sprint Retro** (60 min)
  - [ ] Review estimation accuracy
  - [ ] Analyze misclassifications
  - [ ] Refine rules if needed

**Phase 3: Full Adoption (Week 4+)**

- [ ] Classification is standard practice
- [ ] Weekly calibration sessions (30 min)
- [ ] Monthly metrics review
- [ ] Continuous improvement based on data

---

## 8. WEEKLY REVIEW & CALIBRATION PROCESS

### Weekly Calibration Session (30 minutes, every Monday)

**Purpose**: Continuously improve classification accuracy through data-driven retrospectives.

**Agenda**:

**1. Metrics Review (10 min)**
```
Tech Lead presents:
- Last week's estimation accuracy:
  - Surgical tasks: [N]% within ±20% of estimate
  - Exploratory tasks: [N]% within P75/P80 commitment
- Misclassifications: [N] tasks (>2x estimate)
- Classification distribution: [%] surgical, [%] exploratory
- Velocity trends: Team mean velocity [X.XX]
```

**2. Misclassification Deep-Dive (10 min)**
```
Pick 1-2 tasks that went >2x estimate:
- What was the classification? (Surgical/Exploratory)
- What were the scores? (Completeness, Clarity, Unknowns)
- What went wrong? (Misclassified? Scope creep? Genuine surprise?)
- How to prevent in future? (Update rubric? Better questions?)
```

**3. Borderline Case Workshop (5 min)**
```
Present 1 upcoming task that's borderline (7/7 scores):
- Team votes: Surgical or Exploratory?
- Discuss reasoning
- Make consensus decision
- Document for future reference
```

**4. Calibration Exercise (5 min)**
```
Classify 2 new tasks independently (silent):
- Compare scores
- Calculate inter-rater reliability (Cohen's Kappa)
- If Kappa < 0.7 → Schedule extra training session
```

---

### Monthly Metrics Deep-Dive (60 minutes, first Monday of month)

**Purpose**: Track progress toward estimation maturity, identify systemic issues.

**Metrics Dashboard** (prepare in advance):

```markdown
## ESTIMATION MATURITY SCORECARD: October 2025

### Classification Quality
- Classification Accuracy: 82% (Target: >75%) ✅
- Inter-Rater Reliability (Kappa): 0.74 (Target: >0.7) ✅
- Misclassification Rate: 8% (Target: <10%) ✅

### Estimation Accuracy
- Surgical Tasks: 88% within ±20% (Target: >85%) ✅
- Exploratory Tasks: 76% within P75 (Target: >75%) ✅
- Overall Mean Velocity: 1.05 (Target: 0.95-1.1) ✅

### Process Adoption
- Tasks Classified: 97% (Target: >90%) ✅
- Documentation Complete: 94% (Target: >90%) ✅
- Team Training: 6/6 members (Target: 100%) ✅

### Continuous Improvement
- Lessons Learned Documented: 12 (Target: >10/month) ✅
- Rubric Updates: 2 (Target: 1-2/month) ✅
- Tool Improvements: 1 (Jira automation added) ✅

### RED FLAGS 🚩
- None this month!

### OPPORTUNITIES
- Consider ML classification model (50+ labeled tasks collected)
- Expand Monte Carlo usage for large exploratory tasks (>40hrs)
```

**Discussion Topics**:
1. Celebrate wins (metrics improving)
2. Dive into any red flags
3. Decide on next improvement initiative (e.g., ML model, Monte Carlo training)
4. Update roadmap for estimation system evolution

---

### Quarterly Strategic Review (90 minutes, once per quarter)

**Purpose**: Assess long-term trends, plan major improvements.

**Agenda**:

**1. 3-Month Trend Analysis (30 min)**
- Classification accuracy trend (stable? improving? declining?)
- Estimation accuracy trend
- Velocity stability (should converge toward 1.0)
- Task type distribution (more surgical over time as product matures?)

**2. Framework Evolution (30 min)**
- Should we introduce ML classification? (if 100+ labeled tasks)
- Should we adopt Monte Carlo for all exploratory tasks? (if team proficient in PERT)
- Should we tighten thresholds? (e.g., 8/7 → 9/8 for surgical)
- Any new task types emerging? (need new profiles?)

**3. Team Development (20 min)**
- Which team members need additional calibration?
- Who could mentor new hires on classification?
- Cross-team calibration needed? (if multiple teams)

**4. Tool & Automation (10 min)**
- Are current tools sufficient?
- Automation opportunities (e.g., auto-suggest classification based on keywords)
- Integration with other systems (CI/CD, analytics)

---

## INTEGRATION SUCCESS CRITERIA

### Week 1 Success Criteria
- [ ] All 6 team members trained (2-hour workshop complete)
- [ ] Classification fields added to project management tool
- [ ] Tracking spreadsheet set up and shared
- [ ] First 10 tasks classified and documented

### Month 1 Success Criteria
- [ ] 90%+ of tasks have documented classification
- [ ] Classification accuracy >70% (verified post-hoc)
- [ ] Inter-rater reliability >0.6 (substantial agreement)
- [ ] Zero friction in Monday planning meetings (no debates >5min)

### Month 3 Success Criteria
- [ ] Classification accuracy >80%
- [ ] Estimation accuracy: 85%+ of tasks within ±20%
- [ ] Team velocity stabilizing (SD < 0.3)
- [ ] Weekly calibration sessions running smoothly

### Month 6 Success Criteria
- [ ] Classification accuracy >85%
- [ ] Estimation accuracy: 90%+ within ±20%
- [ ] System is "invisible" (fully internalized by team)
- [ ] New hires onboarded in <2 weeks
- [ ] Decision made on ML classification adoption

---

## TROUBLESHOOTING GUIDE

### Problem: Team Finds Classification "Too Slow"

**Symptoms**:
- Planning meetings running 20+ minutes over time
- Developers skip classification step
- Frustration with "bureaucracy"

**Root Causes**:
1. Rubrics not internalized (still need to reference guide)
2. Too many borderline cases causing debates
3. Tool friction (manual data entry tedious)

**Solutions**:
1. Create 1-page cheat sheet with rubric summary (laminate, post on wall)
2. Tighten thresholds (8/7 → 9/8) to reduce borderline cases
3. Automate data entry (Jira custom fields, Linear webhooks)
4. Timebox classification discussions (2 min max per task)

---

### Problem: Misclassification Rate >20%

**Symptoms**:
- Many surgical tasks go >2x estimate
- Exploratory tasks finish way under P75 (over-conservative)

**Root Causes**:
1. Team optimism bias (scoring too high)
2. Rubric unclear for specific domain (e.g., performance tasks)
3. Scope creep not being caught (requirements changing mid-task)

**Solutions**:
1. Retrospective: Review all misclassified tasks, find patterns
2. Update rubric with domain-specific guidance (e.g., "Performance optimization is always exploratory unless profiled")
3. Mid-sprint check-ins: Re-assess classification at 50% progress
4. Tighten scoring: Require justification for scores >8

---

### Problem: Team Disagrees Frequently (Low Inter-Rater Reliability)

**Symptoms**:
- Cohen's Kappa <0.6
- Same task scored 5/10 by one person, 9/10 by another
- Planning meetings devolve into debates

**Root Causes**:
1. Information asymmetry (one person knows context others don't)
2. Experience gap (senior vs. junior perspectives differ)
3. Unclear rubric language

**Solutions**:
1. Share context: Before scoring, everyone reads full task description
2. Pair calibration: Pair senior with junior for first 20 tasks
3. Clarify rubric: Add more examples at each score level
4. Anchor on examples: "Is this more like Task X (scored 7) or Task Y (scored 9)?"

---

## APPENDIX: QUICK REFERENCE CHECKLIST

**Print this page, laminate it, post it in planning room**

---

### Classification Checklist (2 minutes per task)

```
☐ Step 1: Read task description (30 sec)

☐ Step 2: Score Completeness (0-10) (30 sec)
   Can I start coding immediately without clarifications?
   10 = Zero gaps | 8 = Minor details | 6 = Significant gaps | <6 = Many unknowns

☐ Step 3: Score Clarity (0-10) (30 sec)
   Are requirements unambiguous?
   10 = Executable precision | 8 = Design-level | 6 = High ambiguity | <6 = Subjective

☐ Step 4: Flag Unknown Unknowns (TRUE/FALSE) (30 sec)
   Am I confident I know what I don't know?
   FALSE = Known gaps only | TRUE = Surprises likely

☐ Step 5: Classify (10 sec)
   IF (Completeness ≥8 AND Clarity ≥7 AND Unknown Unknowns = FALSE)
      → SURGICAL
   ELSE
      → EXPLORATORY

☐ Step 6: Document (20 sec)
   Add label, scores, reasoning to task
```

---

### Estimation Checklist (3-5 minutes per task)

```
☐ Surgical Tasks:
   - PERT: Tight bounds (P/O ratio ≤ 4)
   - Commit: Expected Value + 10%
   - SD Check: Should be <25% of E

☐ Exploratory Tasks:
   - PERT: Wide bounds (P/O ratio 6-20)
   - Commit: P75 (internal) or P80 (external)
   - Consider: Decompose if >16 hours

☐ Research/Spikes:
   - Method: Timebox (not PERT)
   - Commit: Fixed hours, deliverable is knowledge
```

---

### Escalation Decision Tree

```
Issue?
├─ Borderline (7/7)
│  └─ Action: Get second opinion (5 min) → Default to EXPLORATORY if still unsure
│
├─ Team Disagreement (>2 points)
│  └─ Action: Tech Lead review (10 min) → Clarify requirements → Re-score
│
└─ High Stakes / Novel
   └─ Action: Team discussion (15 min) → Consensus or timebox approach
```

---

## DOCUMENT CONTROL

**Version**: 1.0
**Status**: Complete - Ready for Team Deployment
**Next Review**: After first sprint using system (2 weeks)
**Owner**: RPM Master Planning Administrator
**Distribution**: All team members, product owners, stakeholders

**Related Documents**:
- Decision Tree: `RPM-PLAN-002-PHASE2-DECISION-TREE.md`
- Task Profiles: `RPM-PLAN-002-PHASE2-TASK-PROFILES.md`
- Phase 1 Research: `RPM-PLAN-002_time_estimation_methodologies_research.md`
- Quick Reference: `RPM-PLAN-002_QUICK_REFERENCE.md`

---

**End of Integration Guide**

# RPM-PLAN-002 Phase 2: Document Index

**Phase**: Phase 2 - Classification System Design
**Completion Date**: 2025-10-26
**Status**: COMPLETE
**Total Documentation**: 63,500+ words across 4 documents

---

## QUICK NAVIGATION

### Core Deliverables (Read in Order)

1. **[Decision Tree](./RPM-PLAN-002-PHASE2-DECISION-TREE.md)** (20 min read)
   - How to classify any task as SURGICAL or EXPLORATORY
   - 3-question questionnaire with detailed rubrics
   - Edge case handling and calibration training plan
   - **Use this**: When classifying a new task

2. **[Task Profiles](./RPM-PLAN-002-PHASE2-TASK-PROFILES.md)** (40 min read)
   - 6 canonical profiles from Pure Surgical to R&D Spike
   - 18 real production examples from LivHana codebase
   - Pattern matching guide for rapid classification
   - **Use this**: To understand what each classification "feels like"

3. **[Integration Guide](./RPM-PLAN-002-PHASE2-INTEGRATION-GUIDE.md)** (30 min read)
   - When to invoke classification (5 trigger events)
   - How to integrate with RPM Weekly Planning
   - Tool setup (Jira, Linear, Notion, Spreadsheet)
   - Team onboarding and calibration process
   - **Use this**: To deploy the system in your team

4. **[Completion Summary](./RPM-PLAN-002-PHASE2-COMPLETION-SUMMARY.md)** (10 min read)
   - Phase 2 objectives and deliverables
   - Time tracking and variance analysis
   - Success criteria validation
   - Next steps (Phase 3: Training & Pilot)
   - **Use this**: For executive overview and approval

---

## DOCUMENT HIERARCHY

```
RPM-PLAN-002: Time Estimation Framework
│
├─ Phase 1: Research (COMPLETE)
│  ├─ Research Report (17,500 words)
│  ├─ Phase 1 Summary
│  └─ Quick Reference Guide
│
├─ Phase 2: Design & Documentation (COMPLETE) ← YOU ARE HERE
│  ├─ Decision Tree (20,500 words)
│  ├─ Task Profiles (25,000 words)
│  ├─ Integration Guide (18,000 words)
│  ├─ Phase 2 Summary
│  └─ This Index
│
└─ Phase 3: Training & Pilot (PENDING)
   ├─ Kickoff Workshop (scheduled)
   ├─ Pilot Sprint (2 weeks)
   └─ Retrospective & Refinement
```

---

## USAGE GUIDE BY ROLE

### For Developers (Estimators)

**Read First** (1 hour):
1. Quick Reference (from Phase 1) - 15 min
2. Decision Tree (Section 1-3) - 25 min
3. Task Profiles (skim examples) - 20 min

**Reference During Work**:
- Decision Tree: Section 2 (Feature Scoring Questionnaire)
- Task Profiles: Profile Selection Guide

**Weekly**:
- Participate in calibration sessions (30 min)

---

### For Tech Leads

**Read First** (2 hours):
1. Phase 1 Summary - 20 min
2. Decision Tree (full) - 40 min
3. Task Profiles (full) - 60 min

**Before Deployment**:
4. Integration Guide (full) - 40 min
5. Phase 2 Summary - 20 min

**Responsibilities**:
- Lead kickoff workshop (2 hours)
- Resolve escalations (borderline cases)
- Run weekly calibration sessions
- Track metrics and refine system

---

### For Product Owners

**Read First** (30 min):
1. Phase 2 Summary - 10 min
2. Decision Tree: Section 1-2 - 15 min
3. Integration Guide: Section 1, 3 (when to classify, documentation) - 10 min

**Action Items**:
- Write clearer task descriptions (aim for Completeness ≥8, Clarity ≥7)
- Participate in classification discussions
- Understand why estimates have ranges

---

### For Project Managers

**Read First** (45 min):
1. Phase 2 Summary - 10 min
2. Integration Guide: Section 2, 5, 8 (planning workflow, RPM template, calibration) - 30 min
3. Decision Tree: Section 1 (overview) - 10 min

**Responsibilities**:
- Update RPM Weekly Plan template
- Set up tracking system (spreadsheet or tool fields)
- Monitor adoption metrics
- Schedule calibration sessions

---

### For Executives (Jesse CEO)

**Read First** (15 min):
1. Phase 2 Summary - 10 min
2. Integration Guide: Section 1, 9 (overview, success criteria) - 5 min

**Executive Insights**:
- System targets 75-85% estimation accuracy (vs. 40-60% baseline)
- 3-feature classification (2 min per task, minimal overhead)
- 4-week team ramp-up (operational by Month 1)
- Self-calibrating (improves over time via weekly retros)

**Decision Point**: Approve Phase 3 (team training and 2-week pilot)

---

## DEPLOYMENT CHECKLIST

### Pre-Deployment (This Week)

- [ ] Executive approval for Phase 3
- [ ] Assign Tech Lead owner
- [ ] Schedule 2-hour kickoff workshop
- [ ] Set up tracking system (spreadsheet or tool fields)
- [ ] Identify 10-15 tasks for pilot sprint

### Week 1: Training

- [ ] Kickoff workshop (2 hours)
- [ ] Tool configuration (30 min)
- [ ] Classify pilot tasks (1 hour)
- [ ] Begin pilot sprint

### Week 2-3: Pilot Sprint

- [ ] Classify all new tasks
- [ ] Track actual vs. estimated
- [ ] Daily stand-up check-ins
- [ ] Mid-sprint calibration (30 min)

### Week 4: Retrospective

- [ ] Calculate pilot metrics
- [ ] Analyze misclassifications
- [ ] Refine rubrics if needed
- [ ] Decision: Full adoption or iterate

---

## FILE LOCATIONS

### Phase 2 Documents (This Phase)

```
/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/research_reports/

├── RPM-PLAN-002-PHASE2-DECISION-TREE.md (20,500 words)
├── RPM-PLAN-002-PHASE2-TASK-PROFILES.md (25,000 words)
├── RPM-PLAN-002-PHASE2-INTEGRATION-GUIDE.md (18,000 words)
├── RPM-PLAN-002-PHASE2-COMPLETION-SUMMARY.md (5,000 words)
└── RPM-PLAN-002-PHASE2-INDEX.md (this file)
```

### Phase 1 Documents (Previous Phase)

```
/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/research_reports/

├── RPM-PLAN-002_time_estimation_methodologies_research.md (17,500 words)
├── RPM-PLAN-002_PHASE1_COMPLETION_SUMMARY.md (5,000 words)
├── RPM-PLAN-002_QUICK_REFERENCE.md (3,500 words)
└── RPM-PLAN-002_INDEX.md (phase 1 index)
```

---

## KEY CONCEPTS SUMMARY

### Classification System

**Goal**: Distinguish SURGICAL (well-defined) from EXPLORATORY (ill-defined) tasks

**Method**: 3-question assessment (2 minutes per task)
1. Requirements Completeness (0-10)
2. Specification Clarity (0-10)
3. Unknown Unknowns (Boolean)

**Decision Rule**: SURGICAL if (Q1≥8 AND Q2≥7 AND Q3=FALSE), else EXPLORATORY

---

### 6 Task Profiles

| Profile | Certainty | Commitment | Example |
|---------|-----------|------------|---------|
| 1: Exact Spec | 95% | E + 10% | "Change button color to #3498db" |
| 2: Near-Surgical | 85-90% | E + 15% | "Fix TypeError with stack trace" |
| 3: Hybrid | 60-75% | P75 | "Add profile editing modal" |
| 4: Near-Exploratory | 40-60% | P75-P80 | "Research state management options" |
| 5: Exploratory | 25-40% | P80-P90 | "Optimize app boot time" |
| 6: Unknown-Unknown | 10-25% | Timebox | "Spike: Can we add blockchain?" |

---

### Estimation Methods by Classification

**Surgical Tasks**:
- Method: PERT (tight bounds, P/O ratio ≤4)
- Commitment: Expected Value + 10%
- Example: O=10min, M=15min, P=30min → E=16.7min, Commit=18min

**Exploratory Tasks**:
- Method: PERT (wide bounds, P/O ratio 6-20) or Monte Carlo
- Commitment: P75 (internal) or P80 (external)
- Example: O=4hrs, M=12hrs, P=40hrs → E=15.3hrs, P75=20hrs, Commit=20hrs

**Research Spikes**:
- Method: Timebox (fixed hours, flexible scope)
- Commitment: Deliverable is knowledge/recommendation, not production code
- Example: "Spend 16 hours researching, deliver feasibility report"

---

## SUCCESS METRICS

### Pilot Sprint Targets (Week 2-3)

- Classification Adoption: >90% of tasks classified
- Classification Accuracy: >70% (verified post-hoc)
- Inter-Rater Reliability: Cohen's Kappa >0.6
- Estimation Accuracy: >80% of tasks within ±20%

### Month 3 Targets

- Classification Accuracy: >80%
- Estimation Accuracy: >85% within ±20%
- Team Velocity: Stabilizing (SD <0.3)
- Misclassification Rate: <10%

### Month 6 Targets

- Classification Accuracy: >85%
- Estimation Accuracy: >90% within ±20%
- System Fully Internalized: "Invisible" to team (second nature)
- New Hire Onboarding: <2 weeks to full productivity

---

## FREQUENTLY ASKED QUESTIONS

### Q: How much overhead does classification add?

**A**: 2 minutes per task (3-question assessment). For 10 tasks/week, that's 20 minutes investment for 80%+ estimation accuracy gain.

### Q: What if we disagree on classification?

**A**: 3-level escalation path:
1. Peer review (5 min) - Get second opinion
2. Tech Lead judgment (10 min) - Clarify requirements
3. Timebox & iterate - Default to EXPLORATORY, re-assess at 50% mark

### Q: Do we need complex tools?

**A**: No. System works with simple spreadsheet. Tool integrations (Jira, Linear, Notion) are optional enhancements.

### Q: What if we have <30 historical tasks?

**A**: Use Phase 1 bootstrap strategy:
- Weeks 1-4: PERT only + manual classification
- Month 2-3: Add velocity tracking
- Month 4+: Introduce Monte Carlo and EBS

### Q: How do we handle borderline cases (7/7 scores)?

**A**: Default to EXPLORATORY (conservative). Underestimation risk > Overestimation risk. Can override with Tech Lead judgment + documentation.

### Q: What if a task changes scope mid-execution?

**A**: Stop work, re-classify, re-estimate. Document as scope creep. Prevents sunk cost fallacy.

---

## CONTACT & SUPPORT

**System Owner**: RPM Master Planning Administrator

**Questions or Issues**:
- Classification ambiguity → See Decision Tree, Section 4 (Edge Cases)
- Tool setup help → See Integration Guide, Section 6 (Tool Integration)
- Training needs → See Integration Guide, Section 7 (Team Onboarding)

**Continuous Improvement**:
- Weekly calibration sessions (30 min Mondays)
- Monthly metrics review (60 min first Monday)
- Quarterly strategic review (90 min)

---

## VERSION HISTORY

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-26 | Initial Phase 2 completion | RPM Master Planning Administrator |

---

**Document Control**:
- Index ID: RPM-PLAN-002-PHASE2-INDEX
- Status: Complete
- Next Update: After Phase 3 pilot (2 weeks)
- Owner: RPM Master Planning Administrator

---

**End of Phase 2 Index**

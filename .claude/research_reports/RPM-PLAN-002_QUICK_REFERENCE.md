# RPM-PLAN-002: Time Estimation Quick Reference Guide

**Purpose**: Fast lookup for core concepts and formulas from the research report.

---

## CLASSIFICATION DECISION TREE

```
START: New Task
    ↓
Q1: Requirements Completeness ≥ 8?
    ├─ NO → EXPLORATORY
    └─ YES → Continue
         ↓
Q2: Specification Clarity ≥ 7?
    ├─ NO → EXPLORATORY
    └─ YES → Continue
         ↓
Q3: Unknown Unknowns Present?
    ├─ YES → EXPLORATORY
    └─ NO → Continue
         ↓
Q4: Scope Isolated OR Precedent Exists OR Tech Familiarity ≥ 8?
    ├─ NO → EXPLORATORY
    └─ YES → SURGICAL
```

**Rule of Thumb**: When in doubt, classify as EXPLORATORY.

---

## ESTIMATION FORMULAS

### PERT (3-Point Estimation)

**Inputs**:
- O = Optimistic (best case)
- M = Most Likely (realistic)
- P = Pessimistic (worst case)

**Expected Value**:
```
E = (O + 4M + P) / 6
```

**Standard Deviation**:
```
SD = (P - O) / 6
```

**Validation Check**:
- Surgical tasks: SD < 25% of E
- Exploratory tasks: SD typically 30-80% of E

**Example**:
- Bug fix: O=15min, M=30min, P=60min
- E = (15 + 4×30 + 60) / 6 = 32.5 min
- SD = (60 - 15) / 6 = 7.5 min (23% of E) → Surgical ✓

---

## COMMITMENT STRATEGY

| Context | Surgical Tasks | Exploratory Tasks |
|---------|----------------|-------------------|
| **Internal Planning** | PERT Expected Value | P50 (median) |
| **Team Commitments** | Expected Value + 10% buffer | P75 |
| **Client/Stakeholder** | Expected Value + 15% buffer | P80 |
| **Fixed Contract** | Expected Value + 20% buffer | P90 |

**Aggregation Rule**: When combining multiple tasks, add 10-15% to total for cumulative risk.

---

## MONTE CARLO CONFIDENCE LEVELS

| Percentile | Meaning | When to Use |
|------------|---------|-------------|
| **P50** | 50% confidence | Internal optimistic planning |
| **P75** | 75% confidence | Standard commitments |
| **P80** | 80% confidence | External clients, proposals |
| **P90** | 90% confidence | Fixed-price contracts |
| **P95** | 95% confidence | High-penalty scenarios |

**Example**: "50% chance we finish by Tuesday, 80% by Friday"

---

## EVIDENCE-BASED SCHEDULING (EBS)

### Velocity Calculation

**Per Task**:
```
Velocity = Actual Time / Estimated Time
```

**Per Developer** (after N tasks):
```
Mean Velocity = Σ(Actual/Estimate) / N
Velocity SD = Standard Deviation of all velocities
```

**Adjusted Estimate**:
```
EBS-Adjusted = PERT Expected Value × Mean Velocity
```

### When to Start Using EBS

- Minimum: 30 completed tasks per developer
- Optimal: 50+ tasks per developer
- Before this: Use pure PERT

### Velocity Targets

| Metric | Good | Needs Improvement |
|--------|------|-------------------|
| Mean Velocity | 0.95 - 1.1 | <0.8 or >1.3 |
| Velocity SD (Surgical) | <0.3 | >0.5 |
| Velocity SD (Exploratory) | <0.6 | >1.0 |

**If Mean Velocity = 1.4**: Developer consistently underestimates by 40% → Future estimates auto-adjusted upward

---

## BOOTSTRAP ROADMAP

### Week 1-4: Foundation
- **Method**: PERT only
- **Classification**: Manual (rule-based)
- **Commitment**: Expected Value + 20% (conservative)
- **Goal**: 20+ completed tasks

### Month 2-3: Calibration
- **Method**: PERT + velocity tracking
- **Classification**: Refined rules
- **Commitment**: Expected Value + Developer Velocity + 10%
- **Goal**: 30-50 completed tasks

### Month 4+: Mature
- **Method**: EBS for surgical, Monte Carlo for exploratory
- **Classification**: ML model (if 50+ labeled tasks)
- **Commitment**: P75/P80 for exploratory, EBS-adjusted for surgical
- **Goal**: 80%+ estimation accuracy

---

## CLASSIFICATION FEATURES (Top 3)

### 1. Requirements Completeness (0-10)
- **10**: Every detail specified, zero questions needed
- **8**: Minor details missing, 95% clear
- **7**: Some gaps, 2-3 clarifying questions needed
- **<7**: Significant unknowns

### 2. Specification Clarity (0-10)
- **10**: Executable-level precision ("Button color: #3498db")
- **8**: Design-level detail ("Add loading spinner")
- **7**: Feature-level ("Improve user feedback")
- **<7**: Ambiguous or multiple interpretations possible

### 3. Unknown Unknowns (Boolean)
- **False**: "I know what I don't know" (e.g., "Need to check browser compatibility")
- **True**: "I don't know what I don't know" (e.g., "Explore payment solutions")

**Decision Rule**: Surgical = (Q1≥8 AND Q2≥7 AND Q3=False)

---

## RED FLAGS

### During Estimation
- [ ] Standard deviation > 50% of expected value → Likely exploratory
- [ ] More than 3 "TBD" or "depends on" in task description → Exploratory
- [ ] Task duration estimate >8 hours → Break down further
- [ ] Estimator says "It could be 2 hours or 20 hours" → Exploratory

### During Execution
- [ ] Actual time >2× estimate → Misclassified as surgical
- [ ] Task blocked >2 days by external dependency → Should've been exploratory
- [ ] Scope expands mid-task → Incomplete requirements (was exploratory)
- [ ] "Just need to research one more thing" (repeatedly) → Was exploratory

### In Retrospective
- [ ] Mean velocity <0.7 or >1.5 → Chronic bias
- [ ] Velocity SD >1.0 → Classification issues
- [ ] Actual > Commitment in >30% of tasks → Too aggressive
- [ ] Classification accuracy <70% → Need better features or training

---

## DECISION MATRIX: Which Method?

| Task Type | Duration | Historical Data | Use This Method | Commit At |
|-----------|----------|-----------------|-----------------|-----------|
| Surgical | Any | None | PERT | E + 10% |
| Surgical | Any | 30-50 tasks | PERT + Velocity | EBS-Adjusted E |
| Surgical | Any | 50+ tasks | Full EBS | EBS-Adjusted E |
| Exploratory | <8 hrs | None | PERT (wide) | P (pessimistic) |
| Exploratory | 8-16 hrs | None | PERT → Monte Carlo | P75 |
| Exploratory | >16 hrs | Any | Break down first | N/A |
| Exploratory | Any | 50+ simulations | Monte Carlo | P80 or P90 |

---

## TASK BREAKDOWN RULES

**MUST decompose if**:
- Surgical task estimated >8 hours
- Exploratory task estimated >16 hours
- Standard deviation >50% of expected value
- More than 5 files to be changed
- Task description >3 sentences with "and" or "then"

**How to decompose**:
1. Identify distinct deliverables
2. Separate discovery/research from implementation
3. Create one task per testable unit
4. Re-estimate and re-classify each subtask

**Example**:
- Original: "Build user profile page" (Exploratory, 24 hours)
- Decomposed:
  1. "Research profile layout patterns" (Exploratory, 4 hours)
  2. "Implement profile data model" (Surgical, 3 hours)
  3. "Build profile UI components" (Surgical, 6 hours)
  4. "Connect profile to backend API" (Surgical, 4 hours)
  5. "Add profile edit functionality" (Surgical, 5 hours)

---

## CONFIDENCE INTERVALS CHEAT SHEET

### Reading Monte Carlo Results

**Scenario**: Task simulated 1,000 times
- P50 = 8 hours: Half of simulations finished by 8 hours
- P75 = 12 hours: 75% of simulations finished by 12 hours
- P90 = 20 hours: 90% of simulations finished by 20 hours

**Communication Template**:
"We have a 50% chance of completing this by [P50], 75% chance by [P75], and 90% chance by [P90]. I recommend we commit to [P75 or P80] to balance confidence and efficiency."

### What Percentile to Target?

- **P50**: Use for internal stretch goals
- **P75**: Default for most commitments
- **P80**: High-stakes projects, important clients
- **P90**: Fixed-price contracts, penalties for late delivery
- **P95**: Safety-critical systems, regulatory deadlines

---

## TRACKING SPREADSHEET TEMPLATE

### Required Fields
| Task ID | Task Name | Classification | O | M | P | E | Actual | Developer | Velocity |
|---------|-----------|----------------|---|---|---|---|--------|-----------|----------|
| T-001 | Fix header CSS | Surgical | 15 | 30 | 60 | 32.5 | 45 | Alice | 1.38 |
| T-002 | Research state mgmt | Exploratory | 120 | 480 | 1440 | 580 | 720 | Bob | 1.24 |

### Optional but Valuable Fields
- Completeness Score (0-10)
- Clarity Score (0-10)
- Unknown Unknowns (Boolean)
- Files Changed (Count)
- Notes (Text)

### Weekly Metrics to Calculate
- Mean Velocity (overall)
- Mean Velocity by Developer
- Mean Velocity by Task Type (Surgical vs Exploratory)
- Classification Accuracy (% correctly classified)
- Commitment Success Rate (% of Actual ≤ Committed)

---

## COMMON MISTAKES TO AVOID

1. **Artificially Narrow Estimates**: Don't make P closer to M to "seem confident" on exploratory tasks
2. **Ignoring Velocity Data**: After 30+ tasks, you MUST use historical velocity (not optional)
3. **Over-Trusting Expected Value**: E is the mean, not a guarantee - add buffers
4. **Misclassifying for Speed**: Pressure to estimate quickly → classify as surgical → underestimate
5. **Forgetting Aggregation Risk**: 10 tasks with E=1hr each ≠ 10 hours total (need buffer)
6. **One-Size-Fits-All Percentile**: Use context-appropriate confidence level (P75 vs P90)
7. **Stale Velocities**: Recalculate quarterly as team/tools/product evolves
8. **Premature ML**: Don't train classification model with <50 labeled examples

---

## ONE-PAGE SUMMARY

**Framework**: 2-Tier (Surgical vs Exploratory)

**Classification** (choose one):
- Surgical: Complete requirements (≥8), clear spec (≥7), no unknowns, isolated scope
- Exploratory: Anything that fails surgical criteria

**Estimation Method**:
- All tasks start with PERT: E = (O + 4M + P) / 6
- Surgical (after 30+ tasks): Apply EBS velocity adjustment
- Exploratory: Use Monte Carlo for P75/P80 confidence intervals

**Commitment**:
- Surgical: Expected Value (or EBS-adjusted) + 10% buffer
- Exploratory: P75 (internal) or P80 (external)

**Bootstrap**:
- Month 1-2: PERT only, track everything
- Month 2-4: Add velocity adjustments
- Month 4+: Full EBS + Monte Carlo

**Success Criteria**:
- 80%+ of tasks finish within ±20% of estimate
- Mean velocity converges to 1.0
- Velocity SD decreases over time

---

**Full Report**: `.claude/research_reports/RPM-PLAN-002_time_estimation_methodologies_research.md`
**Summary**: `.claude/research_reports/RPM-PLAN-002_PHASE1_COMPLETION_SUMMARY.md`
**This Guide**: `.claude/research_reports/RPM-PLAN-002_QUICK_REFERENCE.md`

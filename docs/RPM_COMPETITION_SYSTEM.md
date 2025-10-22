# RPM Competition & Measurement System

**Version:** 1.0  
**Date:** 2025-10-21  
**Status:** Production Ready ✅

---

## 🎯 **MISSION**

Systematically measure, score, and track ALL predictions (human + AI) with:

- **ROI/$/Day as KING** metric
- **Passive Cash Flow RULING** business decisions
- **Within values/results/purpose guardrails**
- **RPM DNA baked in systematically**

---

## 👑 **THE KING METRIC**

### **ROI Per Day**

```
ROI/$/Day = (Actual Profit - Actual Cost) / Actual Days Elapsed
```

**Why This is King:**

- Measures SPEED of value delivery
- Normalizes projects of different sizes
- Prioritizes high-velocity wins
- Aligns with Jesse's "move fast" philosophy

**Weight:** 50% of overall scoring

---

## 👑 **THE RULER METRIC**

### **Passive Cash Flow**

```
Passive Cash Flow = Monthly Recurring Revenue - Monthly Fixed Costs
```

**Why This Rules Business Decisions:**

- Sustainability > one-time gains
- Compound effect over time
- Protects the $1.148M annual revenue base
- Enables reinvestment and growth

**Weight:** 30% of overall scoring

---

## 📊 **PREDICTION DIMENSIONS**

Every prediction tracks 3 dimensions:

| Dimension | Formula | Weight | Min Acceptable |
|-----------|---------|--------|----------------|
| **Timeframe Accuracy** | `1 - abs(projected_hours - actual_hours) / projected_hours` | 30% | 70% |
| **Cost Accuracy** | `1 - abs(projected_cost - actual_cost) / projected_cost` | 30% | 75% |
| **ROI Accuracy** | `1 - abs(projected_roi - actual_roi) / projected_roi` | 40% | 65% |

**Composite Score:**

```
Composite = (Timeframe × 0.30) + (Cost × 0.30) + (ROI × 0.40)
```

---

## 🏆 **GRADE TIERS**

| Tier | Score Range | Label | Award |
|------|-------------|-------|-------|
| **S** | 95%+ | Exceptional | 🏆 |
| **A** | 90-95% | Excellent | 🥇 |
| **B** | 80-90% | Good | 🥈 |
| **C** | 70-80% | Acceptable | 🥉 |
| **D** | 60-70% | Warning | ⚠️ |
| **F** | <60% | Failing | 🔴 |

---

## 🤝 **COMPETITORS**

### **Humans**

1. **Jesse Niesen** (CEO) - Strategic vision, market timing
2. **Andrew** (Director Ops) - Operations, execution timeframes
3. **Christopher** (CSO) - Financial accuracy, cost control

### **AI Models**

1. **Liv Hana (Cursor/Claude Sonnet 4.5)** - Technical execution, architecture
2. **ChatGPT (GPT-4/o1)** - Strategic planning, reasoning
3. **Replit Agent** - Rapid prototyping, deployment
4. **Custom GPT (Liv Hana)** - User interaction, accessibility
5. **Slack Bot (Liv Hana)** - Team coordination, quick answers

---

## 🎮 **COMPETITION TYPES**

### **1. Self Competition**

- Compete against your own historical baseline
- **Cadence:** Continuous
- **Bonuses:** +5% improvement, +3% consistency

### **2. Peer Competition**

- Humans vs Humans, AI vs AI
- **Cadence:** Daily
- **Leaderboards:** Category-specific

### **3. Cross Competition**

- All competitors (human + AI) together
- **Cadence:** Weekly
- **Leaderboards:** Global

---

## 🚦 **BUSINESS DECISION ENGINE**

### **Priority Order (RULER → KING → GUARDRAILS → ACCURACY)**

| Rank | Criterion | Formula | Threshold |
|------|-----------|---------|-----------|
| 1 | **Passive Cash Flow** (RULER) | `MRR - Fixed Costs` | ≥ $0 |
| 2 | **ROI Per Day** (KING) | `(Profit - Cost) / Days` | ≥ $100/day |
| 3 | **Guardrails Compliance** | All must pass | True |
| 4 | **Prediction Accuracy** | Composite score | ≥ 70% |

### **Decision Matrix**

**GO ✅**

- Passive Cash Flow ≥ $0
- ROI Per Day ≥ $100
- Guardrails = True
- Accuracy ≥ 70%

**GO WITH CAUTION ⚠️**

- Passive Cash Flow ≥ -$10K
- ROI Per Day ≥ $50
- Guardrails = True
- Accuracy ≥ 60%

**NO GO 🔴**

- Passive Cash Flow < -$10K OR
- ROI Per Day < $50 OR
- Guardrails = False OR
- Accuracy < 60%

---

## 📅 **CADENCE (RPM DNA Rhythm)**

| Frequency | Action | Output |
|-----------|--------|--------|
| **Hourly** | Update progress metrics | `hourly_progress.json` |
| **Daily** | Score predictions, generate leaderboard | `daily_scores.json` |
| **Weekly** | Comprehensive scoring, awards | `weekly_leaderboard.json` |
| **Monthly** | Update baselines, recalibrate models | `monthly_trends.json` |

---

## 🛡️ **GUARDRAILS (Values/Results/Purpose)**

### **Values**

- **LifeWard Standard:** All predictions must protect people
- **TRUTH Framework:** All actuals must be TRUTH-verified

### **Results**

- Minimum ROI/$/Day: $50
- Minimum Passive Cash Flow: -$10K
- Minimum Prediction Accuracy: 60%

### **Purpose**

- Every decision serves: **Grow, Sell & Heal**
- Mission tags: revenue_recovery, compliance_protection, team_efficiency, customer_satisfaction, operational_excellence

---

## 🔄 **AUTOMATION (Baked into 3-Agent Foundation)**

### **RPM Planning Agent**

- **Captures predictions** when RPM card emitted
- **Tracks actuals** when tasks completed
- **Updates hourly progress** automatically

### **QA Agent**

- **Calculates scores** when actuals recorded
- **Generates leaderboards** daily/weekly
- **Validates guardrails** continuously

### **Research Agent**

- **Runs business decision engine** after scoring
- **Emits recommendations** (GO/CAUTION/NO_GO)
- **Updates baselines** monthly

---

## 📈 **LEADERBOARDS**

### **Daily Dashboard** (`/rpm/leaderboard/daily`)

- **Metrics:** ROI/$/Day, Composite Score, Accuracy Trend
- **Categories:** All, Humans, AI Models
- **Updates:** Every 24 hours

### **Weekly Dashboard** (`/rpm/leaderboard/weekly`)

- **Metrics:** Total ROI Delivered, Avg Composite Score, Consistency
- **Awards:** 🏆 Best ROI/$/Day, Most Accurate, Most Improved, Highest Passive Cash Flow
- **Updates:** Every 7 days

### **Self-Improvement Dashboard** (`/rpm/leaderboard/self-improvement`)

- **Metrics:** Improvement Rate, Consistency, Learning Velocity
- **Shows:** Historical trend graphs
- **Updates:** Continuous

---

## 🎯 **USAGE**

### **Record Prediction**

```python
from scripts.rpm_competition_engine import RPMCompetitionEngine

engine = RPMCompetitionEngine("config/rpm_competition_framework.json")

prediction_id = engine.record_prediction(
    competitor_id="ai_liv_hana_cursor",
    rpm_card_id="rpm_12345",
    project_name="Voice Mode PWA",
    projected_timeframe_hours=48,
    projected_cost_usd=2000,
    projected_roi_usd=50000,
    projected_passive_cashflow_monthly=10000,
    confidence_level=0.85,
    assumptions=["Team available", "No blockers"],
    guardrails_passed=True
)
```

### **Record Actual**

```python
actual_id, score = engine.record_actual(
    prediction_id=prediction_id,
    recorded_by="ai_liv_hana_cursor",
    actual_timeframe_hours=52,
    actual_cost_usd=2500,
    actual_roi_usd=45000,
    actual_passive_cashflow_monthly=12000,
    variance_notes="Took 4 extra hours for polish",
    learnings=["Underestimated polish time", "Overdelivered on cash flow"]
)

print(f"Composite Score: {score['composite_score']:.2%}")
print(f"Grade: {score['grade_tier']}")
print(f"Business Decision: {score['business_decision']}")
```

### **Generate Leaderboard**

```bash
python3 scripts/rpm_competition_engine.py generate_leaderboard weekly all
```

---

## 🎖️ **WEEKLY AWARDS**

Every Sunday, awards announced:

1. 🏆 **Best ROI/$/Day** - Highest average daily return
2. 🎯 **Most Accurate Predictions** - Highest composite score
3. 📈 **Highest Passive Cash Flow** - Most sustainable value
4. 🚀 **Most Improved** - Biggest improvement vs baseline
5. 🤝 **Best Collaboration** - Human+AI team with best combined score

---

## 📊 **DATA SCHEMA**

### **Prediction**

```json
{
  "prediction_id": "uuid",
  "created_by": "competitor_id",
  "projected_timeframe_hours": 48.0,
  "projected_cost_usd": 2000.0,
  "projected_roi_usd": 50000.0,
  "projected_roi_per_day": 25000.0,
  "projected_passive_cashflow_monthly": 10000.0,
  "confidence_level": 0.85,
  "guardrails_passed": true
}
```

### **Actual**

```json
{
  "actual_id": "uuid",
  "prediction_id": "uuid",
  "actual_timeframe_hours": 52.0,
  "actual_cost_usd": 2500.0,
  "actual_roi_usd": 45000.0,
  "actual_roi_per_day": 20769.23,
  "actual_passive_cashflow_monthly": 12000.0
}
```

### **Score**

```json
{
  "score_id": "uuid",
  "competitor_id": "ai_liv_hana_cursor",
  "timeframe_accuracy": 0.92,
  "cost_accuracy": 0.80,
  "roi_accuracy": 0.90,
  "composite_score": 0.874,
  "grade_tier": "B_TIER",
  "roi_per_day": 20769.23,
  "passive_cashflow": 12000.0,
  "business_decision": "GO"
}
```

---

## 🎼 **RPM DNA INTEGRATION**

### **Result**

- **Measurement:** `projected_result vs actual_result`
- **Scoring:** `result_achievement_pct = (actual / projected)`

### **Purpose**

- **Measurement:** `purpose_alignment_score`
- **Scoring:** Qualitative assessment (0-1) by team + guardrails

### **Massive Actions**

- **Measurement:** `actions_completed / actions_planned`
- **Scoring:** `completion_rate + velocity_bonus`

### **Validation**

- **Measurement:** `validation_checks_passed / validation_checks_total`
- **Scoring:** `validation_pass_rate`

---

## ✅ **SUCCESS CRITERIA**

This system succeeds when:

1. ✅ Every prediction is tracked
2. ✅ Every completion updates actuals
3. ✅ Scores calculated automatically
4. ✅ Leaderboards update on cadence
5. ✅ Business decisions follow RULER → KING → GUARDRAILS
6. ✅ Humans + AI compete and improve together
7. ✅ ROI/$/Day is the universal language
8. ✅ Passive cash flow rules investment decisions

---

**Files:**

- Config: `config/rpm_competition_framework.json`
- Engine: `scripts/rpm_competition_engine.py`
- Docs: `docs/RPM_COMPETITION_SYSTEM.md` (this file)

🎯 **SYSTEMATICALLY RPM DNA BAKED IN** ✅

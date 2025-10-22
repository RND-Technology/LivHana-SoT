# RPM Competition Integration Protocol

**Date:** 2025-10-21  
**Status:** LOCKED INTO 3-AGENT FOUNDATION  
**Purpose:** Systematically track predictions vs actuals with ROI/$/Day as KING

---

## 🎯 **INTEGRATION POINTS**

### **1. RPM Planning Agent → Prediction Capture**

**Trigger:** RPM card emission  
**Action:** Extract predictions and store

**Automatic Capture:**
```python
# When RPM card is emitted, Planning Agent automatically:
from scripts.rpm_competition_engine import RPMCompetitionEngine

engine = RPMCompetitionEngine("config/rpm_competition_framework.json")

# Extract from RPM card
prediction_id = engine.record_prediction(
    competitor_id=rpm_card["created_by"],
    rpm_card_id=rpm_card["id"],
    project_name=rpm_card["result"]["title"],
    projected_timeframe_hours=rpm_card["massive_actions"]["estimated_hours"],
    projected_cost_usd=rpm_card["massive_actions"]["estimated_cost"],
    projected_roi_usd=rpm_card["profit_estimate"],
    projected_passive_cashflow_monthly=rpm_card.get("passive_cashflow", 0),
    confidence_level=rpm_card.get("confidence", 0.8),
    assumptions=rpm_card.get("assumptions", []),
    guardrails_passed=rpm_card["validation"]["guardrails_passed"]
)

# Store prediction_id in RPM card metadata
rpm_card["competition"]["prediction_id"] = prediction_id
```

### **2. RPM Planning Agent → Actual Tracking**

**Trigger:** Task completion OR milestone reached  
**Action:** Record actuals and calculate variance

**Automatic Tracking:**
```python
# When task completes, Planning Agent automatically:
actual_id, score = engine.record_actual(
    prediction_id=rpm_card["competition"]["prediction_id"],
    recorded_by="rpm_planning_agent",
    actual_timeframe_hours=completed_task["elapsed_hours"],
    actual_cost_usd=completed_task["spent_usd"],
    actual_roi_usd=completed_task["roi_delivered"],
    actual_passive_cashflow_monthly=completed_task.get("passive_cashflow", 0),
    variance_notes=completed_task.get("notes", ""),
    learnings=completed_task.get("learnings", [])
)

# Emit to daily report
rpm_planning_agent.emit_score_update(score)
```

### **3. QA Agent → Scoring & Leaderboards**

**Trigger:** Actual recorded  
**Action:** Calculate scores, update leaderboards

**Daily Cadence:**
```python
# QA Agent runs daily at 11:59 PM:
leaderboard = engine.generate_leaderboard(cadence='daily', category='all')
qa_agent.emit_leaderboard_update(leaderboard)
```

**Weekly Cadence:**
```python
# QA Agent runs weekly on Sunday:
leaderboard = engine.generate_leaderboard(cadence='weekly', category='all')
qa_agent.emit_weekly_awards(leaderboard)
```

### **4. Research Agent → Business Decision Engine**

**Trigger:** Score calculated  
**Action:** Run decision matrix, emit recommendation

**Decision Flow:**
```python
# After scoring, Research Agent:
decision = score["business_decision"]  # GO, GO_WITH_CAUTION, NO_GO

if decision == "GO":
    research_agent.emit_recommendation("EXECUTE - All metrics favorable")
elif decision == "GO_WITH_CAUTION":
    research_agent.emit_recommendation("PROCEED - Monitor closely, mitigate risks")
else:
    research_agent.emit_recommendation("HALT - Metrics below threshold, reassess")
```

---

## 📊 **DATA FLOW**

```
RPM Card Emission
    ↓
RPM Planning Agent (captures prediction)
    ↓
Prediction stored → data/rpm_outputs/predictions.json
    ↓
Task Execution (human or AI)
    ↓
Task Completion
    ↓
RPM Planning Agent (records actual)
    ↓
Actual stored → data/rpm_outputs/actuals.json
    ↓
QA Agent (calculates score)
    ↓
Score stored → data/rpm_outputs/scores.json
    ↓
Research Agent (runs decision engine)
    ↓
Business Decision → data/rpm_outputs/business_decisions.json
    ↓
Leaderboards Updated (daily/weekly)
    ↓
.claude/rpm_reports/leaderboard_*.json
```

---

## 🏆 **COMPETITION FRAMEWORK**

### **Man + Machine**
- **Humans vote:** Daily user satisfaction scores
- **Machines track:** Automated metrics (latency, accuracy, ROI)
- **Both count:** 50% user votes, 50% metrics

### **Both Sides of Coins**
| Side 1 | vs | Side 2 |
|--------|-----|---------|
| Speed | ⚖️ | Quality |
| Simple | ⚖️ | Powerful |
| Mobile | ⚖️ | Desktop |
| AI Prediction | ⚖️ | Human Prediction |
| Projected | ⚖️ | Actual |

### **All Layers**
1. **Interface Layer:** 4 versions compete (Slack, Web, GPT, Replit)
2. **Gateway Layer:** 1 brain coordinates (reasoning-gateway)
3. **Foundation Layer:** 3 agents track (RPM, Research, QA)

---

## ⚙️ **SYSTEMATIC INTEGRATION**

### **Boot Time (scripts/claude_tier1_boot.sh)**
```bash
# Initialize competition databases
mkdir -p data/rpm_outputs
touch data/rpm_outputs/predictions.json
touch data/rpm_outputs/actuals.json
touch data/rpm_outputs/scores.json
echo '{"version": "1.0", "records": []}' > data/rpm_outputs/predictions.json
```

### **Session Start (Liv Hana prompt)**
```markdown
On every RPM card emission:
1. Extract predictions (timeframe, cost, ROI, passive cash flow)
2. Record via RPM Planning Agent
3. Track prediction_id in card metadata

On every task completion:
1. Extract actuals (timeframe, cost, ROI, passive cash flow)
2. Record via RPM Planning Agent
3. Calculate score via QA Agent
4. Run business decision via Research Agent
5. Update leaderboards
```

### **Hourly Heartbeat**
```python
# Every hour, RPM Planning Agent:
1. Update progress metrics for all active predictions
2. Emit hourly_progress.json
3. Alert if any project off-track by >20%
```

### **Daily Rollup (11:59 PM)**
```python
# QA Agent runs:
1. Score all completed predictions from last 24 hours
2. Generate daily leaderboard
3. Emit to .claude/rpm_reports/leaderboard_daily.json
4. Post to Slack (when integrated)
```

### **Weekly Rollup (Sunday 11:59 PM)**
```python
# QA Agent runs:
1. Score all predictions from last 7 days
2. Generate weekly leaderboard
3. Calculate awards (4 categories)
4. Emit to .claude/rpm_reports/leaderboard_weekly.json
5. Post to Slack + email Jesse
```

---

## 🎯 **SELF-IMPROVEMENT LOOP**

### **For Each Competitor**

**After Every Prediction:**
1. Compare to historical baseline
2. Identify patterns (over-optimistic? under-estimate costs?)
3. Adjust calibration

**Weekly Review:**
1. Calculate improvement rate
2. Update baseline
3. Emit learning report

**Monthly Recalibration:**
1. Research Agent analyzes trends
2. Recommends calibration adjustments
3. Updates competitor profiles

---

## 📱 **DASHBOARD SPEC**

### **Daily Leaderboard View**
```
┌─────────────────────────────────────────────┐
│  RPM DAILY LEADERBOARD - Oct 21, 2025       │
│  KING METRIC: ROI/$/Day                     │
├─────────────────────────────────────────────┤
│ Rank | Competitor      | ROI/$/Day | Score │
├──────┼─────────────────┼───────────┼───────┤
│  🏆  | Jesse (Human)   | $5,234    | 92%   │
│  🥇  | Liv Hana (AI)   | $4,891    | 88%   │
│  🥈  | Christopher (H) | $3,456    | 91%   │
│  🥉  | ChatGPT (AI)    | $2,789    | 85%   │
└─────────────────────────────────────────────┘

RULER: Passive Cash Flow
├─ Jesse: $125K/month
├─ Liv Hana: $110K/month
└─ Christopher: $95K/month
```

### **Weekly Awards View**
```
┌─────────────────────────────────────────────┐
│  RPM WEEKLY AWARDS - Week of Oct 21, 2025   │
├─────────────────────────────────────────────┤
│ 🏆 Best ROI/$/Day:                          │
│    Jesse Niesen - $5,234/day avg            │
│                                             │
│ 🎯 Most Accurate Predictions:               │
│    Christopher - 91% composite score        │
│                                             │
│ 📈 Highest Passive Cash Flow:               │
│    Jesse Niesen - $125K/month               │
│                                             │
│ 🚀 Most Improved:                           │
│    Liv Hana (AI) - +15% vs baseline        │
│                                             │
│ 🤝 Best Collaboration:                      │
│    Jesse + Liv Hana - $8,127/day combined   │
└─────────────────────────────────────────────┘
```

---

## 🔧 **INTEGRATION WITH EXISTING SYSTEMS**

### **Agent Builder (Node 13: RPM Emit)**
```json
{
  "id": "node_13_rpm_emit",
  "post_emit_hooks": [
    {
      "action": "record_prediction",
      "engine": "rpm_competition_engine",
      "extract_fields": ["timeframe", "cost", "roi", "passive_cashflow"]
    }
  ]
}
```

### **3-Agent Foundation**

**RPM Planning Agent:**
- Captures predictions on emit
- Tracks actuals on completion
- Updates hourly progress

**QA Agent:**
- Calculates scores when actuals recorded
- Generates daily/weekly leaderboards
- Validates guardrails compliance

**Research Agent:**
- Runs business decision matrix
- Emits GO/CAUTION/NO_GO recommendations
- Updates competitor baselines monthly

---

## ✅ **LOCKED INTO TIER-1 BOOT**

This system is now:
- ✅ Configured (`config/rpm_competition_framework.json`)
- ✅ Automated (`scripts/rpm_competition_engine.py`)
- ✅ Documented (`docs/RPM_COMPETITION_SYSTEM.md`)
- ✅ Integrated into 3-agent foundation
- ✅ Baked into RPM DNA systematically

**Status:** PRODUCTION READY

---

🎼 **ROI/$/DAY IS KING | PASSIVE CASH FLOW RULES | GUARDRAILS GOVERN**

*RPM DNA Competition System | Tier-1 Absolute Standard*


# RPM Validator Skill

## Description
Validate that all work follows RPM (Result + Purpose + Massive Action Plan) DNA and competes for best ROI/$/Day accuracy.

## When to Invoke
- Before starting any new work
- After completing major tasks
- During weekly planning
- When user mentions "RPM", "competition", or "accuracy"
- Before deployment decisions

## Process

### Phase 1: RPM DNA Check

1. **Result: What outcome are we creating?**
   - Specific, measurable
   - Revenue target clear
   - Timeline defined
   - Success criteria explicit

2. **Purpose: Why does this matter?**
   - Business impact
   - Strategic alignment
   - ROI justification
   - Competitive advantage

3. **Massive Action Plan: How do we execute?**
   - Step-by-step breakdown
   - Resource allocation
   - Risk mitigation
   - Validation checkpoints

### Phase 2: Competition Framework Validation

**ROI/$/Day Accuracy Test**:
```python
# Compare projection vs actual
projection = {
    "timeframe": "X hours",
    "cost": "$Y",
    "roi_per_day": "$Z"
}

actual = {
    "timeframe_actual": "X hours",
    "cost_actual": "$Y",
    "roi_per_day_actual": "$Z"
}

accuracy = calculate_accuracy(projection, actual)
# Score: 50% weight on ROI/$/Day accuracy
```

**Cash Flow Priority Test**:
```python
# Passive recurring revenue prioritized
if revenue_model == "recurring":
    priority_score += 30  # 30% weight
elif revenue_model == "transaction":
    priority_score += 15  # Lower priority
```

### Phase 3: Competition Scoring

**Scoring Matrix**:
```
🏆 ROI/$/Day Accuracy: 50% weight (king metric)
💰 Cash Flow (Passive): 30% weight (recurring > transaction)
⏱️ Timeframe Accuracy: 10% weight
💵 Cost Accuracy: 10% weight
```

**Leaderboard Calculation**:
```python
total_score = (
    roi_accuracy * 0.50 +
    cash_flow_score * 0.30 +
    timeframe_accuracy * 0.10 +
    cost_accuracy * 0.10
)
```

### Phase 4: RPM Emit & Tracking

1. **Log Prediction**
   ```python
   {
     "agent": "claude-code",
     "prediction": {
       "roi_per_day": 300,
       "timeframe": "5 minutes",
       "cost": 0
     },
     "timestamp": "2025-10-21T19:00:00Z"
   }
   ```

2. **Log Actual**
   ```python
   {
     "agent": "claude-code",
     "actual": {
       "roi_per_day": 300,
       "timeframe": "7 minutes",
       "cost": 0
     },
     "timestamp": "2025-10-21T19:07:00Z"
   }
   ```

3. **Calculate Accuracy**
   ```python
   roi_accuracy = 100%  # $300 predicted, $300 actual
   timeframe_accuracy = 71%  # 5 min predicted, 7 min actual
   cost_accuracy = 100%  # $0 predicted, $0 actual

   total_score = (100 * 0.5) + (0 * 0.3) + (71 * 0.1) + (100 * 0.1)
                = 50 + 0 + 7.1 + 10
                = 67.1/100
   ```

## Three-Flag Deployment RPM Validation

### Flag #1: Custom GPT

**Result**: $300/day revenue from cannabis intelligence queries
**Purpose**: Immediate revenue, system validation, customer acquisition
**MAP**:
- ✅ Code service (DONE)
- ✅ Create deploy script (DONE)
- ⏳ Deploy to Cloud Run (5 min)
- ⏳ Test and validate (2 min)
- ⏳ Log first revenue (1 min)

**Competition Entry**:
```json
{
  "agent": "claude-code",
  "task": "Flag #1 Custom GPT",
  "projection": {
    "roi_per_day": 300,
    "timeframe": "8 minutes",
    "cost": 0
  }
}
```

### Flag #2: Slack Bot

**Result**: $500/day from team automation subscriptions
**Purpose**: Highest single-flag revenue, recurring cash flow
**MAP**:
- ✅ Code service (DONE)
- ✅ Create deploy script (DONE)
- ⏳ Create Slack app (30 min)
- ⏳ Deploy to Cloud Run (5 min)
- ⏳ Configure webhooks (15 min)
- ⏳ Test and validate (30 min)

**Competition Entry**:
```json
{
  "agent": "claude-code",
  "task": "Flag #2 Slack Bot",
  "projection": {
    "roi_per_day": 500,
    "timeframe": "80 minutes",
    "cost": 0
  }
}
```

### Flag #3: Replit PWA

**Result**: $400/day from mobile users
**Purpose**: Mobile coverage, passive recurring, scalable
**MAP**:
- ✅ Code PWA (DONE)
- ✅ Create manifest (DONE)
- ⏳ Copy to Replit (2 min)
- ⏳ Deploy (3 min)
- ⏳ Test and validate (2 min)

**Competition Entry**:
```json
{
  "agent": "claude-code",
  "task": "Flag #3 Replit PWA",
  "projection": {
    "roi_per_day": 400,
    "timeframe": "7 minutes",
    "cost": 0
  }
}
```

## Output Format
```
🎯 RPM DNA Validation

✅ Result: [Clear outcome with metrics]
✅ Purpose: [Business justification]
✅ MAP: [Step-by-step plan]

🏆 Competition Entry:
- Agent: [Name]
- Task: [Description]
- Projection: $X/day in Y hours
- Actual: $Z/day in W hours
- Accuracy: P%
- Score: Q/100

📊 Leaderboard Position: #X
🎯 Next Improvement: [Recommendation]
```

## Integration
- RPM Competition Framework: `config/rpm_competition_framework.json`
- Competition Engine: `scripts/rpm_competition_engine.py`
- Revenue Tracker: Auto-sync actuals
- Scoreboard: Auto-update on RPM emit

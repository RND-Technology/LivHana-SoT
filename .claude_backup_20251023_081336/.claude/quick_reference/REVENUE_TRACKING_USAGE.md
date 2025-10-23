# Revenue Tracking - Quick Reference

## 🎯 Three-Flag Revenue Targets

| Flag | Daily Target | Metric | Unit Price | Volume |
|------|--------------|--------|------------|--------|
| **Custom GPT** | $300/day | Queries | $0.10 | 3,000 queries/day |
| **Slack Bot** | $500/day | Team Members | $50/month | 10 members |
| **Replit PWA** | $400/day | Active Users | $4/month | 100 users |
| **TOTAL** | **$1,200/day** | - | - | - |

## 📊 Monthly & Annual Projections

- **Monthly Target**: $36,000/month
- **Annual Target**: $432,000/year

---

## 🚀 Usage Commands

### View Dashboard (Real-time)

```bash
python3 scripts/revenue_tracking_monitor.py dashboard
```

### Log Revenue Event

```bash
# Format: python3 scripts/revenue_tracking_monitor.py log <flag> <event_type> <amount>

# Custom GPT query
python3 scripts/revenue_tracking_monitor.py log custom_gpt query 0.10

# Slack Bot team member signup
python3 scripts/revenue_tracking_monitor.py log slack_bot signup 50.00

# Replit PWA active user
python3 scripts/revenue_tracking_monitor.py log replit_pwa user_active 4.00
```

### Generate Full Report (JSON)

```bash
python3 scripts/revenue_tracking_monitor.py report
```

### Integrate with RPM Competition Framework

```bash
python3 scripts/revenue_tracking_monitor.py integrate
```

---

## 🔄 Auto-Integration with RPM

The revenue tracker automatically integrates with the RPM Competition Framework:

- **File**: `.claude/rpm_logs/revenue_tracking.json`
- **Metric**: `revenue_roi_per_day`
- **Updates**: Real-time on each revenue event

---

## 📈 Example Workflow

### Day 1: Launch

```bash
# Check initial status
python3 scripts/revenue_tracking_monitor.py dashboard

# Log first revenue events as they come in
python3 scripts/revenue_tracking_monitor.py log custom_gpt query 0.10
python3 scripts/revenue_tracking_monitor.py log slack_bot signup 50.00

# View updated dashboard
python3 scripts/revenue_tracking_monitor.py dashboard
```

### Daily Monitoring

```bash
# Morning check
python3 scripts/revenue_tracking_monitor.py dashboard

# Log events throughout the day (automated via webhooks)
# Events auto-logged from Custom GPT API
# Events auto-logged from Slack Bot subscriptions
# Events auto-logged from Replit PWA analytics

# Evening report
python3 scripts/revenue_tracking_monitor.py report > daily_report_$(date +%Y%m%d).json
```

---

## 🎯 Success Indicators

### ✅ On Target

- Custom GPT: ≥ $300/day
- Slack Bot: ≥ $500/day
- Replit PWA: ≥ $400/day
- **TOTAL: ≥ $1,200/day**

### ⚠️ Below Target

- Any flag < target → investigate and optimize
- Total < $1,200/day → strategic review needed

---

## 🔗 Integration Points

### Automated Revenue Logging (Future)

- **Custom GPT**: Webhook from OpenAI API on each query
- **Slack Bot**: Stripe webhook on subscription events
- **Replit PWA**: Analytics event on user activation

### RPM Competition Framework

- **Competition Config**: `config/rpm_competition_framework.json`
- **Competition Engine**: `scripts/rpm_competition_engine.py`
- **Scoreboard**: Auto-updates on revenue events

### 3-Agent Foundation

- **RPM Planning Agent**: Monitors projections vs actuals
- **Research Agent**: Analyzes revenue patterns
- **QA Guardrails Agent**: Validates compliance and accuracy

---

## 📊 Data Files

- **Daily Log**: `.claude/revenue_tracking/daily_revenue_log.jsonl`
- **Summary**: `.claude/revenue_tracking/revenue_summary.json`
- **RPM Integration**: `.claude/rpm_logs/revenue_tracking.json`

---

**Status**: ACTIVE - Monitoring $1,200/day target
**Next**: Log first revenue events and monitor performance

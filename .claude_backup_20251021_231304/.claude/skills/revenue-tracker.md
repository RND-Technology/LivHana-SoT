# Revenue Tracker Skill

## Description

Automatically track and validate revenue events for the three-flag deployment system ($1,200/day target).

## When to Invoke

- After any deployment completes
- When testing revenue flows
- When user mentions "revenue", "tracking", or "$" amounts
- During daily revenue reviews

## Process

### Phase 1: Check Current Status

```bash
python3 scripts/revenue_tracking_monitor.py dashboard
```

### Phase 2: Log Event (if applicable)

```bash
# Custom GPT query
python3 scripts/revenue_tracking_monitor.py log custom_gpt query 0.10

# Slack Bot signup
python3 scripts/revenue_tracking_monitor.py log slack_bot signup 50.00

# Replit PWA user
python3 scripts/revenue_tracking_monitor.py log replit_pwa user_active 4.00
```

### Phase 3: Validate Against Targets

- Custom GPT: $300/day target
- Slack Bot: $500/day target
- Replit PWA: $400/day target
- Total: $1,200/day target

### Phase 4: Report Status

Show:

- Current revenue vs target
- Percentage progress
- Monthly/annual projections
- Next milestone

## Output Format

```
💰 Revenue Status: $X / $1,200 (Y%)
📊 Flag #1: $X / $300 (Y%)
📊 Flag #2: $X / $500 (Y%)
📊 Flag #3: $X / $400 (Y%)
🎯 Next Milestone: $Z in N hours
```

## Integration

- RPM Competition Framework: Auto-sync
- Deployment scripts: Auto-log on success
- Dashboard: Real-time updates

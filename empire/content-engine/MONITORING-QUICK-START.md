# High Noon Cartoon Monitoring - Quick Start Card

## ONE-LINE LAUNCH

```bash
cd empire/content-engine && ./launch-monitoring.sh
```

## WHAT IT DOES

- Monitors all autonomous operations in real-time
- Analyzes episode quality (funny, quotable, advocacy)
- Tracks target persona engagement
- Auto-adjusts content parameters
- Alerts on system issues

## KEY FILES

| File | Purpose | Run |
|------|---------|-----|
| `monitoring-dashboard.html` | Real-time web dashboard | `open monitoring-dashboard.html` |
| `monitor-all-systems.mjs` | System health checker | `./monitor-all-systems.mjs once` |
| `continuous-improvement-loop.mjs` | Quality analyzer | `./continuous-improvement-loop.mjs once` |
| `launch-monitoring.sh` | Start everything | `./launch-monitoring.sh` |
| `stop-monitoring.sh` | Stop everything | `./stop-monitoring.sh` |

## COMMON COMMANDS

```bash
# Start monitoring (everything)
./launch-monitoring.sh

# Stop monitoring
./stop-monitoring.sh

# Check status once
./monitor-all-systems.mjs once

# Analyze quality once
./continuous-improvement-loop.mjs once

# View dashboard
open monitoring-dashboard.html

# Check logs
tail -f ../../reports/autonomous-status/monitor.log
tail -f ../../reports/autonomous-status/ALERTS.log

# View latest status
cat ../../reports/autonomous-status/latest-status.json

# View learnings
cat LEARNINGS.md
```

## MONITORING INTERVALS

- System Monitor: Every 5 minutes
- Improvement Loop: Every 30 minutes
- Dashboard Refresh: Every 30 seconds

## QUALITY TARGETS

- **Funny**: 8.5+/10
- **Quotable**: 9.0+/10
- **Advocacy**: 9.5+/10
- **Overall**: 9.0+/10

## TARGET PERSONAS (TPOPs)

1. **Texas Cannabis Users** (25%) - Target: 85%+
2. **Federal Legalization Advocates** (25%) - Target: 90%+
3. **Trump Supporters (Cannabis)** (20%) - Target: 75%+
4. **Gen Z Short-Form Consumers** (30%) - Target: 95%+

## FILE LOCATIONS

- **Status Reports**: `reports/autonomous-status/`
- **Latest Status**: `reports/autonomous-status/latest-status.json`
- **Alerts**: `reports/autonomous-status/ALERTS.log`
- **Learnings**: `empire/content-engine/LEARNINGS.md`
- **Quality Metrics**: `empire/content-engine/output/quality-metrics.json`
- **Auto-Adjustments**: `empire/content-engine/output/auto-adjustment-params.json`

## ALERT LEVELS

- **INFO**: Normal operations
- **WARNING**: Attention needed (non-critical)
- **ERROR**: Action required
- **CRITICAL**: Immediate action needed

## TROUBLESHOOTING

```bash
# Services not running?
ps aux | grep monitor

# Reset everything
./stop-monitoring.sh
rm ../../reports/autonomous-status/*.pid
./launch-monitoring.sh

# Dashboard not updating?
./monitor-all-systems.mjs once

# Need help?
cat MONITORING-README.md
```

## NEXT STEPS

1. Launch: `./launch-monitoring.sh`
2. Open dashboard in browser
3. Generate episodes with content engine
4. Watch quality scores improve
5. Review `LEARNINGS.md` for insights
6. Scale up production

## FULL DOCUMENTATION

See: `MONITORING-README.md`

---
**Status**: Production Ready
**Version**: 1.0
**Date**: 2025-10-07

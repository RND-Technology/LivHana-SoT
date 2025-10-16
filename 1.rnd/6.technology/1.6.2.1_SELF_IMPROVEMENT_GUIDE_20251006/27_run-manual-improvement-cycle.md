#### Run Manual Improvement Cycle

```bash
# Daily analysis
node scripts/run-improvement-cycle.js --type=daily

# Weekly analysis
node scripts/run-improvement-cycle.js --type=weekly

# Monthly analysis
node scripts/run-improvement-cycle.js --type=monthly

# Full analysis with dashboard
node scripts/run-improvement-cycle.js --type=full

# Dry run (analyze only, don't execute)
node scripts/run-improvement-cycle.js --type=daily --dry-run

# Auto-execute low-risk improvements
node scripts/run-improvement-cycle.js --type=daily --auto-execute
```

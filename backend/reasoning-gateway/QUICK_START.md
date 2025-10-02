# Self-Improvement Loop - Quick Start

## TL;DR

```bash
# 1. Setup environment
export ENABLE_SELF_IMPROVEMENT=true
export ANTHROPIC_API_KEY="your-api-key"

# 2. Install dependencies
npm install

# 3. Start the service
npm start

# 4. Run manual analysis (optional)
npm run improvement:daily

# 5. Setup automated scheduling
npm run setup:cron
```

## What You Get

A fully autonomous system that:
- Learns from every customer interaction
- Finds and fixes bugs automatically
- Discovers new features customers want
- Optimizes performance continuously
- Generates test coverage automatically
- Documents your code
- Sends you proposals for approval

## Environment Setup

### Required Variables

```bash
# In backend/reasoning-gateway/.env
ENABLE_SELF_IMPROVEMENT=true
ANTHROPIC_API_KEY=sk-ant-your-key-here
REDIS_URL=redis://localhost:6379
```

### Optional (but recommended)

```bash
# BigQuery for advanced analytics
ENABLE_BIGQUERY_MEMORY=true
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GCP_PROJECT_ID=your-project-id

# Customize thresholds
IMPROVEMENT_MIN_INTERACTIONS=100
IMPROVEMENT_MIN_ERRORS_FOR_REPORT=5
IMPROVEMENT_PERFORMANCE_THRESHOLD_MS=2000
```

## First Run

### Manual Test Run

```bash
# Dry run - analyze only, no changes
npm run improvement:dry-run

# Full analysis with all components
npm run improvement:full
```

### Expected Output

```
✓ Learning: Analyzed 423 interactions
✓ Performance: Found 5 slow endpoints
✓ Code Quality: Identified 12 test gaps
✓ Features: Discovered 3 feature requests
✓ Bugs: Detected 2 recurring errors

Generated 15 improvement proposals
```

## Scheduled Automation

### Setup Cron (Linux/Mac)

```bash
npm run setup:cron
```

This sets up:
- Daily at 2 AM: Analyze interactions
- Weekly Monday 6 AM: Generate proposals
- Monthly 1st at 8 AM: Refactoring report
- Hourly: Auto-execute approved improvements

### Setup Systemd (Production)

```bash
# Copy service files
sudo cp scripts/*.service /etc/systemd/system/
sudo cp scripts/*.timer /etc/systemd/system/

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable livhana-improvement.timer
sudo systemctl start livhana-improvement.timer
```

## Using the Dashboard

### View All Proposals

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/improvements/proposals | jq
```

### Get Metrics

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/improvements/metrics | jq
```

### Approve a Proposal

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"autoExecute": true}' \
  http://localhost:4002/api/improvements/proposals/PROPOSAL_ID/approve
```

## Safety Features

### Always Enabled
- Tests required before any code changes
- Rollback on failure (automatic)
- Approval required for critical changes
- Audit trail of all actions

### Configuration
```javascript
// In self-improvement-loop.js
this.safetyChecks = {
  requireApproval: true,        // You approve first
  requireTests: true,           // Tests must pass
  allowProductionDeploy: false, // No auto-deploy to prod
  maxChangesPerProposal: 10,    // Max 10 files per change
  maxLinesPerChange: 500,       // Max 500 lines per file
};
```

## Example Workflow

### Day 1: Initial Setup
```bash
# Setup and first run
npm install
npm run improvement:full
# Review generated proposals
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/improvements/proposals
```

### Daily: Review & Approve
```bash
# Check new proposals
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/improvements/proposals | jq '.proposals[] | select(.status == "pending_approval")'

# Approve good ones
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/improvements/proposals/PROPOSAL_ID/approve
```

### Weekly: Check Metrics
```bash
# View dashboard
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/improvements/metrics | jq

# Sample output:
# {
#   "metrics": {
#     "improvementsImplemented": 30,
#     "bugsFixed": 7,
#     "featuresImplemented": 5,
#     "testsGenerated": 45
#   },
#   "performanceGains": {
#     "totalResponseTimeReduced": 3250,
#     "optimizedEndpoints": 15
#   }
# }
```

## Common Commands

```bash
# Daily analysis
npm run improvement:daily

# Weekly report with proposals
npm run improvement:weekly

# Monthly refactoring suggestions
npm run improvement:monthly

# Full analysis + dashboard
npm run improvement:full

# Auto-execute low-risk improvements
npm run improvement:auto

# Test without making changes
npm run improvement:dry-run
```

## Monitoring

### View Logs
```bash
# Service logs
tail -f /var/log/livhana-improvement-daily.log

# Application logs (if using systemd)
sudo journalctl -u livhana-improvement -f
```

### Check Redis
```bash
# View all proposals
redis-cli KEYS "improvement:proposal:*"

# View summary
redis-cli GET "improvement:proposals:summary" | jq

# Check specific proposal
redis-cli GET "improvement:proposal:PROPOSAL_ID" | jq
```

### BigQuery Queries
```sql
-- Recent executions
SELECT * FROM ai_learning.agent_executions
ORDER BY timestamp DESC
LIMIT 10;

-- Performance improvements
SELECT
  DATE(timestamp) as date,
  COUNT(*) as improvements,
  AVG(response_time_reduction) as avg_ms_saved
FROM performance.optimizations
GROUP BY date
ORDER BY date DESC;
```

## Troubleshooting

### No proposals generated
```bash
# Check if there's enough data
# Need 100+ interactions, 5+ errors, or 3+ feature requests

# Run manual analysis to see what's available
npm run improvement:full
```

### Execution failing
```bash
# Check tests
npm test

# Check rollback logs
grep "Rolling back" /var/log/livhana-improvement.log

# Verify proposal status
redis-cli GET "improvement:proposal:PROPOSAL_ID" | jq .status
```

### Service not starting
```bash
# Check environment variables
env | grep IMPROVEMENT

# Check Redis
redis-cli ping

# Check Anthropic API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"hi"}]}'
```

## Best Practices

1. **Start with dry runs** - Get comfortable with the system first
2. **Review all proposals** - Don't blindly approve everything
3. **Enable auto-execution gradually** - Start with docs and tests only
4. **Monitor metrics weekly** - Track improvements over time
5. **Adjust thresholds** - Tune for your data volume and quality

## What Gets Improved?

### Learning
- Response patterns that work well
- Knowledge gaps to fill
- Customer preferences and needs

### Performance
- Slow API endpoints (>2s response time)
- Database query optimizations
- Caching opportunities

### Code Quality
- Missing test coverage
- Complex functions to refactor
- Undocumented code

### Features
- Commonly requested features
- Customer pain points
- Integration opportunities

### Bugs
- Recurring errors (5+ occurrences)
- Root cause analysis
- Preventive measures

## Next Steps

1. Read [SELF_IMPROVEMENT_GUIDE.md](./SELF_IMPROVEMENT_GUIDE.md) for full documentation
2. Check out proposal examples in `reports/improvements/`
3. Review the API reference for integration
4. Join the improvement review workflow
5. Customize thresholds for your needs

## Support

Questions? Check:
- Full guide: [SELF_IMPROVEMENT_GUIDE.md](./SELF_IMPROVEMENT_GUIDE.md)
- Logs: `/var/log/livhana-improvement*.log`
- Redis: `redis-cli KEYS "improvement:*"`
- Email: jesse@livhana.com

## License

Proprietary - Liv Hana / Trinity Empire

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

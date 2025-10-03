# Self-Improvement Loop - Complete Guide

## Overview

The Self-Improvement Loop is Liv Hana's autonomous learning and optimization system. It continuously monitors, learns, and improves the entire platform by:

- Learning from customer interactions
- Optimizing performance automatically
- Detecting and fixing bugs
- Discovering and implementing features
- Generating improvement proposals for approval

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Self-Improvement Loop                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Learning    │  │ Performance  │  │ Code Quality │     │
│  │  Analysis    │  │ Optimization │  │ Improvements │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Feature    │  │     Bug      │  │   Proposal   │     │
│  │  Discovery   │  │  Detection   │  │  Generation  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Approval Workflow                        │  │
│  │  (Generates proposals → Jesse approves → Execute)    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Safety Rails & Rollback                  │  │
│  │  (Tests required, audit trail, rollback capability)  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 1. Continuous Learning

- Monitors all customer interactions via BigQuery
- Extracts successful conversation patterns
- Identifies failure modes and knowledge gaps
- Builds knowledge base automatically
- Learns from sentiment and outcomes

### 2. Performance Optimization

- Tracks API response times
- Identifies slow endpoints
- Suggests database query optimizations
- Proposes caching strategies
- Auto-generates performance improvements

### 3. Code Quality Improvements

- Analyzes test coverage gaps
- Suggests new unit and integration tests
- Identifies refactoring opportunities
- Finds code duplication and complexity issues
- Auto-generates JSDoc documentation

### 4. Feature Discovery

- Analyzes customer requests from conversations
- Identifies common feature requests
- Clusters similar requests into themes
- Prioritizes by frequency and business value
- Auto-generates feature specifications

### 5. Bug Detection

- Monitors error logs in BigQuery and Redis
- Correlates errors with recent code changes
- Analyzes error patterns and frequencies
- Suggests root cause fixes with code
- Auto-generates bug reports with test cases

### 6. Integration with Memory Learning

- Uses customer interaction data from memory engine
- Learns from conversation patterns
- Improves AI responses over time
- Builds customer preference models

### 7. Scheduled Jobs

- **Daily (2 AM)**: Analyze yesterday's interactions
- **Weekly (Monday 6 AM)**: Generate improvement proposals
- **Monthly (1st at 8 AM)**: Major refactoring suggestions
- **Hourly**: Auto-execute approved improvements

### 8. Approval Workflow

- Generates detailed proposals with implementation plans
- Sends to Jesse for review via dashboard/API
- Tracks approval status in Redis
- Executes approved improvements with safety checks
- Reports success metrics

### 9. Metrics Dashboard

- Improvements proposed/approved/implemented
- Performance gains achieved
- Features added, bugs fixed
- Tests and docs generated
- Recent activity timeline

### 10. Safety Rails

- Never deploys to production without approval
- Always runs tests before proposing changes
- Rollback capability for all changes
- Audit trail of all improvements
- Resource limits and security hardening

## Setup

### Prerequisites

```bash
# Required environment variables
export ANTHROPIC_API_KEY="your-api-key"
export REDIS_URL="redis://localhost:6379"
export ENABLE_SELF_IMPROVEMENT="true"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/bigquery-credentials.json"
```

### Installation

1. **Install Dependencies**

```bash
cd backend/reasoning-gateway
npm install @anthropic-ai/sdk
```

2. **Setup BigQuery Tables** (if not already done)

```sql
-- Create learning dataset
CREATE SCHEMA IF NOT EXISTS ai_learning;

-- Customer interactions table
CREATE TABLE IF NOT EXISTS ai_learning.customer_interactions (
  customer_id STRING,
  interaction_type STRING,
  message STRING,
  response STRING,
  metadata JSON,
  sentiment_score FLOAT64,
  outcome STRING,
  timestamp TIMESTAMP
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance.api_metrics (
  endpoint STRING,
  response_time_ms INT64,
  error_rate FLOAT64,
  timestamp TIMESTAMP
);

-- Error logs table
CREATE TABLE IF NOT EXISTS logs.error_logs (
  error_message STRING,
  error_stack STRING,
  endpoint STRING,
  timestamp TIMESTAMP
);
```

3. **Setup Cron Jobs**

```bash
cd backend/reasoning-gateway/scripts
chmod +x setup-cron.sh run-improvement-cycle.js
./setup-cron.sh
```

4. **Setup Systemd Service** (for production)

```bash
# Copy service files
sudo cp scripts/livhana-improvement.service /etc/systemd/system/
sudo cp scripts/livhana-improvement.timer /etc/systemd/system/

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable livhana-improvement.timer
sudo systemctl start livhana-improvement.timer

# Check status
sudo systemctl status livhana-improvement.timer
```

5. **Start the Reasoning Gateway**

```bash
npm start
```

## Usage

### API Endpoints

All endpoints require authentication via `authMiddleware`.

#### Get Metrics Dashboard

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/improvements/metrics
```

Response:

```json
{
  "metrics": {
    "improvementsProposed": 42,
    "improvementsApproved": 35,
    "improvementsImplemented": 30,
    "bugsDetected": 8,
    "bugsFixed": 7,
    "featuresDiscovered": 12,
    "featuresImplemented": 5,
    "performanceImprovements": 15,
    "testsGenerated": 45,
    "docsGenerated": 28
  },
  "proposals": {
    "total": 42,
    "pending": 7,
    "approved": 5,
    "implemented": 30,
    "failed": 0
  },
  "recentActivity": [...],
  "performanceGains": {
    "totalResponseTimeReduced": 3250,
    "optimizedEndpoints": 15,
    "averageImprovement": 216.67
  }
}
```

#### Get All Proposals

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/improvements/proposals
```

#### Get Single Proposal

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/improvements/proposals/{proposalId}
```

#### Approve Proposal

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"autoExecute": true}' \
  http://localhost:4002/api/improvements/proposals/{proposalId}/approve
```

#### Reject Proposal

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Not needed right now"}' \
  http://localhost:4002/api/improvements/proposals/{proposalId}/reject
```

#### Execute Approved Proposal

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/improvements/proposals/{proposalId}/execute
```

#### Trigger Manual Analysis

```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:4002/api/improvements/analyze
```

### Command Line

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

### Cron Schedule

View installed cron jobs:

```bash
crontab -l
```

Edit cron jobs:

```bash
crontab -e
```

View logs:

```bash
tail -f /var/log/livhana-improvement-daily.log
tail -f /var/log/livhana-improvement-weekly.log
tail -f /var/log/livhana-improvement-monthly.log
tail -f /var/log/livhana-improvement-auto.log
```

## Configuration

Edit configuration in `self-improvement-loop.js`:

```javascript
this.config = {
  minInteractionsForLearning: 100,        // Min interactions before learning
  minErrorsForBugReport: 5,               // Min error frequency for bug report
  minFeatureRequestsForProposal: 3,       // Min requests for feature proposal
  performanceThresholdMs: 2000,           // Response time threshold
  analysisInterval: 24 * 60 * 60 * 1000, // Analysis interval (24h)
  approvalRequired: true,                 // Require approval for changes
  maxAutoFixesPerDay: 5,                  // Max auto-fixes without approval
  testRequired: true,                     // Require tests for all changes
};

this.safetyChecks = {
  requireApproval: true,                  // Require approval
  requireTests: true,                     // Require tests
  requireReview: true,                    // Require review
  allowProductionDeploy: false,           // Allow prod deployment
  maxChangesPerProposal: 10,              // Max file changes per proposal
  maxLinesPerChange: 500,                 // Max lines changed per file
};
```

## Proposal Types

### Learning Proposals

- Based on customer interaction analysis
- Improves response patterns and knowledge base
- Priority: Medium
- Usually requires approval

### Performance Proposals

- Optimizes slow endpoints
- Suggests caching and query improvements
- Priority: High
- Requires approval for significant changes

### Code Quality Proposals

- Adds missing tests
- Refactors complex code
- Generates documentation
- Priority: Low-Medium
- Tests and docs can auto-generate

### Feature Proposals

- New features based on customer requests
- Includes technical specifications
- Priority: Medium-High
- Always requires approval

### Bug Fix Proposals

- Fixes recurring errors
- Includes root cause analysis and tests
- Priority: High-Critical
- Critical bugs require approval
- Low-priority bugs can auto-fix

## Safety Features

### 1. Approval Workflow

- All proposals are stored in Redis
- Status tracking: pending → approved/rejected → implemented/failed
- Approval required for:
  - Critical changes
  - Production deployments
  - Major refactorings
  - New features

### 2. Testing Requirements

- All changes must include tests
- Tests run before implementation
- Failed tests prevent deployment
- Test coverage tracked

### 3. Rollback Capability

- Git stash created before changes
- Automatic rollback on failure
- Rollback plans generated for each proposal
- Full audit trail maintained

### 4. Resource Limits

- Max changes per proposal
- Max lines per change
- Max auto-fixes per day
- Memory and CPU limits in systemd

### 5. Audit Trail

- All proposals stored in Redis (30 days)
- Execution history tracked
- Success/failure metrics logged
- Reports saved to disk

## Monitoring

### Health Check

```bash
curl http://localhost:4002/api/improvements/health
```

### Logs

```bash
# Service logs
sudo journalctl -u livhana-improvement -f

# Application logs
tail -f /var/log/livhana-improvement.log
tail -f /var/log/livhana-improvement-error.log
```

### Redis Keys

```bash
# All proposals
redis-cli KEYS "improvement:proposal:*"

# Proposals summary
redis-cli GET "improvement:proposals:summary"

# Knowledge base entries
redis-cli KEYS "knowledge:*"
```

### BigQuery Monitoring

```sql
-- Recent improvement executions
SELECT * FROM ai_learning.agent_executions
ORDER BY timestamp DESC
LIMIT 100;

-- Performance improvements over time
SELECT
  DATE(timestamp) as date,
  COUNT(*) as improvements,
  AVG(response_time_reduction) as avg_reduction
FROM performance.optimizations
GROUP BY date
ORDER BY date DESC;
```

## Troubleshooting

### Self-Improvement Not Starting

```bash
# Check environment variables
echo $ENABLE_SELF_IMPROVEMENT
echo $ANTHROPIC_API_KEY

# Check Redis connection
redis-cli ping

# Check logs
tail -f logs/reasoning-gateway.log
```

### Proposals Not Generating

```bash
# Check BigQuery connection
gcloud auth application-default login

# Check data availability
node -e "
const { BigQuery } = require('@google-cloud/bigquery');
const bq = new BigQuery();
bq.query('SELECT COUNT(*) FROM ai_learning.customer_interactions WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)')
  .then(([rows]) => console.log(rows));
"

# Run manual analysis
node scripts/run-improvement-cycle.js --type=daily
```

### Executions Failing

```bash
# Check test failures
npm test

# Check rollback logs
grep "Rolling back" /var/log/livhana-improvement.log

# Check proposal status
redis-cli GET "improvement:proposal:{id}"
```

## Best Practices

1. **Review Proposals Daily**
   - Check dashboard every morning
   - Approve low-risk improvements quickly
   - Review high-priority bugs immediately

2. **Monitor Performance Gains**
   - Track metrics weekly
   - Verify optimizations are working
   - Adjust thresholds as needed

3. **Test Before Approval**
   - Run tests locally for critical changes
   - Review generated code carefully
   - Verify rollback plans exist

4. **Adjust Configuration**
   - Tune thresholds based on data volume
   - Adjust safety checks for your workflow
   - Enable/disable auto-execution per environment

5. **Regular Maintenance**
   - Clean up old proposals monthly
   - Archive reports quarterly
   - Update BigQuery schemas as needed

## Integration with Other Systems

### Memory Learning Engine

```javascript
import { getMemoryLearningEngine } from './memory_learning.js';

const memoryEngine = await getMemoryLearningEngine({ logger });
const context = await memoryEngine.getContext(customerId);
// Self-improvement learns from this context
```

### Claude Autonomous Agent

```javascript
import { createClaudeAgent } from './claude-autonomous-agent.js';

const agent = createClaudeAgent({ logger });
await agent.executeTask('Implement improvement proposal', { proposalId });
// Agent can execute approved proposals
```

## Future Enhancements

- [ ] Slack/Email notifications for proposals
- [ ] Visual dashboard web UI
- [ ] A/B testing for improvements
- [ ] ML model for proposal prioritization
- [ ] Integration with CI/CD pipeline
- [ ] Customer feedback integration
- [ ] Automatic documentation generation
- [ ] Code review comments integration
- [ ] Performance regression detection
- [ ] Security vulnerability scanning

## Support

For issues or questions:

- Check logs first: `/var/log/livhana-improvement*.log`
- Review Redis data: `redis-cli KEYS "improvement:*"`
- Check BigQuery: Query `ai_learning.agent_executions`
- Contact: <jesse@livhana.com>

## License

Proprietary - Liv Hana / Trinity Empire

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->

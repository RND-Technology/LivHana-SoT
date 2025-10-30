# High Noon Cartoon - Continuous Monitoring Dashboard System

## Overview

This is the autonomous monitoring and continuous improvement system for High Noon Cartoon. It tracks all operations in real-time, analyzes content quality, identifies successful patterns, and automatically adjusts generation parameters to optimize performance.

## System Components

### 1. Real-Time Monitoring Dashboard (`monitoring-dashboard.html`)

Interactive web dashboard that displays:

- **System Health**: HNC Content Engine, News Pipeline, Swarm Coordinator, Replit Services
- **Episode Generation**: Total episodes, today's count, success rate, current progress
- **Quality Metrics**: Funny score, quotable score, advocacy message clarity
- **Revenue Tracking**: Total revenue, production costs, profit, ROI
- **Target Persona Engagement (TPOPs)**:
  - Texas cannabis users
  - Federal legalization advocates
  - Trump supporters who use cannabis
  - Gen Z short-form content consumers
- **Recent Activity Log**: Real-time feed of all operations
- **Continuous Learning Insights**: Auto-discovered patterns and improvements

**Features**:

- Auto-refreshes every 30 seconds
- Real-time status indicators
- Visual progress bars and charts
- Responsive design
- No backend required (reads from JSON reports)

### 2. System Monitor (`monitor-all-systems.mjs`)

Comprehensive system health checker that runs every 5 minutes:

**Monitors**:

- HNC content generation status (scripts, episodes, latest production)
- News pipeline activity (articles processed, cannabis/political news)
- Swarm coordinator health (agent activity, task completion)
- Replit service deployment status

**Outputs**:

- `reports/autonomous-status/status-{TIMESTAMP}.json` - Timestamped reports
- `reports/autonomous-status/latest-status.json` - Always current status
- `reports/autonomous-status/ALERTS.log` - Alert history with recovery suggestions

**Usage**:

```bash
# Run single scan
./monitor-all-systems.mjs once

# Run continuous monitoring (every 5 minutes)
./monitor-all-systems.mjs continuous 5
```

### 3. Continuous Improvement Loop (`continuous-improvement-loop.mjs`)

Analyzes completed episodes every 30 minutes and auto-adjusts parameters:

**Analyzes**:

- Funny score (humor indicators, jokes, wordplay)
- Quotable score (memorable phrases, catchphrases)
- Advocacy score (legalization messaging clarity)
- Target persona alignment (which personas engage most)

**Identifies Patterns**:

- Texas-specific humor effectiveness
- Freedom/liberty messaging impact
- Successful content structures
- High-engagement topics

**Auto-Adjusts**:

- Humor density multiplier
- Advocacy strength multiplier
- Texas references frequency
- Catchphrase frequency
- Target content length
- Persona priority ranking

**Outputs**:

- `LEARNINGS.md` - Human-readable insights and recommendations
- `output/quality-metrics.json` - Machine-readable quality scores
- `output/auto-adjustment-params.json` - Parameters for next generation

**Usage**:

```bash
# Run single analysis
./continuous-improvement-loop.mjs once

# Run continuous loop (every 30 minutes)
./continuous-improvement-loop.mjs continuous 30
```

### 4. Launcher Scripts

**`launch-monitoring.sh`** - Start all monitoring services:

```bash
./launch-monitoring.sh
```

Starts:

1. System monitor (5-minute intervals)
2. Continuous improvement loop (30-minute intervals)
3. Opens monitoring dashboard in browser

Logs to:

- `reports/autonomous-status/monitor.log`
- `reports/autonomous-status/improvement.log`

**`stop-monitoring.sh`** - Stop all services:

```bash
./stop-monitoring.sh
```

## Quick Start

### Option 1: Launch Everything (Recommended)

```bash
cd empire/content-engine
./launch-monitoring.sh
```

This will:

1. Start all monitoring services
2. Open the dashboard in your browser
3. Begin continuous monitoring and improvement
4. Log all activity

### Option 2: Manual Control

```bash
# Terminal 1: System Monitor
cd empire/content-engine
./monitor-all-systems.mjs continuous 5

# Terminal 2: Improvement Loop
cd empire/content-engine
./continuous-improvement-loop.mjs continuous 30

# Terminal 3: Open Dashboard
open monitoring-dashboard.html
```

### Option 3: One-Time Analysis

```bash
# Check system status once
./monitor-all-systems.mjs once

# Analyze episode quality once
./continuous-improvement-loop.mjs once

# View dashboard
open monitoring-dashboard.html
```

## Target Personas (TPOPs)

The system tracks engagement with these target personas:

### 1. Texas Cannabis Users (25% weight)

- **Keywords**: texas, lone star, bbq, oil, cowboy, ranch
- **Strategy**: Texas-specific cultural references
- **Goal**: 85%+ alignment

### 2. Federal Legalization Advocates (25% weight)

- **Keywords**: federal, legalization, law, policy, congress, senate
- **Strategy**: Political advocacy messaging
- **Goal**: 90%+ alignment

### 3. Trump Supporters (Cannabis Users) (20% weight)

- **Keywords**: trump, conservative, republican, freedom, liberty, rights
- **Strategy**: Freedom/liberty messaging
- **Goal**: 75%+ alignment

### 4. Gen Z Short-Form Consumers (30% weight)

- **Keywords**: short, quick, viral, meme, trend, social
- **Strategy**: < 2 minute episodes, viral potential
- **Goal**: 95%+ alignment

## Quality Scoring System

Episodes are scored on three dimensions (0-10 scale):

### Funny Score

Measures humor effectiveness:

- Joke density
- Wordplay and puns
- Situational comedy
- Witty dialogue
- Absurdist humor

**Target**: 8.5+/10

### Quotable Score

Measures memorability:

- Catchphrases
- One-liners
- Memorable dialogue
- Repeatable quotes
- Wisdom/lessons

**Target**: 9.0+/10

### Advocacy Score

Measures legalization messaging:

- Cannabis references
- Legalization advocacy
- Freedom/rights messaging
- Policy discussion
- Social justice themes

**Target**: 9.5+/10

## Auto-Adjustment Parameters

The system automatically adjusts these parameters based on analysis:

### Humor Density

- **Range**: 0.8 - 1.5
- **Default**: 1.0
- **Adjustment**: If funny score < 8.0, increase by 20%

### Advocacy Strength

- **Range**: 0.8 - 1.5
- **Default**: 1.0
- **Adjustment**: If advocacy score < 9.0, increase by 15%

### Catchphrase Frequency

- **Range**: 0.8 - 1.5
- **Default**: 1.0
- **Adjustment**: If quotable score < 8.5, increase by 30%

### Target Length

- **Range**: 60-180 seconds
- **Default**: 120 seconds
- **Adjustment**: Optimize for Gen Z (< 120 seconds)

## Alert System

Alerts are logged to `reports/autonomous-status/ALERTS.log` with:

- Timestamp
- Severity (INFO, WARNING, ERROR, CRITICAL)
- System affected
- Error message
- Recovery suggestion

### Alert Levels

**INFO**: Informational, no action needed

- System started
- Routine operations

**WARNING**: Attention needed, non-critical

- No recent episodes generated
- Low persona alignment
- Swarm coordinator idle

**ERROR**: Action required

- Content generation failed
- News pipeline error
- File system issues

**CRITICAL**: Immediate action required

- System health critical
- Multiple failures
- Data corruption

## Files and Directories

```
empire/content-engine/
├── monitoring-dashboard.html          # Real-time web dashboard
├── monitor-all-systems.mjs           # System health monitor
├── continuous-improvement-loop.mjs   # Quality analyzer
├── launch-monitoring.sh              # Start all services
├── stop-monitoring.sh                # Stop all services
├── MONITORING-README.md              # This file
├── LEARNINGS.md                      # Auto-generated insights
└── output/
    ├── quality-metrics.json          # Quality scores
    ├── auto-adjustment-params.json   # Generation parameters
    ├── scripts/                      # Episode scripts
    ├── episodes/                     # Produced episodes
    └── metrics/                      # Episode metrics

reports/autonomous-status/
├── latest-status.json                # Current system status
├── status-{TIMESTAMP}.json           # Historical reports
├── ALERTS.log                        # Alert history
├── monitor.log                       # Monitor service log
├── improvement.log                   # Improvement loop log
├── monitor.pid                       # Monitor process ID
└── improvement.pid                   # Improvement process ID
```

## Monitoring Intervals

- **System Monitor**: Every 5 minutes
- **Improvement Loop**: Every 30 minutes
- **Dashboard Refresh**: Every 30 seconds

Intervals are configurable:

```bash
./monitor-all-systems.mjs continuous 10      # Every 10 minutes
./continuous-improvement-loop.mjs continuous 60   # Every 60 minutes
```

## Integration with Content Engine

The monitoring system feeds learnings back to the content engine:

1. **Continuous Improvement Loop** analyzes episodes
2. Generates `auto-adjustment-params.json`
3. Content engine reads parameters on next run
4. Adjusts humor, advocacy, persona targeting
5. Produces improved episodes
6. Loop continues

## Performance Metrics

The system tracks:

- **Uptime**: 99.9% target
- **Response Time**: < 5 seconds for monitoring scans
- **Storage**: ~1MB per day of reports
- **CPU Usage**: Minimal (runs in background)

## Troubleshooting

### Dashboard not updating?

Check `reports/autonomous-status/latest-status.json` exists and is recent.

### Services not running?

```bash
ps aux | grep monitor-all-systems
ps aux | grep continuous-improvement
```

### Clear stale PIDs

```bash
rm reports/autonomous-status/*.pid
```

### Reset monitoring

```bash
./stop-monitoring.sh
./launch-monitoring.sh
```

### View logs

```bash
tail -f reports/autonomous-status/monitor.log
tail -f reports/autonomous-status/improvement.log
tail -f reports/autonomous-status/ALERTS.log
```

## API Integration (Future)

The monitoring system is designed for API integration:

- `GET /api/status` - Current system status
- `GET /api/episodes` - Episode metrics
- `GET /api/quality` - Quality scores
- `GET /api/personas` - Persona engagement
- `GET /api/alerts` - Active alerts
- `POST /api/adjust` - Manual parameter adjustment

## Security

- All reports stored locally
- No external network calls (unless content engine configured)
- Read-only dashboard (no write operations)
- Process isolation (separate processes)

## Scaling

For high-volume production:

- Adjust monitoring intervals (increase frequency)
- Archive old reports (> 30 days)
- Implement database backend for reports
- Add distributed monitoring (multiple nodes)
- Enable real-time websocket updates

## Next Steps

1. **Launch monitoring**: `./launch-monitoring.sh`
2. **Generate episodes**: Run content engine
3. **Watch dashboard**: Real-time updates
4. **Review learnings**: Check `LEARNINGS.md` daily
5. **Optimize**: Act on recommendations

## Support

For issues or questions:

- Check `ALERTS.log` for system errors
- Review `monitor.log` and `improvement.log`
- Verify `latest-status.json` is updating
- Restart services: `./stop-monitoring.sh && ./launch-monitoring.sh`

---

**Built for**: High Noon Cartoon Autonomous Operations
**Purpose**: Continuous monitoring, quality improvement, and optimization
**Status**: Production Ready
**Last Updated**: 2025-10-07

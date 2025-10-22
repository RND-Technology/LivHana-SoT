# Slack Bot Deployment - Liv Hana Team Assistant

**Target:** Slack Workspace
**Timeline:** 4-6 hours
**ROI Target:** $500/day
**Status:** Ready for deployment

## Slack App Configuration

### App Name: "Liv Hana Team Assistant"

### Description

"Voice-enabled cannabis intelligence bot for team collaboration. Provides RPM planning, compliance guidance, and strategic intelligence. TRUTH-validated and competition-driven."

### Bot Token Scopes

```
app_mentions:read
channels:read
chat:write
commands
files:read
groups:read
im:read
mpim:read
users:read
```

### Slash Commands

```
/liv - Get Liv Hana status and recent wins
/rpm - Generate RPM plan for current project
/compliance - Check compliance status
/prediction - Submit ROI prediction
/leaderboard - View competition leaderboard
/voice - Activate voice mode (if available)
```

## Implementation

### 1. Slack App Setup (1 hour)

```bash
# Create Slack app
# Configure OAuth & Permissions
# Install to workspace
# Get bot token
```

### 2. Bot Logic (2 hours)

```javascript
// main.js
const { App } = require('@slack/bolt');
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Slash command handlers
app.command('/liv', async ({ command, ack, respond }) => {
  await ack();
  
  const status = await getLivHanaStatus();
  const recentWins = await getRecentWins();
  
  await respond({
    text: `Liv Hana here, full state.`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Status:* ${status}\n*Recent Wins:* ${recentWins}`
        }
      }
    ]
  });
});

app.command('/rpm', async ({ command, ack, respond }) => {
  await ack();
  
  const rpmPlan = await generateRPMPlan(command.text);
  
  await respond({
    text: "RPM Plan Generated",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Result:* ${rpmPlan.result}\n*Purpose:* ${rpmPlan.purpose}\n*MAP:* ${rpmPlan.map}`
        }
      }
    ]
  });
});

app.command('/prediction', async ({ command, ack, respond }) => {
  await ack();
  
  const prediction = await submitPrediction(command.text);
  
  await respond({
    text: "Prediction Submitted",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Projection:* ${prediction.projection}\n*Confidence:* ${prediction.confidence}%\n*ROI Target:* $${prediction.roiTarget}/day`
        }
      }
    ]
  });
});

app.command('/leaderboard', async ({ command, ack, respond }) => {
  await ack();
  
  const leaderboard = await getLeaderboard();
  
  await respond({
    text: "Competition Leaderboard",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Daily Leaderboard:*\n${leaderboard.entries.map(entry => 
            `${entry.rank}. ${entry.participant}: ${entry.accuracy}% ($${entry.roiPerDay}/day)`
          ).join('\n')}`
        }
      }
    ]
  });
});

// Voice mode handler
app.command('/voice', async ({ command, ack, respond }) => {
  await ack();
  
  const voiceStatus = await checkVoiceServices();
  
  if (voiceStatus.available) {
    await respond({
      text: "Voice mode activated. Say 'Liv' for brevity mode.",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Voice Mode:* Active\n*STT:* Whisper (port 2022)\n*TTS:* Kokoro (port 8880)"
          }
        }
      ]
    });
  } else {
    await respond({
      text: "Voice mode unavailable. Using text mode.",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Voice Mode:* Unavailable\n*Fallback:* Text mode active"
          }
        }
      ]
    });
  }
});

// Start the app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('Liv Hana Slack Bot is running!');
})();
```

### 3. Backend Integration (1 hour)

```javascript
// services/livHanaService.js
const axios = require('axios');

class LivHanaService {
  constructor() {
    this.baseURL = process.env.LIV_HANA_BASE_URL || 'http://localhost:8080';
    this.complianceURL = process.env.COMPLIANCE_URL || 'http://localhost:8000';
    this.competitionURL = process.env.COMPETITION_URL || 'http://localhost:8001';
  }

  async getStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/health`);
      return response.data.status;
    } catch (error) {
      return 'unavailable';
    }
  }

  async generateRPMPlan(query) {
    try {
      const response = await axios.post(`${this.baseURL}/api/v1/rpm/generate`, {
        query: query,
        context: 'slack_bot'
      });
      return response.data;
    } catch (error) {
      return {
        result: 'Error generating RPM plan',
        purpose: 'Debug and fix',
        map: ['Check service health', 'Verify API endpoints', 'Retry request']
      };
    }
  }

  async submitPrediction(data) {
    try {
      const response = await axios.post(`${this.competitionURL}/api/v1/projections`, {
        participant: 'slack_bot',
        metric: 'roi_per_day',
        value: data.roiTarget,
        unit: 'USD',
        timeframe: data.timeframe,
        confidence: data.confidence,
        context: {
          project: data.project,
          source: 'slack_bot'
        }
      });
      return response.data;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getLeaderboard() {
    try {
      const response = await axios.get(`${this.competitionURL}/api/v1/leaderboard?type=daily&limit=10`);
      return response.data;
    } catch (error) {
      return { leaderboard: [] };
    }
  }

  async checkVoiceServices() {
    try {
      const sttResponse = await axios.get('http://localhost:2022/health');
      const ttsResponse = await axios.get('http://localhost:8880/health');
      
      return {
        available: sttResponse.status === 200 && ttsResponse.status === 200,
        stt: sttResponse.status === 200,
        tts: ttsResponse.status === 200
      };
    } catch (error) {
      return { available: false, stt: false, tts: false };
    }
  }
}

module.exports = LivHanaService;
```

### 4. Package Configuration (30 minutes)

```json
{
  "name": "liv-hana-slack-bot",
  "version": "1.0.0",
  "description": "Liv Hana Team Assistant Slack Bot",
  "main": "main.js",
  "scripts": {
    "start": "node main.js",
    "dev": "nodemon main.js"
  },
  "dependencies": {
    "@slack/bolt": "^3.12.0",
    "axios": "^1.6.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### 5. Environment Configuration (30 minutes)

```bash
# .env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
LIV_HANA_BASE_URL=http://localhost:8080
COMPLIANCE_URL=http://localhost:8000
COMPETITION_URL=http://localhost:8001
PORT=3000
```

## Deployment Steps

### 1. Create Slack App (1 hour)

1. Go to api.slack.com/apps
2. Create new app
3. Configure OAuth & Permissions
4. Install to workspace
5. Get bot token

### 2. Deploy Bot Code (2 hours)

1. Set up Node.js environment
2. Install dependencies
3. Configure environment variables
4. Deploy to hosting service

### 3. Configure Slash Commands (1 hour)

1. Add slash command endpoints
2. Test each command
3. Verify backend integration
4. Test voice mode

### 4. Launch & Monitor (1 hour)

1. Share with team
2. Monitor usage metrics
3. Track competition scores
4. Iterate based on feedback

## Success Metrics

### Primary KPIs

- **ROI/$/Day:** Target $500/day
- **Team Adoption:** 80%+ of team members
- **Command Usage:** 50+ commands/day
- **Response Quality:** TRUTH compliance > 95%

### Competition Tracking

- **Accuracy:** Projection vs Actual
- **Speed:** Command response time
- **Value Delivered:** $ impact per command
- **Improvement:** Week-over-week gains

## Next Steps

1. **Deploy Slack Bot** (4-6 hours)
2. **Monitor competition metrics** (ongoing)
3. **Iterate based on team feedback** (weekly)
4. **Scale to other workspaces** (monthly)

---

**Status:** Ready for deployment
**Timeline:** 4-6 hours
**ROI Target:** $500/day
**Competition:** Live tracking via port 8001 API

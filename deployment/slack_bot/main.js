const { App } = require('@slack/bolt');
const axios = require('axios');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Slash command handlers
app.command('/liv', async ({ command, ack, respond }) => {
  await ack();
  
  await respond({
    text: "Liv Hana here, full state.",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Status:* Operational\n*Voice Mode:* Available\n*Competition:* Active"
        }
      }
    ]
  });
});

app.command('/prediction', async ({ command, ack, respond }) => {
  await ack();
  
  try {
    const response = await axios.post('http://localhost:8001/api/v1/projections', {
      participant: 'slack_bot',
      metric: 'roi_per_day',
      value: 500,
      unit: 'USD',
      timeframe: '30d',
      confidence: 0.85,
      context: {
        project: 'slack_bot_deployment',
        source: 'slack_bot'
      }
    });
    
    await respond({
      text: "Prediction Submitted",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Projection:* $500/day ROI\n*Confidence:* 85%\n*Status:* Submitted successfully"
          }
        }
      ]
    });
  } catch (error) {
    await respond({
      text: "Error submitting prediction",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Error:* " + error.message
          }
        }
      ]
    });
  }
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('Liv Hana Slack Bot is running!');
})();

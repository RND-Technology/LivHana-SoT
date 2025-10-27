/**
 * Slack Bridge for Mobile Control
 * Handles Slack slash commands for voice mode control
 */

/* eslint-disable @typescript-eslint/no-unused-vars, no-case-declarations */

import express from 'express';
import crypto from 'crypto';
import Redis from 'ioredis';

interface SlackRequest {
  token: string;
  team_id: string;
  team_domain: string;
  channel_id: string;
  channel_name: string;
  user_id: string;
  user_name: string;
  command: string;
  text: string;
  response_url: string;
  trigger_id: string;
}

interface SlackResponse {
  response_type: 'ephemeral' | 'in_channel';
  text: string;
  attachments?: Array<{
    color: string;
    fields: Array<{
      title: string;
      value: string;
      short: boolean;
    }>;
  }>;
}

export function createSlackBridgeRoutes(): express.Router {
  const router = express.Router();
  const redisOptions: { host: string; port: number; password?: string } = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  };
  if (process.env.REDIS_PASSWORD) {
    redisOptions.password = process.env.REDIS_PASSWORD;
  }
  const redis = new Redis(redisOptions);

  // Verify Slack signature
  function verifySlackSignature(req: express.Request): boolean {
    const signature = req.headers['x-slack-signature'] as string;
    const timestamp = req.headers['x-slack-request-timestamp'] as string;
    const signingSecret = process.env.SLACK_SIGNING_SECRET;

    if (!signingSecret || !signature || !timestamp) {
      return false;
    }

    const hmac = crypto.createHmac('sha256', signingSecret);
    hmac.update(`v0:${timestamp}:${JSON.stringify(req.body)}`);
    const calculatedSignature = `v0=${hmac.digest('hex')}`;

    // Prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  }

  // Rate limiting
  async function checkRateLimit(userId: string): Promise<boolean> {
    const key = `ratelimit:slack:${userId}`;
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, 60); // 1 minute window
    }

    return count <= 10; // 10 requests per minute
  }

  // Handle /agent command
  router.post('/slack/agent', async (req, res) => {
    try {
      // Verify signature
      if (!verifySlackSignature(req)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const body = req.body as SlackRequest;
      const { user_id, text } = body;

      // Rate limiting
      if (!(await checkRateLimit(user_id))) {
        return res.json({
          response_type: 'ephemeral',
          text: '⚠️ Rate limit exceeded. Please wait a moment and try again.',
        } as SlackResponse);
      }

      // Parse command
      const [action] = text.trim().split(' ');

      let response: SlackResponse;

      switch (action) {
        case 'start-voice':
          await redis.publish('reasoning.jobs', JSON.stringify({
            type: 'voice_start',
            userId: user_id,
            timestamp: new Date().toISOString(),
          }));
          response = {
            response_type: 'ephemeral',
            text: '✅ Voice mode started',
          };
          break;

        case 'silence':
          await redis.publish('reasoning.jobs', JSON.stringify({
            type: 'voice_silence',
            userId: user_id,
            timestamp: new Date().toISOString(),
          }));
          response = {
            response_type: 'ephemeral',
            text: '🔇 Voice output paused',
          };
          break;

        case 'resume':
          await redis.publish('reasoning.jobs', JSON.stringify({
            type: 'voice_resume',
            userId: user_id,
            timestamp: new Date().toISOString(),
          }));
          response = {
            response_type: 'ephemeral',
            text: '🔊 Voice output resumed',
          };
          break;

        case 'status':
          const health = await redis.get('voice:health');
          const status = health ? JSON.parse(health) : { status: 'unknown' };
          response = {
            response_type: 'ephemeral',
            text: `📊 System Status: ${status.status}`,
            attachments: [{
              color: status.status === 'healthy' ? 'good' : 'warning',
              fields: [
                { title: 'Voice Engine', value: status.voice_engine || 'unknown', short: true },
                { title: 'NLP Service', value: status.nlp_service || 'unknown', short: true },
                { title: 'Timestamp', value: status.timestamp || 'unknown', short: true },
              ],
            }],
          };
          break;

        case 'logs':
          const logs = await redis.lrange('voice:logs', 0, 10);
          response = {
            response_type: 'ephemeral',
            text: '📋 Recent Logs:',
            attachments: logs.map(log => ({
              color: 'warning',
              fields: [{
                title: 'Log Entry',
                value: log,
                short: false,
              }],
            })),
          };
          break;

        default:
          response = {
            response_type: 'ephemeral',
            text: '❓ Unknown command. Available commands: `start-voice`, `silence`, `resume`, `status`, `logs`',
          };
      }

      return res.json(response);
    } catch (error) {
      console.error('Slack bridge error:', error);
      return res.status(500).json({
        response_type: 'ephemeral',
        text: '❌ Internal error. Please try again.',
      });
    }
  });

  return router;
}


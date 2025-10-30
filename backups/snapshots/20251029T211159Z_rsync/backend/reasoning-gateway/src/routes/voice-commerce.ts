/**
 * Voice Commerce Routes
 * Express routes for voice commerce API
 */

import express from 'express';
import { VoiceCommerceEngine } from '../engine/voice-commerce-engine';

export function createVoiceCommerceRoutes(engine: VoiceCommerceEngine): express.Router {
  const router = express.Router();

  router.get('/health', async (req, res) => {
    try {
      const health = await engine.healthCheck();
      res.json(health);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  router.post('/api/voice-commerce', async (req, res) => {
    try {
      const { transcript, customerId } = req.body;

      if (!transcript || !customerId) {
        return res.status(400).json({
          success: false,
          error: 'transcript and customerId are required',
          timestamp: new Date().toISOString(),
        });
      }

      const result = await engine.processVoiceCommand(transcript, customerId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
}


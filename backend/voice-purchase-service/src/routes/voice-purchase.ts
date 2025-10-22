/**
 * Voice Purchase Routes
 * Express routes for voice purchase API
 */

import express from 'express';
import { VoicePurchaseService } from '../services/voice-purchase-service';

export function createVoicePurchaseRoutes(service: VoicePurchaseService): express.Router {
  const router = express.Router();

  // Health check endpoint
  router.get('/health', async (req, res) => {
    try {
      const health = await service.healthCheck();
      res.json(health);
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // Process voice command endpoint
  router.post('/voice/process', async (req, res) => {
    try {
      const result = await service.processVoiceCommand(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Confirm voice purchase endpoint
  router.post('/voice/confirm', async (req, res) => {
    try {
      const result = await service.confirmVoicePurchase(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Cancel voice purchase endpoint
  router.post('/voice/cancel', async (req, res) => {
    try {
      const { session_id, customer_id, order_id, reason } = req.body;
      const result = await service.cancelVoicePurchase(session_id, customer_id, order_id, reason);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Get voice purchase status endpoint
  router.get('/voice/status', async (req, res) => {
    try {
      const { session_id, customer_id } = req.query;
      const result = await service.getVoicePurchaseStatus(session_id as string, customer_id as string);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Get voice help endpoint
  router.post('/voice/help', async (req, res) => {
    try {
      const { audio_data, customer_id, session_id, help_type } = req.body;
      const result = await service.getVoiceHelp(audio_data, customer_id, session_id, help_type);
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


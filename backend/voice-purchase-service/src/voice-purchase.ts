// VOICE-TO-PURCHASE API - PROTOTYPE 5
// Voice-activated purchasing system for cannabis retail
// Implements NLP-powered intent recognition with secure payment processing

import express from 'express';
import { VoicePurchaseService } from './services/voice-purchase-service';
import { createVoicePurchaseRoutes } from './routes/voice-purchase';

// Main application entry point

// Express application setup
const app = express();
app.use(express.json({ limit: '10mb' })); // Large limit for audio data

// Only create service if not in test environment
let service: VoicePurchaseService | null = null;
if (process.env.NODE_ENV !== 'test') {
  service = new VoicePurchaseService();
}

// Register routes
if (service) {
  app.use('/', createVoicePurchaseRoutes(service));
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Voice-to-Purchase API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      process: 'POST /voice/process',
      confirm: 'POST /voice/confirm',
      cancel: 'POST /voice/cancel',
      status: 'GET /voice/status',
      help: 'POST /voice/help',
    },
    documentation: 'See specs/voice-purchase.spec.yaml',
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Voice-to-Purchase API running on port ${PORT}`);
  });
}

export default app;

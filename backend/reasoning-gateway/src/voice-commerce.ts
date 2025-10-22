// VOICE COMMERCE ENGINE - PROTOTYPE 5
// Main application entry point

import express from 'express';
import { VoiceCommerceEngine } from './engine/voice-commerce-engine';
import { createVoiceCommerceRoutes } from './routes/voice-commerce';

// Express application setup
const app = express();
app.use(express.json());

// Only create engine if not in test environment
let voiceEngine: VoiceCommerceEngine | null = null;
if (process.env.NODE_ENV !== 'test') {
  voiceEngine = new VoiceCommerceEngine();
}

// Register routes
if (voiceEngine) {
  app.use('/', createVoiceCommerceRoutes(voiceEngine));
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Voice Commerce Engine',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      voiceCommerce: 'POST /api/voice-commerce',
    },
    documentation: 'See specs/voice-commerce.spec.yaml',
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 8083;
  app.listen(PORT, () => {
    console.log(`Voice Commerce Engine running on port ${PORT}`);
  });
}

export default app;

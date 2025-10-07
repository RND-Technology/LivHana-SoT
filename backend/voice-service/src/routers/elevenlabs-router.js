import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_monolingual_v1';
const ELEVENLABS_DEFAULT_VOICE_ID = process.env.ELEVENLABS_DEFAULT_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

/**
 * POST /api/elevenlabs/synthesize
 * Synthesize speech from text using ElevenLabs API
 *
 * Body:
 * {
 *   text: string (required),
 *   voiceId: string (optional),
 *   modelId: string (optional),
 *   voiceSettings: {
 *     stability: number (0-1),
 *     similarityBoost: number (0-1)
 *   }
 * }
 */
router.post('/synthesize', async (req, res) => {
  try {
    const { text, voiceId, modelId, voiceSettings } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    if (!ELEVENLABS_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'ElevenLabs API key not configured'
      });
    }

    const targetVoiceId = voiceId || ELEVENLABS_DEFAULT_VOICE_ID;
    const targetModelId = modelId || ELEVENLABS_MODEL_ID;

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: targetModelId,
          voice_settings: voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    // Stream audio back to client
    res.setHeader('Content-Type', 'audio/mpeg');
    response.body.pipe(res);

  } catch (error) {
    console.error('ElevenLabs synthesis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/elevenlabs/voices
 * Get list of available voices from ElevenLabs
 */
router.get('/voices', async (req, res) => {
  try {
    if (!ELEVENLABS_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'ElevenLabs API key not configured'
      });
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      voices: data.voices
    });

  } catch (error) {
    console.error('ElevenLabs voices error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/elevenlabs/models
 * Get list of available models from ElevenLabs
 */
router.get('/models', async (req, res) => {
  try {
    if (!ELEVENLABS_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'ElevenLabs API key not configured'
      });
    }

    const response = await fetch('https://api.elevenlabs.io/v1/models', {
      method: 'GET',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      models: data
    });

  } catch (error) {
    console.error('ElevenLabs models error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

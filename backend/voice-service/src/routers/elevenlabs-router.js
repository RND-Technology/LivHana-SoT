import express from 'express';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { createSecureRedisClient } from '../../../common/queue/hardenedQueue.js';

const router = express.Router();

// Initialize Redis cache for TTS responses
const ttsCache = createSecureRedisClient();
const TTS_CACHE_TTL = 120; // 120 seconds as per PO1 spec
const CACHE_KEY_PREFIX = 'tts:elevenlabs:';

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || 'eleven_monolingual_v1';
const ELEVENLABS_DEFAULT_VOICE_ID = process.env.ELEVENLABS_DEFAULT_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';

/**
 * Generate cache key from text and voice ID
 * @param {string} text - The text to synthesize
 * @param {string} voiceId - The voice ID
 * @param {object} settings - Voice settings
 * @returns {string} Cache key
 */
function generateCacheKey(text, voiceId, settings) {
  const payload = `${text}|${voiceId}|${JSON.stringify(settings)}`;
  return CACHE_KEY_PREFIX + crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * POST /api/elevenlabs/synthesize
 * Synthesize speech from text using ElevenLabs API with edge caching
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
 *
 * Cache: 120s TTL, target <100ms for cache hits
 */
router.post('/synthesize', async (req, res) => {
  const startTime = Date.now();

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
    const targetSettings = voiceSettings || {
      stability: 0.5,
      similarity_boost: 0.75
    };

    // Generate cache key
    const cacheKey = generateCacheKey(text, targetVoiceId, targetSettings);

    // Check cache first (target <100ms)
    let cachedAudio = null;
    try {
      const cached = await ttsCache.get(cacheKey);
      if (cached) {
        cachedAudio = Buffer.from(cached, 'base64');
        const cacheLatency = Date.now() - startTime;
        console.log(`✅ TTS cache hit (${cacheLatency}ms) - ${text.substring(0, 50)}...`);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Latency-Ms', cacheLatency.toString());
        return res.send(cachedAudio);
      }
    } catch (cacheError) {
      console.warn('Cache read error:', cacheError.message);
    }

    // Cache miss - call ElevenLabs API
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
          voice_settings: targetSettings
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    // Read audio buffer
    const audioBuffer = await response.buffer();
    const apiLatency = Date.now() - startTime;

    // Store in cache with 120s TTL (async, don't block response)
    ttsCache.setex(cacheKey, TTS_CACHE_TTL, audioBuffer.toString('base64'))
      .then(() => {
        console.log(`💾 TTS cached (${apiLatency}ms) - ${text.substring(0, 50)}...`);
      })
      .catch(err => {
        console.warn('Cache write error:', err.message);
      });

    // Stream audio back to client
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-API-Latency-Ms', apiLatency.toString());
    res.send(audioBuffer);

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

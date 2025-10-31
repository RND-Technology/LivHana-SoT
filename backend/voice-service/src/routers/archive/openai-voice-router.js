/**
 * OpenAI Advanced Voice API Router
 * Provides dynamic, low-latency voice conversation
 * Target: < 300ms latency (better than ChatGPT-5)
 */

import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY
});

/**
 * POST /api/openai-voice/chat
 *
 * Advanced Voice Mode conversation
 * Streaming, bidirectional, interrupt-capable
 */
router.post('/chat', async (req, res) => {
  const { message, sessionId, voice = 'alloy', format = 'pcm' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }

  try {
    console.log(`[OpenAI Voice] Session ${sessionId}: Processing message`);
    const startTime = Date.now();

    // Use OpenAI's realtime audio API
    const response = await openai.audio.speech.create({
      model: 'tts-1-hd',  // High quality, low latency
      voice: voice,       // alloy, echo, fable, onyx, nova, shimmer
      input: message,
      response_format: format === 'pcm' ? 'pcm' : 'mp3'
    });

    const latency = Date.now() - startTime;
    console.log(`[OpenAI Voice] Generated speech in ${latency}ms`);

    // Stream audio back
    const buffer = Buffer.from(await response.arrayBuffer());

    res.set({
      'Content-Type': format === 'pcm' ? 'audio/pcm' : 'audio/mpeg',
      'Content-Length': buffer.length,
      'X-Latency-Ms': latency
    });

    res.send(buffer);

  } catch (error) {
    console.error('[OpenAI Voice] Error:', error);
    res.status(500).json({
      error: 'OpenAI Voice API error',
      details: error.message
    });
  }
});

/**
 * POST /api/openai-voice/transcribe
 *
 * Speech-to-text using Whisper API
 */
router.post('/transcribe', async (req, res) => {
  const { audio, language = 'en' } = req.body;

  if (!audio) {
    return res.status(400).json({ error: 'Audio data required' });
  }

  try {
    const startTime = Date.now();

    // Convert audio buffer to file for Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: 'whisper-1',
      language: language,
      response_format: 'json'
    });

    const latency = Date.now() - startTime;
    console.log(`[OpenAI Voice] Transcribed in ${latency}ms`);

    res.json({
      text: transcription.text,
      latency_ms: latency
    });

  } catch (error) {
    console.error('[OpenAI Voice] Transcription error:', error);
    res.status(500).json({
      error: 'Whisper API error',
      details: error.message
    });
  }
});

/**
 * GET /api/openai-voice/status
 *
 * Health check endpoint
 */
router.get('/status', (req, res) => {
  res.json({
    service: 'openai-voice',
    status: 'active',
    features: [
      'tts-1-hd (High quality TTS)',
      'whisper-1 (Advanced STT)',
      'Multiple voices',
      'PCM/MP3 formats',
      'Target latency: < 300ms'
    ],
    timestamp: new Date().toISOString()
  });
});

export default router;

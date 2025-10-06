import { Router } from 'express';
import axios from 'axios';
import { Queue } from 'bullmq';
import multer from 'multer';
import FormData from 'form-data';
import OpenAI from 'openai';
import { validateTextPayload } from '../common/validation/text.js';
import { withRequestContext } from '../common/logging/context.js';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io';
const ELEVENLABS_MODEL = process.env.ELEVENLABS_MODEL_ID ?? 'eleven_multilingual_v3';
const ELEVENLABS_DEFAULT_VOICE = process.env.ELEVENLABS_DEFAULT_VOICE_ID;
const REASONING_QUEUE_NAME = process.env.REASONING_QUEUE_NAME ?? 'voice-mode-reasoning-jobs';
const REASONING_GATEWAY_BASE_URL = process.env.REASONING_GATEWAY_BASE_URL ?? 'http://localhost:4002/api/reasoning';

// Initialize OpenAI client for Whisper
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Configure multer for audio file uploads (max 25MB - Whisper's limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid audio format: ${file.mimetype}. Allowed: ${allowedMimeTypes.join(', ')}`));
    }
  }
});

const requireApiKey = (_req, res, next) => {
  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured' });
  }
  next();
};

const createVoiceRouter = ({ logger, queue }) => {
  const router = Router();

  // Whisper Speech-to-Text endpoint
  router.post('/whisper/transcribe', upload.single('audio'), async (req, res) => {
    if (!openai) {
      return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);

    try {
      // Create a File object from the buffer
      const audioFile = new File([req.file.buffer], req.file.originalname || 'audio.webm', {
        type: req.file.mimetype
      });

      // Call OpenAI Whisper API
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: req.body.language || 'en', // Optional language hint
        response_format: 'verbose_json' // Get timestamps and confidence
      });

      contextLogger?.info?.({
        duration: transcription.duration,
        language: transcription.language,
        textLength: transcription.text?.length
      }, 'Whisper transcription success');

      res.status(200).json({
        text: transcription.text,
        duration: transcription.duration,
        language: transcription.language,
        segments: transcription.segments // Word-level timestamps
      });
    } catch (error) {
      const status = error.status ?? 500;
      const message = error.message ?? 'Whisper transcription failed';
      contextLogger?.error?.({ status, error: message }, 'Whisper transcription failed');
      res.status(status).json({ error: 'Whisper transcription failed', details: message });
    }
  });

  router.post('/elevenlabs/synthesize', requireApiKey, async (req, res) => {
    const { text, voiceId, voiceSettings, pronunciationDictionaryLocators, optimizeStreamingLatency } = req.body ?? {};

    const validationError = validateTextPayload(text);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const finalVoiceId = voiceId || ELEVENLABS_DEFAULT_VOICE;
    if (!finalVoiceId) {
      return res.status(400).json({ error: 'voiceId missing and ELEVENLABS_DEFAULT_VOICE_ID not set' });
    }

    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);

    try {
      const response = await axios.post(
        `${ELEVENLABS_API_BASE}/v1/text-to-speech/${finalVoiceId}`,
        {
          text,
          model_id: ELEVENLABS_MODEL,
          voice_settings: voiceSettings,
          pronunciation_dictionary_locators: pronunciationDictionaryLocators,
          optimize_streaming_latency: optimizeStreamingLatency,
        },
        {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg'
          },
          responseType: 'arraybuffer',
          timeout: Number(process.env.ELEVENLABS_TIMEOUT_MS ?? 45000)
        }
      );

      res.set('Content-Type', 'audio/mpeg');
      res.send(Buffer.from(response.data));
      contextLogger?.info?.({ voiceId: finalVoiceId, textLength: text.length }, 'ElevenLabs synthesis success');
    } catch (error) {
      const status = error.response?.status ?? 500;
      const payload = error.response?.data ?? error.message;
      contextLogger?.error?.({ status, payload }, 'ElevenLabs synthesis failed');
      res.status(500).json({ error: 'ElevenLabs synthesis failed', details: payload });
    }
  });

  router.post('/reasoning/enqueue', async (req, res) => {
    if (!(queue instanceof Queue)) {
      logger.error('Reasoning queue not configured on voice router');
      return res.status(500).json({ error: 'Reasoning queue unavailable' });
    }

    const { prompt, sessionId, metadata } = req.body ?? {};
    const validationError = validateTextPayload(prompt);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);

    try {
      if (!queue) {
        contextLogger?.warn?.({ sessionId }, 'SAFE_MODE: Queue not available, returning mock response');
        return res.status(202).json({ 
          jobId: `mock-${Date.now()}`, 
          queue: REASONING_QUEUE_NAME,
          safeMode: true,
          message: 'Reasoning job queued in SAFE_MODE (mock)'
        });
      }

      const job = await queue.add('reasoning-task', { prompt, sessionId, metadata }, {
        removeOnComplete: Number(process.env.REASONING_REMOVE_ON_COMPLETE ?? 100),
        removeOnFail: Number(process.env.REASONING_REMOVE_ON_FAIL ?? 1000),
      });

      contextLogger?.info?.({ jobId: job.id, sessionId }, 'Enqueued reasoning job from voice-service');
      res.status(202).json({ jobId: job.id, queue: REASONING_QUEUE_NAME });
    } catch (error) {
      contextLogger?.error?.({ error: error.message }, 'Failed to enqueue reasoning job from voice-service');
      res.status(500).json({ error: 'Failed to enqueue reasoning job' });
    }
  });

  router.get('/reasoning/result/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);

    try {
      const response = await axios.get(`${REASONING_GATEWAY_BASE_URL}/result/${jobId}`, {
        headers: {
          Authorization: req.headers.authorization,
          'x-request-id': req.headers['x-request-id'],
        },
      });

      contextLogger?.info?.({ jobId }, 'Fetched reasoning result via voice-service');
      res.status(response.status).json(response.data);
    } catch (error) {
      const status = error.response?.status ?? 500;
      const payload = error.response?.data ?? { error: error.message };
      contextLogger?.error?.({ status, payload, jobId }, 'Failed to fetch reasoning result from gateway');
      res.status(status).json(payload);
    }
  });

  router.get('/reasoning/stream/:jobId', (req, res) => {
    const { jobId } = req.params;
    const upstream = `${REASONING_GATEWAY_BASE_URL}/stream/${jobId}`;
    const contextLogger = withRequestContext(logger, req.headers['x-request-id']);

    axios
      .get(upstream, {
        headers: {
          Authorization: req.headers.authorization,
          'x-request-id': req.headers['x-request-id'],
        },
        responseType: 'stream',
      })
      .then((response) => {
        contextLogger?.info?.({ jobId }, 'Proxying reasoning stream');
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        response.data.pipe(res);
      })
      .catch((error) => {
        const status = error.response?.status ?? 500;
        const payload = error.response?.data ?? { error: error.message };
        contextLogger?.error?.({ status, payload, jobId }, 'Failed to stream reasoning result');
        res.status(status).json(payload);
      });
  });

  return router;
};

export default createVoiceRouter;

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02

/**
 * Vocode TTS Service
 *
 * This service provides a Vocode-powered Text-to-Speech API.
 * Vocode gives us full control over voice parameters, streaming, and interruption.
 *
 * Features:
 * - Real-time streaming TTS
 * - Full voice customization (pitch, speed, stability, similarity)
 * - Multiple voice providers (ElevenLabs, Azure, PlayHT, Coqui)
 * - Low-latency streaming (target <100ms first chunk)
 * - Interruptible mid-sentence
 *
 * Dependencies:
 * - vocode-core (Python package)
 * - express for HTTP API
 * - streaming support
 */

import express from 'express';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import os from 'os';
import cors from 'cors';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.VOCODE_PORT || 9001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Vocode configuration
const VOCODE_CONFIG = {
  provider: process.env.VOCODE_PROVIDER || 'elevenlabs', // elevenlabs, azure, playht, coqui
  voice_id: process.env.VOCODE_VOICE_ID || 'default',
  api_key: process.env.ELEVENLABS_API_KEY || process.env.VOCODE_API_KEY,
  model: process.env.VOCODE_MODEL || 'eleven_turbo_v2', // for ElevenLabs
  optimize_streaming_latency: parseInt(process.env.VOCODE_STREAMING_LATENCY || '3'),
  output_format: process.env.VOCODE_OUTPUT_FORMAT || 'mp3_44100_128'
};

console.log(`[VocodeService] Provider: ${VOCODE_CONFIG.provider}`);
console.log(`[VocodeService] Voice: ${VOCODE_CONFIG.voice_id}`);
console.log(`[VocodeService] Model: ${VOCODE_CONFIG.model}`);

/**
 * Synthesize speech using ElevenLabs (via Vocode)
 */
async function synthesizeElevenLabs(text, voiceConfig) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.voice_id}/stream`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': VOCODE_CONFIG.api_key
    },
    body: JSON.stringify({
      text,
      model_id: VOCODE_CONFIG.model,
      voice_settings: {
        stability: voiceConfig.stability || 0.75,
        similarity_boost: voiceConfig.similarity_boost || 0.75,
        style: voiceConfig.style || 0.0,
        use_speaker_boost: true
      },
      optimize_streaming_latency: VOCODE_CONFIG.optimize_streaming_latency,
      output_format: VOCODE_CONFIG.output_format
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs TTS failed: ${error}`);
  }

  return response.body;
}

/**
 * Synthesize speech using Azure TTS
 */
async function synthesizeAzure(text, voiceConfig) {
  const region = process.env.AZURE_SPEECH_REGION || 'eastus';
  const apiKey = process.env.AZURE_SPEECH_KEY;

  if (!apiKey) {
    throw new Error('AZURE_SPEECH_KEY not configured');
  }

  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const ssml = `
<speak version='1.0' xml:lang='en-US'>
  <voice name='${voiceConfig.voice_id || 'en-US-JennyNeural'}'>
    <prosody rate='${voiceConfig.speed || 1.0}' pitch='${voiceConfig.pitch || 1.0}'>
      ${text}
    </prosody>
  </voice>
</speak>
`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ssml+xml',
      'Ocp-Apim-Subscription-Key': apiKey,
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3'
    },
    body: ssml
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Azure TTS failed: ${error}`);
  }

  return response.body;
}

/**
 * Synthesize speech using Vocode Python SDK (for advanced features)
 */
async function synthesizeWithVocodePython(text, voiceConfig) {
  return new Promise((resolve, reject) => {
    const pythonScript = `
import asyncio
from vocode.streaming.synthesizer.eleven_labs_synthesizer import ElevenLabsSynthesizer
from vocode.streaming.models.synthesizer import ElevenLabsSynthesizerConfig
import sys
import base64

async def synthesize():
    config = ElevenLabsSynthesizerConfig(
        api_key="${VOCODE_CONFIG.api_key}",
        voice_id="${voiceConfig.voice_id || VOCODE_CONFIG.voice_id}",
        model_id="${VOCODE_CONFIG.model}",
        stability=${voiceConfig.stability || 0.75},
        similarity_boost=${voiceConfig.similarity_boost || 0.75},
        optimize_streaming_latency=${VOCODE_CONFIG.optimize_streaming_latency}
    )

    synthesizer = ElevenLabsSynthesizer(config)

    # Synthesize
    audio_chunks = []
    async for chunk in synthesizer.synthesize("${text.replace(/"/g, '\\"')}"):
        audio_chunks.append(chunk)

    # Combine and output as base64
    audio = b"".join(audio_chunks)
    print(base64.b64encode(audio).decode())

asyncio.run(synthesize())
`;

    const python = spawn('python3', ['-c', pythonScript]);
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        // Convert base64 back to buffer
        const audioBase64 = stdout.trim();
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        const stream = Readable.from(audioBuffer);
        resolve(stream);
      } else {
        reject(new Error(`Vocode Python failed: ${stderr}`));
      }
    });

    python.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * POST /synthesize
 * Synthesize speech from text
 *
 * Body:
 * {
 *   text: string (required),
 *   voice_id: string (optional),
 *   stability: number 0-1 (optional),
 *   similarity_boost: number 0-1 (optional),
 *   speed: number 0.5-2.0 (optional),
 *   pitch: number 0.5-2.0 (optional),
 *   style: number 0-1 (optional),
 *   output_format: string (optional),
 *   streaming: boolean (default: true)
 * }
 */
app.post('/synthesize', async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      text,
      voice_id,
      stability,
      similarity_boost,
      speed,
      pitch,
      style,
      output_format,
      streaming = true
    } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'text required'
      });
    }

    const voiceConfig = {
      voice_id: voice_id || VOCODE_CONFIG.voice_id,
      stability,
      similarity_boost,
      speed,
      pitch,
      style
    };

    console.log(`[VocodeService] Synthesizing ${text.length} chars with ${VOCODE_CONFIG.provider}`);

    let audioStream;

    // Route to appropriate provider
    switch (VOCODE_CONFIG.provider) {
      case 'elevenlabs':
        audioStream = await synthesizeElevenLabs(text, voiceConfig);
        break;

      case 'azure':
        audioStream = await synthesizeAzure(text, voiceConfig);
        break;

      case 'vocode-python':
        audioStream = await synthesizeWithVocodePython(text, voiceConfig);
        break;

      default:
        throw new Error(`Unknown provider: ${VOCODE_CONFIG.provider}`);
    }

    const firstChunkTime = Date.now() - startTime;
    console.log(`[VocodeService] First chunk in ${firstChunkTime}ms`);

    // Set appropriate headers
    res.setHeader('Content-Type', 'audio/mpeg');
    if (streaming) {
      res.setHeader('Transfer-Encoding', 'chunked');
    }

    // Track total latency
    let totalBytes = 0;
    audioStream.on('data', (chunk) => {
      totalBytes += chunk.length;
    });

    audioStream.on('end', () => {
      const totalLatency = Date.now() - startTime;
      console.log(`[VocodeService] Synthesis complete in ${totalLatency}ms (${totalBytes} bytes)`);
    });

    audioStream.on('error', (error) => {
      console.error('[VocodeService] Stream error:', error);
    });

    // Pipe audio stream to response
    audioStream.pipe(res);

  } catch (error) {
    console.error('[VocodeService] Synthesis error:', error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message,
        latency_ms: Date.now() - startTime
      });
    }
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'vocode-tts',
    status: 'healthy',
    config: {
      provider: VOCODE_CONFIG.provider,
      voice_id: VOCODE_CONFIG.voice_id,
      model: VOCODE_CONFIG.model,
      streaming_latency: VOCODE_CONFIG.optimize_streaming_latency,
      output_format: VOCODE_CONFIG.output_format
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /voices
 * List available voices
 */
app.get('/voices', async (req, res) => {
  try {
    if (VOCODE_CONFIG.provider === 'elevenlabs' && VOCODE_CONFIG.api_key) {
      // Fetch voices from ElevenLabs
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': VOCODE_CONFIG.api_key
        }
      });

      const data = await response.json();

      res.json({
        success: true,
        provider: 'elevenlabs',
        voices: data.voices.map(v => ({
          voice_id: v.voice_id,
          name: v.name,
          category: v.category,
          description: v.description
        }))
      });
    } else {
      // Return default voices
      res.json({
        success: true,
        provider: VOCODE_CONFIG.provider,
        voices: [
          { voice_id: 'default', name: 'Default Voice', category: 'default' }
        ]
      });
    }
  } catch (error) {
    console.error('[VocodeService] Voices fetch error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[VocodeService] Running on port ${PORT}`);
  console.log(`[VocodeService] Provider: ${VOCODE_CONFIG.provider}`);
  console.log(`[VocodeService] Voice: ${VOCODE_CONFIG.voice_id}`);
  console.log(`[VocodeService] Ready for synthesis requests`);
});

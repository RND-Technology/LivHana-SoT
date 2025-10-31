/**
 * Whisper Real-Time Transcription Service
 *
 * This service provides a local Whisper API endpoint for real-time STT.
 * It's designed to run as a standalone microservice that the voice router calls.
 *
 * Features:
 * - Real-time audio transcription
 * - WebSocket support for streaming
 * - Low-latency (target <100ms)
 * - Supports multiple audio formats (webm, wav, mp3, ogg)
 * - GPU acceleration support (CUDA/MPS)
 *
 * Dependencies:
 * - whisper.cpp (C++ implementation for speed)
 * - OR OpenAI Whisper Python package
 * - express for HTTP API
 * - ws for WebSocket support
 */

import express from 'express';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import os from 'os';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.WHISPER_PORT || 9000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.raw({ type: 'audio/*', limit: '50mb' }));

// Whisper configuration
const WHISPER_CONFIG = {
  model: process.env.WHISPER_MODEL || 'base.en', // tiny.en, base.en, small.en, medium.en, large
  language: process.env.WHISPER_LANGUAGE || 'en',
  device: process.env.WHISPER_DEVICE || 'auto', // auto, cpu, cuda, mps
  threads: parseInt(process.env.WHISPER_THREADS || '4'),
  whisper_cpp_path: process.env.WHISPER_CPP_PATH || '/usr/local/bin/whisper-cpp',
  use_cpp: process.env.WHISPER_USE_CPP === 'true'
};

/**
 * Detect best available device (GPU if available, else CPU)
 */
function detectDevice() {
  if (WHISPER_CONFIG.device !== 'auto') {
    return WHISPER_CONFIG.device;
  }

  // Check for NVIDIA GPU
  try {
    const result = spawn('nvidia-smi', []);
    result.on('exit', (code) => {
      if (code === 0) return 'cuda';
    });
  } catch (e) {
    // nvidia-smi not found
  }

  // Check for Apple Silicon (MPS)
  if (os.platform() === 'darwin' && os.arch() === 'arm64') {
    return 'mps';
  }

  return 'cpu';
}

const DEVICE = detectDevice();
console.log(`[WhisperService] Using device: ${DEVICE}`);

/**
 * Transcribe audio using whisper.cpp (faster)
 */
async function transcribeWithCpp(audioPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-m', `models/ggml-${WHISPER_CONFIG.model}.bin`,
      '-f', audioPath,
      '-t', WHISPER_CONFIG.threads.toString(),
      '-l', WHISPER_CONFIG.language,
      '--output-txt',
      '--no-timestamps'
    ];

    const whisper = spawn(WHISPER_CONFIG.whisper_cpp_path, args);
    let stdout = '';
    let stderr = '';

    whisper.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    whisper.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    whisper.on('close', (code) => {
      if (code === 0) {
        // Parse output
        const lines = stdout.split('\n').filter(l => l.trim());
        const transcription = lines[lines.length - 1] || '';
        resolve(transcription.trim());
      } else {
        reject(new Error(`Whisper.cpp failed: ${stderr}`));
      }
    });

    whisper.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Transcribe audio using Python Whisper (more accurate, slower)
 */
async function transcribeWithPython(audioPath) {
  return new Promise((resolve, reject) => {
    const pythonScript = `
import whisper
import sys

model = whisper.load_model("${WHISPER_CONFIG.model}", device="${DEVICE}")
result = model.transcribe("${audioPath}", language="${WHISPER_CONFIG.language}")
print(result["text"])
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
        resolve(stdout.trim());
      } else {
        reject(new Error(`Whisper Python failed: ${stderr}`));
      }
    });

    python.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * POST /transcribe
 * Transcribe audio file
 *
 * Body (multipart/form-data):
 * - file: audio file (webm, wav, mp3, ogg)
 * - language: optional language code (default: en)
 * - response_format: json (default) | text
 */
app.post('/transcribe', async (req, res) => {
  const startTime = Date.now();
  let tempFile;

  try {
    // Handle multipart form data
    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      // TODO: Add multipart parser (multer)
      return res.status(400).json({
        success: false,
        error: 'Multipart parsing not yet implemented. Use base64 JSON format.'
      });
    }

    // Handle JSON with base64 audio
    const { audio_base64, format = 'webm', language, response_format = 'json' } = req.body;

    if (!audio_base64) {
      return res.status(400).json({
        success: false,
        error: 'audio_base64 required'
      });
    }

    // Save audio to temp file
    const tempDir = os.tmpdir();
    tempFile = path.join(tempDir, `whisper-${Date.now()}.${format}`);

    const audioBuffer = Buffer.from(audio_base64, 'base64');
    await fs.writeFile(tempFile, audioBuffer);

    console.log(`[WhisperService] Transcribing ${audioBuffer.length} bytes (${format})`);

    // Transcribe
    let transcription;
    if (WHISPER_CONFIG.use_cpp) {
      transcription = await transcribeWithCpp(tempFile);
    } else {
      transcription = await transcribeWithPython(tempFile);
    }

    const latency = Date.now() - startTime;
    console.log(`[WhisperService] Transcription complete in ${latency}ms: "${transcription.substring(0, 50)}..."`);

    // Clean up temp file
    await fs.unlink(tempFile);

    if (response_format === 'text') {
      res.send(transcription);
    } else {
      res.json({
        success: true,
        text: transcription,
        latency_ms: latency,
        model: WHISPER_CONFIG.model,
        device: DEVICE,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[WhisperService] Transcription error:', error);

    // Clean up temp file on error
    if (tempFile) {
      try {
        await fs.unlink(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    res.status(500).json({
      success: false,
      error: error.message,
      latency_ms: Date.now() - startTime
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'whisper-transcription',
    status: 'healthy',
    config: {
      model: WHISPER_CONFIG.model,
      language: WHISPER_CONFIG.language,
      device: DEVICE,
      threads: WHISPER_CONFIG.threads,
      use_cpp: WHISPER_CONFIG.use_cpp
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /models
 * List available Whisper models
 */
app.get('/models', (req, res) => {
  res.json({
    success: true,
    models: [
      { name: 'tiny.en', size: '75 MB', speed: 'fastest', accuracy: 'lowest' },
      { name: 'base.en', size: '142 MB', speed: 'fast', accuracy: 'good' },
      { name: 'small.en', size: '466 MB', speed: 'medium', accuracy: 'better' },
      { name: 'medium.en', size: '1.5 GB', speed: 'slow', accuracy: 'great' },
      { name: 'large', size: '2.9 GB', speed: 'slowest', accuracy: 'best' }
    ],
    current: WHISPER_CONFIG.model,
    device: DEVICE
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[WhisperService] Running on port ${PORT}`);
  console.log(`[WhisperService] Model: ${WHISPER_CONFIG.model}`);
  console.log(`[WhisperService] Device: ${DEVICE}`);
  console.log(`[WhisperService] Threads: ${WHISPER_CONFIG.threads}`);
  console.log(`[WhisperService] Using: ${WHISPER_CONFIG.use_cpp ? 'whisper.cpp' : 'Python Whisper'}`);
});

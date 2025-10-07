#!/usr/bin/env node
/**
 * HNC PRODUCTION API
 * REST API for automated content production
 */

import express from 'express';
import { ScriptParser } from './parser.js';
// Try TTS engines in order: macOS (always works) -> OpenAI -> ElevenLabs
let VoiceGenerator;
try {
  const ttsModule = await import('./tts-macos.js');
  VoiceGenerator = ttsModule.VoiceGenerator;
  console.log('✅ Using macOS built-in TTS (tts-macos.js) - NO API KEY NEEDED');
} catch (error) {
  console.log('⚠️  macOS TTS not available, trying OpenAI...');
  try {
    const ttsModule = await import('./tts-openai.js');
    VoiceGenerator = ttsModule.VoiceGenerator;
    console.log('✅ Using OpenAI TTS (tts-openai.js)');
  } catch (error2) {
    console.log('⚠️  OpenAI TTS not available, trying ElevenLabs...');
    const ttsModule = await import('./tts.js');
    VoiceGenerator = ttsModule.VoiceGenerator;
    console.log('✅ Using ElevenLabs TTS (tts.js)');
  }
}
import { VideoGenerator } from './video.js';
import { Publisher } from './publisher.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Production jobs tracker
const jobs = new Map();

/**
 * POST /api/produce
 * Start full production pipeline for an episode
 */
app.post('/api/produce', async (req, res) => {
  const { scriptPath, episodeNumber } = req.body;

  if (!scriptPath) {
    return res.status(400).json({ error: 'scriptPath required' });
  }

  const jobId = `job-${Date.now()}-ep${episodeNumber || 'unknown'}`;

  jobs.set(jobId, {
    id: jobId,
    status: 'started',
    progress: 0,
    steps: [],
    startedAt: new Date().toISOString()
  });

  // Run production pipeline async
  runProduction(jobId, scriptPath, episodeNumber).catch(err => {
    const job = jobs.get(jobId);
    job.status = 'failed';
    job.error = err.message;
    jobs.set(jobId, job);
  });

  res.json({
    jobId,
    status: 'started',
    message: 'Production pipeline initiated'
  });
});

/**
 * GET /api/jobs/:jobId
 * Get production job status
 */
app.get('/api/jobs/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

/**
 * GET /api/jobs
 * List all jobs
 */
app.get('/api/jobs', (req, res) => {
  const allJobs = Array.from(jobs.values()).sort((a, b) =>
    new Date(b.startedAt) - new Date(a.startedAt)
  );
  res.json({ jobs: allJobs, total: allJobs.length });
});

/**
 * POST /api/publish
 * Publish generated video to distribution channels
 */
app.post('/api/publish', async (req, res) => {
  const { videoPath, metadata, channels } = req.body;

  if (!videoPath) {
    return res.status(400).json({ error: 'videoPath required' });
  }

  try {
    const publisher = new Publisher();
    const result = await publisher.publish(videoPath, metadata, channels);

    res.json({
      success: true,
      published: result
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * GET /health
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'hnc-content-engine',
    version: '1.0.0',
    activeJobs: jobs.size
  });
});

/**
 * Production pipeline runner
 */
async function runProduction(jobId, scriptPath, episodeNumber) {
  const job = jobs.get(jobId);
  const outputDir = path.join(__dirname, '../output');

  try {
    // Step 1: Parse script
    job.status = 'parsing';
    job.progress = 10;
    job.steps.push({ step: 'parse', status: 'started', timestamp: new Date().toISOString() });
    jobs.set(jobId, job);

    const parser = new ScriptParser();
    const parsedScript = await parser.parse(scriptPath);
    const scriptJSON = path.join(outputDir, 'scripts', `episode-${episodeNumber}.json`);
    await parser.exportJSON(scriptJSON);

    job.steps[job.steps.length - 1].status = 'completed';
    job.steps[job.steps.length - 1].output = scriptJSON;
    job.progress = 25;
    jobs.set(jobId, job);

    // Step 2: Generate audio
    job.status = 'generating-audio';
    job.progress = 30;
    job.steps.push({ step: 'audio', status: 'started', timestamp: new Date().toISOString() });
    jobs.set(jobId, job);

    const voiceGen = new VoiceGenerator();
    const audioDir = path.join(outputDir, 'audio', `episode-${episodeNumber}`);
    const audioResults = await voiceGen.generateEpisodeAudio(parsedScript, audioDir);

    job.steps[job.steps.length - 1].status = 'completed';
    job.steps[job.steps.length - 1].output = {
      files: audioResults.files.length,
      duration: audioResults.totalDuration,
      errors: audioResults.errors.length
    };
    job.progress = 60;
    jobs.set(jobId, job);

    // Step 3: Generate video
    job.status = 'generating-video';
    job.progress = 65;
    job.steps.push({ step: 'video', status: 'started', timestamp: new Date().toISOString() });
    jobs.set(jobId, job);

    const videoGen = new VideoGenerator();
    const videoPath = path.join(outputDir, 'videos', `HNC_EP${episodeNumber}_FINAL.mp4`);
    const videoResult = await videoGen.generateEpisode(parsedScript, audioResults, videoPath);

    job.steps[job.steps.length - 1].status = 'completed';
    job.steps[job.steps.length - 1].output = videoResult.path;
    job.progress = 95;
    jobs.set(jobId, job);

    // Complete
    job.status = 'completed';
    job.progress = 100;
    job.completedAt = new Date().toISOString();
    job.output = {
      video: videoResult.path,
      script: scriptJSON,
      audio: audioDir,
      duration: videoResult.duration
    };
    jobs.set(jobId, job);

  } catch (error) {
    console.error(`❌ Production pipeline failed: ${error.message}`);
    job.status = 'failed';
    job.error = error.message;
    job.failedAt = new Date().toISOString();
    jobs.set(jobId, job);
    throw error;
  }
}

// Start server
const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
  console.log(`
═══════════════════════════════════════════════════════════════
🎬 HNC CONTENT ENGINE - LIVE
═══════════════════════════════════════════════════════════════
Port: ${PORT}
Endpoints:
  POST /api/produce   - Start production pipeline
  POST /api/publish   - Publish to distribution channels
  GET  /api/jobs      - List all jobs
  GET  /api/jobs/:id  - Get job status
  GET  /health        - Health check
═══════════════════════════════════════════════════════════════
  `);
});

export default app;

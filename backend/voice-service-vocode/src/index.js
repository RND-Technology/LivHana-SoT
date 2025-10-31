import express from 'express';
import { WebSocketServer } from 'ws';
import { StreamingConversation } from 'vocode';
import OpenAI from 'openai';
import Redis from 'ioredis';
import 'dotenv/config';

const app = express();
const PORT = process.env.VOCODE_PORT || 8081;

// Initialize clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Vocode configuration
const vocodeConfig = {
  transcriberConfig: {
    type: 'whisper',
    model: 'whisper-1', // OpenAI Whisper API
    language: 'en',
    streaming: true,
    endpointing: {
      type: 'time_based',
      time_cutoff_seconds: 0.5 // Interrupt after 500ms silence
    }
  },
  agentConfig: {
    type: 'gpt4o',
    model: 'gpt-4o',
    temperature: 0.7,
    max_tokens: 150, // Short responses for voice
    streaming: true,
    systemPrompt: `You are Liv Hana, an AI assistant for Reggie & Dro Cannabis Dispensary. 
Keep responses concise (2-3 sentences max) for natural conversation flow. 
Be helpful, friendly, and knowledgeable about cannabis products.`
  },
  synthesizerConfig: {
    type: 'elevenlabs',
    voiceId: process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL', // Bella
    model: 'eleven_turbo_v2', // Fastest ElevenLabs model
    stability: 0.5,
    similarityBoost: 0.75,
    streaming: true
  },
  interruptible: true, // KEY: Allow user to interrupt mid-response
  bufferSize: 20 // 20ms audio chunks for low latency
};

// WebSocket server for real-time audio
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (ws, request) => {
  console.log('[VOCODE] New WebSocket connection');
  
  const conversation = new StreamingConversation(vocodeConfig);
  
  // Handle incoming audio from user
  ws.on('message', async (audioChunk) => {
    try {
      // Vocode handles Whisper transcription internally
      await conversation.processAudio(audioChunk);
    } catch (error) {
      console.error('[VOCODE] Audio processing error:', error);
      ws.send(JSON.stringify({ error: error.message }));
    }
  });
  
  // Send synthesized audio back to user
  conversation.on('audioOutput', (audioChunk) => {
    ws.send(audioChunk); // Binary audio data
  });
  
  // Send transcription for UI display
  conversation.on('transcription', (text) => {
    ws.send(JSON.stringify({ 
      type: 'transcription', 
      text,
      timestamp: Date.now() 
    }));
  });
  
  // Send AI response text for UI display
  conversation.on('agentResponse', (text) => {
    ws.send(JSON.stringify({ 
      type: 'response', 
      text,
      timestamp: Date.now() 
    }));
  });
  
  // Handle interruptions
  conversation.on('interrupted', () => {
    ws.send(JSON.stringify({ 
      type: 'interrupted',
      message: 'Previous response stopped',
      timestamp: Date.now() 
    }));
  });
  
  ws.on('close', () => {
    console.log('[VOCODE] WebSocket closed');
    conversation.end();
  });
  
  ws.on('error', (error) => {
    console.error('[VOCODE] WebSocket error:', error);
    conversation.end();
  });
});

// HTTP health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'voice-service-vocode',
    timestamp: new Date().toISOString(),
    config: {
      transcriber: vocodeConfig.transcriberConfig.type,
      agent: vocodeConfig.agentConfig.model,
      synthesizer: vocodeConfig.synthesizerConfig.type,
      interruptible: vocodeConfig.interruptible
    }
  });
});

// Upgrade HTTP to WebSocket
const server = app.listen(PORT, () => {
  console.log(`[VOCODE] Voice service running on port ${PORT}`);
  console.log(`[VOCODE] Health check: http://localhost:${PORT}/health`);
  console.log(`[VOCODE] WebSocket: ws://localhost:${PORT}/ws`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[VOCODE] SIGTERM received, closing server...');
  server.close(() => {
    redis.disconnect();
    console.log('[VOCODE] Server closed');
    process.exit(0);
  });
});

/**
 * Custom Interruptible Voice Router
 *
 * Architecture:
 * - Whisper for real-time STT (open-source, fully customizable)
 * - ChatGPT for reasoning (async, streaming)
 * - Vocode for TTS (full voice control, streaming)
 * - WebSocket for bidirectional real-time communication
 * - Interruption support with VAD (Voice Activity Detection)
 *
 * Latency Target: <200ms end-to-end
 * Interruption: Mid-sentence capable
 * Voice Control: Full parameter customization
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import OpenAI from 'openai';
import fetch from 'node-fetch';

const router = express.Router();

// Initialize OpenAI for ChatGPT reasoning
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Voice session state management
const activeSessions = new Map();

/**
 * Session state structure
 */
class VoiceSession {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.conversationHistory = [];
    this.isListening = true;
    this.isSpeaking = false;
    this.currentTTSStream = null;
    this.interruptionCount = 0;
    this.voiceConfig = {
      voice_id: process.env.VOCODE_VOICE_ID || 'default',
      stability: 0.75,
      similarity_boost: 0.75,
      speed: 1.0,
      pitch: 1.0
    };
    this.createdAt = Date.now();
  }

  interrupt() {
    if (this.currentTTSStream) {
      this.currentTTSStream.destroy();
      this.currentTTSStream = null;
    }
    this.isSpeaking = false;
    this.isListening = true;
    this.interruptionCount++;
    console.log(`[VoiceSession:${this.sessionId}] Interrupted (count: ${this.interruptionCount})`);
  }

  addMessage(role, content) {
    this.conversationHistory.push({ role, content, timestamp: Date.now() });
    // Keep last 10 messages for context
    if (this.conversationHistory.length > 10) {
      this.conversationHistory = this.conversationHistory.slice(-10);
    }
  }

  updateVoiceConfig(config) {
    this.voiceConfig = { ...this.voiceConfig, ...config };
  }
}

/**
 * POST /api/voice/custom/session
 * Create a new voice session
 */
router.post('/session', async (req, res) => {
  try {
    const { voice_config, system_prompt } = req.body;
    const sessionId = `voice-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const session = new VoiceSession(sessionId);
    if (voice_config) {
      session.updateVoiceConfig(voice_config);
    }
    if (system_prompt) {
      session.addMessage('system', system_prompt);
    }

    activeSessions.set(sessionId, session);

    console.log(`[CustomVoice] Session created: ${sessionId}`);

    res.json({
      success: true,
      session_id: sessionId,
      voice_config: session.voiceConfig,
      ws_url: `ws://localhost:${process.env.PORT || 8080}/api/voice/custom/ws/${sessionId}`,
      features: {
        interruptible: true,
        streaming: true,
        voice_adjustable: true,
        whisper_stt: true,
        vocode_tts: true,
        chatgpt_reasoning: true
      }
    });
  } catch (error) {
    console.error('[CustomVoice] Session creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/voice/custom/transcribe
 * Transcribe audio using Whisper
 *
 * Body: { audio_base64: string, session_id: string }
 */
router.post('/transcribe', async (req, res) => {
  try {
    const { audio_base64, session_id, format = 'webm' } = req.body;
    const startTime = Date.now();

    if (!audio_base64) {
      return res.status(400).json({ success: false, error: 'audio_base64 required' });
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audio_base64, 'base64');

    // Call Whisper service (local or OpenAI)
    const whisperUrl = process.env.WHISPER_SERVICE_URL || 'http://localhost:9000/transcribe';

    let transcription;

    if (whisperUrl.includes('localhost') || whisperUrl.includes('127.0.0.1')) {
      // Local Whisper service
      const formData = new FormData();
      formData.append('file', new Blob([audioBuffer]), `audio.${format}`);
      formData.append('response_format', 'json');

      const response = await fetch(whisperUrl, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      transcription = result.text;
    } else {
      // Fallback to OpenAI Whisper API
      const file = new File([audioBuffer], `audio.${format}`, { type: `audio/${format}` });
      const response = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        response_format: 'json',
        language: 'en'
      });
      transcription = response.text;
    }

    const latency = Date.now() - startTime;
    console.log(`[CustomVoice] Transcription complete in ${latency}ms: "${transcription.substring(0, 50)}..."`);

    res.json({
      success: true,
      transcription,
      latency_ms: latency,
      session_id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CustomVoice] Transcription error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/voice/custom/reason
 * Get ChatGPT reasoning response
 *
 * Body: { message: string, session_id: string }
 */
router.post('/reason', async (req, res) => {
  try {
    const { message, session_id, stream = false } = req.body;
    const startTime = Date.now();

    if (!message) {
      return res.status(400).json({ success: false, error: 'message required' });
    }

    const session = activeSessions.get(session_id);
    if (session) {
      session.addMessage('user', message);
    }

    const messages = [
      {
        role: 'system',
        content: 'You are Liv Hana. Be concise, interruptible, and conversational. Respond in under 3 sentences for voice playback.'
      }
    ];

    if (session && session.conversationHistory.length > 0) {
      messages.push(...session.conversationHistory.filter(m => m.role !== 'system'));
    } else {
      messages.push({ role: 'user', content: message });
    }

    const model = process.env.REASONING_FAST_MODEL || 'gpt-4o';

    if (stream) {
      // Streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 150,
        stream: true
      });

      let fullResponse = '';
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
        }
      }

      if (session) {
        session.addMessage('assistant', fullResponse);
      }

      const latency = Date.now() - startTime;
      res.write(`data: ${JSON.stringify({ content: '', done: true, latency_ms: latency })}\n\n`);
      res.end();

      console.log(`[CustomVoice] Reasoning stream complete in ${latency}ms`);
    } else {
      // Non-streaming response
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 150
      });

      const response = completion.choices[0].message.content;

      if (session) {
        session.addMessage('assistant', response);
      }

      const latency = Date.now() - startTime;
      console.log(`[CustomVoice] Reasoning complete in ${latency}ms`);

      res.json({
        success: true,
        response,
        latency_ms: latency,
        model,
        session_id,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[CustomVoice] Reasoning error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/voice/custom/speak
 * Generate voice using Vocode
 *
 * Body: { text: string, session_id: string, voice_config: object }
 */
router.post('/speak', async (req, res) => {
  try {
    const { text, session_id, voice_config } = req.body;
    const startTime = Date.now();

    if (!text) {
      return res.status(400).json({ success: false, error: 'text required' });
    }

    const session = activeSessions.get(session_id);
    const config = voice_config || session?.voiceConfig || {};

    // Vocode TTS endpoint
    const vocodeUrl = process.env.VOCODE_TTS_URL || 'http://localhost:9001/synthesize';

    const response = await fetch(vocodeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice_id: config.voice_id || 'default',
        stability: config.stability || 0.75,
        similarity_boost: config.similarity_boost || 0.75,
        speed: config.speed || 1.0,
        pitch: config.pitch || 1.0,
        output_format: 'mp3',
        streaming: true
      })
    });

    if (!response.ok) {
      throw new Error(`Vocode TTS failed: ${response.statusText}`);
    }

    // Stream audio back to client
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');

    if (session) {
      session.isSpeaking = true;
      session.currentTTSStream = response.body;
    }

    response.body.pipe(res);

    response.body.on('end', () => {
      if (session) {
        session.isSpeaking = false;
        session.currentTTSStream = null;
      }
      const latency = Date.now() - startTime;
      console.log(`[CustomVoice] TTS complete in ${latency}ms`);
    });

    response.body.on('error', (error) => {
      console.error('[CustomVoice] TTS stream error:', error);
      if (session) {
        session.isSpeaking = false;
        session.currentTTSStream = null;
      }
    });
  } catch (error) {
    console.error('[CustomVoice] TTS error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/voice/custom/interrupt
 * Interrupt current speech
 *
 * Body: { session_id: string }
 */
router.post('/interrupt', async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ success: false, error: 'session_id required' });
    }

    const session = activeSessions.get(session_id);

    if (!session) {
      return res.status(404).json({ success: false, error: 'session not found' });
    }

    session.interrupt();

    res.json({
      success: true,
      message: 'Speech interrupted',
      session_id,
      interruption_count: session.interruptionCount,
      is_listening: session.isListening,
      is_speaking: session.isSpeaking
    });
  } catch (error) {
    console.error('[CustomVoice] Interrupt error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/voice/custom/config
 * Update voice configuration for session
 *
 * Body: { session_id: string, voice_config: object }
 */
router.post('/config', async (req, res) => {
  try {
    const { session_id, voice_config } = req.body;

    if (!session_id || !voice_config) {
      return res.status(400).json({ success: false, error: 'session_id and voice_config required' });
    }

    const session = activeSessions.get(session_id);

    if (!session) {
      return res.status(404).json({ success: false, error: 'session not found' });
    }

    session.updateVoiceConfig(voice_config);

    res.json({
      success: true,
      message: 'Voice config updated',
      session_id,
      voice_config: session.voiceConfig
    });
  } catch (error) {
    console.error('[CustomVoice] Config update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/voice/custom/session/:sessionId
 * Get session status
 */
router.get('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, error: 'session not found' });
    }

    res.json({
      success: true,
      session_id: sessionId,
      is_listening: session.isListening,
      is_speaking: session.isSpeaking,
      interruption_count: session.interruptionCount,
      conversation_length: session.conversationHistory.length,
      voice_config: session.voiceConfig,
      uptime_ms: Date.now() - session.createdAt
    });
  } catch (error) {
    console.error('[CustomVoice] Session status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/voice/custom/session/:sessionId
 * End voice session
 */
router.delete('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ success: false, error: 'session not found' });
    }

    // Clean up
    session.interrupt();
    activeSessions.delete(sessionId);

    console.log(`[CustomVoice] Session ended: ${sessionId}`);

    res.json({
      success: true,
      message: 'Session ended',
      session_id: sessionId
    });
  } catch (error) {
    console.error('[CustomVoice] Session end error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/voice/custom/stats
 * Get system statistics
 */
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    active_sessions: activeSessions.size,
    sessions: Array.from(activeSessions.values()).map(s => ({
      session_id: s.sessionId,
      is_speaking: s.isSpeaking,
      is_listening: s.isListening,
      interruption_count: s.interruptionCount,
      conversation_length: s.conversationHistory.length,
      uptime_ms: Date.now() - s.createdAt
    })),
    services: {
      whisper: process.env.WHISPER_SERVICE_URL || 'http://localhost:9000',
      vocode: process.env.VOCODE_TTS_URL || 'http://localhost:9001',
      chatgpt: 'openai-api'
    }
  });
});

/**
 * WebSocket Server Setup
 * Attach to HTTP server in index.js
 *
 * Usage: setupWebSocket(httpServer)
 */
export function setupWebSocket(httpServer) {
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/api/voice/custom/ws'
  });

  console.log('[CustomVoice] WebSocket server initialized at /api/voice/custom/ws');

  wss.on('connection', (ws, req) => {
    // Extract session ID from URL path
    const sessionId = req.url.split('/').pop();
    
    console.log(`[CustomVoice] WebSocket connected: ${sessionId}`);

    let session = activeSessions.get(sessionId);
    
    if (!session) {
      // Auto-create session if not exists
      session = new VoiceSession(sessionId);
      activeSessions.set(sessionId, session);
      console.log(`[CustomVoice] Auto-created session: ${sessionId}`);
    }

    // WebSocket message handler
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'audio':
            await handleAudioStream(ws, session, message);
            break;
          
          case 'interrupt':
            session.interrupt();
            ws.send(JSON.stringify({
              type: 'interrupted',
              session_id: sessionId,
              interruption_count: session.interruptionCount
            }));
            break;
          
          case 'config':
            session.updateVoiceConfig(message.voice_config);
            ws.send(JSON.stringify({
              type: 'config_updated',
              voice_config: session.voiceConfig
            }));
            break;
          
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
            break;
          
          default:
            console.warn(`[CustomVoice] Unknown message type: ${message.type}`);
        }
      } catch (error) {
        console.error('[CustomVoice] WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          error: error.message
        }));
      }
    });

    ws.on('close', () => {
      console.log(`[CustomVoice] WebSocket closed: ${sessionId}`);
    });

    ws.on('error', (error) => {
      console.error(`[CustomVoice] WebSocket error for ${sessionId}:`, error);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      session_id: sessionId,
      voice_config: session.voiceConfig,
      features: {
        interruptible: true,
        streaming: true,
        voice_adjustable: true
      }
    }));
  });

  /**
   * Handle incoming audio stream
   * - Transcribe with Whisper
   * - Get ChatGPT response
   * - Synthesize with Vocode
   * - Stream back to client
   */
  async function handleAudioStream(ws, session, message) {
    const startTime = Date.now();
    
    try {
      // 1. Transcribe audio
      const transcriptionStart = Date.now();
      const { audio_data, format = 'webm' } = message;
      
      // audio_data should be base64 encoded
      const audioBuffer = Buffer.from(audio_data, 'base64');
      
      const whisperUrl = process.env.WHISPER_SERVICE_URL || 'http://localhost:9000/transcribe';
      
      let transcription;
      
      if (whisperUrl.includes('localhost') || whisperUrl.includes('127.0.0.1')) {
        // Local Whisper
        const formData = new FormData();
        formData.append('file', new Blob([audioBuffer]), `audio.${format}`);
        formData.append('response_format', 'json');
        
        const response = await fetch(whisperUrl, {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        transcription = result.text;
      } else {
        // OpenAI Whisper fallback
        const file = new File([audioBuffer], `audio.${format}`, { type: `audio/${format}` });
        const response = await openai.audio.transcriptions.create({
          file,
          model: 'whisper-1'
        });
        transcription = response.text;
      }
      
      const transcriptionLatency = Date.now() - transcriptionStart;
      
      // Send transcription to client
      ws.send(JSON.stringify({
        type: 'transcription',
        text: transcription,
        latency_ms: transcriptionLatency
      }));
      
      console.log(`[CustomVoice] Transcribed in ${transcriptionLatency}ms: "${transcription}"`);
      
      // 2. Get ChatGPT response
      const reasoningStart = Date.now();
      
      session.addMessage('user', transcription);
      
      const messages = [
        {
          role: 'system',
          content: 'You are Liv Hana. Be concise, interruptible, and conversational. Respond in under 3 sentences for voice playback.'
        },
        ...session.conversationHistory.filter(m => m.role !== 'system')
      ];
      
      const model = process.env.REASONING_FAST_MODEL || 'gpt-4o';
      
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 150,
        stream: true
      });
      
      let fullResponse = '';
      let firstChunkTime = null;
      
      for await (const chunk of completion) {
        if (!firstChunkTime) firstChunkTime = Date.now();
        
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          
          // Stream reasoning chunks to client
          ws.send(JSON.stringify({
            type: 'reasoning_chunk',
            content,
            done: false
          }));
        }
      }
      
      const reasoningLatency = Date.now() - reasoningStart;
      const timeToFirstToken = firstChunkTime - reasoningStart;
      
      session.addMessage('assistant', fullResponse);
      
      ws.send(JSON.stringify({
        type: 'reasoning_complete',
        response: fullResponse,
        latency_ms: reasoningLatency,
        ttft_ms: timeToFirstToken
      }));
      
      console.log(`[CustomVoice] Reasoning complete in ${reasoningLatency}ms (TTFT: ${timeToFirstToken}ms)`);
      
      // 3. Synthesize speech with Vocode
      const ttsStart = Date.now();
      
      const vocodeUrl = process.env.VOCODE_TTS_URL || 'http://localhost:9001/synthesize';
      
      const ttsResponse = await fetch(vocodeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullResponse,
          voice_id: session.voiceConfig.voice_id || 'default',
          stability: session.voiceConfig.stability || 0.75,
          similarity_boost: session.voiceConfig.similarity_boost || 0.75,
          speed: session.voiceConfig.speed || 1.0,
          pitch: session.voiceConfig.pitch || 1.0,
          output_format: 'mp3',
          streaming: true
        })
      });
      
      if (!ttsResponse.ok) {
        throw new Error(`Vocode TTS failed: ${ttsResponse.statusText}`);
      }
      
      session.isSpeaking = true;
      
      // Stream audio chunks
      const reader = ttsResponse.body.getReader();
      let firstAudioChunk = true;
      let firstAudioChunkTime = null;
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        if (firstAudioChunk) {
          firstAudioChunkTime = Date.now();
          firstAudioChunk = false;
          
          ws.send(JSON.stringify({
            type: 'audio_start',
            latency_ms: firstAudioChunkTime - ttsStart
          }));
        }
        
        // Send audio chunk (base64 encoded for WebSocket)
        ws.send(JSON.stringify({
          type: 'audio_chunk',
          data: value.toString('base64')
        }));
      }
      
      session.isSpeaking = false;
      session.currentTTSStream = null;
      
      const ttsLatency = Date.now() - ttsStart;
      const totalLatency = Date.now() - startTime;
      
      ws.send(JSON.stringify({
        type: 'audio_complete',
        latency_ms: ttsLatency,
        total_latency_ms: totalLatency,
        performance: {
          transcription_ms: transcriptionLatency,
          reasoning_ms: reasoningLatency,
          tts_ms: ttsLatency,
          total_ms: totalLatency
        }
      }));
      
      console.log(`[CustomVoice] Complete pipeline: ${totalLatency}ms (Whisper: ${transcriptionLatency}ms, ChatGPT: ${reasoningLatency}ms, Vocode: ${ttsLatency}ms)`);
      
    } catch (error) {
      console.error('[CustomVoice] Audio stream error:', error);
      session.isSpeaking = false;
      
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message,
        stage: 'audio_processing'
      }));
    }
  }

  return wss;
}

export default router;

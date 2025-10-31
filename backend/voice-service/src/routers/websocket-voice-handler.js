/**
 * WebSocket Voice Handler - Real-Time Bidirectional Audio
 *
 * This handler enables TRUE real-time voice conversations:
 * - Browser streams microphone directly via WebSocket
 * - No base64 encoding, no HTTP overhead
 * - Instant audio chunks to Whisper
 * - Claude API (Anthropic) for reasoning
 * - Real-time TTS streaming back to browser
 * - True duplex: interrupt while speaking
 *
 * Latency Target: <300ms end-to-end
 * Architecture: Browser → WebSocket → Whisper → Claude → Vocode → WebSocket → Browser
 */

import { WebSocketServer } from 'ws';
import Anthropic from '@anthropic-ai/sdk';
import fetch from 'node-fetch';

// Initialize Anthropic (Claude) client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Track WebSocket connections
const wsConnections = new Map();

/**
 * WebSocket Voice Session
 */
class WebSocketVoiceSession {
  constructor(ws, sessionId) {
    this.ws = ws;
    this.sessionId = sessionId;
    this.conversationHistory = [];
    this.isListening = true;
    this.isSpeaking = false;
    this.audioBuffer = Buffer.alloc(0);
    this.transcriptionBuffer = '';
    this.voiceConfig = {
      voice_id: process.env.VOCODE_VOICE_ID || 'default',
      stability: 0.75,
      similarity_boost: 0.75,
      speed: 1.0,
      pitch: 1.0
    };
    this.interruptionCount = 0;
    this.createdAt = Date.now();

    console.log(`[WebSocket] Session created: ${sessionId}`);
  }

  /**
   * Add message to conversation history
   */
  addMessage(role, content) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: Date.now()
    });

    // Keep last 20 messages for context
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }

  /**
   * Send JSON message to client
   */
  send(type, data) {
    if (this.ws.readyState === 1) { // OPEN
      this.ws.send(JSON.stringify({ type, data, timestamp: Date.now() }));
    }
  }

  /**
   * Send audio data to client
   */
  sendAudio(audioBuffer) {
    if (this.ws.readyState === 1) {
      this.ws.send(audioBuffer);
    }
  }

  /**
   * Interrupt current speech
   */
  interrupt() {
    this.isSpeaking = false;
    this.isListening = true;
    this.interruptionCount++;
    this.send('interrupted', {
      count: this.interruptionCount,
      message: 'Speech interrupted by user'
    });
    console.log(`[WebSocket:${this.sessionId}] Interrupted (count: ${this.interruptionCount})`);
  }

  /**
   * Close session
   */
  close() {
    this.ws.close();
    wsConnections.delete(this.sessionId);
    console.log(`[WebSocket] Session closed: ${this.sessionId}`);
  }
}

/**
 * Initialize WebSocket Server
 */
export function initWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: '/ws/voice'
  });

  console.log('🔥 WebSocket Voice Server initialized at ws://localhost:PORT/ws/voice');

  wss.on('connection', async (ws, req) => {
    const sessionId = `ws-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const session = new WebSocketVoiceSession(ws, sessionId);
    wsConnections.set(sessionId, session);

    // Send connection acknowledgment
    session.send('connected', {
      session_id: sessionId,
      message: 'WebSocket voice connection established',
      features: {
        realtime_streaming: true,
        bidirectional: true,
        interruptible: true,
        claude_reasoning: true,
        whisper_stt: true,
        vocode_tts: true
      }
    });

    /**
     * Handle incoming messages
     */
    ws.on('message', async (data) => {
      try {
        // Check if binary audio data
        if (Buffer.isBuffer(data)) {
          await handleAudioChunk(session, data);
        }
        // Check if JSON command
        else {
          const message = JSON.parse(data.toString());
          await handleCommand(session, message);
        }
      } catch (error) {
        console.error('[WebSocket] Message handling error:', error);
        session.send('error', {
          message: error.message,
          type: 'message_handling_error'
        });
      }
    });

    /**
     * Handle disconnection
     */
    ws.on('close', () => {
      session.close();
    });

    /**
     * Handle errors
     */
    ws.on('error', (error) => {
      console.error(`[WebSocket:${sessionId}] Error:`, error);
      session.send('error', { message: error.message });
    });
  });

  return wss;
}

/**
 * Handle incoming audio chunk
 */
async function handleAudioChunk(session, audioData) {
  const startTime = Date.now();

  // Accumulate audio data
  session.audioBuffer = Buffer.concat([session.audioBuffer, audioData]);

  // If buffer is large enough, transcribe
  if (session.audioBuffer.length >= 16000) { // ~1 second of audio at 16kHz
    try {
      session.send('transcribing', { status: 'processing_audio' });

      // Send to Whisper service
      const whisperUrl = process.env.WHISPER_SERVICE_URL || 'http://localhost:9000';
      const audioBase64 = session.audioBuffer.toString('base64');

      const response = await fetch(`${whisperUrl}/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_base64: audioBase64,
          format: 'raw',
          response_format: 'json'
        })
      });

      const result = await response.json();
      const transcription = result.text || '';

      if (transcription && transcription.trim().length > 0) {
        const transcribeLatency = Date.now() - startTime;

        session.send('transcribed', {
          text: transcription,
          latency_ms: transcribeLatency
        });

        console.log(`[WebSocket:${session.sessionId}] Transcribed in ${transcribeLatency}ms: "${transcription.substring(0, 50)}..."`);

        // Add to conversation history
        session.addMessage('user', transcription);

        // Get Claude response
        await getClaudeResponse(session, transcription);
      }

      // Clear buffer
      session.audioBuffer = Buffer.alloc(0);

    } catch (error) {
      console.error('[WebSocket] Transcription error:', error);
      session.send('error', {
        message: 'Transcription failed',
        error: error.message,
        type: 'transcription_error'
      });
    }
  }
}

/**
 * Get Claude (Anthropic) response
 */
async function getClaudeResponse(session, userMessage) {
  const startTime = Date.now();

  try {
    session.send('thinking', { status: 'claude_processing' });

    // Build messages for Claude
    const messages = session.conversationHistory
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));

    // Call Claude API with streaming
    const stream = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: messages,
      system: 'You are Claude, an AI assistant by Anthropic. You are having a real-time voice conversation with Jesse from LivHana. Be concise, conversational, and helpful. Keep responses under 3 sentences for voice playback. You are helping build the most advanced voice AI system in the hemp industry.',
      stream: true
    });

    let fullResponse = '';
    let firstChunkTime = 0;

    // Stream response chunks
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        const chunk = event.delta.text;
        fullResponse += chunk;

        if (!firstChunkTime) {
          firstChunkTime = Date.now() - startTime;
          console.log(`[WebSocket:${session.sessionId}] First Claude chunk in ${firstChunkTime}ms`);
        }

        // Send text chunk to client
        session.send('response_chunk', {
          text: chunk,
          is_final: false
        });
      }
    }

    const totalLatency = Date.now() - startTime;
    console.log(`[WebSocket:${session.sessionId}] Claude response complete in ${totalLatency}ms: "${fullResponse.substring(0, 50)}..."`);

    // Add to conversation history
    session.addMessage('assistant', fullResponse);

    // Send final response
    session.send('response_complete', {
      text: fullResponse,
      latency_ms: totalLatency,
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514'
    });

    // Generate voice
    await generateVoice(session, fullResponse);

  } catch (error) {
    console.error('[WebSocket] Claude API error:', error);
    session.send('error', {
      message: 'Claude processing failed',
      error: error.message,
      type: 'claude_error'
    });
  }
}

/**
 * Generate voice using Vocode
 */
async function generateVoice(session, text) {
  const startTime = Date.now();

  try {
    session.send('synthesizing', { status: 'generating_voice' });
    session.isSpeaking = true;

    const vocodeUrl = process.env.VOCODE_TTS_URL || 'http://localhost:9001';

    const response = await fetch(`${vocodeUrl}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice_id: session.voiceConfig.voice_id,
        stability: session.voiceConfig.stability,
        similarity_boost: session.voiceConfig.similarity_boost,
        speed: session.voiceConfig.speed,
        pitch: session.voiceConfig.pitch,
        streaming: true
      })
    });

    if (!response.ok) {
      throw new Error(`Vocode TTS failed: ${response.statusText}`);
    }

    const firstChunkTime = Date.now() - startTime;
    console.log(`[WebSocket:${session.sessionId}] First TTS chunk in ${firstChunkTime}ms`);

    session.send('speaking_started', {
      latency_ms: firstChunkTime,
      text_length: text.length
    });

    // Stream audio chunks to client
    let totalBytes = 0;
    const reader = response.body;

    for await (const chunk of reader) {
      if (!session.isSpeaking) {
        console.log(`[WebSocket:${session.sessionId}] TTS interrupted`);
        break;
      }

      session.sendAudio(chunk);
      totalBytes += chunk.length;
    }

    const totalLatency = Date.now() - startTime;
    console.log(`[WebSocket:${session.sessionId}] TTS complete in ${totalLatency}ms (${totalBytes} bytes)`);

    session.send('speaking_complete', {
      latency_ms: totalLatency,
      bytes: totalBytes
    });

    session.isSpeaking = false;
    session.isListening = true;

  } catch (error) {
    console.error('[WebSocket] TTS error:', error);
    session.send('error', {
      message: 'Voice synthesis failed',
      error: error.message,
      type: 'tts_error'
    });
    session.isSpeaking = false;
  }
}

/**
 * Handle command messages
 */
async function handleCommand(session, message) {
  const { type, data } = message;

  switch (type) {
    case 'interrupt':
      session.interrupt();
      break;

    case 'config':
      if (data.voice_config) {
        session.voiceConfig = { ...session.voiceConfig, ...data.voice_config };
        session.send('config_updated', { voice_config: session.voiceConfig });
      }
      break;

    case 'ping':
      session.send('pong', { timestamp: Date.now() });
      break;

    case 'clear_history':
      session.conversationHistory = [];
      session.send('history_cleared', { message: 'Conversation history cleared' });
      break;

    case 'get_stats':
      session.send('stats', {
        session_id: session.sessionId,
        conversation_length: session.conversationHistory.length,
        interruption_count: session.interruptionCount,
        is_speaking: session.isSpeaking,
        is_listening: session.isListening,
        uptime_ms: Date.now() - session.createdAt
      });
      break;

    default:
      session.send('error', {
        message: `Unknown command: ${type}`,
        type: 'unknown_command'
      });
  }
}

/**
 * Get all active WebSocket connections
 */
export function getActiveWebSocketSessions() {
  return Array.from(wsConnections.values()).map(session => ({
    session_id: session.sessionId,
    is_speaking: session.isSpeaking,
    is_listening: session.isListening,
    interruption_count: session.interruptionCount,
    conversation_length: session.conversationHistory.length,
    uptime_ms: Date.now() - session.createdAt
  }));
}

export default { initWebSocketServer, getActiveWebSocketSessions };

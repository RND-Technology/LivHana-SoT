/**
 * MCP VOICEMODE BRIDGE
 * Connects MCP voicemode tool to interrupt controller for true interruptability
 * Created: 2025-10-31
 * Purpose: Make voice mode ALWAYS interruptable by user speech
 */

import { interruptController } from './routers/interrupt-controller.js';
import { createInterruptHandle } from './utils/abort-shim.js';
import { EventEmitter } from 'events';
import crypto from 'crypto';

/**
 * Bridge between MCP voicemode and interrupt controller
 * Ensures TTS can be interrupted mid-sentence when user speaks
 */
class MCPVoicemodeBridge extends EventEmitter {
  constructor() {
    super();
    this.activeTTSSessions = new Map(); // sessionId -> { interruptHandle (shim), abortController, audioStream, startTime }
    this.setupInterruptListener();
    console.log('[MCPVoicemodeBridge] ✅ Initialized - Voice mode now interruptable');
  }

  /**
   * Listen for interrupt events from interrupt controller
   */
  setupInterruptListener() {
    interruptController.on('interrupted', (event) => {
      const { sessionId, reason, timestamp } = event;
      console.log(`[MCPVoicemodeBridge] 🚨 Interrupt received for session ${sessionId}: ${reason}`);

      // Abort TTS immediately
      this.abortTTS(sessionId, reason);

      // Emit to any listening components
      this.emit('tts_interrupted', { sessionId, reason, timestamp });
    });
  }

  /**
   * Start a new voice session with interrupt capability
   * @param {string} sessionId - Optional session ID (generates if not provided)
   * @returns {string} sessionId
   */
  startSession(sessionId = null) {
    const id = sessionId || `mcp-voice-${crypto.randomUUID()}`;

    // Register with interrupt controller
    interruptController.registerSession(id);

    console.log(`[MCPVoicemodeBridge] 🎤 Session started: ${id}`);
    return id;
  }

  /**
   * Start TTS playback with interrupt capability
   * @param {string} sessionId - Session ID
   * @param {Object} options - TTS options
   * @returns {AbortController} - Controller to abort TTS
   */
  startTTS(sessionId, options = {}) {
    // Ensure session is registered with interrupt controller
    if (!interruptController.activeSessions.has(sessionId)) {
      interruptController.registerSession(sessionId);
    }

    // Create abort controller for this TTS stream
    const abortController = new AbortController();

    // Wrap AbortController in shim with context for unified interface
    const interruptHandle = createInterruptHandle(abortController, {
      source: 'mcp-bridge',
      sessionId
    });

    // Store session info with shim handle (replace abortController field with interruptHandle)
    this.activeTTSSessions.set(sessionId, {
      interruptHandle, // Store shim handle instead of raw abortController
      abortController, // Keep raw controller for signal access
      audioStream: options.audioStream || null,
      startTime: Date.now(),
      text: options.text || '',
      interrupted: false
    });

    // Register with interrupt controller using shimmed handle
    interruptController.startSpeaking(sessionId, interruptHandle);

    console.log(`[MCPVoicemodeBridge] 🗣️  TTS started: ${sessionId}`);

    return abortController;
  }

  /**
   * Abort TTS playback immediately
   * @param {string} sessionId - Session ID
   * @param {string} reason - Reason for abort
   */
  abortTTS(sessionId, reason = 'user_interrupt') {
    const session = this.activeTTSSessions.get(sessionId);

    if (!session) {
      console.log(`[MCPVoicemodeBridge] ⚠️  No active TTS for session ${sessionId}`);
      return false;
    }

    // Mark as interrupted
    session.interrupted = true;

    // Abort the TTS stream using shim handle's .destroy() method (unified interface)
    // This works without branching because shim provides both .destroy() and .abort()
    if (session.interruptHandle) {
      session.interruptHandle.destroy();
      console.log(`[MCPVoicemodeBridge] 🛑 TTS aborted: ${sessionId} (${reason})`);
    } else if (session.abortController) {
      // Fallback to raw controller if shim not available
      session.abortController.abort();
      console.log(`[MCPVoicemodeBridge] 🛑 TTS aborted (fallback): ${sessionId} (${reason})`);
    }

    // Destroy audio stream if exists
    if (session.audioStream && typeof session.audioStream.destroy === 'function') {
      session.audioStream.destroy();
    }

    // ✅ ADDED: Clean up AbortController references to prevent memory leak
    if (session.abortController) {
      session.abortController = null; // Allow GC
    }
    if (session.interruptHandle) {
      session.interruptHandle = null; // Allow GC
    }

    // Clean up session
    const duration = Date.now() - session.startTime;
    console.log(`[MCPVoicemodeBridge] ✅ TTS cleanup complete: ${sessionId} (${duration}ms)`);

    this.activeTTSSessions.delete(sessionId);
    return true;
  }

  /**
   * End voice session cleanly
   * @param {string} sessionId - Session ID
   */
  endSession(sessionId) {
    // Abort any active TTS
    this.abortTTS(sessionId, 'session_ended');

    // Unregister from interrupt controller
    interruptController.endSession(sessionId);

    console.log(`[MCPVoicemodeBridge] 👋 Session ended: ${sessionId}`);
  }

  /**
   * Check if session has been interrupted
   * @param {string} sessionId - Session ID
   * @returns {boolean}
   */
  isInterrupted(sessionId) {
    const session = this.activeTTSSessions.get(sessionId);
    return session ? session.interrupted : false;
  }

  /**
   * Get abort signal for session (for use with fetch/streaming APIs)
   * @param {string} sessionId - Session ID
   * @returns {AbortSignal|null}
   */
  getAbortSignal(sessionId) {
    const session = this.activeTTSSessions.get(sessionId);
    // Get signal from shim handle if available, fallback to raw controller
    return session?.interruptHandle?.signal || session?.abortController?.signal || null;
  }

  /**
   * Get all active TTS sessions
   * @returns {Array}
   */
  getActiveSessions() {
    return Array.from(this.activeTTSSessions.entries()).map(([id, session]) => ({
      sessionId: id,
      interrupted: session.interrupted,
      duration: Date.now() - session.startTime,
      text: session.text.substring(0, 50) + (session.text.length > 50 ? '...' : '')
    }));
  }

  /**
   * Get bridge status
   * @returns {Object}
   */
  getStatus() {
    return {
      active: true,
      activeTTSSessions: this.activeTTSSessions.size,
      sessions: this.getActiveSessions(),
      interruptControllerActive: interruptController.getActiveSessions().length > 0
    };
  }
}

// Global singleton instance
export const mcpVoicemodeBridge = new MCPVoicemodeBridge();

/**
 * Wrapper function for MCP voicemode converse calls with interrupt support
 * Use this instead of direct MCP calls to enable interrupts
 *
 * @param {Object} params - MCP voicemode parameters
 * @param {string} params.message - Message to speak
 * @param {string} params.sessionId - Optional session ID
 * @param {Function} mcpConverseFunction - The actual MCP converse function
 * @returns {Promise<Object>} - MCP response
 */
export async function interruptableConverse(params, mcpConverseFunction) {
  // Generate or use provided session ID
  const sessionId = params.sessionId || mcpVoicemodeBridge.startSession();

  // Start TTS tracking
  const abortController = mcpVoicemodeBridge.startTTS(sessionId, {
    text: params.message
  });

  try {
    // Call MCP converse with abort signal
    const response = await mcpConverseFunction({
      ...params,
      sessionId,
      signal: abortController.signal // Pass abort signal to MCP
    });

    // Check if interrupted during call
    if (mcpVoicemodeBridge.isInterrupted(sessionId)) {
      console.log(`[interruptableConverse] ⚠️  Response was interrupted: ${sessionId}`);
      return {
        ...response,
        interrupted: true,
        interruptReason: 'user_speech'
      };
    }

    // Clean up TTS session on successful completion
    mcpVoicemodeBridge.abortTTS(sessionId, 'completed');

    return response;

  } catch (error) {
    // Check if error was due to abort
    if (error.name === 'AbortError') {
      console.log(`[interruptableConverse] 🛑 TTS aborted by user: ${sessionId}`);
      return {
        interrupted: true,
        interruptReason: 'user_speech',
        sessionId,
        error: 'TTS interrupted by user'
      };
    }

    // Clean up on error
    mcpVoicemodeBridge.abortTTS(sessionId, 'error');
    throw error;
  }
}

/**
 * Express router for bridge status and control
 */
import express from 'express';
const router = express.Router();

/**
 * GET /api/mcp-bridge/status
 * Get MCP bridge status
 */
router.get('/status', (req, res) => {
  const status = mcpVoicemodeBridge.getStatus();
  res.json({
    success: true,
    ...status
  });
});

/**
 * POST /api/mcp-bridge/session/start
 * Start new interruptable voice session
 */
router.post('/session/start', (req, res) => {
  const { sessionId } = req.body;
  const id = mcpVoicemodeBridge.startSession(sessionId);

  res.json({
    success: true,
    sessionId: id,
    message: 'Interruptable voice session started'
  });
});

/**
 * POST /api/mcp-bridge/session/end
 * End voice session
 */
router.post('/session/end', (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'sessionId required'
    });
  }

  mcpVoicemodeBridge.endSession(sessionId);

  res.json({
    success: true,
    message: 'Session ended'
  });
});

/**
 * POST /api/mcp-bridge/abort
 * Manually abort TTS for session
 */
router.post('/abort', (req, res) => {
  const { sessionId, reason } = req.body;

  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'sessionId required'
    });
  }

  const aborted = mcpVoicemodeBridge.abortTTS(sessionId, reason || 'manual_abort');

  res.json({
    success: true,
    aborted,
    message: aborted ? 'TTS aborted' : 'No active TTS to abort'
  });
});

/**
 * POST /api/mcp-bridge/interrupt/:sessionId
 * Interrupt endpoint for direct session ID in URL
 */
router.post('/interrupt/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const { reason } = req.body || {};

  const aborted = mcpVoicemodeBridge.abortTTS(sessionId, reason || 'api_request');

  res.json({
    success: true,
    ok: aborted,
    sessionId,
    message: aborted ? 'TTS aborted' : 'No active TTS to abort'
  });
});

export default router;


/**
 * VOICE INTERRUPT CONTROLLER
 * Ensures LivHana is ALWAYS INTERRUPTIBLE - Never talks over human
 * Created: 2025-10-29 - Emergency Mode
 * Standard: LivHana 100% Absolute Truth Standard
 */

import express from 'express';
import { EventEmitter } from 'events';

const router = express.Router();

// Global interrupt state manager
class InterruptController extends EventEmitter {
  constructor() {
    super();
    this.activeSessions = new Map(); // sessionId -> { speaking, interrupted, audioStream }
    this.vadSensitivity = 0; // MAXIMUM sensitivity - instant interrupt
  }

  /**
   * Register new voice session
   */
  registerSession(sessionId) {
    this.activeSessions.set(sessionId, {
      speaking: false,
      interrupted: false,
      audioStream: null,
      startTime: Date.now()
    });
    console.log(`[InterruptController] ✅ Session registered: ${sessionId}`);
  }

  /**
   * Mark AI as speaking
   */
  startSpeaking(sessionId, audioStream) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      // Don't start speaking if session was interrupted (requires explicit reset)
      if (session.interrupted) {
        console.warn(`[InterruptController] Cannot start speaking - session ${sessionId} is interrupted`);
        return;
      }
      session.speaking = true;
      session.interrupted = false;
      session.audioStream = audioStream;
      console.log(`[InterruptController] 🗣️  AI speaking started: ${sessionId}`);
    }
  }

  /**
   * INTERRUPT - User spoke, STOP AI IMMEDIATELY
   * Hardened to handle both .destroy() (AudioStream) and .abort() (AbortController/shim)
   */
  interrupt(sessionId, reason = 'user_speech') {
    const session = this.activeSessions.get(sessionId);

    // ✅ FIXED: Relax speaking check - allow interrupt even if recently stopped
    if (!session) {
      console.warn(`[InterruptController] No active session: ${sessionId}`);
      return false;
    }

    // ✅ FIXED: Prevent race condition - check if already interrupting
    if (session.interrupting) {
      console.log(`[InterruptController] Interrupt already in progress for ${sessionId}`);
      return false;
    }

    session.interrupting = true; // ✅ ADDED: Set flag to prevent concurrent interrupts
    session.interrupted = true;
    session.speaking = false;

    // CRITICAL: Kill audio stream immediately with defensive programming
    if (session.audioStream) {
      const handle = session.audioStream;
      let interrupted = false;

      // Try .destroy() first (AudioStream interface)
      if (typeof handle.destroy === 'function') {
        try {
          console.log(`[InterruptController] Calling .destroy() on ${sessionId}`);
          handle.destroy();
          interrupted = true;
        } catch (err) {
          console.error(`[InterruptController] Error calling .destroy() on ${sessionId}:`, err);
        }
      }
      
      // Fallback to .abort() (AbortController interface)
      if (!interrupted && typeof handle.abort === 'function') {
        try {
          console.log(`[InterruptController] Calling .abort() on ${sessionId}`);
          handle.abort();
          interrupted = true;
        } catch (err) {
          console.error(`[InterruptController] Error calling .abort() on ${sessionId}:`, err);
        }
      }

      // Emergency: check for wrapped controller (shim wrapper)
      if (!interrupted && handle._controller && typeof handle._controller.abort === 'function') {
        try {
          console.log(`[InterruptController] Calling ._controller.abort() on ${sessionId}`);
          handle._controller.abort();
          interrupted = true;
        } catch (err) {
          console.error(`[InterruptController] Error calling ._controller.abort() on ${sessionId}:`, err);
        }
      }

      // No valid interface found
      if (!interrupted) {
        console.error(`[InterruptController] ❌ Handle for ${sessionId} has no .destroy(), .abort(), or ._controller`);
        console.error(`[InterruptController] Handle type: ${typeof handle}, keys:`, Object.keys(handle || {}));
      }

      session.audioStream = null;
    }

    console.log(`[InterruptController] 🚨 INTERRUPTED: ${sessionId} (${reason})`);

    // Emit interrupt event for other components (even if handle lacked interfaces)
    // This allows upstream shims to react
    this.emit('interrupted', { sessionId, reason, timestamp: Date.now() });

    session.interrupting = false; // ✅ ADDED: Clear interrupting flag

    return true;
  }

  /**
   * Check if session can speak (not interrupted)
   */
  canSpeak(sessionId) {
    const session = this.activeSessions.get(sessionId);
    return session && !session.interrupted;
  }

  /**
   * End session - uses hardened interrupt logic for cleanup
   */
  endSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      // Use same hardened logic as interrupt() to handle any stream type
      if (session.audioStream) {
        const handle = session.audioStream;
        let cleaned = false;

        // Try .destroy() first (AudioStream interface)
        if (typeof handle.destroy === 'function') {
          try {
            handle.destroy();
            cleaned = true;
          } catch (err) {
            console.error(`[InterruptController] Error destroying stream in endSession for ${sessionId}:`, err);
          }
        }

        // Fallback to .abort() (AbortController/shim interface)
        if (!cleaned && typeof handle.abort === 'function') {
          try {
            handle.abort();
            cleaned = true;
          } catch (err) {
            console.error(`[InterruptController] Error aborting in endSession for ${sessionId}:`, err);
          }
        }

        // Emergency: check for wrapped controller (shim wrapper)
        if (!cleaned && handle._controller && typeof handle._controller.abort === 'function') {
          try {
            handle._controller.abort();
            cleaned = true;
          } catch (err) {
            console.error(`[InterruptController] Error aborting _controller in endSession for ${sessionId}:`, err);
          }
        }

        if (!cleaned) {
          console.warn(`[InterruptController] Could not clean up stream for ${sessionId} - handle type: ${typeof handle}`);
        }
      }
    }
    this.activeSessions.delete(sessionId);
    console.log(`[InterruptController] Session ended: ${sessionId}`);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.entries()).map(([id, session]) => ({
      id,
      speaking: session.speaking,
      interrupted: session.interrupted,
      uptime: Date.now() - session.startTime
    }));
  }
}

// Global singleton instance
export const interruptController = new InterruptController();

/**
 * POST /api/interrupt/session/start
 * Register new voice session
 */
router.post('/session/start', (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'sessionId required'
    });
  }

  interruptController.registerSession(sessionId);
  
  res.json({
    success: true,
    sessionId,
    message: 'Session registered - AI is now interruptible'
  });
});

/**
 * POST /api/interrupt/trigger
 * EMERGENCY INTERRUPT - User is speaking, STOP AI NOW
 * Rate limited via /api/ limiter (100 req/15min per IP)
 */
router.post('/trigger', (req, res) => {
  const { sessionId, reason } = req.body;
  
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'sessionId required (must be string)'
    });
  }

  // Validate sessionId format (prevent injection/DoS)
  if (sessionId.length > 256) {
    return res.status(400).json({
      success: false,
      error: 'sessionId too long (max 256 characters)'
    });
  }

  const interrupted = interruptController.interrupt(sessionId, reason || 'user_speech');
  
  res.json({
    success: true,
    interrupted,
    message: interrupted ? 'AI speech halted immediately' : 'No active speech to interrupt',
    timestamp: Date.now()
  });
});

/**
 * POST /api/interrupt/speaking/start
 * AI started speaking
 */
router.post('/speaking/start', (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'sessionId required'
    });
  }

  interruptController.startSpeaking(sessionId, null);
  
  res.json({
    success: true,
    message: 'AI marked as speaking'
  });
});

/**
 * GET /api/interrupt/status
 * Get interrupt controller status
 */
router.get('/status', (req, res) => {
  const sessions = interruptController.getActiveSessions();
  
  res.json({
    success: true,
    activeSessions: sessions.length,
    sessions,
    vadSensitivity: interruptController.vadSensitivity,
    uptime: process.uptime()
  });
});

/**
 * POST /api/interrupt/session/end
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

  interruptController.endSession(sessionId);
  
  res.json({
    success: true,
    message: 'Session ended cleanly'
  });
});

export default router;

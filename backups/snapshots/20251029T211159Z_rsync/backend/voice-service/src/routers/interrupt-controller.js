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
      session.speaking = true;
      session.interrupted = false;
      session.audioStream = audioStream;
      console.log(`[InterruptController] 🗣️  AI speaking started: ${sessionId}`);
    }
  }

  /**
   * INTERRUPT - User spoke, STOP AI IMMEDIATELY
   */
  interrupt(sessionId, reason = 'user_speech') {
    const session = this.activeSessions.get(sessionId);
    if (session && session.speaking) {
      session.interrupted = true;
      session.speaking = false;

      // CRITICAL: Kill audio stream immediately
      if (session.audioStream) {
        session.audioStream.destroy();
        session.audioStream = null;
      }

      console.log(`[InterruptController] 🚨 INTERRUPTED: ${sessionId} (${reason})`);
      
      // Emit interrupt event for other components
      this.emit('interrupted', { sessionId, reason, timestamp: Date.now() });
      
      return true;
    }
    return false;
  }

  /**
   * Check if session can speak (not interrupted)
   */
  canSpeak(sessionId) {
    const session = this.activeSessions.get(sessionId);
    return session && !session.interrupted;
  }

  /**
   * End session
   */
  endSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session && session.audioStream) {
      session.audioStream.destroy();
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
 */
router.post('/trigger', (req, res) => {
  const { sessionId, reason } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({
      success: false,
      error: 'sessionId required'
    });
  }

  const interrupted = interruptController.interrupt(sessionId, reason);
  
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

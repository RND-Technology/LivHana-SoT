/**
 * VAD INTERRUPT CLIENT
 * Detects user speech and triggers interrupt to stop AI TTS mid-sentence
 * For use in VS Code extension / Claude Code voice mode
 * Created: 2025-10-31
 * Purpose: 3-way interruptable voice mode
 */

/**
 * Voice Activity Detection (VAD) Interrupt Client
 * Monitors microphone for user speech and sends interrupt signals
 */
class VADInterruptClient {
  constructor(options = {}) {
    this.apiBaseUrl = options.apiBaseUrl || 'http://localhost:8080';
    this.sessionId = options.sessionId || null;
    this.authToken = options.authToken || null; // ✅ ADDED: Auth token support
    this.vadSensitivity = options.vadSensitivity || 0; // 0 = most sensitive
    this.interruptThreshold = options.interruptThreshold || -40; // dB
    this.enabled = false;
    this.analyzing = false;

    // Audio context and nodes
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;

    // Interrupt state
    this.aiSpeaking = false;
    this.userSpeaking = false;
    this.interruptInProgress = false;

    // Callbacks
    this.onInterruptSent = options.onInterruptSent || (() => {});
    this.onSpeechDetected = options.onSpeechDetected || (() => {});
    this.onSpeechEnded = options.onSpeechEnded || (() => {});

    console.log('[VADInterruptClient] ✅ Initialized');
  }

  /**
   * Initialize audio input and VAD
   */
  async initialize() {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Setup Web Audio API
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.3;

      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      // Setup data array for frequency analysis
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      this.enabled = true;
      console.log('[VADInterruptClient] 🎤 Microphone initialized');

      return true;
    } catch (error) {
      console.error('[VADInterruptClient] ❌ Failed to initialize microphone:', error);
      return false;
    }
  }

  /**
   * Start monitoring for user speech (call when AI starts speaking)
   */
  startMonitoring(sessionId) {
    if (!this.enabled) {
      console.warn('[VADInterruptClient] ⚠️  Not initialized, call initialize() first');
      return;
    }

    this.sessionId = sessionId;
    this.aiSpeaking = true;
    this.analyzing = true;

    console.log(`[VADInterruptClient] 👂 Monitoring for interrupts on session: ${sessionId}`);

    // Start VAD analysis loop
    this._analyzeAudio();
  }

  /**
   * Stop monitoring (call when AI stops speaking)
   */
  stopMonitoring() {
    this.analyzing = false;
    this.aiSpeaking = false;
    this.userSpeaking = false;
    console.log('[VADInterruptClient] 🛑 Monitoring stopped');
  }

  /**
   * Analyze audio for speech detection
   */
  _analyzeAudio() {
    if (!this.analyzing) return;

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate average volume
    const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;

    // Convert to dB (approximate)
    const dB = 20 * Math.log10(average / 255);

    // Detect speech
    const speechDetected = dB > this.interruptThreshold;

    if (speechDetected && !this.userSpeaking && this.aiSpeaking) {
      // User started speaking while AI is talking - INTERRUPT!
      this._handleSpeechStart();
    } else if (!speechDetected && this.userSpeaking) {
      // User stopped speaking
      this._handleSpeechEnd();
    }

    // Continue analysis loop
    requestAnimationFrame(() => this._analyzeAudio());
  }

  /**
   * Handle user speech start (trigger interrupt)
   */
  async _handleSpeechStart() {
    this.userSpeaking = true;
    console.log('[VADInterruptClient] 🗣️  User speech detected!');

    // Callback
    this.onSpeechDetected();

    // Send interrupt if AI is speaking
    if (this.aiSpeaking && !this.interruptInProgress) {
      await this.sendInterrupt('user_speech_detected');
    }
  }

  /**
   * Handle user speech end
   */
  _handleSpeechEnd() {
    this.userSpeaking = false;
    this.interruptInProgress = false;
    console.log('[VADInterruptClient] 🤫 User speech ended');

    // Callback
    this.onSpeechEnded();
  }

  /**
   * Send interrupt signal to backend
   */
  async sendInterrupt(reason = 'user_interrupt') {
    if (!this.sessionId) {
      console.warn('[VADInterruptClient] ⚠️  No session ID, cannot send interrupt');
      return false;
    }

    if (this.interruptInProgress) {
      console.log('[VADInterruptClient] ⏳ Interrupt already in progress, skipping');
      return false;
    }

    this.interruptInProgress = true;

    try {
      console.log(`[VADInterruptClient] 🚨 Sending interrupt for session: ${this.sessionId}`);

      // ✅ ADDED: Timeout for fetch request (5 second timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const headers = {
        'Content-Type': 'application/json'
      };

      // ✅ FIXED: Add auth token if provided
      if (this.authToken) {
        headers['Authorization'] = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.apiBaseUrl}/api/interrupt/trigger`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId: this.sessionId,
          reason
        }),
        signal: controller.signal // ✅ ADDED: Abort signal for timeout
      });

      clearTimeout(timeoutId); // ✅ ADDED: Clear timeout on success

      const result = await response.json();

      if (result.success) {
        console.log('[VADInterruptClient] ✅ Interrupt sent successfully');
        this.aiSpeaking = false; // AI should have stopped
        this.onInterruptSent(result);
        return true;
      } else {
        console.error('[VADInterruptClient] ❌ Interrupt failed:', result);
        return false;
      }

    } catch (error) {
      console.error('[VADInterruptClient] ❌ Error sending interrupt:', error);
      return false;
    }
  }

  /**
   * Manually trigger interrupt (for testing or manual control)
   */
  async manualInterrupt() {
    console.log('[VADInterruptClient] 🔴 Manual interrupt triggered');
    return await this.sendInterrupt('manual_interrupt');
  }

  /**
   * Register a new voice session
   */
  async registerSession(sessionId = null) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/mcp-bridge/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
      });

      const result = await response.json();

      if (result.success) {
        this.sessionId = result.sessionId;
        console.log(`[VADInterruptClient] ✅ Session registered: ${this.sessionId}`);
        return this.sessionId;
      }

    } catch (error) {
      console.error('[VADInterruptClient] ❌ Failed to register session:', error);
    }

    return null;
  }

  /**
   * End voice session
   */
  async endSession() {
    if (!this.sessionId) return;

    try {
      await fetch(`${this.apiBaseUrl}/api/mcp-bridge/session/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.sessionId
        })
      });

      console.log(`[VADInterruptClient] 👋 Session ended: ${this.sessionId}`);
      this.sessionId = null;

    } catch (error) {
      console.error('[VADInterruptClient] ❌ Error ending session:', error);
    }
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.stopMonitoring();

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.enabled = false;
    console.log('[VADInterruptClient] 🧹 Disposed');
  }
}

/**
 * Example usage for VS Code extension / Claude Code integration
 */

// Initialize VAD client
const vadClient = new VADInterruptClient({
  apiBaseUrl: 'http://localhost:8080',
  vadSensitivity: 0, // Most sensitive
  interruptThreshold: -40, // dB threshold

  // Callbacks
  onSpeechDetected: () => {
    console.log('👤 User started speaking!');
  },

  onInterruptSent: (result) => {
    console.log('🚨 Interrupt sent:', result);
  },

  onSpeechEnded: () => {
    console.log('🤫 User stopped speaking');
  }
});

// Initialize microphone (one time, at extension startup)
async function initVoiceMode() {
  const initialized = await vadClient.initialize();

  if (!initialized) {
    console.error('Failed to initialize VAD client');
    return;
  }

  // Register session with backend
  const sessionId = await vadClient.registerSession();
  console.log('Session ID:', sessionId);
}

// When AI starts speaking (TTS begins)
function onAIStartSpeaking(sessionId) {
  vadClient.startMonitoring(sessionId);
}

// When AI stops speaking (TTS ends)
function onAIStopSpeaking() {
  vadClient.stopMonitoring();
}

// Manual interrupt (for testing or button click)
async function triggerManualInterrupt() {
  await vadClient.manualInterrupt();
}

// Cleanup on extension deactivate
function cleanup() {
  vadClient.endSession();
  vadClient.dispose();
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VADInterruptClient,
    initVoiceMode,
    onAIStartSpeaking,
    onAIStopSpeaking,
    triggerManualInterrupt,
    cleanup
  };
}

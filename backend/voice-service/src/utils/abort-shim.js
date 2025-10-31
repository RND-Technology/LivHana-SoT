/**
 * AbortController Shim - Unifies .destroy() and .abort() interfaces
 * Ensures ALL 3 interrupt paths (WebSocket, REST, MCP) can kill audio
 * Created: 2025-10-31 - Voice Mode Interruptability Fix
 */

/**
 * Create unified interrupt handle that wraps AbortController
 * @param {AbortController} abortController - The AbortController to wrap
 * @param {Object} context - Optional context for logging: { source: string, sessionId: string }
 * @returns {Object} Unified handle with .destroy(), .abort(), and .signal
 */
export function createInterruptHandle(abortController, context = {}) {
  if (!abortController) {
    console.error('[ABORT-SHIM] No AbortController provided', context);
    // Return safe no-op handle with dummy signal to prevent null reference errors
    const dummySignal = { aborted: true }; // Mark as already aborted
    return { 
      destroy: () => {}, 
      abort: () => {}, 
      signal: dummySignal, // Provide dummy signal instead of null
      _controller: null,
      get aborted() { return true; } // Always report as aborted
    };
  }

  const { source, sessionId } = context;
  let aborted = false;

  const log = (action) => {
    // Guard against non-string context values to prevent logging crashes
    const ctx = source ? `[${String(source)}]` : '[ABORT-SHIM]';
    const session = sessionId ? ` session:${String(sessionId)}` : '';
    console.log(`${ctx} ${action}${session}`);
  };

  return {
    // Primary interface expected by interrupt-controller.js
    destroy: () => {
      // Always check signal state first to sync with external aborts
      if (abortController.signal.aborted || aborted) {
        log('destroy() called (already aborted - duplicate call)');
        aborted = true; // Sync local state
        return;
      }
      aborted = true;
      log('destroy() called → aborting controller');
      abortController.abort();
    },

    // Secondary interface for direct abort calls
    abort: () => {
      // Always check signal state first to sync with external aborts
      if (abortController.signal.aborted || aborted) {
        log('abort() called (already aborted - duplicate call)');
        aborted = true; // Sync local state
        return;
      }
      aborted = true;
      log('abort() called → aborting controller');
      abortController.abort();
    },

    // Expose signal for downstream abort listeners
    signal: abortController.signal,

    // Expose raw controller for edge cases
    _controller: abortController,

    // Check if already aborted (for debugging)
    get aborted() {
      return aborted || abortController.signal.aborted;
    }
  };
}


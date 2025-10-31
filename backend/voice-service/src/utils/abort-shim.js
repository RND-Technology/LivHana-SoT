/**
 * AbortController Shim - Unifies .destroy() and .abort() interfaces
 * Ensures ALL 3 interrupt paths (WebSocket, REST, MCP) can kill audio
 * 
 * Created: 2025-10-31
 * Standard: LivHana 100% Absolute Truth Standard
 */

export function createInterruptHandle(abortController, context = {}) {
  if (!abortController) {
    return { destroy: () => {}, abort: () => {}, signal: null, context: {}, isAborted: false };
  }

  const frozenContext = Object.freeze({ ...context });

  let isAborted = false;

  return Object.freeze({
    destroy: () => {
      if (isAborted) return;
      try {
        if (!abortController.signal.aborted) {
          isAborted = true;
          abortController.abort();
        }
      } catch (err) { 
        console.error('[SHIM] destroy() error:', err); 
      }
    },

    abort: () => {
      if (isAborted) return;
      try {
        if (!abortController.signal.aborted) {
          isAborted = true;
          abortController.abort();
        }
      } catch (err) { 
        console.error('[SHIM] abort() error:', err); 
      }
    },

    signal: abortController.signal,

    context: frozenContext,

    get isAborted() { return isAborted || abortController.signal.aborted; }
  });
}


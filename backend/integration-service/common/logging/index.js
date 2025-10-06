/* eslint-disable no-console */
export function createLogger(name) {
  return {
    info: (message, meta = {}) => console.log(`[${name}] INFO: ${message}`, meta),
    error: (message, meta = {}) => console.error(`[${name}] ERROR: ${message}`, meta),
    warn: (message, meta = {}) => console.warn(`[${name}] WARN: ${message}`, meta),
    debug: (message, meta = {}) => console.log(`[${name}] DEBUG: ${message}`, meta)
  };
}
/* eslint-enable no-console */

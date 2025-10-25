/* eslint-disable no-console */
/**
 * Structured JSON logging for Tier-1 production
 * Format: { severity, timestamp, message, requestId?, ...meta }
 */
export function createLogger(name) {
  const log = (severity, message, meta = {}) => {
    const entry = {
      severity: severity.toUpperCase(),
      timestamp: new Date().toISOString(),
      message,
      service: name,
      ...meta
    };
    const output = JSON.stringify(entry);
    if (severity === 'error') {
      console.error(output);
    } else {
      console.log(output);
    }
  };

  return {
    info: (message, meta = {}) => log('info', message, meta),
    error: (message, meta = {}) => log('error', message, meta),
    warn: (message, meta = {}) => log('warn', message, meta),
    debug: (message, meta = {}) => log('debug', message, meta)
  };
}
/* eslint-enable no-console */

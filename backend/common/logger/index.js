// Simple structured logger (no external deps)
// Usage: logger.info('message', { metaKey: 'value' })

function serialize(level, message, meta) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta && typeof meta === 'object' ? meta : {})
  };
  return JSON.stringify(entry);
}

const logger = {
  info(message, meta) {
    // eslint-disable-next-line no-console
    console.log(serialize('info', message, meta));
  },
  warn(message, meta) {
    // eslint-disable-next-line no-console
    console.warn(serialize('warn', message, meta));
  },
  error(message, meta) {
    // eslint-disable-next-line no-console
    console.error(serialize('error', message, meta));
  }
};

export default logger;

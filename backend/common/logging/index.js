const pino = require('pino');

const createLogger = (serviceName) => {
  // Use pino-pretty in development, JSON in production
  const transport = process.env.NODE_ENV === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname'
        }
      }
    : undefined;

  return pino({
    name: serviceName,
    level: process.env.LOG_LEVEL || 'info',
    transport,
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      }
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
      err: pino.stdSerializers.err
    }
  });
};

module.exports = { createLogger };

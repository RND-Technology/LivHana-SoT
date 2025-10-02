import pino from 'pino';

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
    },
    // Add base context
    base: {
      service: serviceName,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    }
  });
};

export { createLogger };
export * from './logger.js';
export * from './context.js';
// Last optimized: 2025-10-02

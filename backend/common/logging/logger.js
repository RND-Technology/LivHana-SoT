import { randomUUID } from 'crypto';

/**
 * Generate or retrieve request ID for correlation
 */
export const withRequestId = (logger) => (req, res, next) => {
  // Get request ID from header or generate new one
  const requestId = req.headers['x-request-id'] || randomUUID();

  // Attach to request for later use
  req.requestId = requestId;

  // Add to response headers for tracing
  res.setHeader('x-request-id', requestId);

  // Create child logger with request ID
  req.logger = logger.child({ requestId });

  next();
};

export const requestLogger = (logger) => (req, _res, next) => {
  const requestLogger = req.logger || logger;
  requestLogger.info({
    method: req.method,
    path: req.path,
    userAgent: req.get('user-agent'),
    ip: req.ip,
  }, 'Incoming request');
  next();
};

export const errorLogger = (logger) => (error, req, res, next) => {
  const requestLogger = req.logger || logger;
  requestLogger.error({
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  }, 'Unhandled error');

  if (res.headersSent) {
    return next(error);
  }
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.requestId,
  });
};
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

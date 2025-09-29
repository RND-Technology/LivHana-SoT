export const requestLogger = (logger) => (req, _res, next) => {
  logger.info({ method: req.method, path: req.path }, 'Incoming request');
  next();
};

export const errorLogger = (logger) => (error, req, res, next) => {
  logger.error({ error: error.message, path: req.path }, 'Unhandled error');
  if (res.headersSent) {
    return next(error);
  }
  res.status(500).json({ error: 'Internal server error' });
};

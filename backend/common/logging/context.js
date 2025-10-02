export const withRequestContext = (logger, requestId) => {
  if (!logger || !requestId) {
    return logger;
  }

  return logger.child({ requestId });
};
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

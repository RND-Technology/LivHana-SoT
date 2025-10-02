export const withRequestContext = (logger, requestId) => {
  if (!logger || !requestId) {
    return logger;
  }

  return logger.child({ requestId });
};

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02

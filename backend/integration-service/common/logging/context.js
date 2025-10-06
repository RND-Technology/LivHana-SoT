/**
 * Optimized: 2025-10-02
 * RPM: 1.6.2.3.backend-common-optimization
 * Session: Elephant Strategy Batch 1
 */

export const withRequestContext = (logger, requestId) => {
  if (!logger || !requestId) {
    return logger;
  }

  return logger.child({ requestId });
};

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02

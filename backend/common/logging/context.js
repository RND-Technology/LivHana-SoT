export const withRequestContext = (logger, requestId) => {
  if (!logger || !requestId) {
    return logger;
  }

  return logger.child({ requestId });
};

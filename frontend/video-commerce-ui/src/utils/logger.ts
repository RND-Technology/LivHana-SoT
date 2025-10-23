// Simple logger utility that respects NODE_ENV
// Prevents console warnings in production

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = {
  error: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.error(...args);
    }
  },
  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  log: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
};


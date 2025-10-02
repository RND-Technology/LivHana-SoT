// Mock for ../../common/logging module

const createLogger = jest.fn(() => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
  fatal: jest.fn()
}));

module.exports = {
  createLogger
};
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

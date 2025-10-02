// Mock for ../../common/logging

const createLogger = () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn()
});

module.exports = {
  createLogger
};

// tests/setup.js
// Set test environment
process.env.NODE_ENV = 'test';
process.env.LIV_MODE = 'test';

// Global test utilities
global.testUtils = {
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  cleanupProcesses: async () => {
    // Clean up any test processes
    const { exec } = require('child_process');
    return new Promise((resolve) => {
      exec('pkill -f "test.*livhana" || true', () => resolve());
    });
  },

  createTempDir: async () => {
    const { mkdtemp } = require('fs/promises');
    const { join } = require('path');
    const { tmpdir } = require('os');
    return mkdtemp(join(tmpdir(), 'livhana-test-'));
  }
};

// Cleanup after each test
afterEach(async () => {
  await global.testUtils.cleanupProcesses();
});
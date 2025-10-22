/**
 * Unified Jest Configuration
 * ONE TEST CONFIG FOR ALL SERVICES - TIER-1 ONLY
 *
 * Usage:
 *   npm test                          # Run all tests
 *   npm test -- --testPathPattern=integration  # Run specific tests
 *   npm test -- --coverage            # Generate coverage report
 */

export default {
  // Use projects for multi-service testing (Tier-1 only)
  projects: [
    // Backend Services (Tier-1)
    {
      displayName: 'integration-service',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/backend/integration-service/tests/**/*.test.js'],
      collectCoverageFrom: [
        'backend/integration-service/src/**/*.js',
        '!backend/integration-service/src/index.js',
        '!**/node_modules/**',
      ],
      coverageDirectory: 'coverage/integration-service',
      moduleNameMapper: {
        '^../../common/logging$': '<rootDir>/backend/common/logging.js',
      },
    },
    {
      displayName: 'voice-service',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/backend/voice-service/tests/**/*.test.js'],
      collectCoverageFrom: [
        'backend/voice-service/src/**/*.js',
        '!backend/voice-service/src/index.js',
      ],
      coverageDirectory: 'coverage/voice-service',
    },
    {
      displayName: 'reasoning-gateway',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/backend/reasoning-gateway/tests/**/*.test.js'],
      collectCoverageFrom: [
        'backend/reasoning-gateway/src/**/*.js',
        '!backend/reasoning-gateway/src/index.js',
      ],
      coverageDirectory: 'coverage/reasoning-gateway',
    },
    {
      displayName: 'product-service',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/backend/product-service/tests/**/*.test.js'],
      collectCoverageFrom: [
        'backend/product-service/src/**/*.js',
        '!backend/product-service/src/index.js',
      ],
      coverageDirectory: 'coverage/product-service',
    },

    // Frontend (Tier-1)
    {
      displayName: 'vibe-cockpit',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/frontend/vibe-cockpit/src/**/*.{test,spec}.{js,jsx}'],
      collectCoverageFrom: [
        'frontend/vibe-cockpit/src/**/*.{js,jsx}',
        '!frontend/vibe-cockpit/src/main.jsx',
        '!frontend/vibe-cockpit/src/**/*.stories.{js,jsx}',
      ],
      coverageDirectory: 'coverage/vibe-cockpit',
      setupFilesAfterEnv: ['<rootDir>/frontend/vibe-cockpit/tests/setup.js'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
      },
    },
  ],

  // Global settings
  verbose: true,
  testTimeout: 10000,
  maxWorkers: '50%',

  // Coverage settings
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  // Global setup/teardown
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/.next/',
    '/coverage/',
    '/legacy/',
    '/.cursor-backups/',
    '/empire/',
    '/1.rnd/',
    '/backups/',
    '/deployment/',
  ],

  // Module path aliases
  moduleDirectories: ['node_modules', 'backend', 'frontend'],

  // Transform settings (for ES modules)
  transform: {},
};

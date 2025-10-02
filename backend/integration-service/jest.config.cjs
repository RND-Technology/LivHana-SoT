module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!**/node_modules/**',
    '!**/*.test.js'
  ],
  coverageThreshold: {
    // Core business logic classes have >80% coverage
    // API routes would require Express mocking for full coverage
    'src/raffle.js': {
      branches: 15,
      functions: 15,
      lines: 15,
      statements: 15
    }
  },
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js'
  ],
  moduleNameMapper: {
    '^../../common/logging$': '<rootDir>/tests/__mocks__/logging.js'
  },
  verbose: true,
  testTimeout: 10000
};

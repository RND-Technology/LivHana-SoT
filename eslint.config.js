import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: [
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.spec.js',
      '**/*.spec.ts',
      '**/tests/**',
      '**/test/**',
      '**/__tests__/**',
      'automation/tests/**',
      'dist/',
      'build/',
      '*.min.js',
      'node_modules/',
      'scripts/**',
      'tools/**',
      'docs/**',
      '*.md',
      '**/*.mock.js',
      '**/mocks/**',
      'age-verification-smart-gate.js',
      'age-verification-smart-gate-fixed.js',
      'watch-cheetah.js',
      'archived/**'
    ]
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'warn',
      'no-unused-vars': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'warn',
      'no-extra-semi': 'error',
      'no-func-assign': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-obj-calls': 'error',
      'no-sparse-arrays': 'error',
      'no-unexpected-multiline': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error'
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    files: ['**/*.test.*', 'tests/**'],
    rules: {
      'max-lines-per-function': 'off',
      complexity: 'off',
      'no-console': 'off'
    }
  },
  {
    files: ['jest.config.js', 'jest.config.unified.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script'
    }
  }
];

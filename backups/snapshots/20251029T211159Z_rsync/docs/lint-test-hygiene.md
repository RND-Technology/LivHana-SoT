# Lint & Test Hygiene for Liv Hana

## Overview

This document describes the linting and testing standards for Liv Hana Tier-1 services.

## ESLint Configuration

### Tier-1 Scope
Only lint Tier-1 services:
- `backend/voice-service`
- `backend/reasoning-gateway`
- `backend/integration-service`
- `backend/product-service`
- `frontend/vibe-cockpit`

### Excluded Paths
Frozen directories (not linted):
- `1.rnd/**`
- `empire/**`
- `deployment/**`
- `backups/**`
- `legacy/**`
- `logs/**`
- `**/venv/**`
- `**/node_modules/**`

### Rules
- TypeScript: `plugin:@typescript-eslint/recommended`
- Test files: Relaxed rules (no max-lines-per-function)
- Coverage: 50% minimum threshold

## Jest Configuration

### Projects
Only test Tier-1 services:
- `integration-service`
- `voice-service`
- `reasoning-gateway`
- `product-service`
- `vibe-cockpit`

### Setup Files
- `tests/globalSetup.js`: Global test setup
- `tests/globalTeardown.js`: Global test teardown
- `frontend/vibe-cockpit/tests/setup.js`: Frontend test setup

### Smoke Tests
Each Tier-1 service must have a smoke test:
```
backend/<service>/tests/smoke/health.test.js
```

Smoke test checks:
- Service health endpoint returns 200
- Response includes expected fields
- Service is operational

## Running Tests

### All Tests
```bash
npm test
```

### Specific Service
```bash
npm test -- integration-service
```

### Coverage
```bash
npm test -- --coverage
```

### Linting
```bash
npm run lint
```

## Acceptance Criteria

### Lint
- Zero config errors
- Tier-1 violations < 300
- All violations are high-signal
- No references to frozen paths

### Tests
- Jest runs without config errors
- Tier-1 smoke tests pass
- No missing setup errors
- Coverage > 50%

### Build
- `tsc --build` completes
- No TypeScript errors
- All imports resolve

### Docker
- Services start successfully
- Health endpoints return healthy
- No container errors

## Monitoring

### Lint Violations
Track via `.eslintcache` and lint reports

### Test Failures
Monitor via Jest output and coverage reports

### Service Health
Check via `/health` endpoints

## Troubleshooting

### ESLint Config Errors
1. Check `.eslintrc.json` syntax
2. Verify parser plugins installed
3. Check file extensions match

### Jest Config Errors
1. Verify project paths exist
2. Check `globalSetup`/`globalTeardown` exist
3. Review test match patterns

### Test Failures
1. Check service dependencies
2. Verify test data exists
3. Review error messages

### Build Errors
1. Check TypeScript config
2. Verify imports are correct
3. Review compilation errors

## Best Practices

1. **Write Tests First**: TDD approach
2. **Keep Tests Simple**: One assertion per test
3. **Mock External Services**: Don't call real APIs
4. **Clean Up**: Remove test data after tests
5. **Document**: Comment complex test logic

## Continuous Integration

### Pre-commit Hook
```bash
npm run lint && npm test
```

### Pull Request Checks
- Lint must pass
- Tests must pass
- Coverage must meet threshold
- Build must succeed

## Resources

- ESLint: https://eslint.org/docs/latest/
- Jest: https://jestjs.io/docs/getting-started
- TypeScript: https://www.typescriptlang.org/docs/


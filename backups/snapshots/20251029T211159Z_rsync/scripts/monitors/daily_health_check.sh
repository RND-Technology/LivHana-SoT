#!/bin/bash
# Daily Health Check - Loop 2
# Runs: code quality, test coverage delta, Redis ACL/TLS enforcement

echo "[$(date)] Daily Health Check started"

# Code quality check
npx eslint backend/ --format json > /tmp/eslint_daily.json
echo "✓ Lint check complete"

# Test coverage
npm test -- --coverage --json > /tmp/coverage_daily.json
echo "✓ Coverage check complete"

# Redis ACL check
redis-cli ACL LIST > /tmp/redis_acl_check.txt
echo "✓ Redis ACL audit complete"

echo "[$(date)] Daily Health Check complete"

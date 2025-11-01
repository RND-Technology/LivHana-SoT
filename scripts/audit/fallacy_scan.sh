#!/bin/bash
# Fallacy scan - checks for disputed claims or inconsistencies
# Part of EA_PRECISION audit infrastructure
set -euo pipefail

echo "=== Fallacy Scan ==="
echo "Date: $(date)"
echo ""

SCAN_DIR="fallacy-scan-$(date +%Y%m%d)"
mkdir -p "$SCAN_DIR"

echo "1. Scanning for TODO/FIXME markers..."
grep -r "TODO\|FIXME\|XXX\|HACK" backend/ frontend/ --include="*.js" --include="*.ts" 2>/dev/null > "$SCAN_DIR/todo-markers.txt" || echo "No markers found"

echo "2. Scanning for console.log statements..."
grep -r "console\.log\|console\.error" backend/ --include="*.js" 2>/dev/null > "$SCAN_DIR/console-logs.txt" || echo "No console logs found"

echo "3. Scanning for hardcoded secrets..."
grep -r "api[_-]key\|password\|secret" backend/ frontend/ --include="*.js" --include="*.json" | grep -v "env\|example\|README" 2>/dev/null > "$SCAN_DIR/potential-secrets.txt" || echo "No hardcoded secrets found"

echo "4. Scanning for disabled tests..."
grep -r "\.skip\|\.only\|xdescribe\|xit" backend/ frontend/ --include="*.js" --include="*.test.js" 2>/dev/null > "$SCAN_DIR/disabled-tests.txt" || echo "No disabled tests found"

echo "5. Checking for missing error handling..."
grep -r "async.*{" backend/ --include="*.js" -A 5 | grep -v "try\|catch" 2>/dev/null > "$SCAN_DIR/missing-error-handling.txt" || echo "Error handling looks good"

echo ""
echo "✅ Fallacy scan complete. Results in: $SCAN_DIR/"
ls -lh "$SCAN_DIR/"

# Count issues
ISSUE_COUNT=$(cat "$SCAN_DIR"/*.txt | wc -l)
echo ""
echo "Total potential issues found: $ISSUE_COUNT"

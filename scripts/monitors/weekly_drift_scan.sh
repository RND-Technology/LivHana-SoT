#!/bin/bash
# Weekly Drift Scan - Loop 3
# Scans: service boundaries, queue naming, compliance rules, docs freshness

echo "[$(date)] Weekly Drift Scan started"

# Check service boundaries
echo "Checking service boundaries..."
find backend/ -name "package.json" -exec dirname {} \; | sort

# Check queue naming conventions
echo "Auditing queue naming..."
grep -rn "createHardenedQueue\|createQueue" backend/ --include="*.js" | \
  grep -o "QUEUE_NAME[^'\"]*['\"][^'\"]*" || echo "No queue names found"

# Check compliance rule updates
echo "Checking compliance service..."
ls -lh backend/compliance-service/src/adapters/ 2>/dev/null || echo "Compliance adapters not found"

# Check docs freshness
echo "Checking documentation timestamps..."
find docs/ -name "*.md" -mtime +30 2>/dev/null | \
  sed 's/^/  STALE: /' || echo "All docs up-to-date"

echo "[$(date)] Weekly Drift Scan complete"

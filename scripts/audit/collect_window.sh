#!/bin/bash
# Collect artifacts from Oct 21 window
# Part of EA_PRECISION audit infrastructure
set -euo pipefail

echo "=== Artifact Collection: Oct 21 Window ==="
echo "Date: $(date)"
echo ""

ARTIFACT_DIR="audit-artifacts-$(date +%Y%m%d)"
mkdir -p "$ARTIFACT_DIR"

echo "1. Collecting Git History..."
git log --since="2025-10-21" --until="2025-10-22" --pretty=format:"%h - %an, %ar : %s" > "$ARTIFACT_DIR/git-history-oct21.txt" 2>/dev/null || echo "No commits in window"

echo "2. Collecting Voice Service Files..."
if [ -d "backend/voice-service" ]; then
    find backend/voice-service -type f \( -name "*.js" -o -name "*.json" \) > "$ARTIFACT_DIR/voice-service-files.txt"
fi

echo "3. Collecting Reasoning Gateway Files..."
if [ -d "backend/reasoning-gateway" ]; then
    find backend/reasoning-gateway -type f \( -name "*.js" -o -name "*.json" \) > "$ARTIFACT_DIR/reasoning-gateway-files.txt"
fi

echo "4. Collecting Documentation..."
find docs -type f -name "*.md" 2>/dev/null | grep -i "voice\|audit" > "$ARTIFACT_DIR/voice-docs.txt" 2>/dev/null || echo "No voice docs found"

echo "5. Collecting Test Results..."
if [ -f "test-results.json" ]; then
    cp test-results.json "$ARTIFACT_DIR/"
fi

echo ""
echo "✅ Artifacts collected in: $ARTIFACT_DIR/"
ls -lh "$ARTIFACT_DIR/" 2>/dev/null || echo "Directory created but empty"

#!/bin/bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1
set -euo pipefail


# Bundle Optimization Verification Script
# Location: /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/frontend/vibe-cockpit

echo "=================================="
echo "BUNDLE OPTIMIZATION VERIFICATION"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Build the project
echo "Building project..."

if ! npm run build > /dev/null 2>&1; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Calculate initial bundle size
echo "Calculating bundle sizes..."
echo ""

# Get file sizes
INDEX_SIZE=$(stat -f%z "dist/assets/index-"*.js 2>/dev/null | head -1)
ULTIMATE_SIZE=$(stat -f%z "dist/assets/UltimateCockpit-"*.js 2>/dev/null | head -1)
VENDOR_REACT_SIZE=$(stat -f%z "dist/assets/vendor-react-"*.js 2>/dev/null | head -1)
VENDOR_MUI_SIZE=$(stat -f%z "dist/assets/vendor-mui-core-"*.js 2>/dev/null | head -1)

# Calculate totals
TOTAL_BYTES=$((INDEX_SIZE + ULTIMATE_SIZE + VENDOR_REACT_SIZE + VENDOR_MUI_SIZE))
TOTAL_KB=$((TOTAL_BYTES / 1024))
TOTAL_MB=$(echo "scale=2; $TOTAL_BYTES / 1024 / 1024" | bc)

echo "Initial Bundle Breakdown:"
echo "  index.js:        $(echo "scale=2; $INDEX_SIZE / 1024" | bc) KB"
echo "  UltimateCockpit: $(echo "scale=2; $ULTIMATE_SIZE / 1024" | bc) KB"
echo "  vendor-react:    $(echo "scale=2; $VENDOR_REACT_SIZE / 1024" | bc) KB"
echo "  vendor-mui-core: $(echo "scale=2; $VENDOR_MUI_SIZE / 1024" | bc) KB"
echo "  --------------------------------"
echo "  TOTAL:           ${TOTAL_KB} KB (${TOTAL_MB} MB)"
echo ""

# Check if under 1MB
TARGET_BYTES=1048576  # 1MB in bytes

if [ $TOTAL_BYTES -lt $TARGET_BYTES ]; then
    echo -e "${GREEN}✅ PASS: Initial bundle < 1MB (${TOTAL_MB} MB)${NC}"
else
    echo -e "${RED}❌ FAIL: Initial bundle > 1MB (${TOTAL_MB} MB)${NC}"
fi

# Check for stats.html
if [ -f "dist/stats.html" ]; then
    echo -e "${GREEN}✅ PASS: Bundle analyzer report generated${NC}"
else
    echo -e "${RED}❌ FAIL: Bundle analyzer report missing${NC}"
fi

# Count chunks
mapfile -t JS_CHUNKS < <(find dist/assets -maxdepth 1 -type f -name '*.js' -print 2>/dev/null)
CHUNK_COUNT=${#JS_CHUNKS[@]}
if [ "$CHUNK_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ PASS: ${CHUNK_COUNT} chunks created (code splitting working)${NC}"
else
    echo -e "${RED}❌ FAIL: No JavaScript chunks detected in dist/assets${NC}"
fi

# Check for large chunks
echo ""
echo "Large Chunks (> 100KB):"
for file in "${JS_CHUNKS[@]}"; do
    size=$(stat -f%z "$file" 2>/dev/null || echo 0)
    if [ "$size" -gt 102400 ]; then
        name=$(basename "$file")
        kb=$(echo "scale=2; $size / 1024" | bc)
        echo "  - $name: ${kb} KB"
    fi
done

echo ""
echo "=================================="
echo "VERIFICATION COMPLETE"
echo "=================================="
echo ""
echo "To view bundle analysis:"
echo "  open dist/stats.html"
echo ""
echo "To start dev server:"
echo "  npm run dev"
echo ""
echo "To preview production build:"
echo "  npm run preview"
echo ""

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

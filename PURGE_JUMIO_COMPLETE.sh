#!/usr/bin/env bash
# 🔥 PURGE JUMIO HALLUCINATION - Tier-1 Precision Strike
# Replace all Jumio references with Veriff (the actual system)

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${RED}  🔥 PURGING JUMIO HALLUCINATION${NC}"
echo -e "${BOLD}${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
cd "$ROOT"

# Find all files with Jumio (excluding this script and .git)
echo -e "${CYAN}🎯 Scanning for Jumio hallucinations...${NC}"
JUMIO_FILES=$(grep -rl "Jumio\|jumio\|JUMIO" . \
  --include="*.md" \
  --include="*.js" \
  --include="*.py" \
  --include="*.sh" \
  --include="*.json" \
  --exclude="PURGE_JUMIO_COMPLETE.sh" \
  --exclude-dir=".git" \
  --exclude-dir="node_modules" \
  --exclude-dir="legacy" \
  2>/dev/null || true)

FILE_COUNT=$(echo "$JUMIO_FILES" | grep -c . || echo "0")
echo -e "${YELLOW}⚠️  Found $FILE_COUNT files with Jumio references${NC}"
echo

if [ "$FILE_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✅ No Jumio references found - already clean!${NC}"
  exit 0
fi

# Show sample of files
echo -e "${CYAN}📄 Sample files to be cleaned:${NC}"
echo "$JUMIO_FILES" | head -10
echo
read -p "Press Enter to execute purge (Ctrl+C to abort)..." -t 10 || true
echo

# Execute purge with case-insensitive replacement
CLEANED=0
while IFS= read -r file; do
  if [ -f "$file" ]; then
    # Replace all variants: Jumio → Veriff, jumio → veriff, JUMIO → VERIFF
    # Keep biometric IDV context when appropriate
    sed -i.purge_bak \
      -e 's/Jumio biometric IDV/Veriff biometric ID verification/g' \
      -e 's/Jumio IDV/Veriff ID verification/g' \
      -e 's/Jumio/Veriff/g' \
      -e 's/jumio/veriff/g' \
      -e 's/JUMIO/VERIFF/g' \
      "$file"
    
    # Check if file actually changed
    if ! cmp -s "$file" "$file.purge_bak"; then
      echo -e "${GREEN}✅ Cleaned: $file${NC}"
      rm "$file.purge_bak"
      ((CLEANED++))
    else
      rm "$file.purge_bak"
    fi
  fi
done <<< "$JUMIO_FILES"

echo
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}  ✅ PURGE COMPLETE${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo
echo -e "${CYAN}📊 Stats:${NC}"
echo -e "  • Files scanned: $FILE_COUNT"
echo -e "  • Files cleaned: $CLEANED"
echo -e "  • Jumio → Veriff replacements complete"
echo
echo -e "${YELLOW}🎯 Next steps:${NC}"
echo -e "  1. Review changes: git diff"
echo -e "  2. Verify accuracy: grep -ri jumio ."
echo -e "  3. Commit: git add -A && git commit -m 'fix: PURGE Jumio hallucination - use Veriff standard'"
echo
echo -e "${BOLD}${GREEN}🏆 TIER-1 PURGE EXECUTED${NC}"
echo -e "${BOLD}${GREEN}🇺🇸 SEMPER FI${NC}"
echo


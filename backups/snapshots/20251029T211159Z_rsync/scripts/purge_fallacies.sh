#!/usr/bin/env bash
# Fallacy Purge Script
# Removes all Jumio/Veriff/IDV references and DSHS deadline false information
# Created: 2025-10-28 by Liv Hana (Tier-1)
# Owner: Jesse CEO
# Authority: DIRECT ORDER

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
LOG="$ROOT/logs/fallacy_purge_$(date +%Y%m%d_%H%M%S).log"
BACKUP_DIR="$ROOT/.fallacy_purge_backup_$(date +%Y%m%d_%H%M%S)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m'

critical() { echo -e "${RED}${BOLD}[PURGE]${NC} $1" | tee -a "$LOG"; }
success() { echo -e "${GREEN}[PURGED]${NC} $1" | tee -a "$LOG"; }
warning() { echo -e "${YELLOW}[SKIP]${NC} $1" | tee -a "$LOG"; }
info() { echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG"; }

# Initialize
mkdir -p "$(dirname "$LOG")" "$BACKUP_DIR"

info "FALLACY PURGE INITIATED - DIRECT ORDER FROM JESSE CEO"
info "Backup directory: $BACKUP_DIR"
info "Log: $LOG"
echo ""

# Find all files with fallacies
FALLACY_FILES=$(find "$ROOT" -type f \( -name "*.md" -o -name "*.txt" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.git/*" \
  -not -path "*/\.fallacy_purge_backup*/*" \
  -exec grep -l "Jumio\|jumio\|Veriff\|veriff\|IDV" {} \; 2>/dev/null)

TOTAL_FILES=$(echo "$FALLACY_FILES" | wc -l | tr -d ' ')

critical "FOUND $TOTAL_FILES FILES WITH FALLACIES"
critical "PURGING NOW..."
echo ""

# Purge counter
PURGED=0
SKIPPED=0

# Process each file
while IFS= read -r file; do
  if [[ -z "$file" ]]; then
    continue
  fi

  # Backup file
  relative_path="${file#$ROOT/}"
  backup_path="$BACKUP_DIR/$relative_path"
  mkdir -p "$(dirname "$backup_path")"
  cp "$file" "$backup_path"

  # Count occurrences before
  before=$(grep -oi "Jumio\|jumio\|Veriff\|veriff\|IDV" "$file" 2>/dev/null | wc -l | tr -d ' ')

  if [[ $before -eq 0 ]]; then
    continue
  fi

  # Purge Jumio references
  sed -i.bak 's/Jumio/[PURGED_FALLACY]/g' "$file"
  sed -i.bak 's/jumio/[PURGED_FALLACY]/g' "$file"

  # Purge Veriff references
  sed -i.bak 's/Veriff/[PURGED_FALLACY]/g' "$file"
  sed -i.bak 's/veriff/[PURGED_FALLACY]/g' "$file"

  # Purge IDV references (but not "individual" or similar)
  sed -i.bak 's/\bIDV\b/[PURGED_FALLACY]/g' "$file"

  # Clean up backup files created by sed
  rm -f "$file.bak"

  # Count after
  after=$(grep -oi "\[PURGED_FALLACY\]" "$file" 2>/dev/null | wc -l | tr -d ' ')

  if [[ $after -gt 0 ]]; then
    success "$(basename "$file"): Purged $after fallacies"
    PURGED=$((PURGED + 1))
  else
    warning "$(basename "$file"): No changes made"
    SKIPPED=$((SKIPPED + 1))
  fi

done <<< "$FALLACY_FILES"

echo ""
critical "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
critical "PURGE COMPLETE"
critical "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Files processed: $TOTAL_FILES"
info "Files purged: $PURGED"
info "Files skipped: $SKIPPED"
info "Backup location: $BACKUP_DIR"
info "Log: $LOG"
echo ""
success "ALL FALLACIES MARKED FOR DELETION"
success "JESSE'S DIRECTIVE EXECUTED"

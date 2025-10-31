#!/usr/bin/env bash
# scripts/clear-artifacts.sh
# Clears stale artifacts (tmp/raw/out) to reduce disk and memory footprint.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_DIRS=("tmp" "out" "raw")
AGE_MINUTES="${AGE_MINUTES:-60}"
DRY_RUN="${DRY_RUN:-false}"
LOG_FILE="${LOG_FILE:-$ROOT/logs/cleanup-artifacts.log}"

IFS=' ' read -r -a ADDITIONAL_DIRS <<< "${EXTRA_DIRS:-}"
TARGET_DIRS=("${DEFAULT_DIRS[@]}" "${ADDITIONAL_DIRS[@]}")

mkdir -p "$(dirname "$LOG_FILE")"

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG_FILE"
}

cleanup_dir() {
  local rel_path="$1"
  local abs_path="$ROOT/$rel_path"
  local deleted=0

  if [[ ! -d "$abs_path" ]]; then
    log "Skipping $rel_path (missing)"
    return
  fi

  log "Scanning $rel_path for files older than ${AGE_MINUTES}m"
  mapfile -t candidates < <(find "$abs_path" -type f -mmin "+$AGE_MINUTES" 2>/dev/null || true)
  if [[ ${#candidates[@]} -eq 0 ]]; then
    log "No stale artifacts in $rel_path"
    return
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    log "DRY-RUN: Would delete ${#candidates[@]} file(s) in $rel_path"
    printf '%s\n' "${candidates[@]}" >> "$LOG_FILE"
    return
  fi

  local bytes_before bytes_after freed
  bytes_before=$(du -sk "$abs_path" 2>/dev/null | awk '{print $1}' || echo 0)

  for file in "${candidates[@]}"; do
    rm -f "$file" && ((deleted++)) || true
  done

  find "$abs_path" -type d -empty -delete 2>/dev/null || true
  bytes_after=$(du -sk "$abs_path" 2>/dev/null | awk '{print $1}' || echo 0)
  freed=$((bytes_before - bytes_after))
  ((freed < 0)) && freed=0

  log "Deleted $deleted file(s) from $rel_path | freed ~${freed} KB"
}

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🧹 Artifact cleanup starting (threshold: ${AGE_MINUTES}m, dry-run=${DRY_RUN})"

for dir in "${TARGET_DIRS[@]}"; do
  [[ -z "$dir" ]] && continue
  cleanup_dir "$dir"
done

log "✅ Artifact cleanup complete"

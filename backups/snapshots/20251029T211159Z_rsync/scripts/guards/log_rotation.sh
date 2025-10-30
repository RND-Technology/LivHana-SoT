#!/usr/bin/env bash
# Log Rotation - Truncate large logs to prevent runaway growth
# Fixes: Log files growing unbounded

set -euo pipefail

rotate_log() {
  local log_file="$1"
  local max_size_mb="${2:-10}"
  local max_size_bytes=$((max_size_mb * 1024 * 1024))
  
  if [[ ! -f "$log_file" ]]; then
    return 0
  fi
  
  local size=$(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null || echo 0)
  
  if [[ $size -gt $max_size_bytes ]]; then
    # Keep last 5MB of logs
    local keep_bytes=$((5 * 1024 * 1024))
    tail -c "$keep_bytes" "$log_file" > "${log_file}.tmp"
    mv "${log_file}.tmp" "$log_file"
    
    # Ensure proper permissions
    chmod 600 "$log_file" 2>/dev/null || true
    
    echo "[LOG_ROTATE] Truncated $log_file from $size bytes"
  fi
}

if [[ "${BASH_SOURCE[0]:-$0}" == "$0" ]]; then
  for log_file in "$@"; do
    rotate_log "$log_file"
  done
fi


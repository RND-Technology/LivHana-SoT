#!/usr/bin/env bash
# scripts/pre-boot-health-check.sh
# Runs fast readiness checks before Tier-1 boot.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIN_DISK_MB="${MIN_DISK_MB:-10240}"
MIN_MEMORY_PCT="${MIN_MEMORY_PCT:-20}"
CRITICAL_PORTS=("${CRITICAL_PORTS[@]:-3005 2022 8880}")

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

calc_free_memory_pct() {
  if command -v memory_pressure >/dev/null 2>&1; then
    memory_pressure 2>/dev/null | awk -F': ' '/System-wide memory free percentage/ {gsub("%","",$2); print int($2)}' || echo 0
    return
  fi
  if ! command -v vm_stat >/dev/null 2>&1; then
    echo 0
    return
  fi
  python3 - <<'PY' 2>/dev/null || printf '0\n'
import subprocess

try:
    output = subprocess.check_output(["vm_stat"], text=True)
except Exception:
    print(0)
    raise SystemExit

values = {}
for line in output.splitlines():
    if ":" not in line:
        continue
    key, value = line.split(":", 1)
    key = key.strip().replace(" ", "_")
    try:
        values[key] = int(float(value.strip().strip(".")))
    except ValueError:
        continue

total = sum(v for k, v in values.items() if k.startswith("Pages"))
free = values.get("Pages_free", 0) + values.get("Pages_inactive", 0) + values.get("Pages_speculative", 0)
print(int(free * 100 / total) if total else 0)
PY
}

disk_ok() {
  local free_mb
  free_mb="$(df -m "$ROOT" | awk 'NR==2 {print $4}' 2>/dev/null || echo 0)"
  if [[ "$free_mb" -lt "$MIN_DISK_MB" ]]; then
    log "❌ Workspace disk low: ${free_mb}MB (min ${MIN_DISK_MB}MB)"
    return 1
  fi
  log "✅ Workspace disk sufficient: ${free_mb}MB"
}

memory_ok() {
  local pct
  pct="$(calc_free_memory_pct)"
  if [[ "$pct" -lt "$MIN_MEMORY_PCT" ]]; then
    log "❌ Memory pressure high: ${pct}% free (min ${MIN_MEMORY_PCT}%)"
    return 1
  fi
  log "✅ Memory headroom: ${pct}% free"
}

ports_ok() {
  local port busy status=0
  for port in "${CRITICAL_PORTS[@]}"; do
    busy=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null | tr '\n' ' ')
    if [[ -n "$busy" ]]; then
      log "❌ Port $port in use by PID(s): $busy"
      status=1
    else
      log "✅ Port $port free"
    fi
  done
  return "$status"
}

quarantine_ok() {
  local attr
  attr=$(xattr -p com.apple.quarantine "/Applications/Visual Studio Code.app" 2>/dev/null || true)
  if [[ -n "$attr" ]]; then
    log "❌ VS Code quarantine flag set"
    return 1
  fi
  log "✅ VS Code quarantine cleared"
}

translocation_ok() {
  if pgrep -fl "AppTranslocation/.*/Visual Studio Code" >/dev/null 2>&1; then
    log "⚠️  VS Code still running from AppTranslocation (restart recommended)"
    return 1
  fi
  log "✅ No AppTranslocation VS Code processes detected"
  return 0
}

main() {
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "🔍 Pre-boot health check"

  local failures=0
  disk_ok || ((failures++))
  memory_ok || ((failures++))
  ports_ok || ((failures++))
  quarantine_ok || ((failures++))
  translocation_ok || true   # treat as warning

  if (( failures > 0 )); then
    log "❌ Pre-boot health check FAILED ($failures issue(s))"
    exit 1
  fi

  log "✅ Pre-boot health check passed"
}

main "$@"

#!/usr/bin/env bash
# scripts/system-health-monitor.sh
# Lightweight JSONL health telemetry (CPU, memory, disk, crash events).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_PATH="${LOG_PATH:-$ROOT/logs/system-health.jsonl}"
INTERVAL="${INTERVAL:-60}"
MODE="${1:---daemon}"

mkdir -p "$(dirname "$LOG_PATH")"
touch "$LOG_PATH"

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

sample_cpu() {
  if ! command -v top >/dev/null 2>&1; then
    echo ""
    return
  fi
  top -l 1 2>/dev/null | grep -m1 "CPU usage" | sed 's/^[[:space:]]*//' || true
}

sample_memory_free_pct() {
  if command -v memory_pressure >/dev/null 2>&1; then
    memory_pressure 2>/dev/null | awk -F': ' '/System-wide memory free percentage/ {gsub("%","",$2); print int($2)}' || true
    return
  fi
  if ! command -v vm_stat >/dev/null 2>&1; then
    echo ""
    return
  fi
  python3 - "$@" 2>/dev/null <<'PY' || true
import subprocess, re, sys

try:
    raw = subprocess.check_output(["vm_stat"], text=True)
except Exception:
    sys.exit(0)

pages = {}
pattern = re.compile(r"^(.*?):\s+([\d\.]+)")
for line in raw.splitlines():
    m = pattern.match(line)
    if not m:
        continue
    key = m.group(1).strip().lower().replace(" ", "_")
    value = int(float(m.group(2)))
    pages[key] = value

total = sum(v for k, v in pages.items() if k.startswith("pages"))
free = pages.get("pages_free", 0) + pages.get("pages_inactive", 0) + pages.get("pages_speculative", 0)
if total:
    print(int(free * 100 / total))
PY
}

sample_disk_io() {
  if ! command -v iostat >/dev/null 2>&1; then
    echo ""
    return
  fi
  local output
  if ! output=$(iostat -d 1 2 2>/dev/null | tail -n +2 | tail -n 1); then
    echo ""
    return
  fi
  echo "$output" | awk '{print sprintf("{\"device\":\"%s\",\"tps\":%s,\"mbRead\":%s,\"mbWritten\":%s}", $1, $2, $3, $4)}'
}

sample_disk_free_mb() {
  df -m "$ROOT" 2>/dev/null | awk 'NR==2 {print $4}' || true
}

sample_crashes() {
  if ! command -v log >/dev/null 2>&1; then
    echo ""
    return
  fi
  log show --style syslog --predicate 'eventMessage CONTAINS "crash"' --last 1m 2>/dev/null | wc -l | tr -d ' ' || true
}

capture_snapshot() {
  local ts cpu mem_pct disk_io disk_free crashes health_json
  ts="$(timestamp)"
  cpu="$(sample_cpu)"
  mem_pct="$(sample_memory_free_pct)"
  disk_io="$(sample_disk_io)"
  disk_free="$(sample_disk_free_mb)"
  crashes="$(sample_crashes)"
  health_json=""
  if [[ -x "$ROOT/scripts/calculate-health-score.sh" ]]; then
    health_json=$("$ROOT/scripts/calculate-health-score.sh" --json 2>/dev/null || echo "")
  fi

  CPU_SUMMARY="$cpu" \
  MEM_FREE_PCT="${mem_pct:-}" \
  DISK_IO_JSON="${disk_io:-}" \
  DISK_FREE_MB="${disk_free:-}" \
  CRASH_COUNT="${crashes:-}" \
  TIMESTAMP="$ts" \
  HEALTH_SCORE_JSON="$health_json" \
  python3 - "$LOG_PATH" <<'PY'
import json, os, sys

log_path = sys.argv[1]
health = os.environ.get("HEALTH_SCORE_JSON")
health_data = None
if health:
    try:
        health_data = json.loads(health)
    except json.JSONDecodeError:
        health_data = None
payload = {
    "timestamp": os.environ.get("TIMESTAMP"),
    "cpuSummary": os.environ.get("CPU_SUMMARY") or None,
    "memoryFreePercent": int(os.environ["MEM_FREE_PCT"]) if os.environ.get("MEM_FREE_PCT") else None,
    "workspaceFreeMB": int(os.environ["DISK_FREE_MB"]) if os.environ.get("DISK_FREE_MB") else None,
    "diskIo": json.loads(os.environ["DISK_IO_JSON"]) if os.environ.get("DISK_IO_JSON") else None,
    "crashEventsLastMinute": int(os.environ["CRASH_COUNT"]) if os.environ.get("CRASH_COUNT") else None,
    "healthScore": health_data
}
with open(log_path, "a", encoding="utf-8") as stream:
    stream.write(json.dumps(payload, separators=(",", ":"), ensure_ascii=True) + "\n")
PY
}

run_once() {
  capture_snapshot
}

run_daemon() {
  while true; do
    capture_snapshot
    sleep "$INTERVAL"
  done
}

case "$MODE" in
  --once)
    run_once
    ;;
  --daemon)
    run_daemon
    ;;
  *)
    echo "Usage: $0 [--daemon|--once]" >&2
    exit 1
    ;;
esac

#!/usr/bin/env bash
# System Integrity Monitor
# Continuous health telemetry for VS Code + voice-mode environment

set -euo pipefail
shopt -s nullglob

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
OUT_DIR="$ROOT/tmp/agent_status/system_metrics"
LOG_FILE="$ROOT/logs/system_integrity_monitor.log"
METRICS_FILE="$OUT_DIR/metrics.json"
HISTORY_FILE="$OUT_DIR/metrics_history.jsonl"
HISTORY_RETENTION="${SYSTEM_MONITOR_RETENTION:-240}"   # number of snapshots kept in history
INTERVAL="${SYSTEM_MONITOR_INTERVAL:-60}"               # seconds between samples
MODE="${1:---daemon}"

mkdir -p "$OUT_DIR" "$(dirname "$LOG_FILE")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 is required for system_integrity_monitor.sh" >&2
  exit 1
fi

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_msg() {
  local level="$1"; shift
  local color prefix
  case "$level" in
    info) color="$BLUE"; prefix="ℹ️";;
    success) color="$GREEN"; prefix="✅";;
    warn) color="$YELLOW"; prefix="⚠️";;
    error) color="$RED"; prefix="❌";;
    *) color="$NC"; prefix="";;
  esac
  local timestamp
  timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
  printf "%b[%s]%b %s %s\n" "$color" "$timestamp" "$NC" "$prefix" "$*" | tee -a "$LOG_FILE" >/dev/null
}

json_array_from_lines() {
  python3 2>/dev/null <<'PY'
import json, sys
lines = [line.strip() for line in sys.stdin if line.strip()]
print(json.dumps(lines))
PY
}

gather_snapshot() {
  local timestamp cpu_summary mem_summary top_output queue_depth load_avg crash_latest crash_name
  local root_free_mb workspace_free_mb free_pct mem_status process_hot_file last_crash_file
  local alerts=()

  timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  if command -v top >/dev/null 2>&1; then
    if top_output="$(top -l 1 -stats pid,cpu,mem,command 2>/dev/null)"; then
      printf '%s\n' "$top_output" | head -n 40 > "$OUT_DIR/top_snapshot.txt"
      cpu_summary="$(printf '%s\n' "$top_output" | grep -m1 'CPU usage' || true)"
      mem_summary="$(printf '%s\n' "$top_output" | grep -m1 'PhysMem' || true)"
    else
      log_msg warn "top command returned non-zero status; skipping detailed snapshot"
    fi
  else
    log_msg warn "top command not found; CPU/memory summaries unavailable"
  fi

  process_hot_file="$OUT_DIR/process_hot.txt"
  ps -Ao pid,pcpu,pmem,comm 2>/dev/null | sort -k2 -nr | head -n 25 > "$process_hot_file" || true

  local cpu_hot_json="[]"
  if [[ -s "$process_hot_file" ]]; then
    cpu_hot_json=$(
      PROCESS_HOT_FILE="$process_hot_file" python3 2>/dev/null <<'PY' || echo "[]"
import json, os, pathlib
path = pathlib.Path(os.environ["PROCESS_HOT_FILE"])
rows = []
if path.exists():
    for line in path.read_text().splitlines():
        parts = line.strip().split(None, 3)
        if len(parts) != 4:
            continue
        pid, cpu, mem, cmd = parts
        try:
            rows.append({
                "pid": int(pid),
                "cpuPercent": float(cpu),
                "memoryPercent": float(mem),
                "command": cmd
            })
        except ValueError:
            continue
rows = rows[:15]
print(json.dumps(rows))
PY
    )
    [[ -z "$cpu_hot_json" ]] && cpu_hot_json="[]"
  fi

  load_avg="$(sysctl -n vm.loadavg 2>/dev/null | tr -d '{}' | sed 's/^ *//' || true)"

  queue_depth=-1
  if command -v redis-cli >/dev/null 2>&1; then
    queue_depth="$(redis-cli LLEN bull:voice-mode-reasoning-jobs:wait 2>/dev/null || echo -1)"
  fi

  root_free_mb="$(df -m / | tail -1 | awk '{print $4}')"
  workspace_free_mb="$(df -m "$ROOT" | tail -1 | awk '{print $4}')"

  mem_status=""
  free_pct=""
  if command -v memory_pressure >/dev/null 2>&1; then
    mem_status="$(memory_pressure 2>/dev/null | grep -i 'System-wide memory free percentage' || true)"
    free_pct="$(printf '%s\n' "$mem_status" | grep -oE '[0-9]+' | head -1 || true)"
  fi
  if [[ -z "$free_pct" ]] && command -v vm_stat >/dev/null 2>&1; then
    local pages_free pages_inactive pages_spec pages_total free_total
    pages_free=$(vm_stat | awk '/Pages free/ {gsub("\\.","",$3); print $3}' || echo 0)
    pages_inactive=$(vm_stat | awk '/Pages inactive/ {gsub("\\.","",$3); print $3}' || echo 0)
    pages_spec=$(vm_stat | awk '/Pages speculative/ {gsub("\\.","",$3); print $3}' || echo 0)
    pages_total=$(vm_stat | awk '/Pages/ {gsub("\\.","",$3); sum+=$3} END {print sum}' || echo 0)
    if [[ "$pages_total" -gt 0 ]]; then
      free_total=$(( pages_free + pages_inactive + pages_spec ))
      free_pct=$(( free_total * 100 / pages_total ))
    fi
  fi

  local crash_dir="$HOME/Library/Logs/DiagnosticReports"
  local crash_latest_mtime=0
  crash_latest=""
  crash_name="none"
  if [[ -d "$crash_dir" ]]; then
    local file mtime
    for file in "$crash_dir"/*.crash; do
      [[ -e "$file" ]] || continue
      mtime=$(stat -f %m "$file" 2>/dev/null || echo 0)
      if (( mtime > crash_latest_mtime )); then
        crash_latest_mtime=$mtime
        crash_latest="$file"
      fi
    done
    if [[ -n "$crash_latest" ]]; then
      crash_name="$(basename "$crash_latest")"
    fi
  fi

  last_crash_file="$OUT_DIR/.last_crash"
  if [[ -n "$crash_latest" ]]; then
    if [[ ! -f "$last_crash_file" ]] || [[ "$(cat "$last_crash_file")" != "$crash_name" ]]; then
      alerts+=("new_crash:$crash_name")
      printf '%s' "$crash_name" > "$last_crash_file"
      log_msg warn "Detected new crash report: $crash_name"
    fi
  fi

  if [[ -n "$free_pct" ]]; then
    if (( free_pct < 20 )); then
      alerts+=("low_memory:${free_pct}%")
    elif (( free_pct < 35 )); then
      alerts+=("memory_warning:${free_pct}%")
    fi
  fi

  if [[ -n "$workspace_free_mb" ]] && (( workspace_free_mb < 10240 )); then
    alerts+=("workspace_disk_low:${workspace_free_mb}MB")
  fi
  if [[ -n "$root_free_mb" ]] && (( root_free_mb < 5120 )); then
    alerts+=("root_disk_low:${root_free_mb}MB")
  fi
  if [[ "$queue_depth" =~ ^[0-9]+$ ]] && (( queue_depth > 100 )); then
    alerts+=("queue_backlog:${queue_depth}")
  fi

  local alerts_json="[]"
  if (( ${#alerts[@]} > 0 )); then
    alerts_json=$(printf '%s\n' "${alerts[@]}" | json_array_from_lines)
    [[ -z "$alerts_json" ]] && alerts_json="[]"
  fi

  export TIMESTAMP="$timestamp"
  export LOAD_AVG="$load_avg"
  export FREE_PCT="${free_pct:-}"
  export MEMORY_STATUS="${mem_status:-}"
  export ROOT_FREE_MB="${root_free_mb:-}"
  export WORKSPACE_FREE_MB="${workspace_free_mb:-}"
  export QUEUE_DEPTH="${queue_depth:- -1}"
  export LATEST_CRASH="$crash_name"
  export CPU_SUMMARY="${cpu_summary:-}"
  export MEM_SUMMARY="${mem_summary:-}"
  export ALERTS_JSON="$alerts_json"
  export CPU_HOT_JSON="$cpu_hot_json"
  export METRICS_DEST="$METRICS_FILE"
  export HISTORY_DEST="$HISTORY_FILE"
  export HISTORY_RETENTION

  python3 2>/dev/null <<'PY' || log_msg error "Failed to serialize system metrics JSON"
import json, os, pathlib

def parse_load(raw):
    if not raw:
        return None
    try:
        parts = [float(x) for x in raw.split()[:3]]
        return {"1min": parts[0], "5min": parts[1], "15min": parts[2]}
    except Exception:
        return {"raw": raw}

def parse_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None

alerts = json.loads(os.environ.get("ALERTS_JSON", "[]"))
cpu_hot = json.loads(os.environ.get("CPU_HOT_JSON", "[]"))

data = {
    "timestamp": os.environ.get("TIMESTAMP"),
    "loadAverage": parse_load(os.environ.get("LOAD_AVG")),
    "memory": {
        "freePercent": parse_int(os.environ.get("FREE_PCT")),
        "status": os.environ.get("MEMORY_STATUS") or None
    },
    "disk": {
        "rootFreeMB": parse_int(os.environ.get("ROOT_FREE_MB")),
        "workspaceFreeMB": parse_int(os.environ.get("WORKSPACE_FREE_MB"))
    },
    "queueDepth": parse_int(os.environ.get("QUEUE_DEPTH")),
    "latestCrash": os.environ.get("LATEST_CRASH") or "none",
    "topSummary": {
        "cpu": os.environ.get("CPU_SUMMARY") or None,
        "memory": os.environ.get("MEM_SUMMARY") or None
    },
    "cpuHotProcesses": cpu_hot,
    "alerts": alerts
}

metrics_path = pathlib.Path(os.environ["METRICS_DEST"])
metrics_path.write_text(json.dumps(data, indent=2) + "\n")

history_path = pathlib.Path(os.environ["HISTORY_DEST"])
history_path.parent.mkdir(parents=True, exist_ok=True)
with history_path.open("a") as stream:
    stream.write(json.dumps(data) + "\n")

retention = int(os.environ.get("HISTORY_RETENTION", "240"))
try:
    lines = history_path.read_text().splitlines()
except FileNotFoundError:
    lines = []
if len(lines) > retention:
    history_path.write_text("\n".join(lines[-retention:]) + "\n")
PY

  if (( ${#alerts[@]} > 0 )); then
    log_msg warn "Snapshot captured with ${#alerts[@]} alert(s) | free_mem=${free_pct:-unknown}% | queue=${queue_depth}"
  else
    log_msg success "Snapshot captured | free_mem=${free_pct:-unknown}% | queue=${queue_depth}"
  fi
}

run_once() {
  gather_snapshot
}

run_daemon() {
  log_msg info "System integrity monitor running (PID $$) | interval=${INTERVAL}s | retention=${HISTORY_RETENTION}"
  while true; do
    gather_snapshot
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

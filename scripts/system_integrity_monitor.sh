#!/usr/bin/env bash
# VS Code Crash Prevention & Real-Time Monitoring System
# Proactive diagnostics for M4 Max + Voice Mode + Claude Code stability

set -euo pipefail

OUT="tmp/agent_status/system_metrics"
CRASH_LOG="logs/crash_prevention_$(date +%Y%m%d_%H%M%S).log"
mkdir -p "$OUT" logs

log() {
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $*" | tee -a "$CRASH_LOG"
}

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🎼 VS CODE CRASH PREVENTION MONITOR - STARTED"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. MEMORY PRESSURE MONITORING
check_memory() {
    local mem_pressure=$(memory_pressure 2>&1 | grep -i "System-wide memory free percentage" | awk '{print $NF}' | tr -d '%')
    local mem_status="HEALTHY"
    
    if [ -n "$mem_pressure" ]; then
        if [ "$mem_pressure" -lt 20 ]; then
            mem_status="CRITICAL"
            log "⚠️  MEMORY CRITICAL: ${mem_pressure}% free - triggering cleanup"
            # Auto-cleanup artifacts
            find /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT -name '*.raw*' -delete 2>/dev/null || true
            rm -rf /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/out_mirror 2>/dev/null || true
        elif [ "$mem_pressure" -lt 40 ]; then
            mem_status="WARNING"
            log "⚠️  MEMORY WARNING: ${mem_pressure}% free"
        else
            log "✅ Memory healthy: ${mem_pressure}% free"
        fi
    fi
    
    echo "$mem_pressure" > "$OUT/memory_pressure.txt"
    echo "$mem_status" > "$OUT/memory_status.txt"
}

# 2. APPTRANSLOCATION DETECTION
check_apptranslocation() {
    local vscode_path=$(ps aux | grep -i "Visual Studio Code\|Cursor" | grep -v grep | head -1 | awk '{for(i=11;i<=NF;i++) printf "%s ", $i; print ""}' | xargs)
    
    if echo "$vscode_path" | grep -q "AppTranslocation"; then
        log "🚨 CRITICAL: VS Code in AppTranslocation quarantine - CRASH RISK HIGH"
        log "   Path: $vscode_path"
        log "   Fix: bash scripts/fix_cursor_quarantine.sh && restart VS Code"
        echo "QUARANTINED" > "$OUT/apptranslocation_status.txt"
        return 1
    else
        log "✅ VS Code not in quarantine"
        echo "CLEAN" > "$OUT/apptranslocation_status.txt"
    fi
}

# 3. ELECTRON THREAD MONITORING
check_electron_threads() {
    local electron_pids=$(pgrep -f "Electron|Visual Studio Code|Cursor" || echo "")
    local thread_count=0
    
    if [ -n "$electron_pids" ]; then
        for pid in $electron_pids; do
            local threads=$(ps -M -p "$pid" 2>/dev/null | wc -l || echo 0)
            thread_count=$((thread_count + threads))
        done
        
        if [ "$thread_count" -gt 100 ]; then
            log "⚠️  HIGH THREAD COUNT: $thread_count threads (normal: 30-50)"
        else
            log "✅ Thread count healthy: $thread_count"
        fi
    fi
    
    echo "$thread_count" > "$OUT/electron_threads.txt"
}

# 4. FILE WATCHER LOAD
check_file_watchers() {
    local watcher_count=$(lsof -p $(pgrep -f "Visual Studio Code|Cursor" | head -1) 2>/dev/null | grep -c "VREG\|VDIR" || echo 0)
    
    if [ "$watcher_count" -gt 5000 ]; then
        log "⚠️  FILE WATCHER OVERLOAD: $watcher_count files watched"
        log "   Recommend: Exclude tmp/, logs/, out/ in .vscode/settings.json"
    else
        log "✅ File watchers healthy: $watcher_count"
    fi
    
    echo "$watcher_count" > "$OUT/file_watchers.txt"
}

# 5. CRASH REPORT DETECTION
check_recent_crashes() {
    local crash_dir="$HOME/Library/Logs/DiagnosticReports"
    local recent_crashes=$(find "$crash_dir" -name "*Electron*.crash" -o -name "*VSCode*.crash" -o -name "*Cursor*.crash" -mtime -1 2>/dev/null | wc -l | tr -d ' ')
    
    if [ "$recent_crashes" -gt 0 ]; then
        log "🚨 FOUND $recent_crashes RECENT CRASHES (last 24h)"
        local latest=$(ls -t "$crash_dir"/*{Electron,VSCode,Cursor}*.crash 2>/dev/null | head -1)
        if [ -n "$latest" ]; then
            log "   Latest: $(basename "$latest")"
            # Extract key crash signature
            grep -A 5 "Exception Type" "$latest" 2>/dev/null | tee "$OUT/latest_crash_signature.txt" || true
        fi
    else
        log "✅ No recent crashes detected"
    fi
    
    echo "$recent_crashes" > "$OUT/crash_count_24h.txt"
}

# 6. VOICE MODE QUEUE DEPTH
check_voice_queue() {
    local redis_cli=${REDIS_CLI:-redis-cli}
    local queue_depth=$($redis_cli LLEN bull:voice-mode-reasoning-jobs:wait 2>/dev/null || echo -1)
    
    if [ "$queue_depth" -gt 50 ]; then
        log "⚠️  VOICE QUEUE BACKLOG: $queue_depth jobs pending"
    elif [ "$queue_depth" -ge 0 ]; then
        log "✅ Voice queue healthy: $queue_depth jobs"
    else
        log "ℹ️  Voice queue unavailable (Redis not running)"
    fi
    
    echo "$queue_depth" > "$OUT/voice_queue_depth.txt"
}

# 7. CPU HOT PROCESSES
check_cpu_hogs() {
    log "🔍 Top CPU consumers:"
    ps -Ao pid,pcpu,pmem,comm | sort -k2 -nr | head -n 10 | while read line; do
        log "   $line"
    done > "$OUT/cpu_hot_processes.txt"
}

# 8. GENERATE METRICS JSON
generate_metrics() {
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local mem_pressure=$(cat "$OUT/memory_pressure.txt" 2>/dev/null || echo "unknown")
    local mem_status=$(cat "$OUT/memory_status.txt" 2>/dev/null || echo "unknown")
    local apptrans=$(cat "$OUT/apptranslocation_status.txt" 2>/dev/null || echo "unknown")
    local threads=$(cat "$OUT/electron_threads.txt" 2>/dev/null || echo 0)
    local watchers=$(cat "$OUT/file_watchers.txt" 2>/dev/null || echo 0)
    local crashes=$(cat "$OUT/crash_count_24h.txt" 2>/dev/null || echo 0)
    local queue=$(cat "$OUT/voice_queue_depth.txt" 2>/dev/null || echo -1)
    
    cat > "$OUT/metrics.json" <<EOF
{
  "timestamp": "$timestamp",
  "memory": {
    "freePercent": $mem_pressure,
    "status": "$mem_status"
  },
  "appTranslocation": "$apptrans",
  "electronThreads": $threads,
  "fileWatchers": $watchers,
  "crashesLast24h": $crashes,
  "voiceQueueDepth": $queue,
  "healthScore": $(calculate_health_score)
}
EOF
    
    log "📊 Metrics saved: $OUT/metrics.json"
}

calculate_health_score() {
    local score=100
    local mem_pressure=$(cat "$OUT/memory_pressure.txt" 2>/dev/null || echo 50)
    local apptrans=$(cat "$OUT/apptranslocation_status.txt" 2>/dev/null || echo "CLEAN")
    local crashes=$(cat "$OUT/crash_count_24h.txt" 2>/dev/null || echo 0)
    
    # Deduct points for issues
    [ "$mem_pressure" -lt 20 ] && score=$((score - 40))
    [ "$mem_pressure" -lt 40 ] && score=$((score - 20))
    [ "$apptrans" = "QUARANTINED" ] && score=$((score - 30))
    [ "$crashes" -gt 0 ] && score=$((score - 10 * crashes))
    
    [ "$score" -lt 0 ] && score=0
    echo "$score"
}

# 9. MAIN MONITORING LOOP
main() {
    log "Starting continuous monitoring (interval: 60s)..."
    
    while true; do
        log ""
        log "━━━ Health Check Cycle ━━━"
        
        check_memory
        check_apptranslocation
        check_electron_threads
        check_file_watchers
        check_recent_crashes
        check_voice_queue
        check_cpu_hogs
        generate_metrics
        
        local health_score=$(calculate_health_score)
        log "🏥 HEALTH SCORE: $health_score/100"
        
        if [ "$health_score" -lt 50 ]; then
            log "🚨 CRITICAL HEALTH - RECOMMEND IMMEDIATE ACTION"
        fi
        
        sleep 60
    done
}

# Run if executed directly
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main
fi
#!/usr/bin/env bash
# System Integrity Monitor
# Continuously captures CPU/memory/disk health, queue depth, and crash signals
# Writes structured metrics to tmp/agent_status/system_metrics and maintains logs

set -euo pipefail

shopt -s nullglob

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
OUT_DIR="$ROOT/tmp/agent_status/system_metrics"
LOG_FILE="$ROOT/logs/system_integrity_monitor.log"
METRICS_FILE="$OUT_DIR/metrics.json"
HISTORY_FILE="$OUT_DIR/metrics_history.jsonl"
HISTORY_RETENTION="${SYSTEM_MONITOR_RETENTION:-240}"   # number of snapshots retained
INTERVAL="${SYSTEM_MONITOR_INTERVAL:-60}"               # seconds between samples
MODE="${1:---daemon}"

mkdir -p "$OUT_DIR" "$(dirname "$LOG_FILE")"

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
  local data
  data=$(python3 - <<'PY'
import json, sys
lines = [line.strip() for line in sys.stdin if line.strip()]
print(json.dumps(lines))
PY
  )
  printf '%s' "${data:-[]}"
}

prune_history() {
  if [[ ! -f "$HISTORY_FILE" ]]; then
    return
  fi

  python3 - "$HISTORY_FILE" "$HISTORY_RETENTION" <<'PY' || true
import json, pathlib, sys
history_path = pathlib.Path(sys.argv[1])
retention = int(sys.argv[2])
try:
    lines = history_path.read_text().splitlines()
except FileNotFoundError:
    sys.exit(0)
if len(lines) > retention:
    history_path.write_text("\n".join(lines[-retention:]) + "\n")
PY
}

gather_snapshot() {
  local timestamp cpu_summary mem_summary top_output queue_depth load_avg crash_latest crash_name
  local root_free_mb workspace_free_mb free_pct mem_status alerts_json cpu_hot_json last_crash_file
  local alerts=()

  timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

  if command -v top >/dev/null 2>&1; then
    if top_output="$(top -l 1 -stats pid,cpu,mem,command 2>/dev/null)"; then
      printf '%s\n' "$top_output" | head -n 40 > "$OUT_DIR/top_snapshot.txt"
      cpu_summary="$(printf '%s\n' "$top_output" | grep -m1 'CPU usage' || true)"
      mem_summary="$(printf '%s\n' "$top_output" | grep -m1 'PhysMem' || true)"
    else
      log_msg warn "top command failed to capture metrics"
    fi
  else
    log_msg warn "top command not available; skipping detailed snapshot"
  fi

  ps -Ao pid,pcpu,pmem,comm | sort -k2 -nr | head -n 25 > "$OUT_DIR/process_hot.txt" || true

  cpu_hot_json="[]"
  if [[ -s "$OUT_DIR/process_hot.txt" ]]; then
    cpu_hot_json=$(python3 <<'PY' 2>/dev/null || echo "[]")
import json, pathlib
from pathlib import Path
rows = []
path = Path("$OUT_DIR/process_hot.txt")
if path.exists():
    for line in path.read_text().splitlines():
        parts = line.strip().split(None, 3)
        if len(parts) != 4:
            continue
        pid, cpu, mem, cmd = parts
        try:
            rows.append({
                "pid": int(pid),
                "cpu": float(cpu),
                "memory": float(mem),
                "command": cmd
            })
        except ValueError:
            continue
    rows = rows[:15]
print(json.dumps(rows))
PY
    )
  fi

  load_avg="$(sysctl -n vm.loadavg 2>/dev/null | tr -d '{}' | xargs || true)"

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
  if [[ -z "$free_pct" ]] && command -v vm_stat >/dev/null 2>&1 && command -v python3 >/dev/null 2>&1; then
    local pages_free pages_inactive pages_spec pages_total
    pages_free=$(vm_stat | awk '/Pages free/ {gsub("\\.","",$3); print $3}' || echo 0)
    pages_inactive=$(vm_stat | awk '/Pages inactive/ {gsub("\\.","",$3); print $3}' || echo 0)
    pages_spec=$(vm_stat | awk '/Pages speculative/ {gsub("\\.","",$3); print $3}' || echo 0)
    pages_total=$(vm_stat | awk '/Pages/ {gsub("\\.","",$3); sum+=$3} END {print sum}' || echo 0)
    if [[ "$pages_total" != "0" ]]; then
      free_pct=$(python3 <<PY 2>/dev/null || echo "")
free_total = $pages_free + $pages_inactive + $pages_spec
pages_total = $pages_total
print(int((free_total / pages_total) * 100))
PY
      )
    fi
  fi

  crash_latest=$(ls -t "$HOME/Library/Logs/DiagnosticReports/"*.crash 2>/dev/null | head -n1 || true)
  crash_name="none"
  if [[ -n "$crash_latest" ]]; then
    crash_name="$(basename "$crash_latest")"
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

  alerts_json="[]"
  if (( ${#alerts[@]} > 0 )); then
    alerts_json=$(printf '%s\n' "${alerts[@]}" | json_array_from_lines)
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

  python3 <<'PY' 2>/dev/null || log_msg error "Failed to serialize system metrics JSON"
import json, os, pathlib, sys
from datetime import datetime

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

def parse_float(value):
    try:
        return float(value)
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

  log_msg success "Snapshot captured | free_mem=${free_pct:-unknown}% | root_free=${root_free_mb:-?}MB | queue=${queue_depth}"
}

run_once() {
  gather_snapshot
}

run_daemon() {
  log_msg info "System integrity monitor started (PID $$) | interval=${INTERVAL}s | retention=${HISTORY_RETENTION}"
  while true; do
    gather_snapshot
    sleep "$INTERVAL"
    prune_history
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
    echo "Usage: $0 [--daemon|--once]"
    exit 1
    ;;
esac

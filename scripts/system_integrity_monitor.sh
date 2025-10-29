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

#!/bin/bash

echo "=== Validating Metrics Capture ==="
echo ""

# Check if metrics file exists and is recent
if [ -f "tmp/agent_status/system_metrics/metrics.json" ]; then
    AGE=$(( $(date +%s) - $(stat -f %m tmp/agent_status/system_metrics/metrics.json 2>/dev/null || stat -c %Y tmp/agent_status/system_metrics/metrics.json) ))

    if [ $AGE -lt 60 ]; then
        echo "✓ Metrics file is current (${AGE}s old)"
    else
        echo "⚠️  WARNING: Metrics file is stale (${AGE}s old)"
    fi

    # Validate JSON format
    if command -v jq &> /dev/null; then
        if jq . tmp/agent_status/system_metrics/metrics.json > /dev/null 2>&1; then
            echo "✓ Metrics file is valid JSON"
        else
            echo "❌ ERROR: Metrics file is not valid JSON"
        fi
    else
        echo "⚠️  jq not installed, skipping JSON validation"
    fi
else
    echo "❌ ERROR: Metrics file not found"
fi

echo ""

# Check for JSONL history file
HISTORY_FILE="tmp/agent_status/system_metrics/metrics_history.jsonl"
if [ -f "$HISTORY_FILE" ]; then
    LINE_COUNT=$(wc -l < "$HISTORY_FILE")
    FILE_SIZE=$(du -h "$HISTORY_FILE" | cut -f1)

    echo "✓ Metrics history file found"
    echo "  Lines: $LINE_COUNT"
    echo "  Size: $FILE_SIZE"

    # Show last 3 entries
    echo ""
    echo "Last 3 metric snapshots:"
    tail -3 "$HISTORY_FILE" | while read -r line; do
        if command -v jq &> /dev/null; then
            echo "$line" | jq -c '{timestamp, cpu_percent, memory_percent}'
        else
            echo "$line"
        fi
    done
else
    echo "⚠️  Metrics history file not found at $HISTORY_FILE"
    echo "   This may be created by the monitor script"
fi

echo ""

# Check monitor process
if [ -f "tmp/pids/system_monitor.pid" ]; then
    MONITOR_PID=$(cat tmp/pids/system_monitor.pid)
    if ps -p "$MONITOR_PID" > /dev/null 2>&1; then
        echo "✓ System monitor is running (PID: $MONITOR_PID)"

        # Show process info
        ps -p "$MONITOR_PID" -o pid,etime,command
    else
        echo "⚠️  WARNING: Monitor PID file exists but process not running"
    fi
else
    echo "⚠️  WARNING: Monitor PID file not found"
fi

echo ""
echo "=== Validation Complete ==="

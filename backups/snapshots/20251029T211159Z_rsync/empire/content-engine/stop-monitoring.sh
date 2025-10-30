#!/bin/bash

# STOP CONTINUOUS MONITORING SYSTEM

echo "Stopping monitoring services..."

REPORTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../../reports/autonomous-status"

# Read PIDs from files
if [ -f "$REPORTS_DIR/monitor.pid" ]; then
    MONITOR_PID=$(cat "$REPORTS_DIR/monitor.pid")
    if ps -p $MONITOR_PID > /dev/null 2>&1; then
        kill $MONITOR_PID
        echo "Stopped System Monitor (PID: $MONITOR_PID)"
    else
        echo "System Monitor already stopped"
    fi
    rm "$REPORTS_DIR/monitor.pid"
fi

if [ -f "$REPORTS_DIR/improvement.pid" ]; then
    IMPROVEMENT_PID=$(cat "$REPORTS_DIR/improvement.pid")
    if ps -p $IMPROVEMENT_PID > /dev/null 2>&1; then
        kill $IMPROVEMENT_PID
        echo "Stopped Improvement Loop (PID: $IMPROVEMENT_PID)"
    else
        echo "Improvement Loop already stopped"
    fi
    rm "$REPORTS_DIR/improvement.pid"
fi

echo ""
echo "All monitoring services stopped."

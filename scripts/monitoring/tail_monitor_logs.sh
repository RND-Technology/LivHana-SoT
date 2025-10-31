#!/bin/bash

echo "=== Tailing System Monitor Logs ==="
echo "Press Ctrl+C to exit"
echo ""

if [ -f "logs/system_integrity_monitor.log" ]; then
    tail -f logs/system_integrity_monitor.log
else
    echo "❌ ERROR: logs/system_integrity_monitor.log not found"
    echo ""
    echo "Start the monitor first with:"
    echo "  scripts/tier1_boot.sh"
    exit 1
fi

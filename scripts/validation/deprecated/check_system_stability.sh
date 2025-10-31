#!/bin/bash

echo "=== System Stability Check ==="
echo ""

# Check crash monitor logs if they exist
if [ -f "logs/crash_monitor.log" ]; then
    echo "Recent crash events (last 10):"
    tail -10 logs/crash_monitor.log | grep -i "crash\|error\|fail" || echo "  No recent crashes detected"
else
    echo "⚠️  Crash monitor log not found"
fi

echo ""

# Check VS Code process stability
echo "VS Code process uptime:"
ps -eo pid,etime,command | grep "Visual Studio Code" | grep -v grep | head -5

echo ""

# Check system load
echo "System load:"
uptime

echo ""

# Check memory pressure
echo "Memory pressure:"
vm_stat | grep "Pages free\|Pages active\|Pages inactive\|Pages wired"

echo ""
echo "=== Stability Check Complete ==="
echo "Monitor this output over time to confirm stability improvements"

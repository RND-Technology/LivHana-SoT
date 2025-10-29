#!/bin/bash

echo "=== System Metrics Monitor ==="
echo ""
echo "Press Ctrl+C to exit"
echo ""

# Function to display metrics
display_metrics() {
    clear
    echo "=== System Metrics ($(date)) ==="
    echo ""

    if [ -f "tmp/agent_status/system_metrics/metrics.json" ]; then
        echo "Current Metrics:"
        echo "----------------"

        # Pretty print JSON if jq is available
        if command -v jq &> /dev/null; then
            cat tmp/agent_status/system_metrics/metrics.json | jq '.'
        else
            cat tmp/agent_status/system_metrics/metrics.json
        fi

        echo ""
        echo "File age: $(( $(date +%s) - $(stat -f %m tmp/agent_status/system_metrics/metrics.json 2>/dev/null || stat -c %Y tmp/agent_status/system_metrics/metrics.json) )) seconds"
    else
        echo "⚠️  Metrics file not found"
    fi

    echo ""
    echo "Recent Log Entries:"
    echo "-------------------"
    if [ -f "logs/system_integrity_monitor.log" ]; then
        tail -5 logs/system_integrity_monitor.log
    else
        echo "⚠️  Log file not found"
    fi
}

# Display metrics every 5 seconds
while true; do
    display_metrics
    sleep 5
done

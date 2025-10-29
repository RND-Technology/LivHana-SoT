#!/bin/bash

echo "=== Testing System Integrity Monitor ==="
echo ""

# Check if monitor script exists
if [ ! -f "scripts/system_integrity_monitor.sh" ]; then
    echo "❌ ERROR: scripts/system_integrity_monitor.sh not found"
    exit 1
fi

# Ensure script is executable
chmod +x scripts/system_integrity_monitor.sh

# Test --once mode
echo "Running monitor in --once mode..."
echo ""

if scripts/system_integrity_monitor.sh --once; then
    EXIT_CODE=$?
    echo ""
    echo "✓ Monitor script executed successfully (exit code: $EXIT_CODE)"

    # Check if output files were created
    if [ -f "tmp/agent_status/system_metrics/metrics.json" ]; then
        echo "✓ Metrics file created"
        echo ""
        echo "Sample metrics:"
        cat tmp/agent_status/system_metrics/metrics.json | head -20
    else
        echo "⚠️  WARNING: Metrics file not created"
    fi
else
    EXIT_CODE=$?
    echo ""
    echo "❌ ERROR: Monitor script failed (exit code: $EXIT_CODE)"
    exit 1
fi

echo ""
echo "=== Test Complete ==="

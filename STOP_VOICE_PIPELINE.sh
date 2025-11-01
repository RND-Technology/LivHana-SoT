#!/bin/bash
# Stop Unified Voice Pipeline
set -euo pipefail

echo "🛑 Stopping Unified Voice Pipeline..."

# Check if PID file exists
if [ ! -f /tmp/voice-pipeline.pid ]; then
    echo "⚠️  No PID file found. Pipeline may not be running."
    
    # Try to find and kill process on port 8080
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        PID=$(lsof -Pi :8080 -sTCP:LISTEN -t)
        echo "Found process on port 8080 (PID: $PID)"
        kill $PID
        echo "✅ Process stopped"
    else
        echo "ℹ️  No process found on port 8080"
    fi
    exit 0
fi

# Read PID
PID=$(cat /tmp/voice-pipeline.pid)

# Check if process exists
if ps -p $PID > /dev/null 2>&1; then
    echo "Stopping process $PID..."
    kill $PID
    
    # Wait for graceful shutdown
    for i in {1..10}; do
        if ! ps -p $PID > /dev/null 2>&1; then
            echo "✅ Voice pipeline stopped gracefully"
            rm -f /tmp/voice-pipeline.pid
            exit 0
        fi
        sleep 1
    done
    
    # Force kill if still running
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Forcing shutdown..."
        kill -9 $PID
        echo "✅ Voice pipeline force stopped"
    fi
else
    echo "ℹ️  Process $PID not running"
fi

rm -f /tmp/voice-pipeline.pid
echo "✅ Cleaned up PID file"

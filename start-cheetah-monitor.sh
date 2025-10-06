#!/bin/bash

# CONTINUOUS CHEETAH MONITOR
# Runs monitor-cheetah.sh every 5 minutes
# Use Ctrl+C to stop

echo "🐆 CHEETAH CONTINUOUS MONITOR STARTED"
echo "📡 Running monitor every 5 minutes"
echo "🛑 Press Ctrl+C to stop"
echo ""

# Run immediately
./monitor-cheetah.sh

# Then run every 5 minutes
while true; do
  sleep 300  # 5 minutes
  echo ""
  echo "🔄 Running scheduled check..."
  ./monitor-cheetah.sh
done

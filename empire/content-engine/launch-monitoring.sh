#!/bin/bash

# LAUNCH CONTINUOUS MONITORING DASHBOARD ENGINE
# Starts all monitoring services in parallel

echo "========================================================================"
echo "HIGH NOON CARTOON - CONTINUOUS MONITORING SYSTEM"
echo "========================================================================"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Create reports directory if it doesn't exist
mkdir -p ../../reports/autonomous-status

echo -e "${CYAN}Starting monitoring services...${NC}"
echo ""

# 1. Start system monitor (runs every 5 minutes)
echo -e "${GREEN}[1/3]${NC} Launching System Monitor (5-minute intervals)"
node monitor-all-systems.mjs continuous 5 > ../../reports/autonomous-status/monitor.log 2>&1 &
MONITOR_PID=$!
echo "      PID: $MONITOR_PID"

# 2. Start continuous improvement loop (runs every 30 minutes)
echo -e "${GREEN}[2/3]${NC} Launching Continuous Improvement Loop (30-minute intervals)"
node continuous-improvement-loop.mjs continuous 30 > ../../reports/autonomous-status/improvement.log 2>&1 &
IMPROVEMENT_PID=$!
echo "      PID: $IMPROVEMENT_PID"

# 3. Open monitoring dashboard
echo -e "${GREEN}[3/3]${NC} Opening Monitoring Dashboard"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "monitoring-dashboard.html"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "monitoring-dashboard.html" 2>/dev/null || echo "      Please open monitoring-dashboard.html in your browser"
else
    echo "      Please open monitoring-dashboard.html in your browser"
fi

echo ""
echo "========================================================================"
echo -e "${GREEN}ALL SERVICES RUNNING!${NC}"
echo "========================================================================"
echo ""
echo "Process IDs:"
echo "  System Monitor:         $MONITOR_PID"
echo "  Improvement Loop:       $IMPROVEMENT_PID"
echo ""
echo "Log files:"
echo "  Monitor:                reports/autonomous-status/monitor.log"
echo "  Improvement:            reports/autonomous-status/improvement.log"
echo ""
echo "Status reports:"
echo "  Latest:                 reports/autonomous-status/latest-status.json"
echo "  Alerts:                 reports/autonomous-status/ALERTS.log"
echo ""
echo "Learnings:"
echo "  Document:               empire/content-engine/LEARNINGS.md"
echo "  Quality Metrics:        empire/content-engine/output/quality-metrics.json"
echo ""
echo "Dashboard:"
echo "  URL:                    file://$SCRIPT_DIR/monitoring-dashboard.html"
echo ""
echo -e "${YELLOW}To stop all services, run:${NC}"
echo "  kill $MONITOR_PID $IMPROVEMENT_PID"
echo ""
echo -e "${YELLOW}Or use:${NC}"
echo "  ./stop-monitoring.sh"
echo ""
echo "========================================================================"
echo ""

# Save PIDs to file for easy cleanup
echo "$MONITOR_PID" > ../../reports/autonomous-status/monitor.pid
echo "$IMPROVEMENT_PID" > ../../reports/autonomous-status/improvement.pid

# Keep script running
echo "Press Ctrl+C to stop all monitoring services..."
echo ""

# Wait for processes
wait $MONITOR_PID $IMPROVEMENT_PID

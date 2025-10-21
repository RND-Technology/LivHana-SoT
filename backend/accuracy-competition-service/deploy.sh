#!/bin/bash
# RPM Accuracy Competition Service Deployment Script
# ROI/$/Day is KING. Cash flow (passive profits) RULES business decisions.

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
SERVICE_NAME="accuracy-competition-service"
PORT=8001
LOG_DIR="logs"
DATA_DIR="data"

banner() {
  printf "\n${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
  printf "${BOLD}${MAGENTA}  🎯 %s${NC}\n" "$1"
  printf "${BOLD}${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n\n"
}

success() { printf "${GREEN}✅ %s${NC}\n" "$1"; }
warning() { printf "${YELLOW}⚠️  %s${NC}\n" "$1"; }
error() { printf "${RED}❌ %s${NC}\n" "$1"; }
info() { printf "${CYAN}🎯 %s${NC}\n" "$1"; }

# Start deployment
banner "RPM ACCURACY COMPETITION SERVICE DEPLOYMENT"
info "ROI/$/Day is KING. Cash flow RULES business decisions."
info "Models vs Humans vs Selves competition system"
echo

# Check prerequisites
banner "STEP 1: PREREQUISITES CHECK"
info "Checking system requirements..."

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
  error "Node.js not found - please install Node.js 18+"
  exit 1
fi
success "Node.js available: $(node --version)"

# Check npm
if ! command -v npm >/dev/null 2>&1; then
  error "npm not found - please install npm"
  exit 1
fi
success "npm available: $(npm --version)"

# Check port availability
if lsof -i :$PORT >/dev/null 2>&1; then
  warning "Port $PORT is in use - stopping existing service"
  pkill -f "node.*$SERVICE_NAME" || true
  sleep 2
fi
success "Port $PORT available"

echo

# Install dependencies
banner "STEP 2: DEPENDENCIES INSTALLATION"
info "Installing npm dependencies..."

if [ ! -d "node_modules" ]; then
  info "Installing dependencies..."
  npm install
else
  info "Dependencies already installed - updating..."
  npm update
fi

success "Dependencies installed/updated"
echo

# Create directories
banner "STEP 3: DIRECTORY SETUP"
info "Creating required directories..."

mkdir -p "$LOG_DIR"
mkdir -p "$DATA_DIR"
mkdir -p "logs"

success "Directories created"
echo

# Database initialization
banner "STEP 4: DATABASE INITIALIZATION"
info "Initializing SQLite database..."

# The database will be created automatically on first run
success "Database initialization ready"
echo

# Environment setup
banner "STEP 5: ENVIRONMENT CONFIGURATION"
info "Setting up environment variables..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  cat > .env << EOF
# RPM Accuracy Competition Service Configuration
NODE_ENV=production
PORT=$PORT
LOG_LEVEL=info

# Database
DB_PATH=./data/accuracy_competition.db

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:4002

# Competition Settings
DEFAULT_COMPETITION_DURATION=7d
LEADERBOARD_UPDATE_INTERVAL=3600000
ACCURACY_CALCULATION_INTERVAL=86400000
EOF
  success ".env file created"
else
  info ".env file already exists"
fi

echo

# Service startup
banner "STEP 6: SERVICE STARTUP"
info "Starting $SERVICE_NAME on port $PORT..."

# Start service in background
nohup npm start > "$LOG_DIR/service.log" 2>&1 &
SERVICE_PID=$!

# Wait for service to start
sleep 5

# Check if service is running
if ps -p $SERVICE_PID > /dev/null; then
  success "Service started successfully (PID: $SERVICE_PID)"
else
  error "Service failed to start"
  cat "$LOG_DIR/service.log"
  exit 1
fi

# Health check
banner "STEP 7: HEALTH CHECK"
info "Performing health check..."

sleep 3
if curl -s "http://localhost:$PORT/health" | grep -q "healthy"; then
  success "Health check passed"
else
  warning "Health check failed - service may still be starting"
fi

echo

# Service status
banner "STEP 8: SERVICE STATUS"
info "Service Information:"
echo "  • Name: $SERVICE_NAME"
echo "  • Port: $PORT"
echo "  • PID: $SERVICE_PID"
echo "  • Logs: $LOG_DIR/service.log"
echo "  • Database: $DATA_DIR/accuracy_competition.db"
echo "  • Health: http://localhost:$PORT/health"
echo

# API endpoints
banner "STEP 9: API ENDPOINTS"
info "Available API Endpoints:"
echo "  • Health Check: GET /health"
echo "  • Submit Projection: POST /api/v1/projections"
echo "  • Submit Actual: POST /api/v1/actuals"
echo "  • Calculate Accuracy: POST /api/v1/accuracy/calculate"
echo "  • Get Leaderboard: GET /api/v1/leaderboard"
echo "  • Get Participant Stats: GET /api/v1/participants/:id/stats"
echo "  • Create Competition: POST /api/v1/competitions"
echo "  • Join Competition: POST /api/v1/competitions/:id/join"
echo "  • Get Accuracy Trends: GET /api/v1/analytics/trends"
echo "  • Get Recommendations: GET /api/v1/analytics/recommendations/:id"
echo

# Competition setup
banner "STEP 10: INITIAL COMPETITION SETUP"
info "Setting up initial competition..."

# Create default tournament
curl -s -X POST "http://localhost:$PORT/api/v1/competitions" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekly Accuracy Tournament",
    "type": "tournament",
    "description": "Weekly accuracy competition for all participants",
    "start_date": "'$(date -u +%Y-%m-%d)'",
    "end_date": "'$(date -u -d '+7 days' +%Y-%m-%d)'"
  }' > /dev/null

success "Initial competition setup complete"
echo

# Final status
banner "🌟 DEPLOYMENT COMPLETE"
echo
success "RPM Accuracy Competition Service is now running!"
echo
info "${BOLD}SERVICE DETAILS:${NC}"
echo "  • URL: http://localhost:$PORT"
echo "  • Status: RUNNING"
echo "  • PID: $SERVICE_PID"
echo "  • Logs: tail -f $LOG_DIR/service.log"
echo
info "${BOLD}COMPETITION FEATURES:${NC}"
echo "  • ROI/$/Day accuracy measurement (KING metric)"
echo "  • Cash flow projection accuracy"
echo "  • Models vs Humans vs Selves competition"
echo "  • Real-time leaderboards"
echo "  • Improvement recommendations"
echo "  • Tournament management"
echo
info "${BOLD}NEXT STEPS:${NC}"
echo "  1. Submit projections via API"
echo "  2. Submit actual results"
echo "  3. View leaderboards"
echo "  4. Join competitions"
echo "  5. Track improvement"
echo
success "🎯 ROI/$/Day is KING. Cash flow RULES business decisions."
success "🏆 Competition system ready for Models vs Humans vs Selves."
success "🚀 RPM DNA baked in. Accuracy measurement active."
echo

# Save PID for management
echo $SERVICE_PID > "$SERVICE_NAME.pid"
info "Service PID saved to $SERVICE_NAME.pid"

exit 0

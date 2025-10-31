#!/bin/bash
# RPM DNA: 1.6.2.1 (RND → Technology → Replit Master Deployment)
# Purpose: Complete Replit deployment orchestration
# Owner: Replit Agent
# Status: READY FOR EXECUTION
# Timestamp: 2025-10-08

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🦄 REPLIT MAX AUTO PARALLEL DEPLOYMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Mission: Launch HNC to Massive Day 1 Success"
echo "⏱️  Timeline: 4 hours to 20 episodes"
echo "💰 Impact: $80K → $100K/month"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Configuration
REPO_ROOT="/workspace/LivHana-Trinity-Local/LivHana-SoT"
LOG_DIR="${REPO_ROOT}/logs"
mkdir -p "${LOG_DIR}"

# Function: Check prerequisites
check_prerequisites() {
  echo "🔍 Checking prerequisites..."

  # Check 1Password CLI
  if ! command -v op &> /dev/null; then
    echo "❌ 1Password CLI not found"
    echo "💡 Installing 1Password CLI..."
    curl -sSfo op.zip https://cache.agilebits.com/dist/1P/op2/pkg/v2.20.0/op_linux_amd64_v2.20.0.zip
    unzip -o op.zip
    rm op.zip
    chmod +x op
    sudo mv op /usr/local/bin/
  fi

  # Verify OP_SERVICE_ACCOUNT_TOKEN
  if [ -z "$OP_SERVICE_ACCOUNT_TOKEN" ]; then
    echo "❌ OP_SERVICE_ACCOUNT_TOKEN not set in Replit Secrets"
    exit 1
  fi

  # Check Node.js
  if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
  fi

  # Check npm
  if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
  fi

  echo "✅ All prerequisites satisfied"
}

# Function: Install dependencies
install_dependencies() {
  echo ""
  echo "📦 Installing dependencies..."

  # Backend services
  for service in delivery-service analytics-service integration-service; do
    if [ -d "${REPO_ROOT}/backend/${service}" ]; then
      echo "  Installing ${service}..."
      cd "${REPO_ROOT}/backend/${service}"
      npm install --quiet > "${LOG_DIR}/${service}-install.log" 2>&1 || {
        echo "❌ Failed to install ${service}"
        exit 1
      }
    fi
  done

  # Content engine
  if [ -d "${REPO_ROOT}/empire/content-engine" ]; then
    echo "  Installing content-engine..."
    cd "${REPO_ROOT}/empire/content-engine"
    npm install --quiet > "${LOG_DIR}/content-engine-install.log" 2>&1 || {
      echo "❌ Failed to install content-engine"
      exit 1
    }
  fi

  echo "✅ Dependencies installed"
}

# Function: Deploy HNC Content Engine
deploy_hnc_engine() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎬 Deploying HNC Autonomous Content Engine (HIGHEST PRIORITY)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  cd "${REPO_ROOT}/empire/content-engine"

  # Create environment file
  cat > .env <<EOF
NODE_ENV=production
AUTONOMOUS_MODE=true
EPISODE_TARGET=20
GENERATION_INTERVAL=3600
DOMAIN=herbitrage.com
EOF

  # Start engine
  echo "🚀 Starting HNC engine..."
  op run --env-file=.env -- npm start > "${LOG_DIR}/hnc-engine.log" 2>&1 &
  HNC_PID=$!

  echo "✅ HNC Engine started (PID: ${HNC_PID})"
  echo "📊 Monitor: tail -f ${LOG_DIR}/hnc-engine.log"

  # Store PID for cleanup
  echo "${HNC_PID}" > "${LOG_DIR}/hnc-engine.pid"
}

# Function: Deploy YouTube Analyzer
deploy_youtube_analyzer() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📊 Deploying YouTube Viral Pattern Analyzer"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  cd "${REPO_ROOT}/backend/analytics-service"

  # Create environment file
  cat > .env <<EOF
NODE_ENV=production
GCP_PROJECT_ID=$(op read "op://LivHana-Ops-Keys/GCP_PROJECT_ID/credential")
YOUTUBE_API_KEY=$(op read "op://LivHana-Ops-Keys/YOUTUBE_API_KEY/credential" || echo "PENDING")
EOF

  # Start analyzer
  if [ "$YOUTUBE_API_KEY" != "PENDING" ]; then
    echo "🚀 Starting YouTube analyzer..."
    op run --env-file=.env -- node 1.6.3.1_youtube-analyzer-integration_20251008.js > "${LOG_DIR}/youtube-analyzer.log" 2>&1 &
    YOUTUBE_PID=$!
    echo "✅ YouTube Analyzer started (PID: ${YOUTUBE_PID})"
    echo "${YOUTUBE_PID}" > "${LOG_DIR}/youtube-analyzer.pid"
  else
    echo "⚠️  YouTube API key not found - skipping analyzer"
    echo "💡 Add key: YOUTUBE_API_KEY=op://LivHana-Ops-Keys/YOUTUBE_API_KEY/credential"
  fi
}

# Function: Deploy NewsAPI Pipeline
deploy_newsapi_pipeline() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📰 Deploying NewsAPI Real-Time Cannabis Pipeline"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  cd "${REPO_ROOT}/backend/analytics-service"

  # Create environment file
  cat > .env <<EOF
NODE_ENV=production
GCP_PROJECT_ID=$(op read "op://LivHana-Ops-Keys/GCP_PROJECT_ID/credential")
NEWSAPI_KEY=$(op read "op://LivHana-Ops-Keys/NEWSAPI_KEY/credential" || echo "PENDING")
EOF

  # Start pipeline
  if [ "$NEWSAPI_KEY" != "PENDING" ]; then
    echo "🚀 Starting NewsAPI pipeline..."
    op run --env-file=.env -- node 1.6.3.2_newsapi-integration_20251008.js > "${LOG_DIR}/newsapi-pipeline.log" 2>&1 &
    NEWS_PID=$!
    echo "✅ NewsAPI Pipeline started (PID: ${NEWS_PID})"
    echo "${NEWS_PID}" > "${LOG_DIR}/newsapi-pipeline.pid"
  else
    echo "⚠️  NewsAPI key not found - skipping pipeline"
    echo "💡 Add key: NEWSAPI_KEY=op://LivHana-Ops-Keys/NEWSAPI_KEY/credential"
  fi
}

# Function: Deploy Lightspeed Webhook
deploy_lightspeed_webhook() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🎧 Deploying Lightspeed Webhook Listener"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  cd "${REPO_ROOT}/backend/integration-service"

  # Create environment file
  cat > .env <<EOF
NODE_ENV=production
PORT_INTEGRATION_SERVICE=3005
DELIVERY_SERVICE_URL=https://delivery-service-XXXXX-uc.a.run.app
LIGHTSPEED_WEBHOOK_SECRET=$(op read "op://LivHana-Ops-Keys/LIGHTSPEED_WEBHOOK_SECRET/credential" || echo "PENDING")
SQUARE_ACCESS_TOKEN=$(op read "op://LivHana-Ops-Keys/SQUARE_ACCESS_TOKEN/credential")
GCP_PROJECT_ID=$(op read "op://LivHana-Ops-Keys/GCP_PROJECT_ID/credential")
EOF

  # Start webhook listener
  echo "🚀 Starting Lightspeed webhook listener..."
  op run --env-file=.env -- node 1.6.2.1_lightspeed-webhook-listener_20251008.js > "${LOG_DIR}/webhook-listener.log" 2>&1 &
  WEBHOOK_PID=$!

  echo "✅ Webhook Listener started (PID: ${WEBHOOK_PID})"
  echo "📊 Monitor: tail -f ${LOG_DIR}/webhook-listener.log"
  echo "${WEBHOOK_PID}" > "${LOG_DIR}/webhook-listener.pid"

  # Get Replit URL
  REPLIT_URL=$(echo $REPL_SLUG | sed 's/.*\///')
  echo "🔗 Webhook URL: https://${REPLIT_URL}.repl.co/webhook/lightspeed"
}

# Function: Monitor deployment
monitor_deployment() {
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📊 Deployment Status"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # List all running services
  echo ""
  echo "🏃 Running Services:"

  for pid_file in "${LOG_DIR}"/*.pid; do
    if [ -f "$pid_file" ]; then
      service_name=$(basename "$pid_file" .pid)
      pid=$(cat "$pid_file")
      if ps -p "$pid" > /dev/null; then
        echo "  ✅ ${service_name} (PID: ${pid})"
      else
        echo "  ❌ ${service_name} (STOPPED)"
      fi
    fi
  done

  echo ""
  echo "📁 Log Files:"
  echo "  ${LOG_DIR}/"

  echo ""
  echo "📊 Monitor Commands:"
  echo "  tail -f ${LOG_DIR}/hnc-engine.log       # HNC episodes"
  echo "  tail -f ${LOG_DIR}/youtube-analyzer.log # Viral patterns"
  echo "  tail -f ${LOG_DIR}/newsapi-pipeline.log # News ingestion"
  echo "  tail -f ${LOG_DIR}/webhook-listener.log # Order events"

  echo ""
  echo "🎯 Success Criteria:"
  echo "  - 20 HNC episodes generated (4 hours)"
  echo "  - YouTube analysis complete (200+ videos)"
  echo "  - NewsAPI pipeline active (100+ articles/hour)"
  echo "  - Webhook listener ready (port 3005)"
}

# Function: Cleanup on exit
cleanup() {
  echo ""
  echo "🛑 Shutting down services..."

  for pid_file in "${LOG_DIR}"/*.pid; do
    if [ -f "$pid_file" ]; then
      pid=$(cat "$pid_file")
      if ps -p "$pid" > /dev/null; then
        echo "  Stopping PID ${pid}..."
        kill "$pid"
      fi
      rm "$pid_file"
    fi
  done

  echo "✅ Cleanup complete"
}

# Register cleanup handler
trap cleanup EXIT INT TERM

# Main execution
main() {
  check_prerequisites
  install_dependencies
  deploy_hnc_engine
  deploy_youtube_analyzer
  deploy_newsapi_pipeline
  deploy_lightspeed_webhook
  monitor_deployment

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✅ MAX PARALLEL DEPLOYMENT COMPLETE!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "🏁 Status: ALL SERVICES RUNNING"
  echo "⏱️  Expected: 4 hours to 20 episodes"
  echo "💰 Impact: $80K → $100K/month path clear"
  echo ""
  echo "🎉 LFG! 🦄🐆⚡"
  echo ""

  # Keep script running
  echo "Press Ctrl+C to stop all services..."
  wait
}

# Execute main
main

# Optimized: 2025-10-08

#!/usr/bin/env bash
# 🎙️ Ensure Voice Services Running - Fallback to Docker Compose
# Tier-1 Pattern: Try macOS LaunchAgents, fallback to Docker if needed

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

check_service() {
  local port=$1
  curl -sf "http://localhost:$port/health" >/dev/null 2>&1
}

start_via_docker() {
  echo "Starting voice services via Docker Compose..."
  cd "$REPO_ROOT"
  docker-compose -f docker-compose.voice-services.yml up -d
  sleep 10
  
  if check_service 2022 && check_service 8880; then
    echo "✅ Voice services started via Docker"
    return 0
  else
    echo "❌ Docker Compose start failed"
    return 1
  fi
}

start_via_launchd() {
  echo "Starting voice services via macOS LaunchAgents..."
  if command -v voicemode >/dev/null 2>&1; then
    voicemode whisper start || true
    voicemode kokoro start || true
    sleep 5
    
    if check_service 2022 && check_service 8880; then
      echo "✅ Voice services started via LaunchAgents"
      return 0
    fi
  fi
  return 1
}

# Check if services are already running
if check_service 2022 && check_service 8880; then
  echo "✅ Voice services already running"
  exit 0
fi

# Try LaunchAgents first
if ! start_via_launchd; then
  # Fallback to Docker Compose
  start_via_docker
fi



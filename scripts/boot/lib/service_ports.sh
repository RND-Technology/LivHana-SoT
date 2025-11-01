#!/usr/bin/env bash
# Centralized Service Port Configuration
# Principle of One: Single source of truth for all service ports

# Voice Service
export VOICE_SERVICE_PORT="${VOICE_SERVICE_PORT:-8080}"
export VOICE_SERVICE_URL="http://localhost:${VOICE_SERVICE_PORT}"

# Redis
export REDIS_PORT="${REDIS_PORT:-6379}"
export REDIS_HOST="${REDIS_HOST:-localhost}"
export REDIS_URL="redis://${REDIS_HOST}:${REDIS_PORT}"

# Whisper STT Service
export WHISPER_PORT="${WHISPER_PORT:-2022}"
export WHISPER_SERVICE_URL="http://localhost:${WHISPER_PORT}"

# Vocode/Kokoro TTS Service
export VOCODE_PORT="${VOCODE_PORT:-9001}"
export VOCODE_TTS_URL="http://localhost:${VOCODE_PORT}"
export KOKORO_PORT="${KOKORO_PORT:-8880}"
export KOKORO_TTS_URL="http://localhost:${KOKORO_PORT}"

# Reasoning Gateway
export REASONING_PORT="${REASONING_PORT:-4002}"
export REASONING_GATEWAY_BASE_URL="http://localhost:${REASONING_PORT}"

# Orchestration Service
export ORCHESTRATION_PORT="${ORCHESTRATION_PORT:-4010}"
export ORCHESTRATION_SERVICE_URL="http://localhost:${ORCHESTRATION_PORT}"

# Integration Service
export INTEGRATION_PORT="${INTEGRATION_PORT:-3005}"
export INTEGRATION_SERVICE_URL="http://localhost:${INTEGRATION_PORT}"

# MCP Server
export MCP_PORT="${MCP_PORT:-8765}"
export MCP_SERVER_URL="http://localhost:${MCP_PORT}"

# Health check helper
check_port_available() {
  local port="$1"
  local service_name="${2:-service}"
  
  if lsof -ti :"$port" >/dev/null 2>&1; then
    local existing_pid
    existing_pid=$(lsof -ti :"$port" | head -1)
    local existing_cmd
    existing_cmd=$(ps -p "$existing_pid" -o comm= 2>/dev/null || echo "unknown")
    
    echo "WARNING: Port $port already in use by $existing_cmd (PID $existing_pid)" >&2
    echo "Cannot start $service_name on port $port" >&2
    return 1
  fi
  return 0
}

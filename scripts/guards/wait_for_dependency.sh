#!/usr/bin/env bash
# Wait for Database/Redis Dependencies
# Fixes: Race conditions in service startup

set -euo pipefail

wait_for_dependency() {
  local service="$1"
  local command="$2"
  local max_wait="${3:-30}"
  local interval="${4:-2}"
  local elapsed=0
  
  while [[ $elapsed -lt $max_wait ]]; do
    if eval "$command" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$interval"
    ((elapsed += interval))
  done
  
  return 1
}

wait_for_postgres() {
  local host="${POSTGRES_HOST:-localhost}"
  local port="${POSTGRES_PORT:-5432}"
  local db="${POSTGRES_DB:-postgres}"
  
  wait_for_dependency "PostgreSQL" \
    "PGPASSWORD=\"${POSTGRES_PASSWORD:-}\" pg_isready -h \"$host\" -p \"$port\" -d \"$db\"" \
    "${WAIT_POSTGRES_MAX:-30}" \
    "${WAIT_POSTGRES_INTERVAL:-2}"
}

wait_for_redis() {
  local host="${REDIS_HOST:-localhost}"
  local port="${REDIS_PORT:-6379}"
  
  wait_for_dependency "Redis" \
    "redis-cli -h \"$host\" -p \"$port\" PING" \
    "${WAIT_REDIS_MAX:-30}" \
    "${WAIT_REDIS_INTERVAL:-2}"
}

if [[ "${BASH_SOURCE[0]:-$0}" == "$0" ]]; then
  SERVICE="$1"
  shift
  
  case "$SERVICE" in
    postgres)
      wait_for_postgres "$@"
      ;;
    redis)
      wait_for_redis "$@"
      ;;
    *)
      echo "Usage: $0 {postgres|redis}" >&2
      exit 1
      ;;
  esac
fi


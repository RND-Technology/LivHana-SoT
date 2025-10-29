#!/usr/bin/env bash
set -euo pipefail

REDIS_HOST=${REDIS_HOST:-localhost}
REDIS_PORT=${REDIS_PORT:-6379}
QUEUE_KEY=${QUEUE_KEY:-housekeeping:queue}

echo "Checking housekeeping queue on ${REDIS_HOST}:${REDIS_PORT} (key=${QUEUE_KEY})"

if ! command -v redis-cli >/dev/null 2>&1; then
  echo "redis-cli not found. Install Redis tools or run inside docker-compose environment."
  exit 1
fi

LEN=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" LLEN "$QUEUE_KEY" 2>/dev/null || echo 0)
echo "Queue length: $LEN"

HEAD=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" LINDEX "$QUEUE_KEY" 0 2>/dev/null || true)
if [[ -n "${HEAD:-}" ]]; then
  echo "Head item: ${HEAD:0:160}"
fi

exit 0



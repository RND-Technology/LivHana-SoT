#!/usr/bin/env bash
# RPM Planning Agent Sync
# Notifies planning agent of new seeds/chunks for coordination

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SEEDS_DIR="$ROOT_DIR/rpm/seeds"
CHUNKS_DIR="$ROOT_DIR/rpm/chunks"
PLANNING_INBOX="$ROOT_DIR/tmp/agent_status/shared/planning_inbox.jsonl"

mkdir -p "$(dirname "$PLANNING_INBOX")"

# Send event to planning agent
send_event() {
  local event_type="$1"
  local event_data="$2"

  local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  local event_json=$(cat <<EOF
{
  "timestamp": "${timestamp}",
  "event_type": "${event_type}",
  "source": "rpm_sync",
  "data": ${event_data}
}
EOF
)

  echo "$event_json" >> "$PLANNING_INBOX"
  echo "✅ Event sent to planning agent: ${event_type}"
}

# Sync all new seeds
sync_seeds() {
  local today=$(date +%Y-%m-%d)
  local seeds_today="$SEEDS_DIR/$today"

  if [[ ! -d "$seeds_today" ]]; then
    echo "ℹ️  No seeds to sync"
    return 0
  fi

  local seed_count=0
  for seed_file in "$seeds_today"/*.yaml; do
    [[ -f "$seed_file" ]] || continue

    local seed_id=$(grep "^id:" "$seed_file" | cut -d: -f2 | tr -d ' ')
    local status=$(grep "^Status:" "$seed_file" | cut -d: -f2- | tr -d ' ')
    local what=$(grep "^## WHAT" "$seed_file" -A 1 | tail -1 | tr -d '\n')
    local agent=$(grep "^Agent:" "$seed_file" | cut -d: -f2 | tr -d ' ')

    local event_data=$(cat <<EOF
{
  "seed_id": "${seed_id}",
  "status": "${status}",
  "description": "${what}",
  "agent": "${agent}",
  "file": "${seed_file}"
}
EOF
)

    send_event "dna_seed_update" "$event_data"
    ((seed_count++))
  done

  echo "📤 Synced ${seed_count} DNA seeds"
}

# Sync all chunks
sync_chunks() {
  if [[ ! -d "$CHUNKS_DIR" ]] || [[ -z "$(ls -A "$CHUNKS_DIR" 2>/dev/null)" ]]; then
    echo "ℹ️  No chunks to sync"
    return 0
  fi

  local chunk_count=0
  for chunk_file in "$CHUNKS_DIR"/*.yaml; do
    [[ -f "$chunk_file" ]] || continue

    local chunk_id=$(grep "^id:" "$chunk_file" | cut -d: -f2 | tr -d ' ')
    local status=$(grep "^status:" "$chunk_file" | cut -d: -f2 | tr -d ' ')
    local title=$(grep "^Title:" "$chunk_file" | cut -d: -f2-)
    local seed_count=$(grep -c "^\- \[.\] DNA-" "$chunk_file" || echo 0)

    local event_data=$(cat <<EOF
{
  "chunk_id": "${chunk_id}",
  "status": "${status}",
  "title": "${title}",
  "seed_count": ${seed_count},
  "file": "${chunk_file}"
}
EOF
)

    send_event "rpm_chunk_update" "$event_data"
    ((chunk_count++))
  done

  echo "📤 Synced ${chunk_count} RPM chunks"
}

# Request planning agent action
request_planning() {
  local action="$1"
  local context="$2"

  local event_data=$(cat <<EOF
{
  "action_requested": "${action}",
  "context": "${context}",
  "requester": "claude-code-sheriff"
}
EOF
)

  send_event "planning_request" "$event_data"
  echo "🎯 Planning action requested: ${action}"
}

# Generate daily summary
daily_summary() {
  local today=$(date +%Y-%m-%d)
  local seeds_today="$SEEDS_DIR/$today"

  local total_seeds=0
  local complete_seeds=0

  if [[ -d "$seeds_today" ]]; then
    total_seeds=$(find "$seeds_today" -name "*.yaml" 2>/dev/null | wc -l | tr -d ' ')
    complete_seeds=$(grep -l "Status: ✅ Complete" "$seeds_today"/*.yaml 2>/dev/null | wc -l | tr -d ' ')
  fi

  local total_chunks=0
  if [[ -d "$CHUNKS_DIR" ]]; then
    total_chunks=$(find "$CHUNKS_DIR" -name "*.yaml" 2>/dev/null | wc -l | tr -d ' ')
  fi

  local summary_data=$(cat <<EOF
{
  "date": "${today}",
  "seeds_total": ${total_seeds},
  "seeds_complete": ${complete_seeds},
  "chunks_total": ${total_chunks},
  "sheriff": "claude-code",
  "accountability_status": "maintained"
}
EOF
)

  send_event "daily_summary" "$summary_data"

  echo ""
  echo "📊 DAILY SUMMARY"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Date: ${today}"
  echo "DNA Seeds: ${complete_seeds}/${total_seeds} complete"
  echo "RPM Chunks: ${total_chunks}"
  echo "Sheriff: claude-code (accountable)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Planning agent notified. Ready for coordination."
}

# Main
case "${1:-all}" in
  seeds)
    sync_seeds
    ;;
  chunks)
    sync_chunks
    ;;
  request)
    if [[ -z "${2:-}" ]] || [[ -z "${3:-}" ]]; then
      echo "Usage: sync_to_planning.sh request \"action\" \"context\""
      exit 1
    fi
    request_planning "$2" "$3"
    ;;
  summary)
    daily_summary
    ;;
  all)
    sync_seeds
    sync_chunks
    daily_summary
    ;;
  *)
    echo "Usage: sync_to_planning.sh {seeds|chunks|request|summary|all}"
    exit 1
    ;;
esac

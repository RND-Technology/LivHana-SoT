#!/usr/bin/env bash
# RPM DNA SEED Capture Script
# Captures atomic work units with full context

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SEEDS_DIR="$ROOT_DIR/rpm/seeds"
STATE_FILE="$ROOT_DIR/tmp/rpm_current_seed.json"

mkdir -p "$SEEDS_DIR/$(date +%Y-%m-%d)" "$ROOT_DIR/tmp"

# Generate unique seed ID
generate_seed_id() {
  local timestamp=$(date +%Y%m%d-%H%M)
  local hash=$(echo "$1" | shasum -a 256 | cut -c1-3)
  echo "DNA-${timestamp}-${hash}"
}

# Start a new seed
start_seed() {
  local description="$1"
  local agent="${2:-claude-code}"
  local seed_id=$(generate_seed_id "$description")
  local seed_file="$SEEDS_DIR/$(date +%Y-%m-%d)/${seed_id}.yaml"
  local start_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  cat > "$seed_file" << EOF
---
type: dna_seed
id: ${seed_id}
timestamp: ${start_time}
status: in_progress
---

## WHAT
${description}

## WHY
[To be filled on completion]

## WHO
Agent: ${agent}
Human: Jesse

## WHEN
Started: ${start_time}
Completed: [in progress]
Duration: [calculating...]

## WHERE
Files:
  [To be captured on completion]

## HOW
Method: [To be filled]
Tools: [To be captured]
Commands:
  \`\`\`bash
  # Commands will be captured
  \`\`\`

## RESULT
Status: 🔄 In Progress
Output: [Working...]

## NEXT
Enables:
  [To be determined]

Blocks:
  [To be determined]

## LINKS
Parent Chunk: [Auto-detected]
Related Seeds: [Auto-linked]
RPM Tree: [Current week]
EOF

  # Save current seed state
  cat > "$STATE_FILE" << EOF
{
  "seed_id": "${seed_id}",
  "seed_file": "${seed_file}",
  "description": "${description}",
  "agent": "${agent}",
  "start_time": "${start_time}",
  "files_before": $(git -C "$ROOT_DIR" ls-files | jq -R -s -c 'split("\n")[:-1]')
}
EOF

  echo "✅ DNA SEED started: ${seed_id}"
  echo "📝 Description: ${description}"
  echo "🤖 Agent: ${agent}"
  echo ""
  echo "Continue working... call 'capture_seed.sh complete ${seed_id}' when done."
}

# Complete a seed
complete_seed() {
  local seed_id="$1"
  local why="${2:-Strategic work toward LivHana SoT excellence}"

  if [[ ! -f "$STATE_FILE" ]]; then
    echo "❌ No active seed found. Start one first with: capture_seed.sh start \"description\""
    exit 1
  fi

  local state=$(cat "$STATE_FILE")
  local seed_file=$(echo "$state" | jq -r '.seed_file')
  local start_time=$(echo "$state" | jq -r '.start_time')
  local end_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  local description=$(echo "$state" | jq -r '.description')

  # Calculate duration
  local start_sec=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$start_time" +%s 2>/dev/null || echo 0)
  local end_sec=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$end_time" +%s 2>/dev/null || echo 0)
  local duration=$((end_sec - start_sec))
  local duration_min=$((duration / 60))
  local duration_sec=$((duration % 60))

  # Detect changed files
  local files_before=$(echo "$state" | jq -r '.files_before')
  local files_after=$(git -C "$ROOT_DIR" ls-files | jq -R -s -c 'split("\n")[:-1]')
  local changed_files=$(git -C "$ROOT_DIR" status --porcelain | awk '{print $2}' | jq -R -s -c 'split("\n")[:-1]')

  # Update seed file
  local temp_file="${seed_file}.tmp"
  awk -v end="$end_time" -v dur="${duration_min}m ${duration_sec}s" -v why="$why" -v changed="$changed_files" '
    /^Completed: \[in progress\]/ { print "Completed: " end; next }
    /^Duration: \[calculating\.\.\.\]/ { print "Duration: " dur; next }
    /^\[To be filled on completion\]/ && !done { print why; done=1; next }
    /^Status: 🔄 In Progress/ { print "Status: ✅ Complete"; next }
    { print }
  ' "$seed_file" > "$temp_file"

  # Add changed files if any
  if [[ "$changed_files" != "[]" ]]; then
    echo "$changed_files" | jq -r '.[]' | while read -r file; do
      if [[ -n "$file" ]]; then
        local action="modified"
        if [[ ! -f "$ROOT_DIR/$file" ]]; then
          action="deleted"
        elif ! echo "$files_before" | jq -e ".[] | select(. == \"$file\")" >/dev/null 2>&1; then
          action="created"
        fi
        sed -i '' "s|Files:|Files:\n  - $file ($action)|" "$temp_file"
      fi
    done
  fi

  mv "$temp_file" "$seed_file"
  rm "$STATE_FILE"

  echo "✅ DNA SEED completed: ${seed_id}"
  echo "⏱️  Duration: ${duration_min}m ${duration_sec}s"
  echo "📄 Captured: $(echo "$changed_files" | jq '. | length') files"
  echo ""
  echo "Next: Run 'chunk_seeds.sh auto' to group related seeds"
}

# Show current seed status
status_seed() {
  if [[ ! -f "$STATE_FILE" ]]; then
    echo "ℹ️  No active seed"
    exit 0
  fi

  local state=$(cat "$STATE_FILE")
  local seed_id=$(echo "$state" | jq -r '.seed_id')
  local description=$(echo "$state" | jq -r '.description')
  local start_time=$(echo "$state" | jq -r '.start_time')
  local agent=$(echo "$state" | jq -r '.agent')

  echo "🔄 Active DNA SEED: ${seed_id}"
  echo "📝 Description: ${description}"
  echo "🤖 Agent: ${agent}"
  echo "⏰ Started: ${start_time}"
  echo ""
  echo "Complete with: capture_seed.sh complete ${seed_id} \"business value reason\""
}

# Main
case "${1:-status}" in
  start)
    if [[ -z "${2:-}" ]]; then
      echo "Usage: capture_seed.sh start \"description\" [agent]"
      exit 1
    fi
    start_seed "$2" "${3:-claude-code}"
    ;;
  complete)
    if [[ -z "${2:-}" ]]; then
      echo "Usage: capture_seed.sh complete SEED-ID \"why this matters\""
      exit 1
    fi
    complete_seed "$2" "${3:-Strategic work toward LivHana SoT excellence}"
    ;;
  status)
    status_seed
    ;;
  *)
    echo "Usage: capture_seed.sh {start|complete|status}"
    exit 1
    ;;
esac

#!/usr/bin/env bash
# RPM Chunking Script
# Groups related DNA SEEDs into tactical chunks

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SEEDS_DIR="$ROOT_DIR/rpm/seeds"
CHUNKS_DIR="$ROOT_DIR/rpm/chunks"

mkdir -p "$CHUNKS_DIR"

# Auto-detect related seeds and create chunk
auto_chunk() {
  local today=$(date +%Y-%m-%d)
  local seeds_today="$SEEDS_DIR/$today"

  if [[ ! -d "$seeds_today" ]]; then
    echo "ℹ️  No seeds found for today"
    exit 0
  fi

  # Find all complete seeds from today
  local complete_seeds=()
  for seed_file in "$seeds_today"/*.yaml; do
    if grep -q "Status: ✅ Complete" "$seed_file" 2>/dev/null; then
      complete_seeds+=("$seed_file")
    fi
  done

  if [[ ${#complete_seeds[@]} -eq 0 ]]; then
    echo "ℹ️  No completed seeds to chunk"
    exit 0
  fi

  echo "🔍 Found ${#complete_seeds[@]} completed seeds today"
  echo "📦 Creating chunk..."

  # Extract common theme from seeds
  local theme="work"
  if [[ ${#complete_seeds[@]} -gt 0 ]]; then
    # Extract first WHAT line as theme hint
    theme=$(grep "^## WHAT" "${complete_seeds[0]}" -A 1 | tail -1 | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | cut -c1-30)
  fi

  # Generate chunk ID
  local timestamp=$(date +%Y%m%d-%H%M)
  local chunk_id="CHUNK-${timestamp}-${theme}"
  local chunk_file="$CHUNKS_DIR/${chunk_id}.yaml"

  # Create chunk
  cat > "$chunk_file" << EOF
---
type: rpm_chunk
id: ${chunk_id}
timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
status: complete
---

## CHUNK IDENTITY
Title: Today's Work - $(date +%Y-%m-%d)
Context: Automated chunking of completed DNA seeds
Owner: claude-code (Sheriff)
Priority: P1

## SCOPE
Goal: Complete all planned work for today
Duration: Full session
Complexity: Medium

## DNA SEEDS (Work Units)
EOF

  # Add all seeds
  for seed_file in "${complete_seeds[@]}"; do
    local seed_id=$(basename "$seed_file" .yaml)
    local what=$(grep "^## WHAT" "$seed_file" -A 1 | tail -1)
    echo "- [x] ${seed_id}: ${what}" >> "$chunk_file"
  done

  cat >> "$chunk_file" << EOF

## DEPENDENCIES
Requires:
  - Previous day's work

Enables:
  - Tomorrow's planning
  - Weekly review aggregation

## SUCCESS CRITERIA
- [x] All seeds captured with full context
- [x] Files documented
- [x] Timing recorded
- [x] Business value stated

## LINKS
RPM Tree: TREE-$(date +%Y)-W$(date +%W)-current-week
Related Chunks: [Auto-linked by planning agent]
EOF

  echo "✅ Chunk created: ${chunk_id}"
  echo "📄 File: ${chunk_file}"
  echo "🌳 Seeds grouped: ${#complete_seeds[@]}"
  echo ""
  echo "Next: Run 'sync_to_planning.sh' to notify planning agent"
}

# Manual chunk creation
manual_chunk() {
  local title="$1"
  local seed_ids="${@:2}"

  if [[ -z "$title" ]] || [[ -z "$seed_ids" ]]; then
    echo "Usage: chunk_seeds.sh manual \"Chunk Title\" SEED-ID1 SEED-ID2 ..."
    exit 1
  fi

  local timestamp=$(date +%Y%m%d-%H%M)
  local theme=$(echo "$title" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | cut -c1-30)
  local chunk_id="CHUNK-${timestamp}-${theme}"
  local chunk_file="$CHUNKS_DIR/${chunk_id}.yaml"

  cat > "$chunk_file" << EOF
---
type: rpm_chunk
id: ${chunk_id}
timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
status: complete
---

## CHUNK IDENTITY
Title: ${title}
Context: Manually grouped related work
Owner: claude-code (Sheriff)
Priority: P1

## SCOPE
Goal: Group related DNA seeds for planning
Duration: Calculated from seeds
Complexity: Medium

## DNA SEEDS (Work Units)
EOF

  for seed_id in $seed_ids; do
    echo "- [x] ${seed_id}: [Description from seed file]" >> "$chunk_file"
  done

  cat >> "$chunk_file" << EOF

## DEPENDENCIES
Requires:
  - [Context-specific]

Enables:
  - [Context-specific]

## SUCCESS CRITERIA
- [x] Seeds logically grouped
- [x] Related work bundled
- [x] Ready for tree integration

## LINKS
RPM Tree: TREE-$(date +%Y)-W$(date +%W)-current-week
Related Chunks: [To be determined]
EOF

  echo "✅ Chunk created: ${chunk_id}"
  echo "📄 File: ${chunk_file}"
}

# List all chunks
list_chunks() {
  if [[ ! -d "$CHUNKS_DIR" ]] || [[ -z "$(ls -A "$CHUNKS_DIR" 2>/dev/null)" ]]; then
    echo "ℹ️  No chunks created yet"
    exit 0
  fi

  echo "📦 RPM CHUNKS:"
  echo ""
  for chunk_file in "$CHUNKS_DIR"/*.yaml; do
    local chunk_id=$(grep "^id:" "$chunk_file" | cut -d: -f2 | tr -d ' ')
    local title=$(grep "^Title:" "$chunk_file" | cut -d: -f2-)
    local status=$(grep "^status:" "$chunk_file" | cut -d: -f2 | tr -d ' ')
    local seed_count=$(grep -c "^\- \[.\] DNA-" "$chunk_file" || echo 0)

    echo "  ${chunk_id}"
    echo "    Title: ${title}"
    echo "    Status: ${status}"
    echo "    Seeds: ${seed_count}"
    echo ""
  done
}

# Main
case "${1:-auto}" in
  auto)
    auto_chunk
    ;;
  manual)
    manual_chunk "${@:2}"
    ;;
  list)
    list_chunks
    ;;
  *)
    echo "Usage: chunk_seeds.sh {auto|manual|list}"
    exit 1
    ;;
esac

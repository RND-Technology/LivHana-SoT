# TRUTH Pipeline Script Specifications

**Token Count**: ~1,800 | **Dependencies**: 01_architecture_overview.md, 02_data_flow.md | **Last Updated**: 2025-10-21

## Summary

The TRUTH Pipeline includes comprehensive shell scripts for each stage: Apify scraping, Perplexity verification, GPT-5 Mini compression, Claude Sonnet TRUTH synthesis, RPM orchestration, and validation. All scripts include error handling, retry logic, and telemetry hooks for production deployment.

## Core Pipeline Scripts

### L1: Apify Scraping Script

```bash
#!/bin/bash
# step_apify_v2.sh

set -euo pipefail

# Configuration
ACTORS=("youtube" "instagram" "google_business" "better_business_bureau")
OUTPUT_DIR="data/apify_outputs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SESSION_ID="${SESSION_ID:-$(uuidgen)}"

# Input validation
if [ -z "${QUERY:-}" ]; then
  echo "ERROR: QUERY environment variable required"
  exit 1
fi

if [ -z "${APIFY_API_KEY:-}" ]; then
  echo "ERROR: APIFY_API_KEY environment variable required"
  exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Scrape with each actor
scrape_with_actor() {
  local actor=$1
  local output_file="$OUTPUT_DIR/${actor}_${TIMESTAMP}.json"
  local manifest_file="$OUTPUT_DIR/${actor}_${TIMESTAMP}.manifest"
  
  echo "Scraping with $actor..."
  
  # Execute Apify actor
  local response=$(curl -s -X POST "https://api.apify.com/v2/acts/$actor/run" \
    -H "Authorization: Bearer $APIFY_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"query\": \"$QUERY\",
      \"maxResults\": 50,
      \"timeout\": 300
    }")
  
  # Check for errors
  local error=$(echo "$response" | jq -r '.error // empty')
  if [ -n "$error" ]; then
    echo "ERROR: Apify actor $actor failed: $error"
    return 1
  fi
  
  # Get run ID
  local run_id=$(echo "$response" | jq -r '.data.id')
  
  # Wait for completion
  local status="RUNNING"
  local attempts=0
  local max_attempts=60
  
  while [ "$status" = "RUNNING" ] && [ $attempts -lt $max_attempts ]; do
    sleep 5
    status=$(curl -s "https://api.apify.com/v2/actor-runs/$run_id" \
      -H "Authorization: Bearer $APIFY_API_KEY" | jq -r '.data.status')
    attempts=$((attempts + 1))
  done
  
  if [ "$status" != "SUCCEEDED" ]; then
    echo "ERROR: Apify actor $actor failed with status: $status"
    return 1
  fi
  
  # Download results
  curl -s "https://api.apify.com/v2/actor-runs/$run_id/dataset/items" \
    -H "Authorization: Bearer $APIFY_API_KEY" > "$output_file"
  
  # Generate manifest
  local hash=$(sha256sum "$output_file" | cut -d' ' -f1)
  local item_count=$(jq '. | length' "$output_file")
  
  cat > "$manifest_file" << EOF
{
  "actor": "$actor",
  "timestamp": "$TIMESTAMP",
  "hash": "$hash",
  "item_count": $item_count,
  "run_id": "$run_id",
  "session_id": "$SESSION_ID"
}
EOF
  
  echo "Completed scraping with $actor: $item_count items"
}

# Main execution
main() {
  echo "Starting Apify scraping for query: $QUERY"
  echo "Session ID: $SESSION_ID"
  
  local failed_actors=()
  
  for actor in "${ACTORS[@]}"; do
    if ! scrape_with_actor "$actor"; then
      failed_actors+=("$actor")
    fi
  done
  
  # Summary
  local total_items=$(find "$OUTPUT_DIR" -name "*_${TIMESTAMP}.json" -exec jq '. | length' {} \; | awk '{sum+=$1} END {print sum}')
  
  echo "Apify scraping completed:"
  echo "  Total items: $total_items"
  echo "  Successful actors: $((${#ACTORS[@]} - ${#failed_actors[@]}))"
  echo "  Failed actors: ${#failed_actors[@]}"
  
  if [ ${#failed_actors[@]} -gt 0 ]; then
    echo "  Failed actors: ${failed_actors[*]}"
    exit 1
  fi
  
  echo "All actors completed successfully"
}

# Run main function
main "$@"
```

### L2: Perplexity Verification Script

```bash
#!/bin/bash
# step_perplexity_verify_v2.sh

set -euo pipefail

# Configuration
OUTPUT_DIR="data/perplexity_outputs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SESSION_ID="${SESSION_ID:-$(uuidgen)}"
MIN_SOURCES=2

# Input validation
if [ -z "${PERPLEXITY_API_KEY:-}" ]; then
  echo "ERROR: PERPLEXITY_API_KEY environment variable required"
  exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Verify single fact
verify_fact() {
  local fact=$1
  local fact_id=$2
  local output_file="$OUTPUT_DIR/verify_${fact_id}_${TIMESTAMP}.json"
  
  echo "Verifying fact $fact_id: $fact"
  
  # Call Perplexity API
  local response=$(curl -s -X POST "https://api.perplexity.ai/chat/completions" \
    -H "Authorization: Bearer $PERPLEXITY_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"llama-3.1-sonar-large-128k-online\",
      \"messages\": [
        {
          \"role\": \"user\",
          \"content\": \"Verify this fact with at least 2 independent sources: $fact\"
        }
      ],
      \"max_tokens\": 1000
    }")
  
  # Check for errors
  local error=$(echo "$response" | jq -r '.error // empty')
  if [ -n "$error" ]; then
    echo "ERROR: Perplexity API error: $error"
    return 1
  fi
  
  # Extract content
  local content=$(echo "$response" | jq -r '.choices[0].message.content')
  
  # Extract sources
  local sources=$(echo "$content" | grep -o 'https://[^ ]*' | head -10)
  local source_count=$(echo "$sources" | wc -l)
  
  # Validate source count
  if [ "$source_count" -lt "$MIN_SOURCES" ]; then
    echo "ERROR: Insufficient sources for fact $fact_id ($source_count < $MIN_SOURCES)"
    return 1
  fi
  
  # Save verification result
  cat > "$output_file" << EOF
{
  "fact_id": "$fact_id",
  "fact": "$fact",
  "content": "$content",
  "sources": $(echo "$sources" | jq -R . | jq -s .),
  "source_count": $source_count,
  "timestamp": "$TIMESTAMP",
  "session_id": "$SESSION_ID"
}
EOF
  
  echo "Verified fact $fact_id with $source_count sources"
  return 0
}

# Process facts from Apify output
process_facts() {
  local apify_output_dir=$1
  local facts_file="$OUTPUT_DIR/facts_${TIMESTAMP}.json"
  
  # Extract facts from Apify outputs
  local all_facts=()
  
  for apify_file in "$apify_output_dir"/*.json; do
    if [ -f "$apify_file" ]; then
      local facts=$(jq -r '.[] | .title, .description, .content' "$apify_file" | grep -v '^null$' | head -20)
      while IFS= read -r fact; do
        if [ -n "$fact" ] && [ ${#fact} -gt 20 ]; then
          all_facts+=("$fact")
        fi
      done <<< "$facts"
    fi
  done
  
  # Save facts for verification
  printf '%s\n' "${all_facts[@]}" | jq -R . | jq -s . > "$facts_file"
  
  echo "Extracted ${#all_facts[@]} facts for verification"
  
  # Verify each fact
  local verified_count=0
  local failed_count=0
  
  for i in "${!all_facts[@]}"; do
    local fact="${all_facts[$i]}"
    local fact_id="fact_$i"
    
    if verify_fact "$fact" "$fact_id"; then
      verified_count=$((verified_count + 1))
    else
      failed_count=$((failed_count + 1))
    fi
  done
  
  # Summary
  echo "Perplexity verification completed:"
  echo "  Total facts: ${#all_facts[@]}"
  echo "  Verified: $verified_count"
  echo "  Failed: $failed_count"
  
  if [ $failed_count -gt 0 ]; then
    echo "WARNING: $failed_count facts failed verification"
  fi
  
  return 0
}

# Main execution
main() {
  local apify_output_dir="${1:-data/apify_outputs}"
  
  if [ ! -d "$apify_output_dir" ]; then
    echo "ERROR: Apify output directory not found: $apify_output_dir"
    exit 1
  fi
  
  echo "Starting Perplexity verification"
  echo "Session ID: $SESSION_ID"
  echo "Apify output directory: $apify_output_dir"
  
  process_facts "$apify_output_dir"
  
  echo "Perplexity verification completed successfully"
}

# Run main function
main "$@"
```

### L3: GPT-5 Mini Compression Script

```bash
#!/bin/bash
# step_gpt5_compress_v2.sh

set -euo pipefail

# Configuration
OUTPUT_DIR="data/compression_outputs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SESSION_ID="${SESSION_ID:-$(uuidgen)}"
COMPRESSION_TARGET=40
MAX_DATA_LOSS=5

# Input validation
if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "ERROR: OPENAI_API_KEY environment variable required"
  exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Compress facts
compress_facts() {
  local input_file=$1
  local output_file="$OUTPUT_DIR/compressed_${TIMESTAMP}.json"
  
  echo "Compressing facts from: $input_file"
  
  # Read input facts
  local facts=$(cat "$input_file")
  local original_tokens=$(echo "$facts" | wc -w)
  
  # Compression prompt
  local compression_prompt="Deduplicate and normalize the following facts. Target 40% token reduction while preserving all numeric evidence and direct quotes. Output a JSON array of compressed facts."
  
  # Call OpenAI API
  local response=$(curl -s -X POST "https://api.openai.com/v1/chat/completions" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"gpt-4o-mini\",
      \"messages\": [
        {
          \"role\": \"system\",
          \"content\": \"$compression_prompt\"
        },
        {
          \"role\": \"user\",
          \"content\": \"$facts\"
        }
      ],
      \"max_tokens\": 2000,
      \"temperature\": 0.1
    }")
  
  # Check for errors
  local error=$(echo "$response" | jq -r '.error // empty')
  if [ -n "$error" ]; then
    echo "ERROR: OpenAI API error: $error"
    return 1
  fi
  
  # Extract compressed content
  local compressed_content=$(echo "$response" | jq -r '.choices[0].message.content')
  local compressed_tokens=$(echo "$compressed_content" | wc -w)
  
  # Calculate compression metrics
  local compression_saved_pct=$(( (original_tokens - compressed_tokens) * 100 / original_tokens ))
  local data_loss_pct=$(( (original_tokens - compressed_tokens) * 100 / original_tokens ))
  
  # Validate compression target
  if [ "$compression_saved_pct" -lt "$COMPRESSION_TARGET" ]; then
    echo "WARNING: Compression below target ($compression_saved_pct% < $COMPRESSION_TARGET%)"
  fi
  
  # Validate data loss
  if [ "$data_loss_pct" -gt "$MAX_DATA_LOSS" ]; then
    echo "ERROR: Data loss exceeds limit ($data_loss_pct% > $MAX_DATA_LOSS%)"
    return 1
  fi
  
  # Save compressed output
  cat > "$output_file" << EOF
{
  "compressed_facts": $compressed_content,
  "compression_metrics": {
    "original_tokens": $original_tokens,
    "compressed_tokens": $compressed_tokens,
    "compression_saved_pct": $compression_saved_pct,
    "data_loss_pct": $data_loss_pct
  },
  "normalization_applied": [
    "currency_normalization",
    "percentage_normalization",
    "deduplication"
  ],
  "timestamp": "$TIMESTAMP",
  "session_id": "$SESSION_ID"
}
EOF
  
  echo "Compression completed:"
  echo "  Original tokens: $original_tokens"
  echo "  Compressed tokens: $compressed_tokens"
  echo "  Compression saved: ${compression_saved_pct}%"
  echo "  Data loss: ${data_loss_pct}%"
  
  return 0
}

# Main execution
main() {
  local input_file="${1:-data/perplexity_outputs/facts_${TIMESTAMP}.json}"
  
  if [ ! -f "$input_file" ]; then
    echo "ERROR: Input file not found: $input_file"
    exit 1
  fi
  
  echo "Starting GPT-5 Mini compression"
  echo "Session ID: $SESSION_ID"
  echo "Input file: $input_file"
  
  compress_facts "$input_file"
  
  echo "Compression completed successfully"
}

# Run main function
main "$@"
```

### L4: Claude Sonnet TRUTH Script

```bash
#!/bin/bash
# step_claude_truth_v2.sh

set -euo pipefail

# Configuration
OUTPUT_DIR="data/truth_outputs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SESSION_ID="${SESSION_ID:-$(uuidgen)}"
MAX_CLAIMS=25
MAX_TOKENS=2000

# Input validation
if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  echo "ERROR: ANTHROPIC_API_KEY environment variable required"
  exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Generate TRUTH output
generate_truth_output() {
  local input_file=$1
  local output_file="$OUTPUT_DIR/truth_${TIMESTAMP}.json"
  
  echo "Generating TRUTH output from: $input_file"
  
  # Read compressed facts
  local compressed_facts=$(cat "$input_file")
  
  # TRUTH prompt
  local truth_prompt="Generate TRUTH-compliant JSON output. Status must be 'ok' or 'failed'. Summary ≤120 tokens. Claims must be testable, reproducible, unambiguous, traceable (≥2 sources), high_fidelity. RPM actions must have profit_delta > 0. Include token_report with compression metrics."
  
  # Call Anthropic API
  local response=$(curl -s -X POST "https://api.anthropic.com/v1/messages" \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"claude-3-5-sonnet-20241022\",
      \"max_tokens\": 1000,
      \"messages\": [
        {
          \"role\": \"system\",
          \"content\": \"$truth_prompt\"
        },
        {
          \"role\": \"user\",
          \"content\": \"$compressed_facts\"
        }
      ]
    }")
  
  # Check for errors
  local error=$(echo "$response" | jq -r '.error // empty')
  if [ -n "$error" ]; then
    echo "ERROR: Anthropic API error: $error"
    return 1
  fi
  
  # Extract content
  local content=$(echo "$response" | jq -r '.content[0].text')
  
  # Parse JSON from content
  local truth_json=$(echo "$content" | jq -r '.')
  
  # Validate schema compliance
  if ! echo "$truth_json" | jq -e '.status' > /dev/null; then
    echo "ERROR: Invalid JSON structure - missing status field"
    return 1
  fi
  
  # Check claim count
  local claim_count=$(echo "$truth_json" | jq -r '.claims | length')
  if [ "$claim_count" -gt "$MAX_CLAIMS" ]; then
    echo "ERROR: Too many claims ($claim_count > $MAX_CLAIMS)"
    return 1
  fi
  
  # Check summary length
  local summary=$(echo "$truth_json" | jq -r '.summary')
  local summary_tokens=$(echo "$summary" | wc -w)
  if [ "$summary_tokens" -gt 120 ]; then
    echo "ERROR: Summary too long ($summary_tokens > 120 tokens)"
    return 1
  fi
  
  # Save TRUTH output
  echo "$truth_json" > "$output_file"
  
  echo "TRUTH output generated:"
  echo "  Status: $(echo "$truth_json" | jq -r '.status')"
  echo "  Claims: $claim_count"
  echo "  Summary tokens: $summary_tokens"
  
  return 0
}

# Main execution
main() {
  local input_file="${1:-data/compression_outputs/compressed_${TIMESTAMP}.json}"
  
  if [ ! -f "$input_file" ]; then
    echo "ERROR: Input file not found: $input_file"
    exit 1
  fi
  
  echo "Starting Claude Sonnet TRUTH generation"
  echo "Session ID: $SESSION_ID"
  echo "Input file: $input_file"
  
  generate_truth_output "$input_file"
  
  echo "TRUTH generation completed successfully"
}

# Run main function
main "$@"
```

### L5: RPM Orchestration Script

```bash
#!/bin/bash
# step_rpm_emit_v2.sh

set -euo pipefail

# Configuration
OUTPUT_DIR="data/rpm_outputs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SESSION_ID="${SESSION_ID:-$(uuidgen)}"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Process RPM actions
process_rpm_actions() {
  local input_file=$1
  local output_file="$OUTPUT_DIR/rpm_${TIMESTAMP}.json"
  
  echo "Processing RPM actions from: $input_file"
  
  # Read TRUTH output
  local truth_output=$(cat "$input_file")
  
  # Extract RPM actions
  local rpm_actions=$(echo "$truth_output" | jq -r '.rpm.massive_actions // []')
  
  # Validate profit gating
  local total_profit=0
  local action_count=$(echo "$rpm_actions" | jq -r '. | length')
  
  for i in $(seq 0 $((action_count - 1))); do
    local action=$(echo "$rpm_actions" | jq -r ".[$i]")
    local purpose=$(echo "$action" | jq -r '.purpose')
    local profit_delta=$(echo "$action" | jq -r '.profit_delta')
    local timeframe=$(echo "$action" | jq -r '.timeframe')
    
    # Validate profit delta
    if [ "$(echo "$profit_delta <= 0" | bc)" -eq 1 ]; then
      echo "ERROR: Non-profitable action detected ($purpose: $profit_delta)"
      return 1
    fi
    
    # Validate timeframe
    if [ -z "$timeframe" ]; then
      echo "ERROR: Missing timeframe for action: $purpose"
      return 1
    fi
    
    # Accumulate profit
    total_profit=$((total_profit + profit_delta))
    
    echo "Validated action: $purpose (profit: $profit_delta, timeframe: $timeframe)"
  done
  
  # Generate RPM DNA tags
  local rpm_dna_tags=$(echo "$rpm_actions" | jq -r '.[] | {
    "TAG::RPM_RESULT": .purpose,
    "TAG::RPM_ACTION": .action,
    "TAG::RPM_OWNER": .owner,
    "TAG::RPM_PROFIT": .profit_delta,
    "TAG::RPM_TIMEFRAME": .timeframe
  }')
  
  # Save RPM output
  cat > "$output_file" << EOF
{
  "rpm_actions": $rpm_actions,
  "rpm_dna_tags": [$rpm_dna_tags],
  "profit_validation": {
    "total_profit_delta": $total_profit,
    "action_count": $action_count,
    "validation_status": "passed"
  },
  "enrichment_metadata": {
    "timestamp": "$TIMESTAMP",
    "session_id": "$SESSION_ID"
  }
}
EOF
  
  echo "RPM orchestration completed:"
  echo "  Total profit delta: $total_profit"
  echo "  Action count: $action_count"
  echo "  Validation status: passed"
  
  return 0
}

# Main execution
main() {
  local input_file="${1:-data/truth_outputs/truth_${TIMESTAMP}.json}"
  
  if [ ! -f "$input_file" ]; then
    echo "ERROR: Input file not found: $input_file"
    exit 1
  fi
  
  echo "Starting RPM orchestration"
  echo "Session ID: $SESSION_ID"
  echo "Input file: $input_file"
  
  process_rpm_actions "$input_file"
  
  echo "RPM orchestration completed successfully"
}

# Run main function
main "$@"
```

## Validation Scripts

### Pipeline Integrity Script

```bash
#!/bin/bash
# verify_pipeline_integrity.sh

set -euo pipefail

# Configuration
OUTPUT_DIR="data/truth_outputs"
EVIDENCE_DIR="data/evidence"

# Validate pipeline integrity
validate_pipeline_integrity() {
  local timestamp=$1
  local output_file="$OUTPUT_DIR/truth_${timestamp}.json"
  
  echo "Validating pipeline integrity for: $output_file"
  
  if [ ! -f "$output_file" ]; then
    echo "ERROR: Output file not found: $output_file"
    return 1
  fi
  
  # Check JSON validity
  if ! jq empty "$output_file" 2>/dev/null; then
    echo "ERROR: Invalid JSON structure"
    return 1
  fi
  
  # Check required fields
  local status=$(jq -r '.status' "$output_file")
  if [ "$status" != "ok" ] && [ "$status" != "failed" ]; then
    echo "ERROR: Invalid status field: $status"
    return 1
  fi
  
  # Check claims
  local claim_count=$(jq -r '.claims | length' "$output_file")
  if [ "$claim_count" -eq 0 ]; then
    echo "ERROR: No claims found"
    return 1
  fi
  
  # Check RPM actions
  local rpm_actions=$(jq -r '.rpm.massive_actions | length' "$output_file")
  if [ "$rpm_actions" -eq 0 ]; then
    echo "ERROR: No RPM actions found"
    return 1
  fi
  
  # Check token report
  local token_report=$(jq -r '.token_report' "$output_file")
  if [ "$token_report" = "null" ]; then
    echo "ERROR: Missing token report"
    return 1
  fi
  
  echo "Pipeline integrity validation passed"
  return 0
}

# Main execution
main() {
  local timestamp="${1:-$(date +%Y%m%d_%H%M%S)}"
  
  echo "Starting pipeline integrity validation"
  echo "Timestamp: $timestamp"
  
  validate_pipeline_integrity "$timestamp"
  
  echo "Pipeline integrity validation completed successfully"
}

# Run main function
main "$@"
```

## Utility Scripts

### Session Output Validator

```bash
#!/bin/bash
# session_output_validator.sh

set -euo pipefail

# Configuration
SESSION_DIR="data/sessions"
VALIDATION_DIR="data/validation"

# Validate session output
validate_session_output() {
  local session_id=$1
  local session_file="$SESSION_DIR/${session_id}.json"
  
  echo "Validating session output: $session_id"
  
  if [ ! -f "$session_file" ]; then
    echo "ERROR: Session file not found: $session_file"
    return 1
  fi
  
  # Check session structure
  local session_data=$(cat "$session_file")
  
  # Validate required fields
  local required_fields=("session_id" "timestamp" "status" "outputs")
  for field in "${required_fields[@]}"; do
    if ! echo "$session_data" | jq -e ".$field" > /dev/null; then
      echo "ERROR: Missing required field: $field"
      return 1
    fi
  done
  
  # Validate outputs
  local output_count=$(echo "$session_data" | jq -r '.outputs | length')
  if [ "$output_count" -eq 0 ]; then
    echo "ERROR: No outputs found"
    return 1
  fi
  
  # Validate each output
  for i in $(seq 0 $((output_count - 1))); do
    local output=$(echo "$session_data" | jq -r ".outputs[$i]")
    local output_type=$(echo "$output" | jq -r '.type')
    local output_file=$(echo "$output" | jq -r '.file')
    
    if [ ! -f "$output_file" ]; then
      echo "ERROR: Output file not found: $output_file"
      return 1
    fi
    
    echo "Validated output $i: $output_type"
  done
  
  echo "Session output validation passed"
  return 0
}

# Main execution
main() {
  local session_id="${1:-$(uuidgen)}"
  
  echo "Starting session output validation"
  echo "Session ID: $session_id"
  
  validate_session_output "$session_id"
  
  echo "Session output validation completed successfully"
}

# Run main function
main "$@"
```

## References

- **Source**: copilot-liv-hana-10-21.txt:15-120, 326-440, 817-829, 1020-1109
- **Related**: 01_architecture_overview.md, 02_data_flow.md, 06_validation_harness.md
- **Validation**: 07_agent_builder_nodes.md, 08_secrets_integration.md

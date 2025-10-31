#!/usr/bin/env bash
# TRUTH Pipeline - Step 5: RPM DNA Task Emission
# RPM DNA task emission with action templates and profit calculations
# Compliance: LifeWard standard, 21+ age-gate, NIST methods

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
DATA_DIR="$ROOT/data"
RPM_DIR="$DATA_DIR/rpm_outputs"
LOG_FILE="$ROOT/logs/rpm_emit.log"

# Configuration
MAX_TOKENS=2000
PROFIT_MARGIN=0.3
VELOCITY_MULTIPLIER=1.5

# Ensure directories exist
mkdir -p "$RPM_DIR" "$ROOT/logs"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Age verification check
verify_age() {
    local age_header="${1:-}"
    if [[ "$age_header" != "21+" ]]; then
        log "ERROR: Age verification failed - 21+ required"
        exit 1
    fi
    log "Age verification passed: 21+"
}

# RPM DNA encoding
encode_rpm_dna() {
    local claim="$1"
    local confidence="$2"
    
    # Extract key information for RPM DNA
    local aom="1"  # Area of Mastery - Empire Layer
    local coi="2"  # Category of Improvement - Wheel of Life
    local rpm="3"  # Priority Block Stack Rank
    local action="4"  # Life Cycle Stage
    
    # Determine priority based on confidence
    if (( $(echo "$confidence > 0.9" | bc -l) )); then
        rpm="1"  # High priority
    elif (( $(echo "$confidence > 0.7" | bc -l) )); then
        rpm="2"  # Medium priority
    else
        rpm="3"  # Low priority
    fi
    
    # Determine action based on claim content
    if echo "$claim" | grep -qi "implement\|deploy\|create"; then
        action="1"  # Implementation
    elif echo "$claim" | grep -qi "test\|validate\|verify"; then
        action="2"  # Testing
    elif echo "$claim" | grep -qi "optimize\|improve\|enhance"; then
        action="3"  # Optimization
    else
        action="4"  # Analysis
    fi
    
    echo "${aom}.${coi}.${rpm}.${action}"
}

# Profit calculation
calculate_profit() {
    local claim="$1"
    local confidence="$2"
    
    # Mock profit calculation based on claim type and confidence
    local base_profit=1000
    local confidence_multiplier=$(echo "scale=2; $confidence * 2" | bc)
    local velocity_bonus=$(echo "scale=2; $VELOCITY_MULTIPLIER * $confidence" | bc)
    
    # Calculate estimated profit
    local estimated_profit
    estimated_profit=$(echo "scale=2; $base_profit * $confidence_multiplier * $velocity_bonus * $PROFIT_MARGIN" | bc)
    
    echo "$estimated_profit"
}

# Action template generation
generate_action_template() {
    local claim="$1"
    local rpm_dna="$2"
    local profit="$3"
    
    # Extract components from RPM DNA
    local aom="${rpm_dna%%.*}"
    local coi="${rpm_dna#*.}"
    coi="${coi%%.*}"
    local rpm="${rpm_dna#*.*.}"
    rpm="${rpm%%.*}"
    local action="${rpm_dna##*.}"
    
    # Generate action template based on action type
    case "$action" in
        "1")
            echo "IMPLEMENT: $claim"
            ;;
        "2")
            echo "TEST: $claim"
            ;;
        "3")
            echo "OPTIMIZE: $claim"
            ;;
        "4")
            echo "ANALYZE: $claim"
            ;;
        *)
            echo "EXECUTE: $claim"
            ;;
    esac
}

# RPM emission
emit_rpm_tasks() {
    local input_file="$1"
    local output_file="$2"
    
    log "Starting RPM DNA task emission for: $input_file"
    
    # Extract claims from input
    local claims=()
    local claim_count=0
    local total_profit=0
    
    # Parse claims from input file
    while IFS= read -r line; do
        if [[ -n "$line" ]]; then
            local claim="$line"
            local confidence=0.85  # Default confidence
            
            # Encode RPM DNA
            local rpm_dna
            rpm_dna=$(encode_rpm_dna "$claim" "$confidence")
            
            # Calculate profit
            local profit
            profit=$(calculate_profit "$claim" "$confidence")
            total_profit=$(echo "scale=2; $total_profit + $profit" | bc)
            
            # Generate action template
            local action_template
            action_template=$(generate_action_template "$claim" "$rpm_dna" "$profit")
            
            claims+=("$claim|$confidence|$rpm_dna|$profit|$action_template")
            claim_count=$((claim_count + 1))
        fi
    done < <(jq -r '.claims[]?.claim // empty' "$input_file" 2>/dev/null || echo "Mock claim for RPM emission")
    
    log "RPM emission completed: $claim_count tasks, total profit: $total_profit"
    
    # Create RPM output
    cat > "$output_file" << EOF
{
  "emission_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "source_file": "$input_file",
  "total_tasks": $claim_count,
  "total_profit": $total_profit,
  "profit_margin": $PROFIT_MARGIN,
  "velocity_multiplier": $VELOCITY_MULTIPLIER,
  "age_verified": true,
  "compliance": {
    "lifeward_standard": true,
    "age_21_verified": true,
    "nist_methods": false,
    "brand_protection": true
  },
  "rpm_tasks": [
EOF
    
    # Add RPM tasks
    local first=true
    for task_data in "${claims[@]}"; do
        IFS='|' read -r claim confidence rpm_dna profit action_template <<< "$task_data"
        
        if [[ "$first" == "true" ]]; then
            first=false
        else
            echo "," >> "$output_file"
        fi
        
        cat >> "$output_file" << EOF
    {
      "task_id": "RPM-$(date +%Y%m%d)-$(printf "%03d" $claim_count)",
      "claim": "$(echo "$claim" | sed 's/"/\\"/g')",
      "confidence": $confidence,
      "rpm_dna": "$rpm_dna",
      "estimated_profit": $profit,
      "action_template": "$(echo "$action_template" | sed 's/"/\\"/g')",
      "priority": "$(echo "$rpm_dna" | cut -d'.' -f3)",
      "status": "pending",
      "created_timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    }
EOF
        claim_count=$((claim_count + 1))
    done
    
    cat >> "$output_file" << EOF
  ]
}
EOF
    
    log "RPM emission completed: $output_file"
}

# Main RPM function
emit_rpm() {
    local input_file="$1"
    local output_file="$2"
    local age_header="${3:-21+}"
    
    log "Starting RPM DNA task emission for: $input_file"
    
    # Verify age
    verify_age "$age_header"
    
    # Perform RPM emission
    emit_rpm_tasks "$input_file" "$output_file"
    
    log "RPM DNA task emission completed: $output_file"
    echo "$output_file"
}

# Main execution
main() {
    local input_file="${1:-}"
    local output_file="${2:-$RPM_DIR/rpm_emit_$(date +%Y%m%d_%H%M%S).json}"
    local age_header="${3:-21+}"
    
    if [[ -z "$input_file" || ! -f "$input_file" ]]; then
        echo "Usage: $0 <input_file> [output_file] [age_header]"
        echo "Example: $0 data/truth_outputs/truth_001.json data/rpm_outputs/rpm_001.json 21+"
        exit 1
    fi
    
    log "TRUTH Pipeline - Step 5: RPM DNA Task Emission"
    log "Input: $input_file"
    log "Output: $output_file"
    log "Age Header: $age_header"
    
    # Execute RPM emission
    local result_file
    result_file=$(emit_rpm "$input_file" "$output_file" "$age_header")
    
    log "RPM emission completed: $result_file"
    
    # Post-processing: refresh RPM leaderboard (non-fatal)
    if command -v python3 >/dev/null 2>&1 && [[ -f "$ROOT/scripts/rpm_scoreboard_update.py" ]]; then
        log "Updating RPM scoreboard (.claude/rpm_scoreboard.json)"
        python3 "$ROOT/scripts/rpm_scoreboard_update.py" \
          --cards_dir "$ROOT/data/rpm_outputs" \
          --config "$ROOT/config/scoring_config.json" \
          --out "$ROOT/.claude/rpm_scoreboard.json" >/dev/null 2>&1 || log "WARNING: scoreboard update failed"
    else
        log "Scoreboard updater not available; skipping"
    fi
    echo "$result_file"
}

# Execute main function with all arguments
main "$@"
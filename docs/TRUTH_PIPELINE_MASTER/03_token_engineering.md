# TRUTH Pipeline Token Engineering

**Token Count**: ~1,300 | **Dependencies**: 01_architecture_overview.md, 02_data_flow.md | **Last Updated**: 2025-10-21

## Summary

Token engineering for the TRUTH Pipeline enforces strict budgets per stage, targets ≥40% compression savings, and implements adaptive budgeting to prevent cost spikes. The system tracks token usage across Apify (8-12k), Perplexity (3-4k), GPT-5 Mini (2-3k), and Claude Sonnet (≤2k) stages with real-time monitoring and automatic abort mechanisms.

## Token Budget Allocation

### Per-Stage Budgets
| Stage | Avg Tokens | Hard Limit | Soft Limit | Optimization Target |
|-------|------------|------------|------------|-------------------|
| **L1 Apify** | 8-12k | 16k | 14k | Hash + manifest |
| **L2 Perplexity** | 3-4k | 6k | 5k | Top-3 responses |
| **L3 Compression** | 2-3k | 4k | 3.5k | ≥40% reduction |
| **L4 TRUTH** | ≤2k | 3k | 2.5k | ≤25 claims |
| **L5 RPM** | 0.5-1k | 2k | 1.5k | Profit gating |
| **Total Pipeline** | 14-22k | 31k | 26k | ≥40% compression |

### Budget Enforcement Logic
```bash
#!/bin/bash
# token_budget_enforcer.sh

# Stage-specific budgets
APIFY_BUDGET=16000
PERPLEXITY_BUDGET=6000
COMPRESSION_BUDGET=4000
TRUTH_BUDGET=3000
RPM_BUDGET=2000

# Total pipeline budget
TOTAL_BUDGET=31000
SOFT_LIMIT=26000

# Check stage budget
check_stage_budget() {
  local stage=$1
  local used_tokens=$2
  local budget=$3
  
  if [ "$used_tokens" -gt "$budget" ]; then
    echo "ERROR: $stage exceeded budget ($used_tokens > $budget)"
    return 1
  fi
  
  # Soft limit warning
  local soft_limit=$((budget * 90 / 100))
  if [ "$used_tokens" -gt "$soft_limit" ]; then
    echo "WARNING: $stage approaching budget ($used_tokens > $soft_limit)"
  fi
  
  return 0
}

# Abort if total budget exceeded
check_total_budget() {
  local total_used=$1
  
  if [ "$total_used" -gt "$TOTAL_BUDGET" ]; then
    echo "ERROR: Total budget exceeded ($total_used > $TOTAL_BUDGET)"
    exit 1
  fi
  
  if [ "$total_used" -gt "$SOFT_LIMIT" ]; then
    echo "WARNING: Approaching total budget limit ($total_used > $SOFT_LIMIT)"
  fi
}
```

## Token Accounting System

### Real-Time Tracking
```bash
#!/bin/bash
# token_accounting.sh

TOKEN_LOG="data/token_usage/$(date +%Y%m%d).json"

# Initialize token log
init_token_log() {
  cat > "$TOKEN_LOG" << EOF
{
  "date": "$(date +%Y-%m-%d)",
  "sessions": [],
  "totals": {
    "apify_tokens": 0,
    "perplexity_tokens": 0,
    "compression_tokens": 0,
    "truth_tokens": 0,
    "rpm_tokens": 0,
    "total_tokens": 0
  }
}
EOF
}

# Log stage tokens
log_stage_tokens() {
  local stage=$1
  local input_tokens=$2
  local output_tokens=$3
  local session_id=$4
  
  # Update session log
  jq --arg stage "$stage" \
     --argjson input "$input_tokens" \
     --argjson output "$output_tokens" \
     --arg session "$session_id" \
     '.sessions += [{
       "stage": $stage,
       "input_tokens": $input,
       "output_tokens": $output,
       "session_id": $session,
       "timestamp": now
     }]' "$TOKEN_LOG" > "$TOKEN_LOG.tmp" && mv "$TOKEN_LOG.tmp" "$TOKEN_LOG"
  
  # Update totals
  local total_stage=$((input_tokens + output_tokens))
  jq --arg stage "${stage}_tokens" \
     --argjson tokens "$total_stage" \
     '.totals[$stage] += $tokens' "$TOKEN_LOG" > "$TOKEN_LOG.tmp" && mv "$TOKEN_LOG.tmp" "$TOKEN_LOG"
}

# Calculate compression metrics
calculate_compression() {
  local original_tokens=$1
  local compressed_tokens=$2
  
  local compression_saved_pct=$(( (original_tokens - compressed_tokens) * 100 / original_tokens ))
  local data_loss_pct=$(( (original_tokens - compressed_tokens) * 100 / original_tokens ))
  
  echo "Compression saved: ${compression_saved_pct}%"
  echo "Data loss: ${data_loss_pct}%"
  
  # Validate compression target
  if [ "$compression_saved_pct" -lt 40 ]; then
    echo "WARNING: Compression below target (${compression_saved_pct}% < 40%)"
    return 1
  fi
  
  return 0
}
```

## Compression Strategy

### GPT-5 Mini Compression Logic
```bash
#!/bin/bash
# compression_optimizer.sh

COMPRESSION_TARGET=40
MAX_DATA_LOSS=5

optimize_compression() {
  local input_file=$1
  local output_file=$2
  
  # Calculate original token count
  local original_tokens=$(wc -w < "$input_file")
  
  # Apply compression with monitoring
  curl -X POST "https://api.openai.com/v1/chat/completions" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"model\": \"gpt-4o-mini\",
      \"messages\": [
        {
          \"role\": \"system\",
          \"content\": \"Compress the following data by at least 40% while preserving all numeric evidence and direct quotes. Output JSON array.\"
        },
        {
          \"role\": \"user\",
          \"content\": \"$(cat $input_file)\"
        }
      ],
      \"max_tokens\": 2000,
      \"temperature\": 0.1
    }" \
    -o "$output_file"
  
  # Calculate compressed token count
  local compressed_tokens=$(wc -w < "$output_file")
  
  # Validate compression
  calculate_compression "$original_tokens" "$compressed_tokens"
  
  # Log compression metrics
  log_stage_tokens "compression" "$original_tokens" "$compressed_tokens" "$SESSION_ID"
}
```

### Token Reduction Techniques
| Technique | Target Reduction | Implementation |
|-----------|------------------|----------------|
| **Deduplication** | 15-20% | Remove duplicate facts |
| **Normalization** | 10-15% | Standardize currency/percentages |
| **Summarization** | 20-25% | Condense verbose descriptions |
| **Abbreviation** | 5-10% | Use standard abbreviations |
| **Structure Optimization** | 5-10% | Minimize JSON overhead |

## Adaptive Budgeting

### Dynamic Budget Adjustment
```bash
#!/bin/bash
# adaptive_budgeting.sh

# Monitor token usage patterns
analyze_usage_patterns() {
  local log_file=$1
  local days_back=${2:-7}
  
  # Extract usage patterns
  jq -r --arg days "$days_back" '
    .sessions[] | 
    select(.timestamp > (now - ($days | tonumber) * 86400)) |
    "\(.stage),\(.input_tokens),\(.output_tokens),\(.timestamp)"
  ' "$log_file" > "data/token_analysis/usage_patterns.csv"
  
  # Calculate averages
  local avg_apify=$(awk -F',' '$1=="apify" {sum+=$2+$3; count++} END {print sum/count}' "data/token_analysis/usage_patterns.csv")
  local avg_perplexity=$(awk -F',' '$1=="perplexity" {sum+=$2+$3; count++} END {print sum/count}' "data/token_analysis/usage_patterns.csv")
  local avg_compression=$(awk -F',' '$1=="compression" {sum+=$2+$3; count++} END {print sum/count}' "data/token_analysis/usage_patterns.csv")
  local avg_truth=$(awk -F',' '$1=="truth" {sum+=$2+$3; count++} END {print sum/count}' "data/token_analysis/usage_patterns.csv")
  
  echo "Average usage (last $days_back days):"
  echo "Apify: $avg_apify tokens"
  echo "Perplexity: $avg_perplexity tokens"
  echo "Compression: $avg_compression tokens"
  echo "TRUTH: $avg_truth tokens"
}

# Adjust budgets based on usage
adjust_budgets() {
  local usage_analysis=$1
  
  # Increase budgets for consistently high usage
  if [ "$(echo "$usage_analysis" | grep "Apify:" | cut -d' ' -f2)" -gt 12000 ]; then
    echo "Increasing Apify budget to 18k"
    APIFY_BUDGET=18000
  fi
  
  # Decrease budgets for consistently low usage
  if [ "$(echo "$usage_analysis" | grep "Perplexity:" | cut -d' ' -f2)" -lt 3000 ]; then
    echo "Decreasing Perplexity budget to 5k"
    PERPLEXITY_BUDGET=5000
  fi
}
```

## Cost Control Mechanisms

### Automatic Abort Conditions
```bash
#!/bin/bash
# cost_control.sh

MAX_COST_PER_SESSION=50.00
COST_THRESHOLD=40.00

# Token cost calculation (approximate)
calculate_token_cost() {
  local tokens=$1
  local model=$2
  
  case "$model" in
    "gpt-4o-mini")
      echo "scale=4; $tokens * 0.00015" | bc
      ;;
    "claude-3-5-sonnet")
      echo "scale=4; $tokens * 0.003" | bc
      ;;
    "perplexity")
      echo "scale=4; $tokens * 0.0002" | bc
      ;;
    *)
      echo "0.00"
      ;;
  esac
}

# Check cost limits
check_cost_limits() {
  local session_cost=$1
  
  if [ "$(echo "$session_cost > $MAX_COST_PER_SESSION" | bc)" -eq 1 ]; then
    echo "ERROR: Session cost exceeded limit ($session_cost > $MAX_COST_PER_SESSION)"
    exit 1
  fi
  
  if [ "$(echo "$session_cost > $COST_THRESHOLD" | bc)" -eq 1 ]; then
    echo "WARNING: Approaching cost threshold ($session_cost > $COST_THRESHOLD)"
  fi
}
```

## Token Efficiency Metrics

### Performance Monitoring
```bash
#!/bin/bash
# token_efficiency_monitor.sh

# Calculate efficiency metrics
calculate_efficiency_metrics() {
  local session_log=$1
  
  # Token efficiency per stage
  local apify_efficiency=$(jq -r '
    .sessions[] | 
    select(.stage == "apify") | 
    (.output_tokens / .input_tokens) * 100
  ' "$session_log" | awk '{sum+=$1; count++} END {print sum/count}')
  
  local compression_efficiency=$(jq -r '
    .sessions[] | 
    select(.stage == "compression") | 
    (.output_tokens / .input_tokens) * 100
  ' "$session_log" | awk '{sum+=$1; count++} END {print sum/count}')
  
  # Overall pipeline efficiency
  local total_input=$(jq -r '.sessions[] | .input_tokens' "$session_log" | awk '{sum+=$1} END {print sum}')
  local total_output=$(jq -r '.sessions[] | .output_tokens' "$session_log" | awk '{sum+=$1} END {print sum}')
  local overall_efficiency=$(( (total_output * 100) / total_input ))
  
  echo "Token Efficiency Metrics:"
  echo "Apify efficiency: ${apify_efficiency}%"
  echo "Compression efficiency: ${compression_efficiency}%"
  echo "Overall pipeline efficiency: ${overall_efficiency}%"
}

# Generate efficiency report
generate_efficiency_report() {
  local report_file="data/token_reports/efficiency_$(date +%Y%m%d).json"
  
  cat > "$report_file" << EOF
{
  "date": "$(date +%Y-%m-%d)",
  "efficiency_metrics": {
    "apify_efficiency": "$apify_efficiency",
    "compression_efficiency": "$compression_efficiency", 
    "overall_efficiency": "$overall_efficiency"
  },
  "budget_compliance": {
    "total_budget_used": "$total_budget_used",
    "budget_compliance_pct": "$budget_compliance_pct"
  },
  "cost_analysis": {
    "total_cost": "$total_cost",
    "cost_per_token": "$cost_per_token"
  }
}
EOF
}
```

## Token Budget Validation

### Pre-Flight Validation
```bash
#!/bin/bash
# token_budget_validator.sh

# Validate token budgets before execution
validate_token_budgets() {
  local query=$1
  local estimated_tokens=$2
  
  # Estimate token usage based on query length
  local query_tokens=$(echo "$query" | wc -w)
  local estimated_apify=$((query_tokens * 100))
  local estimated_perplexity=$((query_tokens * 50))
  local estimated_compression=$((query_tokens * 30))
  local estimated_truth=$((query_tokens * 20))
  
  local total_estimated=$((estimated_apify + estimated_perplexity + estimated_compression + estimated_truth))
  
  # Check against budgets
  if [ "$total_estimated" -gt "$TOTAL_BUDGET" ]; then
    echo "ERROR: Estimated tokens exceed budget ($total_estimated > $TOTAL_BUDGET)"
    return 1
  fi
  
  echo "Token budget validation passed"
  echo "Estimated usage: $total_estimated tokens"
  return 0
}

# Post-execution validation
validate_post_execution() {
  local actual_tokens=$1
  local estimated_tokens=$2
  
  local variance=$(( (actual_tokens - estimated_tokens) * 100 / estimated_tokens ))
  
  if [ "$variance" -gt 20 ]; then
    echo "WARNING: High token variance ($variance% > 20%)"
  fi
  
  echo "Token variance: ${variance}%"
}
```

## References

- **Source**: copilot-liv-hana-10-21.txt:886-895, 1031-1036, 1079-1088, 2740-2745
- **Related**: 01_architecture_overview.md, 02_data_flow.md, 05_script_specifications.md
- **Validation**: 06_validation_harness.md, 07_agent_builder_nodes.md

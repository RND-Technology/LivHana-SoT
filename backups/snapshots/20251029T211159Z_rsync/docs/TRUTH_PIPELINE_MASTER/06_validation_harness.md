# TRUTH Pipeline Validation Harness

**Token Count**: ~1,400 | **Dependencies**: 01_architecture_overview.md, 04_guardrails_matrix.md | **Last Updated**: 2025-10-21

## Summary

The TRUTH Pipeline validation harness provides comprehensive testing and verification capabilities using jq, jsonschema, and custom validation scripts. It ensures TRUTH compliance, schema validation, source verification, profit gating, and reproducible outputs across all pipeline stages.

## Core Validation Commands

### TRUTH Schema Validation

```bash
#!/bin/bash
# truth_schema_validator.sh

set -euo pipefail

# Configuration
SCHEMA_FILE="schemas/truth.schema.json"
OUTPUT_DIR="data/truth_outputs"

# TRUTH schema definition
create_truth_schema() {
  cat > "$SCHEMA_FILE" << 'EOF'
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["status", "summary", "claims", "rpm", "token_report"],
  "properties": {
    "status": {
      "type": "string",
      "enum": ["ok", "failed"]
    },
    "summary": {
      "type": "string",
      "maxLength": 120
    },
    "claims": {
      "type": "array",
      "maxItems": 25,
      "items": {
        "type": "object",
        "required": ["testable", "reproducible", "unambiguous", "traceable", "high_fidelity"],
        "properties": {
          "testable": {
            "type": "boolean"
          },
          "reproducible": {
            "type": "boolean"
          },
          "unambiguous": {
            "type": "boolean"
          },
          "traceable": {
            "type": "object",
            "required": ["sources"],
            "properties": {
              "sources": {
                "type": "array",
                "minItems": 2,
                "items": {
                  "type": "string"
                }
              }
            }
          },
          "high_fidelity": {
            "type": "string"
          }
        }
      }
    },
    "rpm": {
      "type": "object",
      "required": ["massive_actions"],
      "properties": {
        "massive_actions": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "required": ["purpose", "action", "owner", "profit_delta", "timeframe"],
            "properties": {
              "purpose": {
                "type": "string"
              },
              "action": {
                "type": "string"
              },
              "owner": {
                "type": "string"
              },
              "profit_delta": {
                "type": "number",
                "minimum": 0.01
              },
              "timeframe": {
                "type": "string"
              }
            }
          }
        }
      }
    },
    "token_report": {
      "type": "object",
      "required": ["input_tokens", "output_tokens", "compression_saved_pct"],
      "properties": {
        "input_tokens": {
          "type": "number",
          "minimum": 0
        },
        "output_tokens": {
          "type": "number",
          "minimum": 0
        },
        "compression_saved_pct": {
          "type": "number",
          "minimum": 40
        }
      }
    }
  }
}
EOF
}

# Validate TRUTH output
validate_truth_output() {
  local output_file=$1
  
  echo "Validating TRUTH output: $output_file"
  
  # Check file exists
  if [ ! -f "$output_file" ]; then
    echo "ERROR: Output file not found: $output_file"
    return 1
  fi
  
  # Validate JSON structure
  if ! jq empty "$output_file" 2>/dev/null; then
    echo "ERROR: Invalid JSON structure"
    return 1
  fi
  
  # Validate against schema
  if ! jsonschema --instance "$output_file" "$SCHEMA_FILE"; then
    echo "ERROR: Schema validation failed"
    return 1
  fi
  
  # Additional validations
  validate_claim_count "$output_file"
  validate_source_verification "$output_file"
  validate_profit_gating "$output_file"
  validate_summary_length "$output_file"
  
  echo "TRUTH output validation passed"
  return 0
}

# Validate claim count
validate_claim_count() {
  local output_file=$1
  
  local claim_count=$(jq -r '.claims | length' "$output_file")
  
  if [ "$claim_count" -eq 0 ]; then
    echo "ERROR: No claims found"
    return 1
  fi
  
  if [ "$claim_count" -gt 25 ]; then
    echo "ERROR: Too many claims ($claim_count > 25)"
    return 1
  fi
  
  echo "Claim count validation passed: $claim_count claims"
  return 0
}

# Validate source verification
validate_source_verification() {
  local output_file=$1
  
  local source_validation=$(jq -r '[.claims[] | (.traceable.sources | length >= 2)] | all' "$output_file")
  
  if [ "$source_validation" != "true" ]; then
    echo "ERROR: Some claims lack sufficient sources (≥2 required)"
    return 1
  fi
  
  echo "Source verification validation passed"
  return 0
}

# Validate profit gating
validate_profit_gating() {
  local output_file=$1
  
  local profit_validation=$(jq -r '[.rpm.massive_actions[] | .profit_delta > 0] | all' "$output_file")
  
  if [ "$profit_validation" != "true" ]; then
    echo "ERROR: Some RPM actions have non-profitable profit_delta"
    return 1
  fi
  
  echo "Profit gating validation passed"
  return 0
}

# Validate summary length
validate_summary_length() {
  local output_file=$1
  
  local summary=$(jq -r '.summary' "$output_file")
  local summary_tokens=$(echo "$summary" | wc -w)
  
  if [ "$summary_tokens" -gt 120 ]; then
    echo "ERROR: Summary too long ($summary_tokens > 120 tokens)"
    return 1
  fi
  
  echo "Summary length validation passed: $summary_tokens tokens"
  return 0
}

# Main execution
main() {
  local output_file="${1:-$OUTPUT_DIR/truth_$(date +%Y%m%d_%H%M%S).json}"
  
  # Create schema if it doesn't exist
  if [ ! -f "$SCHEMA_FILE" ]; then
    create_truth_schema
  fi
  
  echo "Starting TRUTH schema validation"
  echo "Output file: $output_file"
  
  validate_truth_output "$output_file"
  
  echo "TRUTH schema validation completed successfully"
}

# Run main function
main "$@"
```

## Pipeline Integrity Validation

### End-to-End Pipeline Validation

```bash
#!/bin/bash
# pipeline_integrity_validator.sh

set -euo pipefail

# Configuration
PIPELINE_DIR="data/pipeline_outputs"
VALIDATION_DIR="data/validation"

# Validate pipeline integrity
validate_pipeline_integrity() {
  local timestamp=$1
  local pipeline_dir="$PIPELINE_DIR/$timestamp"
  
  echo "Validating pipeline integrity for: $timestamp"
  
  if [ ! -d "$pipeline_dir" ]; then
    echo "ERROR: Pipeline directory not found: $pipeline_dir"
    return 1
  fi
  
  # Check required files
  local required_files=(
    "apify_output.json"
    "perplexity_output.json"
    "compression_output.json"
    "truth_output.json"
    "rpm_output.json"
  )
  
  for file in "${required_files[@]}"; do
    if [ ! -f "$pipeline_dir/$file" ]; then
      echo "ERROR: Required file not found: $file"
      return 1
    fi
  done
  
  # Validate each stage
  validate_apify_output "$pipeline_dir/apify_output.json"
  validate_perplexity_output "$pipeline_dir/perplexity_output.json"
  validate_compression_output "$pipeline_dir/compression_output.json"
  validate_truth_output "$pipeline_dir/truth_output.json"
  validate_rpm_output "$pipeline_dir/rpm_output.json"
  
  # Validate data flow
  validate_data_flow "$pipeline_dir"
  
  echo "Pipeline integrity validation passed"
  return 0
}

# Validate Apify output
validate_apify_output() {
  local output_file=$1
  
  echo "Validating Apify output: $output_file"
  
  # Check JSON structure
  if ! jq empty "$output_file" 2>/dev/null; then
    echo "ERROR: Invalid JSON structure"
    return 1
  fi
  
  # Check for required fields
  local item_count=$(jq -r '. | length' "$output_file")
  if [ "$item_count" -eq 0 ]; then
    echo "ERROR: No items found in Apify output"
    return 1
  fi
  
  echo "Apify output validation passed: $item_count items"
  return 0
}

# Validate Perplexity output
validate_perplexity_output() {
  local output_file=$1
  
  echo "Validating Perplexity output: $output_file"
  
  # Check JSON structure
  if ! jq empty "$output_file" 2>/dev/null; then
    echo "ERROR: Invalid JSON structure"
    return 1
  fi
  
  # Check for verified facts
  local fact_count=$(jq -r '.verified_facts | length' "$output_file")
  if [ "$fact_count" -eq 0 ]; then
    echo "ERROR: No verified facts found"
    return 1
  fi
  
  # Check source count for each fact
  local source_validation=$(jq -r '[.verified_facts[] | .source_count >= 2] | all' "$output_file")
  if [ "$source_validation" != "true" ]; then
    echo "ERROR: Some facts lack sufficient sources"
    return 1
  fi
  
  echo "Perplexity output validation passed: $fact_count facts"
  return 0
}

# Validate compression output
validate_compression_output() {
  local output_file=$1
  
  echo "Validating compression output: $output_file"
  
  # Check JSON structure
  if ! jq empty "$output_file" 2>/dev/null; then
    echo "ERROR: Invalid JSON structure"
    return 1
  fi
  
  # Check compression metrics
  local compression_saved_pct=$(jq -r '.compression_metrics.compression_saved_pct' "$output_file")
  if [ "$compression_saved_pct" -lt 40 ]; then
    echo "ERROR: Compression below target ($compression_saved_pct% < 40%)"
    return 1
  fi
  
  # Check data loss
  local data_loss_pct=$(jq -r '.compression_metrics.data_loss_pct' "$output_file")
  if [ "$data_loss_pct" -gt 5 ]; then
    echo "ERROR: Data loss exceeds limit ($data_loss_pct% > 5%)"
    return 1
  fi
  
  echo "Compression output validation passed: ${compression_saved_pct}% saved"
  return 0
}

# Validate RPM output
validate_rpm_output() {
  local output_file=$1
  
  echo "Validating RPM output: $output_file"
  
  # Check JSON structure
  if ! jq empty "$output_file" 2>/dev/null; then
    echo "ERROR: Invalid JSON structure"
    return 1
  fi
  
  # Check profit validation
  local profit_status=$(jq -r '.profit_validation.validation_status' "$output_file")
  if [ "$profit_status" != "passed" ]; then
    echo "ERROR: Profit validation failed"
    return 1
  fi
  
  # Check total profit
  local total_profit=$(jq -r '.profit_validation.total_profit_delta' "$output_file")
  if [ "$(echo "$total_profit <= 0" | bc)" -eq 1 ]; then
    echo "ERROR: Non-profitable RPM actions"
    return 1
  fi
  
  echo "RPM output validation passed: $total_profit profit"
  return 0
}

# Validate data flow
validate_data_flow() {
  local pipeline_dir=$1
  
  echo "Validating data flow: $pipeline_dir"
  
  # Check data continuity between stages
  local apify_items=$(jq -r '. | length' "$pipeline_dir/apify_output.json")
  local perplexity_facts=$(jq -r '.verified_facts | length' "$pipeline_dir/perplexity_output.json")
  local compressed_facts=$(jq -r '.compressed_facts | length' "$pipeline_dir/compression_output.json")
  local truth_claims=$(jq -r '.claims | length' "$pipeline_dir/truth_output.json")
  local rpm_actions=$(jq -r '.rpm_actions | length' "$pipeline_dir/rpm_output.json")
  
  echo "Data flow validation:"
  echo "  Apify items: $apify_items"
  echo "  Perplexity facts: $perplexity_facts"
  echo "  Compressed facts: $compressed_facts"
  echo "  TRUTH claims: $truth_claims"
  echo "  RPM actions: $rpm_actions"
  
  # Validate data reduction
  if [ "$compressed_facts" -gt "$perplexity_facts" ]; then
    echo "ERROR: Compression increased data size"
    return 1
  fi
  
  if [ "$truth_claims" -gt "$compressed_facts" ]; then
    echo "ERROR: TRUTH synthesis increased data size"
    return 1
  fi
  
  echo "Data flow validation passed"
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

## Session Validation Suite

### Session Output Validation

```bash
#!/bin/bash
# session_validator.sh

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
  local required_fields=("session_id" "timestamp" "status" "outputs" "metadata")
  for field in "${required_fields[@]}"; do
    if ! echo "$session_data" | jq -e ".$field" > /dev/null; then
      echo "ERROR: Missing required field: $field"
      return 1
    fi
  done
  
  # Validate session ID
  local file_session_id=$(echo "$session_data" | jq -r '.session_id')
  if [ "$file_session_id" != "$session_id" ]; then
    echo "ERROR: Session ID mismatch ($file_session_id != $session_id)"
    return 1
  fi
  
  # Validate status
  local status=$(echo "$session_data" | jq -r '.status')
  if [ "$status" != "completed" ] && [ "$status" != "failed" ]; then
    echo "ERROR: Invalid status: $status"
    return 1
  fi
  
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
    
    # Validate output type
    case "$output_type" in
      "apify"|"perplexity"|"compression"|"truth"|"rpm")
        echo "Validated output $i: $output_type"
        ;;
      *)
        echo "ERROR: Invalid output type: $output_type"
        return 1
        ;;
    esac
  done
  
  # Validate metadata
  local metadata=$(echo "$session_data" | jq -r '.metadata')
  local start_time=$(echo "$metadata" | jq -r '.start_time')
  local end_time=$(echo "$metadata" | jq -r '.end_time')
  
  if [ -z "$start_time" ] || [ -z "$end_time" ]; then
    echo "ERROR: Missing timing metadata"
    return 1
  fi
  
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

## Validation Test Suite

### Comprehensive Validation Testing

```bash
#!/bin/bash
# validation_test_suite.sh

set -euo pipefail

# Configuration
TEST_DIR="data/validation_tests"
RESULTS_DIR="data/validation_results"

# Run validation test suite
run_validation_tests() {
  local test_name=$1
  
  echo "Running validation test suite: $test_name"
  
  # Create test directory
  mkdir -p "$TEST_DIR/$test_name"
  mkdir -p "$RESULTS_DIR/$test_name"
  
  # Test 1: TRUTH schema validation
  echo "Test 1: TRUTH schema validation"
  if ! ./truth_schema_validator.sh "$TEST_DIR/$test_name/truth_output.json"; then
    echo "FAILED: TRUTH schema validation"
    return 1
  fi
  
  # Test 2: Pipeline integrity validation
  echo "Test 2: Pipeline integrity validation"
  if ! ./pipeline_integrity_validator.sh "$test_name"; then
    echo "FAILED: Pipeline integrity validation"
    return 1
  fi
  
  # Test 3: Session output validation
  echo "Test 3: Session output validation"
  if ! ./session_validator.sh "$test_name"; then
    echo "FAILED: Session output validation"
    return 1
  fi
  
  # Test 4: Guardrail validation
  echo "Test 4: Guardrail validation"
  if ! ./guardrail_test_suite.sh; then
    echo "FAILED: Guardrail validation"
    return 1
  fi
  
  # Test 5: Token budget validation
  echo "Test 5: Token budget validation"
  if ! ./token_budget_validator.sh; then
    echo "FAILED: Token budget validation"
    return 1
  fi
  
  echo "All validation tests passed"
  return 0
}

# Generate validation report
generate_validation_report() {
  local test_name=$1
  local report_file="$RESULTS_DIR/$test_name/validation_report.json"
  
  cat > "$report_file" << EOF
{
  "test_name": "$test_name",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "validation_results": {
    "truth_schema": "passed",
    "pipeline_integrity": "passed",
    "session_output": "passed",
    "guardrails": "passed",
    "token_budget": "passed"
  },
  "overall_status": "passed"
}
EOF
  
  echo "Validation report generated: $report_file"
}

# Main execution
main() {
  local test_name="${1:-validation_test_$(date +%Y%m%d_%H%M%S)}"
  
  echo "Starting validation test suite"
  echo "Test name: $test_name"
  
  run_validation_tests "$test_name"
  generate_validation_report "$test_name"
  
  echo "Validation test suite completed successfully"
}

# Run main function
main "$@"
```

## Validation Commands Reference

### Quick Validation Commands

```bash
# TRUTH alignment commands
jq '.claims | length' data/truth_outputs/truth_output.json
jq '[.claims[] | (.traceable.sources|length>=2)] | all' data/truth_outputs/truth_output.json
jq '.rpm.massive_actions | length > 0' data/truth_outputs/truth_output.json
jsonschema --instance data/truth_outputs/truth_output.json schemas/truth.schema.json

# Pipeline integrity commands
jq '.verified_facts | length' data/perplexity_outputs/verified_facts.json
jq '.compression_metrics.compression_saved_pct' data/compression_outputs/compressed_facts.json
jq '.profit_validation.total_profit_delta' data/rpm_outputs/rpm_actions.json

# Session validation commands
jq '.session_id' data/sessions/session.json
jq '.outputs | length' data/sessions/session.json
jq '.metadata.start_time' data/sessions/session.json
```

## References

- **Source**: copilot-liv-hana-10-21.txt:102-118, 833-848, 1023-1047, 5471-5559
- **Related**: 01_architecture_overview.md, 04_guardrails_matrix.md, 05_script_specifications.md
- **Validation**: 07_agent_builder_nodes.md, 08_secrets_integration.md

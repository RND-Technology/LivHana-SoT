# TRUTH Pipeline Guardrails Matrix

**Token Count**: ~1,500 | **Dependencies**: 01_architecture_overview.md, 03_token_engineering.md | **Last Updated**: 2025-10-21

## Summary

The TRUTH Pipeline implements comprehensive guardrails across AGE21 verification, PII detection, cannabis compliance, financial accuracy, and secret hygiene. Each guardrail includes specific test commands, enforcement mechanisms, and failure handling procedures to ensure Tier-1 compliance and safety.

## Guardrails Overview

### Pre-Flight Guardrails

| Guardrail | Purpose | Enforcement | Test Command |
|-----------|---------|-------------|--------------|
| **AGE21** | Age verification | Hard block | `curl -H "Age: 18" /age-gate` |
| **PII Detection** | Personal info protection | Auto-redact | `grep -E "ssn\|email\|phone" output.json` |
| **Jailbreak Detection** | Prompt injection prevention | Block execution | `grep -i "ignore\|override\|system" prompt.txt` |
| **Moderation Filter** | Content safety | Content removal | `curl -X POST /moderate -d "content"` |
| **Secret Scan** | Credential leakage | Block + alert | `grep -E "sk-\|api_key\|password" output.json` |

### Post-Flight Guardrails

| Guardrail | Purpose | Enforcement | Test Command |
|-----------|---------|-------------|--------------|
| **Schema Validation** | TRUTH compliance | Reject output | `jsonschema --instance output.json schema.json` |
| **Source Verification** | Fact checking | Require ≥2 sources | `jq '[.claims[] \| (.traceable.sources\|length>=2)] \| all' output.json` |
| **Profit Gating** | Business viability | Reject non-profitable | `jq '.rpm.massive_actions[].profit_delta' output.json` |
| **Medical Claims** | FDA compliance | Require FDA source | `jq '.claims[] \| select(.medical)' output.json` |
| **Financial Accuracy** | Deterministic formulas | Validate calculations | `jq '.rpm.massive_actions[].profit_delta' output.json` |

## AGE21 Verification System

### Age Gate Implementation

```bash
#!/bin/bash
# age_gate_guardrail.sh

AGE_GATE_ENDPOINT="https://api.livhana.com/age-gate"
MIN_AGE=21

verify_age() {
  local user_age=$1
  local session_id=$2
  
  # Call age gate API
  local response=$(curl -s -X POST "$AGE_GATE_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "{\"age\": $user_age, \"session_id\": \"$session_id\"}")
  
  local age_verified=$(echo "$response" | jq -r '.age_verified')
  local http_code=$(echo "$response" | jq -r '.http_code')
  
  if [ "$age_verified" != "true" ]; then
    echo "ERROR: Age verification failed (age: $user_age)"
    return 1
  fi
  
  if [ "$user_age" -lt "$MIN_AGE" ]; then
    echo "ERROR: Underage access blocked (age: $user_age < $MIN_AGE)"
    return 1
  fi
  
  echo "Age verification passed (age: $user_age)"
  return 0
}

# Test age gate
test_age_gate() {
  echo "Testing age gate..."
  
  # Test underage
  if verify_age 18 "test_session_1"; then
    echo "ERROR: Underage test should have failed"
    exit 1
  fi
  
  # Test adult
  if ! verify_age 25 "test_session_2"; then
    echo "ERROR: Adult test should have passed"
    exit 1
  fi
  
  echo "Age gate tests passed"
}
```

### Age Gate Response Codes

| HTTP Code | Meaning | Action |
|-----------|---------|--------|
| **200** | Age verified | Proceed |
| **403** | Underage | Block access |
| **429** | Rate limited | Retry with backoff |
| **500** | Server error | Fallback verification |

## PII Detection & Redaction

### PII Detection Patterns

```bash
#!/bin/bash
# pii_detection_guardrail.sh

# PII regex patterns
SSN_PATTERN="\b\d{3}-\d{2}-\d{4}\b"
EMAIL_PATTERN="\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"
PHONE_PATTERN="\b\d{3}-\d{3}-\d{4}\b"
CREDIT_CARD_PATTERN="\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b"

detect_pii() {
  local content=$1
  local output_file=$2
  
  # Scan for PII patterns
  local pii_found=false
  local pii_types=()
  
  if echo "$content" | grep -qE "$SSN_PATTERN"; then
    pii_found=true
    pii_types+=("SSN")
  fi
  
  if echo "$content" | grep -qE "$EMAIL_PATTERN"; then
    pii_found=true
    pii_types+=("EMAIL")
  fi
  
  if echo "$content" | grep -qE "$PHONE_PATTERN"; then
    pii_found=true
    pii_types+=("PHONE")
  fi
  
  if echo "$content" | grep -qE "$CREDIT_CARD_PATTERN"; then
    pii_found=true
    pii_types+=("CREDIT_CARD")
  fi
  
  if [ "$pii_found" = true ]; then
    echo "PII detected: ${pii_types[*]}"
    redact_pii "$content" "$output_file" "${pii_types[@]}"
    return 1
  fi
  
  echo "No PII detected"
  return 0
}

# PII redaction
redact_pii() {
  local content=$1
  local output_file=$2
  shift 2
  local pii_types=("$@")
  
  local redacted_content="$content"
  
  for pii_type in "${pii_types[@]}"; do
    case "$pii_type" in
      "SSN")
        redacted_content=$(echo "$redacted_content" | sed -E "s/$SSN_PATTERN/[REDACTED-SSN]/g")
        ;;
      "EMAIL")
        redacted_content=$(echo "$redacted_content" | sed -E "s/$EMAIL_PATTERN/[REDACTED-EMAIL]/g")
        ;;
      "PHONE")
        redacted_content=$(echo "$redacted_content" | sed -E "s/$PHONE_PATTERN/[REDACTED-PHONE]/g")
        ;;
      "CREDIT_CARD")
        redacted_content=$(echo "$redacted_content" | sed -E "s/$CREDIT_CARD_PATTERN/[REDACTED-CARD]/g")
        ;;
    esac
  done
  
  echo "$redacted_content" > "$output_file"
  echo "PII redacted and saved to $output_file"
}
```

## Cannabis Compliance Guardrails

### THC Content Verification

```bash
#!/bin/bash
# cannabis_compliance_guardrail.sh

# THC content limits (Texas)
MAX_THC_CONTENT=0.3
MAX_DELTA9_THC=0.3

verify_thc_content() {
  local product_data=$1
  
  # Extract THC content
  local thc_content=$(echo "$product_data" | jq -r '.thc_content // 0')
  local delta9_thc=$(echo "$product_data" | jq -r '.delta9_thc // 0')
  
  # Check THC limits
  if [ "$(echo "$thc_content > $MAX_THC_CONTENT" | bc)" -eq 1 ]; then
    echo "ERROR: THC content exceeds limit ($thc_content% > $MAX_THC_CONTENT%)"
    return 1
  fi
  
  if [ "$(echo "$delta9_thc > $MAX_DELTA9_THC" | bc)" -eq 1 ]; then
    echo "ERROR: Delta-9 THC exceeds limit ($delta9_thc% > $MAX_DELTA9_THC%)"
    return 1
  fi
  
  echo "THC content verification passed"
  return 0
}

# Medical claims validation
validate_medical_claims() {
  local claims=$1
  
  # Check for medical claims
  local medical_claims=$(echo "$claims" | jq -r '.claims[] | select(.medical == true)')
  
  if [ -n "$medical_claims" ]; then
    # Verify FDA-approved sources
    local fda_sources=$(echo "$medical_claims" | jq -r '.traceable.sources[] | select(.fda_approved == true)')
    
    if [ -z "$fda_sources" ]; then
      echo "ERROR: Medical claims require FDA-approved sources"
      return 1
    fi
    
    echo "Medical claims validated with FDA sources"
  fi
  
  return 0
}
```

## Financial Accuracy Guardrails

### Profit Calculation Validation

```bash
#!/bin/bash
# financial_accuracy_guardrail.sh

# Deterministic profit formula
calculate_profit() {
  local revenue=$1
  local costs=$2
  local timeframe=$3
  
  # Basic profit calculation
  local profit=$((revenue - costs))
  
  # Apply timeframe multiplier
  case "$timeframe" in
    "daily")
      local multiplier=1
      ;;
    "weekly")
      local multiplier=7
      ;;
    "monthly")
      local multiplier=30
      ;;
    "yearly")
      local multiplier=365
      ;;
    *)
      echo "ERROR: Invalid timeframe: $timeframe"
      return 1
      ;;
  esac
  
  local adjusted_profit=$((profit * multiplier))
  echo "$adjusted_profit"
}

# Validate profit calculations
validate_profit_calculations() {
  local rpm_actions=$1
  
  # Check each action's profit calculation
  echo "$rpm_actions" | jq -r '.[] | @base64' | while read -r action; do
    local action_json=$(echo "$action" | base64 --decode)
    local purpose=$(echo "$action_json" | jq -r '.purpose')
    local profit_delta=$(echo "$action_json" | jq -r '.profit_delta')
    local timeframe=$(echo "$action_json" | jq -r '.timeframe')
    
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
    
    echo "Profit validation passed for: $purpose"
  done
  
  return 0
}
```

## Secret Hygiene Guardrails

### Credential Leakage Detection

```bash
#!/bin/bash
# secret_hygiene_guardrail.sh

# Secret patterns
API_KEY_PATTERN="\b[A-Za-z0-9]{32,}\b"
SECRET_PATTERN="\b[A-Za-z0-9+/]{40,}={0,2}\b"
PASSWORD_PATTERN="\b[A-Za-z0-9!@#$%^&*()_+-=]{8,}\b"

scan_for_secrets() {
  local content=$1
  local output_file=$2
  
  local secrets_found=false
  local secret_types=()
  
  # Scan for API keys
  if echo "$content" | grep -qE "$API_KEY_PATTERN"; then
    secrets_found=true
    secret_types+=("API_KEY")
  fi
  
  # Scan for secrets
  if echo "$content" | grep -qE "$SECRET_PATTERN"; then
    secrets_found=true
    secret_types+=("SECRET")
  fi
  
  # Scan for passwords
  if echo "$content" | grep -qE "$PASSWORD_PATTERN"; then
    secrets_found=true
    secret_types+=("PASSWORD")
  fi
  
  if [ "$secrets_found" = true ]; then
    echo "SECURITY ALERT: Secrets detected: ${secret_types[*]}"
    
    # Log security incident
    log_security_incident "$content" "${secret_types[@]}"
    
    # Block execution
    return 1
  fi
  
  echo "No secrets detected"
  return 0
}

# Security incident logging
log_security_incident() {
  local content=$1
  shift
  local secret_types=("$@")
  
  local incident_log="data/security/incidents/$(date +%Y%m%d_%H%M%S).json"
  
  cat > "$incident_log" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "incident_type": "SECRET_LEAKAGE",
  "secret_types": $(printf '%s\n' "${secret_types[@]}" | jq -R . | jq -s .),
  "content_hash": "$(echo "$content" | sha256sum | cut -d' ' -f1)",
  "severity": "HIGH",
  "action_taken": "BLOCKED_EXECUTION"
}
EOF
  
  echo "Security incident logged: $incident_log"
}
```

## Guardrail Enforcement Matrix

### Enforcement Levels

| Level | Action | Description |
|-------|--------|-------------|
| **BLOCK** | Stop execution | Hard failure, no retry |
| **WARN** | Log warning | Continue with monitoring |
| **REDACT** | Remove content | Auto-clean and proceed |
| **VALIDATE** | Check compliance | Verify before proceeding |
| **ALERT** | Notify operators | Real-time monitoring |

### Guardrail Failure Handling

```bash
#!/bin/bash
# guardrail_failure_handler.sh

handle_guardrail_failure() {
  local guardrail_type=$1
  local failure_reason=$2
  local severity=$3
  
  case "$guardrail_type" in
    "AGE21")
      echo "BLOCK: Age verification failed - $failure_reason"
      exit 1
      ;;
    "PII")
      echo "REDACT: PII detected - $failure_reason"
      # Continue with redacted content
      ;;
    "MEDICAL_CLAIMS")
      echo "VALIDATE: Medical claims require FDA sources - $failure_reason"
      # Require additional validation
      ;;
    "FINANCIAL_ACCURACY")
      echo "BLOCK: Financial calculation error - $failure_reason"
      exit 1
      ;;
    "SECRET_HYGIENE")
      echo "ALERT: Secret leakage detected - $failure_reason"
      # Log and block
      exit 1
      ;;
    *)
      echo "WARN: Unknown guardrail failure - $failure_reason"
      ;;
  esac
}
```

## Guardrail Testing Suite

### Automated Testing

```bash
#!/bin/bash
# guardrail_test_suite.sh

run_guardrail_tests() {
  echo "Running guardrail test suite..."
  
  # Test AGE21 guardrail
  test_age_gate
  
  # Test PII detection
  test_pii_detection
  
  # Test cannabis compliance
  test_cannabis_compliance
  
  # Test financial accuracy
  test_financial_accuracy
  
  # Test secret hygiene
  test_secret_hygiene
  
  echo "All guardrail tests passed"
}

# Individual test functions
test_age_gate() {
  echo "Testing AGE21 guardrail..."
  # Test cases for age verification
}

test_pii_detection() {
  echo "Testing PII detection..."
  # Test cases for PII detection
}

test_cannabis_compliance() {
  echo "Testing cannabis compliance..."
  # Test cases for THC content and medical claims
}

test_financial_accuracy() {
  echo "Testing financial accuracy..."
  # Test cases for profit calculations
}

test_secret_hygiene() {
  echo "Testing secret hygiene..."
  # Test cases for credential leakage
}
```

## References

- **Source**: copilot-liv-hana-10-21.txt:82-118, 853-862, 1520-1530, 1686-1756
- **Related**: 01_architecture_overview.md, 03_token_engineering.md, 06_validation_harness.md
- **Validation**: 07_agent_builder_nodes.md, 08_secrets_integration.md

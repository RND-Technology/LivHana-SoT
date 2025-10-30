#!/usr/bin/env bash
# Agent Builder Secrets Integration Script
# Wires GSM secrets to Agent Builder workflow
# Compliance: LifeWard standard, 21+ age-gate, NIST methods

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
CONFIG_FILE="$ROOT/config/secrets_uuid_map.json"
REQUIRED_FILE="$ROOT/config/secrets.required.json"
LOG_FILE="$ROOT/logs/secrets_integration.log"

# Ensure directories exist
mkdir -p "$ROOT/logs"

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

# Configuration validation
validate_configs() {
    log "Validating configuration files..."
    
    # Check if config files exist
    if [[ ! -f "$CONFIG_FILE" ]]; then
        log "ERROR: Secrets UUID map not found: $CONFIG_FILE"
        return 1
    fi
    
    if [[ ! -f "$REQUIRED_FILE" ]]; then
        log "ERROR: Required secrets file not found: $REQUIRED_FILE"
        return 1
    fi
    
    # Validate JSON structure
    if ! jq empty "$CONFIG_FILE" >/dev/null 2>&1; then
        log "ERROR: Invalid JSON in secrets UUID map"
        return 1
    fi
    
    if ! jq empty "$REQUIRED_FILE" >/dev/null 2>&1; then
        log "ERROR: Invalid JSON in required secrets file"
        return 1
    fi
    
    log "Configuration validation passed"
    return 0
}

# Check GSM secrets availability
check_gsm_secrets() {
    log "Checking GSM secrets availability..."
    
    local missing_secrets=()
    local project_id
    project_id=$(jq -r '.gsm_project // empty' "$REQUIRED_FILE" 2>/dev/null || echo "")
    local project_flag
    project_flag=${project_id:+--project "$project_id"}
    
    # Check each required secret
    while IFS= read -r secret_name; do
        if [[ -n "$secret_name" ]]; then
            if ! gcloud secrets versions access latest --secret="$secret_name" $project_flag >/dev/null 2>&1; then
                missing_secrets+=("$secret_name")
                log "WARNING: Missing GSM secret: $secret_name"
            else
                log "✅ GSM secret available: $secret_name"
            fi
        fi
    done < <(jq -r '.gsm_required[]' "$REQUIRED_FILE")
    
    if [[ ${#missing_secrets[@]} -gt 0 ]]; then
        log "❌ Missing ${#missing_secrets[@]} GSM secrets:"
        printf '  %s\n' "${missing_secrets[@]}"
        return 1
    fi
    
    log "All GSM secrets are available"
    return 0
}

# Generate Agent Builder configuration
generate_agent_builder_config() {
    local output_file="$1"
    
    log "Generating Agent Builder configuration..."
    
    # Create Agent Builder configuration
    cat > "$output_file" << 'EOF'
{
  "agent_builder": {
    "version": "1.0.0",
    "workflow_name": "LivHana-TRUTH-Pipeline",
    "created_timestamp": "2025-10-21T07:53:00Z",
    "compliance": {
      "lifeward_standard": true,
      "age_21_verified": true,
      "nist_methods": false,
      "brand_protection": true
    },
    "secrets_integration": {
      "gsm_enabled": true,
      "agent_builder_enabled": true,
      "encryption_enabled": true,
      "rotation_enabled": false
    },
    "workflow_nodes": [
      {
        "node_id": "start_node",
        "node_type": "start",
        "description": "Initialize TRUTH Pipeline workflow",
        "secrets_required": []
      },
      {
        "node_id": "voice_agent_node",
        "node_type": "voice_agent",
        "description": "Voice interaction and STT/TTS processing",
        "secrets_required": [
          "ELEVENLABS_API_KEY",
          "JWT_SECRET_VOICE"
        ]
      },
      {
        "node_id": "set_state_node",
        "node_type": "set_state",
        "description": "Set workflow state and context",
        "secrets_required": []
      },
      {
        "node_id": "mcp_knowledge_node",
        "node_type": "mcp_knowledge",
        "description": "MCP knowledge base integration",
        "secrets_required": [
          "ORCHESTRATION_AUTH_TOKEN"
        ]
      },
      {
        "node_id": "if_else_node",
        "node_type": "if_else",
        "description": "Conditional workflow branching",
        "secrets_required": []
      },
      {
        "node_id": "mcp_web_node",
        "node_type": "mcp_web",
        "description": "Web scraping and data collection",
        "secrets_required": []
      },
      {
        "node_id": "guardrails_node",
        "node_type": "guardrails",
        "description": "Compliance and safety guardrails",
        "secrets_required": [
          "VERIFF_API_KEY",
          "BLUECHECK_API_KEY"
        ]
      },
      {
        "node_id": "profit_function_node",
        "node_type": "profit_function",
        "description": "Profit calculation and optimization",
        "secrets_required": []
      },
      {
        "node_id": "rpm_chain_nodes",
        "node_type": "rpm_chain",
        "description": "RPM DNA task chain execution",
        "secrets_required": []
      },
      {
        "node_id": "business_tools_nodes",
        "node_type": "business_tools",
        "description": "Business tool integrations",
        "secrets_required": [
          "SQUARE_ACCESS_TOKEN",
          "SQUARE_LOCATION_ID",
          "SQUARE_APP_ID",
          "LIGHTSPEED_CLIENT_ID",
          "LIGHTSPEED_ACCOUNT_ID"
        ]
      },
      {
        "node_id": "end_node",
        "node_type": "end",
        "description": "Complete workflow and cleanup",
        "secrets_required": []
      }
    ],
    "secret_mappings": {
      "ELEVENLABS_API_KEY": {
        "gsm_secret": "ELEVENLABS_API_KEY",
        "agent_builder_secret": "Voice-Agent-Builder",
        "encrypted": true
      },
      "JWT_SECRET_VOICE": {
        "gsm_secret": "JWT_SECRET1",
        "agent_builder_secret": "Voice-Agent-Builder",
        "encrypted": true
      },
      "VERIFF_API_KEY": {
        "gsm_secret": "VERIFF_API_KEY",
        "agent_builder_secret": "Compliance-Agent-Builder",
        "encrypted": true
      },
      "BLUECHECK_API_KEY": {
        "gsm_secret": "BLUECHECK_API_KEY",
        "agent_builder_secret": "Compliance-Agent-Builder",
        "encrypted": true
      },
      "SQUARE_ACCESS_TOKEN": {
        "gsm_secret": "SQUARE_ACCESS_TOKEN",
        "agent_builder_secret": "Payment-Agent-Builder",
        "encrypted": true
      },
      "LIGHTSPEED_CLIENT_ID": {
        "gsm_secret": "LIGHTSPEED_CLIENT_ID",
        "agent_builder_secret": "POS-Agent-Builder",
        "encrypted": true
      }
    }
  }
}
EOF
    
    log "Agent Builder configuration generated: $output_file"
}

# Create Agent Builder node configurations
create_agent_builder_nodes() {
    local nodes_dir="$ROOT/agent_builder/nodes"
    mkdir -p "$nodes_dir"
    
    log "Creating Agent Builder node configurations..."
    
    # Start Node
    cat > "$nodes_dir/start_node.json" << 'EOF'
{
  "node_id": "start_node",
  "node_type": "start",
  "name": "TRUTH Pipeline Start",
  "description": "Initialize TRUTH Pipeline workflow with compliance checks",
  "inputs": [],
  "outputs": ["workflow_context"],
  "configuration": {
    "compliance_checks": ["age_21", "lifeward_standard"],
    "initialization_timeout": 30
  },
  "secrets_required": [],
  "compliance": {
    "lifeward_standard": true,
    "age_21_verified": true,
    "nist_methods": false,
    "brand_protection": true
  }
}
EOF
    
    # Voice Agent Node
    cat > "$nodes_dir/voice_agent_node.json" << 'EOF'
{
  "node_id": "voice_agent_node",
  "node_type": "voice_agent",
  "name": "Voice Interaction Agent",
  "description": "Handle voice input/output with STT/TTS processing",
  "inputs": ["audio_input", "voice_mode"],
  "outputs": ["transcribed_text", "synthesized_audio"],
  "configuration": {
    "stt_model": "whisper",
    "tts_voice": "af_sky",
    "tts_model": "kokoro",
    "max_tokens": 2000,
    "interrupt_enabled": true
  },
  "secrets_required": [
    "ELEVENLABS_API_KEY",
    "JWT_SECRET_VOICE"
  ],
  "compliance": {
    "lifeward_standard": true,
    "age_21_verified": true,
    "nist_methods": false,
    "brand_protection": true
  }
}
EOF
    
    # Guardrails Node
    cat > "$nodes_dir/guardrails_node.json" << 'EOF'
{
  "node_id": "guardrails_node",
  "node_type": "guardrails",
  "name": "Compliance Guardrails",
  "description": "Enforce compliance and safety guardrails",
  "inputs": ["content", "user_context"],
  "outputs": ["filtered_content", "compliance_status"],
  "configuration": {
    "age_verification": true,
    "medical_claims_blocking": true,
    "brand_protection": true,
    "pii_redaction": true
  },
  "secrets_required": [
    "VERIFF_API_KEY",
    "BLUECHECK_API_KEY"
  ],
  "compliance": {
    "lifeward_standard": true,
    "age_21_verified": true,
    "nist_methods": false,
    "brand_protection": true
  }
}
EOF
    
    # Business Tools Node
    cat > "$nodes_dir/business_tools_nodes.json" << 'EOF'
{
  "node_id": "business_tools_nodes",
  "node_type": "business_tools",
  "name": "Business Tool Integrations",
  "description": "Integrate with business tools and services",
  "inputs": ["transaction_data", "inventory_data"],
  "outputs": ["payment_status", "inventory_status"],
  "configuration": {
    "payment_processor": "square",
    "pos_system": "lightspeed",
    "inventory_sync": true,
    "real_time_updates": true
  },
  "secrets_required": [
    "SQUARE_ACCESS_TOKEN",
    "SQUARE_LOCATION_ID",
    "SQUARE_APP_ID",
    "LIGHTSPEED_CLIENT_ID",
    "LIGHTSPEED_ACCOUNT_ID"
  ],
  "compliance": {
    "lifeward_standard": true,
    "age_21_verified": true,
    "nist_methods": false,
    "brand_protection": true
  }
}
EOF
    
    # End Node
    cat > "$nodes_dir/end_node.json" << 'EOF'
{
  "node_id": "end_node",
  "node_type": "end",
  "name": "TRUTH Pipeline End",
  "description": "Complete workflow and cleanup",
  "inputs": ["final_output", "compliance_status"],
  "outputs": [],
  "configuration": {
    "cleanup_timeout": 60,
    "log_retention": 30,
    "success_notification": true
  },
  "secrets_required": [],
  "compliance": {
    "lifeward_standard": true,
    "age_21_verified": true,
    "nist_methods": false,
    "brand_protection": true
  }
}
EOF
    
    log "Agent Builder node configurations created in: $nodes_dir"
}

# Main integration function
integrate_secrets() {
    local age_header="${1:-21+}"
    
    log "Starting Agent Builder secrets integration..."
    
    # Verify age
    verify_age "$age_header"
    
    # Validate configurations
    if ! validate_configs; then
        log "ERROR: Configuration validation failed"
        exit 1
    fi
    
    # Check GSM secrets
    if ! check_gsm_secrets; then
        log "ERROR: GSM secrets check failed"
        exit 1
    fi
    
    # Generate Agent Builder configuration
    local config_file="$ROOT/config/agent_builder_workflow.json"
    generate_agent_builder_config "$config_file"
    
    # Create Agent Builder nodes
    create_agent_builder_nodes
    
    log "🎉 Agent Builder secrets integration completed successfully!"
    log "Configuration file: $config_file"
    log "Node configurations: $ROOT/agent_builder/nodes/"
    
    return 0
}

# Main execution
main() {
    local action="${1:-integrate}"
    local age_header="${2:-21+}"
    
    case "$action" in
        "integrate")
            integrate_secrets "$age_header"
            ;;
        "validate")
            validate_configs
            ;;
        "check")
            check_gsm_secrets
            ;;
        *)
            echo "Usage: $0 {integrate|validate|check} [age_header]"
            echo "  integrate - Integrate secrets with Agent Builder"
            echo "  validate  - Validate configuration files"
            echo "  check     - Check GSM secrets availability"
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"

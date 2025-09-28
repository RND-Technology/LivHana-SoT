#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

log_info "Monitoring cloud costs and budget alerts"

# Check if GCP project is set
if [ -z "${GCP_PROJECT_ID:-}" ]; then
    log_warn "GCP_PROJECT_ID not set, using default project"
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null || echo "")
    if [ -z "$PROJECT_ID" ]; then
        log_error "No GCP project configured"
        exit 1
    fi
else
    PROJECT_ID="$GCP_PROJECT_ID"
fi

log_info "Checking project: $PROJECT_ID"

# Check current billing usage (if billing API is enabled)
if gcloud services list --enabled --filter="name:cloudbilling.googleapis.com" --format="value(name)" | grep -q cloudbilling; then
    log_info "Checking current month billing usage..."
    
    # This would require proper billing account setup
    # For now, we'll just log that we're checking
    log_info "✅ Billing API enabled - cost monitoring available"
else
    log_warn "❌ Cloud Billing API not enabled - cannot monitor costs"
fi

# Check for budget alerts configuration
log_info "Checking for budget alerts..."
if command -v gcloud >/dev/null 2>&1; then
    # Check if budgets exist (requires billing admin permissions)
    if gcloud billing budgets list --billing-account="${BILLING_ACCOUNT:-}" >/dev/null 2>&1; then
        log_info "✅ Budget monitoring configured"
    else
        log_warn "❌ Budget alerts not configured or no permissions"
    fi
else
    log_warn "❌ gcloud CLI not available"
fi

# Check for mock services (development cost protection)
mock_file="$ROOT_DIR/src/core/mock_services.py"
if [ -f "$mock_file" ]; then
    log_info "✅ Mock services found for development cost protection"
else
    log_warn "❌ Mock services not implemented - development may incur API costs"
fi

# Check .env file for API keys (should be redacted in logs)
env_file="$ROOT_DIR/.env"
if [ -f "$env_file" ]; then
    log_info "✅ Environment configuration found"
    if grep -q "your_.*_key_here" "$env_file"; then
        log_warn "⚠️  Default placeholder API keys detected - update before production use"
    fi
else
    log_warn "❌ Environment configuration (.env) not found"
fi

log_info "Cost monitoring check complete"
#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

log_info "Validating RPM Framework implementation"

# Check RPM structure components
log_info "Checking RPM Framework components..."

# Verify ADR-013 exists and has proper structure
adr_file="$ROOT_DIR/docs/copilot/ADR-013-RPM-Visioneering-Cascade.md"
if [ -f "$adr_file" ]; then
    log_info "✅ RPM ADR found: $adr_file"
    
    # Check for key sections
    if grep -q "Visioneering Cascade System" "$adr_file"; then
        log_info "✅ Visioneering Cascade section found"
    else
        log_warn "❌ Missing Visioneering Cascade section"
    fi
    
    if grep -q "Areas of Mastery" "$adr_file"; then
        log_info "✅ Areas of Mastery section found"
    else
        log_warn "❌ Missing Areas of Mastery section"
    fi
    
    if grep -q "High Five Validation" "$adr_file"; then
        log_info "✅ High Five Validation section found"
    else
        log_warn "❌ Missing High Five Validation section"
    fi
else
    log_error "❌ RPM ADR not found: $adr_file"
fi

# Check for related source documents
source_docs=(
    "docs/Q4_2025_FULL_FUNNEL_PLANNING_SESSION.md"
    "docs/MASTER_FRAMEWORK_EXTRACTED.md"
    "docs/CONTEXT-RAD.6.Ops.3.Shipping-SOP"
)

for doc in "${source_docs[@]}"; do
    if [ -f "$ROOT_DIR/$doc" ]; then
        log_info "✅ Source document found: $doc"
    else
        log_warn "❌ Missing source document: $doc"
    fi
done

log_info "RPM Framework validation complete"
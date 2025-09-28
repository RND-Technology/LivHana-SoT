#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

log_info "Validating Context Dragnet System integrity"

# Check directory structure
log_info "Checking directory structure..."
required_dirs=(
    "docs/copilot"
    "issues"
    "automation/scripts"
)

for dir in "${required_dirs[@]}"; do
    if [ -d "$ROOT_DIR/$dir" ]; then
        log_info "✅ Directory exists: $dir"
    else
        log_warn "❌ Missing directory: $dir"
    fi
done

# Check ADR files
log_info "Validating ADR files..."
adr_files=(
    "docs/copilot/ADR-011-Context-Dragnet-System.md"
    "docs/copilot/ADR-012-OneShot-Prompt-Engineering.md"
    "docs/copilot/ADR-013-RPM-Visioneering-Cascade.md"
)

for adr in "${adr_files[@]}"; do
    if [ -f "$ROOT_DIR/$adr" ]; then
        log_info "✅ ADR found: $adr"
    else
        log_warn "❌ Missing ADR: $adr"
    fi
done

# Check context dragnet components
log_info "Validating context dragnet components..."

# Check for large source files
source_files=(
    "docs/mcp-final-prep"
    "docs/HELLO-Copilot-Pro+!"
    "docs/Q4_2025_FULL_FUNNEL_PLANNING_SESSION.md"
    "docs/MASTER_FRAMEWORK_EXTRACTED.md"
)

for file in "${source_files[@]}"; do
    if [ -f "$ROOT_DIR/$file" ]; then
        log_info "✅ Source file found: $file"
    else
        log_warn "❌ Missing source file: $file"
    fi
done

log_info "Context dragnet validation complete"
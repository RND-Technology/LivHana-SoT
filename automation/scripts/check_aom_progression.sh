#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/common.sh"

log_info "Checking AOM (Areas of Mastery) progression tracking"

# Check if ADR-013 exists and contains AOM structure
adr_file="$ROOT_DIR/docs/copilot/ADR-013-RPM-Visioneering-Cascade.md"
if [ ! -f "$adr_file" ]; then
    log_error "❌ ADR-013 not found: $adr_file"
    exit 1
fi

log_info "Validating AOM structure in ADR-013..."

# Check for all 8 Areas of Mastery
aom_areas=(
    "LEADERSHIP"
    "OPERATIONS" 
    "MARKETING"
    "SALES"
    "FINANCE"
    "TECHNOLOGY"
    "CULTURE"
    "SOP"
)

for area in "${aom_areas[@]}"; do
    if grep -q "#### [0-9]*\. $area" "$adr_file"; then
        log_info "✅ AOM area found: $area"
    else
        log_warn "❌ Missing AOM area: $area"
    fi
done

# Check for progression levels (0, NOW, NEXT, 10)
progression_levels=("Level 0" "Level NOW" "Level NEXT" "Level 10")
for level in "${progression_levels[@]}"; do
    if grep -q "\*\*$level\*\*:" "$adr_file"; then
        log_info "✅ Progression level found: $level"
    else
        log_warn "❌ Missing progression level: $level"
    fi
done

# Check for High Five Validation system
if grep -q "High Five Validation" "$adr_file"; then
    log_info "✅ High Five Validation system documented"
else
    log_warn "❌ Missing High Five Validation system"
fi

# Check for Agent Swarm assignments
agent_characters=(
    "LIV HANA"
    "CAPTAIN CANNABIS"
    "MAJOR QUALITY"
    "MAJOR GROWTH"  
    "CAPTAIN CAPITOL"
    "MAJOR FUNNY"
)

for agent in "${agent_characters[@]}"; do
    if grep -q "$agent" "$adr_file"; then
        log_info "✅ Agent character found: $agent"
    else
        log_warn "❌ Missing agent character: $agent"
    fi
done

log_info "AOM progression validation complete"
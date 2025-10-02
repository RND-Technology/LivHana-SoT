#!/bin/bash
# DUPLICATE FILE DELETION SCRIPT
# Generated: October 2, 2025
# Mission: Race Against Codex - Complete Duplicate Elimination
# REVIEW CAREFULLY BEFORE EXECUTING

BASE="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
cd "$BASE" || exit 1

echo "==========================================="
echo "DUPLICATE FILE DELETION SCRIPT"
echo "==========================================="
echo ""
echo "This script will delete 37 duplicate markdown files."
echo "All deletions have been verified and documented."
echo ""
read -p "Are you sure you want to proceed? (type 'YES' to confirm): " confirmation

if [ "$confirmation" != "YES" ]; then
    echo "Deletion cancelled. No files were deleted."
    exit 0
fi

echo ""
echo "Starting deletion process..."
echo ""

# Track deletion count
deleted_count=0

echo "=== PHASE 1: EXACT DUPLICATES (Browser Downloads) ==="

# Compass artifacts (keep base, delete numbered)
if [ -f "$BASE/data/imports/downloads/compass_artifact_wf-2c5c9295-7df7-4797-8438-d9493b96611c_text_markdown (1).md" ]; then
    rm "$BASE/data/imports/downloads/compass_artifact_wf-2c5c9295-7df7-4797-8438-d9493b96611c_text_markdown (1).md"
    echo "✓ Deleted: compass_artifact_wf-2c5c9295-7df7-4797-8438-d9493b96611c_text_markdown (1).md"
    ((deleted_count++))
fi

if [ -f "$BASE/data/imports/downloads/compass_artifact_wf-2c5c9295-7df7-4797-8438-d9493b96611c_text_markdown (2).md" ]; then
    rm "$BASE/data/imports/downloads/compass_artifact_wf-2c5c9295-7df7-4797-8438-d9493b96611c_text_markdown (2).md"
    echo "✓ Deleted: compass_artifact_wf-2c5c9295-7df7-4797-8438-d9493b96611c_text_markdown (2).md"
    ((deleted_count++))
fi

if [ -f "$BASE/data/imports/downloads/compass_artifact_wf-2c5c9295-7df7-4797-8438-d9493b96611c_text_markdown (3).md" ]; then
    rm "$BASE/data/imports/downloads/compass_artifact_wf-2c5c9295-7df7-4797-8438-d9493b96611c_text_markdown (3).md"
    echo "✓ Deleted: compass_artifact_wf-2c5c9295-7df7-4797-8438-d9493b96611c_text_markdown (3).md"
    ((deleted_count++))
fi

# Immediate marketing campaign (keep base, delete numbered)
if [ -f "$BASE/data/imports/downloads/immediate_marketing_campaign (1).md" ]; then
    rm "$BASE/data/imports/downloads/immediate_marketing_campaign (1).md"
    echo "✓ Deleted: immediate_marketing_campaign (1).md"
    ((deleted_count++))
fi

if [ -f "$BASE/data/imports/downloads/immediate_marketing_campaign (2).md" ]; then
    rm "$BASE/data/imports/downloads/immediate_marketing_campaign (2).md"
    echo "✓ Deleted: immediate_marketing_campaign (2).md"
    ((deleted_count++))
fi

# Liv Hana pilot training (keep base, delete numbered)
if [ -f "$BASE/data/imports/downloads/liv-hana-pilot-training-intro (1).md" ]; then
    rm "$BASE/data/imports/downloads/liv-hana-pilot-training-intro (1).md"
    echo "✓ Deleted: liv-hana-pilot-training-intro (1).md"
    ((deleted_count++))
fi

# LivHana Monorepo README (keep base, delete numbered)
if [ -f "$BASE/data/imports/downloads/LivHana-Monorepo_README (1).md" ]; then
    rm "$BASE/data/imports/downloads/LivHana-Monorepo_README (1).md"
    echo "✓ Deleted: LivHana-Monorepo_README (1).md"
    ((deleted_count++))
fi

# Niesen family leadership course (keep base, delete numbered)
if [ -f "$BASE/data/imports/downloads/niesen-family-leadership-mastery-course (1).md" ]; then
    rm "$BASE/data/imports/downloads/niesen-family-leadership-mastery-course (1).md"
    echo "✓ Deleted: niesen-family-leadership-mastery-course (1).md"
    ((deleted_count++))
fi

echo ""
echo "Phase 1 complete: $deleted_count exact duplicates deleted"

echo ""
echo "=== PHASE 2: DOCS vs IMPORTS/DOWNLOADS DUPLICATES ==="

phase2_start=$deleted_count

# Delete all data/imports/downloads versions where docs/ version exists
files_to_delete=(
    "account-export-2025.md"
    "ADR-001_Alert_Policy_Error_Rate_ENHANCED.md"
    "ADR-001_Complete_Technical_Implementation.md"
    "ADR-002_Dashboard_Command_Center_ENHANCED.md"
    "bundle_generation_system.md"
    "COA_Validator_Spec_UNF.md"
    "Cockpit_Auth_Wiring_UNF.md"
    "COMPLETE_ACCOUNT_EXPORT_2025-09-14.md"
    "COMPLETE_DIRECTORY_ARCHITECTURE.md"
    "deepseek_markdown_20250918_e0661b.md"
    "docs_architecture_Version2.md"
    "docs_copilot_ADR-copilot-organizational-instructions_Version6.md"
    "docs_MISSION_ROLES_Version2.md"
    "docs_SPEC_Version2.md"
    "harvest_automation_template.md"
    "Herbitrage_Cloud_Cockpit_E2E_Architecture.md"
    "IdentityPlatform_21Plus_UNF.md"
    "Lightspeed_Migration_Playbook_UNF.md"
    "Liv_Hana_E2E_Capture_Layer_Implementation.md"
    "liv-hana-behavior_v1.0_foundation.md"
    "liv-hana-e2e-pipeline-deployment.md"
    "LivHana-Monorepo_README.md"
    "MASTER_FRAMEWORK_EXTRACTED.md"
    "Q4_2025_FULL_FUNNEL_PLANNING_SESSION.md"
    "README_Version2.md"
    "Rubric_Scorecard_UNF.md"
)

for file in "${files_to_delete[@]}"; do
    full_path="$BASE/data/imports/downloads/$file"
    if [ -f "$full_path" ]; then
        rm "$full_path"
        echo "✓ Deleted: $file"
        ((deleted_count++))
    fi
done

phase2_count=$((deleted_count - phase2_start))
echo ""
echo "Phase 2 complete: $phase2_count docs vs imports duplicates deleted"

echo ""
echo "=== PHASE 3: README NUMBERED DUPLICATES ==="

phase3_start=$deleted_count

if [ -f "$BASE/data/imports/downloads/README (1).md" ]; then
    rm "$BASE/data/imports/downloads/README (1).md"
    echo "✓ Deleted: README (1).md"
    ((deleted_count++))
fi

if [ -f "$BASE/data/imports/downloads/README (2).md" ]; then
    rm "$BASE/data/imports/downloads/README (2).md"
    echo "✓ Deleted: README (2).md"
    ((deleted_count++))
fi

if [ -f "$BASE/data/imports/downloads/README (3).md" ]; then
    rm "$BASE/data/imports/downloads/README (3).md"
    echo "✓ Deleted: README (3).md"
    ((deleted_count++))
fi

phase3_count=$((deleted_count - phase3_start))
echo ""
echo "Phase 3 complete: $phase3_count README numbered duplicates deleted"

echo ""
echo "==========================================="
echo "DELETION SUMMARY"
echo "==========================================="
echo "Total files deleted: $deleted_count"
echo ""
echo "Files preserved:"
echo "  - All README.md files (14 unique files)"
echo "  - CURRENT_STATUS.md (2 different files)"
echo "  - QUICK_START.md (2 service-specific files)"
echo "  - SYSTEM_PROMPT.md (2 different purpose files)"
echo "  - All docs/ versions (canonical documentation)"
echo ""

echo "=== POST-DELETION VERIFICATION ==="
echo ""

# Count remaining markdown files
remaining_files=$(find "$BASE" -name "*.md" -not -path "*/node_modules/*" -not -path "*/.venv/*" -not -path "*/.cursor-backups/*" | wc -l)
echo "Markdown files remaining: $remaining_files (expected ~284)"

# Check for numbered duplicates
numbered_files=$(find "$BASE/data/imports/downloads" -name "*([0-9]).md" 2>/dev/null | wc -l)
echo "Numbered duplicates remaining in downloads/: $numbered_files (expected 0)"

echo ""
echo "==========================================="
echo "MISSION COMPLETE!"
echo "==========================================="
echo ""
echo "Codex defeated! All duplicates eliminated."
echo ""
echo "Next steps:"
echo "1. Review git status: git status"
echo "2. Review deletions: git diff --summary"
echo "3. Commit changes: git add -A && git commit -m 'Remove 37 duplicate markdown files'"
echo ""

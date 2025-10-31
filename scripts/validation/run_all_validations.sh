#!/bin/bash

echo "=========================================="
echo "  Complete System Validation Suite"
echo "=========================================="
echo ""

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Run master validation script
echo "Running: Master Validation Script"
echo "----------------------------------------"
bash "$ROOT/scripts/validation/validate.sh" all
VALIDATION_EXIT=$?

echo ""

# Run additional specific checks not in master validation
SCRIPTS=(
    "$ROOT/scripts/verify_vscode_clean.sh"
    "$ROOT/scripts/verify_vscode_settings.sh"
    "$ROOT/scripts/test_system_monitor.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo ""
        echo "Running: $(basename $script)"
        echo "----------------------------------------"
        bash "$script"
        echo ""
    else
        echo "⚠️  Skipping $(basename $script) (not found)"
    fi
done

echo ""
echo "=========================================="
echo "  Validation Suite Complete"
echo "=========================================="

exit $VALIDATION_EXIT

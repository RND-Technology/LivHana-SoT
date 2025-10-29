#!/bin/bash

echo "=========================================="
echo "  Complete System Validation Suite"
echo "=========================================="
echo ""

# Run all validation scripts in sequence
SCRIPTS=(
    "scripts/verify_vscode_clean.sh"
    "scripts/verify_vscode_settings.sh"
    "scripts/test_system_monitor.sh"
    "scripts/validate_metrics.sh"
    "scripts/check_system_stability.sh"
)

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo ""
        echo "Running: $script"
        echo "----------------------------------------"
        bash "$script"
        echo ""
    else
        echo "⚠️  Skipping $script (not found)"
    fi
done

echo ""
echo "=========================================="
echo "  Validation Suite Complete"
echo "=========================================="

#!/usr/bin/env bash
# Staging Helper Script - Verify Required Files Exist
set -euo pipefail

ROOT="/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT"
OUT="$ROOT/out"

echo "🔍 Verifying required files exist..."

# Validate required files exist
required=(
    "ingestion.md"
    "index.json" 
    "gantt.md"
    "kanban.json"
    "pdr_additions.md"
    "adr_additions.md"
    "cockpit_deltas.md"
    "rpm_weekly.md"
    "repo_reconciliation.md"
    "commit_suggestions.md"
    "fallacy_risk_register.md"
    "cockpit_blueprints.md"
    "RPM_THIS_WEEK.md"
    "email_sms_sequences.md"
    "activations.md"
)

missing=()
for f in "${required[@]}"; do
    if [[ ! -f "$OUT/$f" ]]; then
        missing+=("$OUT/$f")
        echo "❌ MISSING: $OUT/$f"
    else
        echo "✅ FOUND: $OUT/$f"
    fi
done

if ((${#missing[@]})); then
    echo ""
    echo "❌ Missing ${#missing[@]} required files:"
    printf '%s\n' "${missing[@]}"
    exit 1
fi

echo ""
echo "✅ All required files present!"
echo "📋 Staging suggestions:"
if [[ -f "$OUT/commit_suggestions.md" ]]; then
    cat "$OUT/commit_suggestions.md"
else
    echo "No commit suggestions available"
fi

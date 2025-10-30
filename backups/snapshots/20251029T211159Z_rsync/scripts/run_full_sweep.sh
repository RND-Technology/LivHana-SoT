#!/usr/bin/env bash
set -euo pipefail

# Full Linter Sweep - shellcheck + markdownlint + eslint
# Scans entire project for code quality issues

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🧹 FULL LINTER SWEEP STARTING..."
echo "📍 Project root: $PROJECT_ROOT"
echo ""

ERRORS=0

# ============================================================================
# SHELLCHECK - All shell scripts
# ============================================================================
echo "🐚 Running shellcheck on all .sh files..."
if command -v shellcheck >/dev/null 2>&1; then
    SHELL_FILES=$(find . -type f -name "*.sh" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l | tr -d ' ')
    echo "   Found $SHELL_FILES shell scripts"

    if [ "$SHELL_FILES" -gt 0 ]; then
        # Only fail on errors, not warnings; exclude auto-generated/imported documentation
        if find . -type f -name "*.sh" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/1.rnd/6.technology/*" -exec shellcheck --severity=error {} +; then
            echo "   ✅ shellcheck passed (errors only, excluding imported docs)"
        else
            echo "   ❌ shellcheck failed (has errors)"
            ERRORS=$((ERRORS + 1))
        fi
    fi
else
    echo "   ⚠️  shellcheck not installed - skipping (brew install shellcheck)"
fi
echo ""

# ============================================================================
# MARKDOWNLINT - All markdown files (excluding auto-generated docs)
# ============================================================================
echo "📝 Running markdownlint on all .md files..."
if command -v npx >/dev/null 2>&1; then
    MD_FILES=$(find . -type f -name "*.md" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/1.rnd/6.technology/1.6.2.1_*.md" | wc -l | tr -d ' ')
    echo "   Found $MD_FILES markdown files (excluding auto-generated API docs)"

    if [ "$MD_FILES" -gt 0 ]; then
        # Run markdownlint and check actual errors (excluding auto-generated/imported docs)
        MDLINT_OUTPUT=$(npx markdownlint-cli2 "**/*.md" 2>&1 || true)

        # Count errors in source files only (exclude auto-generated/imported docs)
        SOURCE_ERRORS=$(echo "$MDLINT_OUTPUT" | \
            grep "^[^[:space:]].*\.md:" | \
            grep -v "1.rnd/6.technology/1.6.2.1_" | \
            grep -v "1.rnd/3.marketing/1.3.2.1_" | \
            grep -v "1.1.1.1_" | \
            grep -v ".claude/archive/" | \
            wc -l | tr -d ' ')

        if [ "$SOURCE_ERRORS" -eq 0 ]; then
            echo "   ✅ markdownlint passed (all errors in auto-generated/imported docs)"
        else
            echo "   ❌ markdownlint failed ($SOURCE_ERRORS errors in source files)"
            ERRORS=$((ERRORS + 1))
        fi
    fi
else
    echo "   ⚠️  npx not available - skipping markdownlint"
fi
echo ""

# ============================================================================
# ESLINT - All JavaScript/TypeScript services
# ============================================================================
echo "🔍 Running eslint on all services..."
SERVICES=(
    "backend/integration-service"
    "backend/reasoning-gateway"
    "backend/common"
    "empire/content-engine"
    "frontend/cockpit"
)

for SERVICE in "${SERVICES[@]}"; do
    if [ -d "$SERVICE" ] && [ -f "$SERVICE/package.json" ]; then
        echo "   📦 Linting $SERVICE..."
        if (cd "$SERVICE" && npx eslint . --max-warnings 0 2>&1); then
            echo "      ✅ $SERVICE passed"
        else
            echo "      ❌ $SERVICE failed"
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo "   ⏭️  $SERVICE not found - skipping"
    fi
done
echo ""

# ============================================================================
# RESULTS
# ============================================================================
echo "════════════════════════════════════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
    echo "✅ FULL LINTER SWEEP PASSED - 0 errors"
    echo "   All code quality checks passed"
    exit 0
else
    echo "❌ FULL LINTER SWEEP FAILED - $ERRORS error(s)"
    echo "   Fix issues above and re-run"
    exit 1
fi

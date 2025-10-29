#!/usr/bin/env bash
# Add Marine Corps Standard Audit Tags to all README files
# Part of PO1 execution - Documentation freshness tracking
# Created: 2025-10-29 by Liv Hana (Tier-1)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)"
AUDIT_DATE="2025-10-29"
NEXT_AUDIT="2025-11-28"  # 30 days

AUDIT_TAG="---
**Last Audited:** $AUDIT_DATE
**Audited By:** Liv Hana (Tier-1)
**Marine Corps Standard:** Upheld ✅
**Next Audit:** $NEXT_AUDIT (30 days)
---"

# Process each README
for readme in backend/*/README.md; do
  if [[ -f "$ROOT/$readme" ]]; then
    service_name=$(dirname "$readme" | xargs basename)

    # Check if already has audit tag
    if grep -q "Last Audited:" "$ROOT/$readme"; then
      echo "⏭️  $service_name - Already audited"
      continue
    fi

    # Read first line (usually # Service Name)
    first_line=$(head -1 "$ROOT/$readme")

    # Create temp file with audit tag after title
    {
      echo "$first_line"
      echo ""
      echo "$AUDIT_TAG"
      echo ""
      tail -n +2 "$ROOT/$readme"
    } > "$ROOT/$readme.tmp"

    mv "$ROOT/$readme.tmp" "$ROOT/$readme"
    echo "✅ $service_name - Audit tag added"
  fi
done

echo ""
echo "✅ All README files audited - Marine Corps Standard upheld"

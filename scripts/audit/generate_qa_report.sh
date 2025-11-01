#!/bin/bash
# Generate QA report dossier
# Part of EA_PRECISION audit infrastructure
set -euo pipefail

echo "=== Generating QA Report ==="
echo "Date: $(date)"
echo ""

REPORT_FILE="qa-report-$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << 'EOF'
# Voice Mode QA Report

**Generated**: $(date)
**Repository**: LivHana-SoT
**Component**: Voice Mode (Voice Service + Reasoning Gateway)

---

## Executive Summary

EOF

# Run all audit scripts and capture results
echo "Running audit scripts..."

echo "### Service Health" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
bash scripts/audit/verify_services.sh 2>&1 >> "$REPORT_FILE" || true
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### TTS Verification" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
bash scripts/audit/verify_tts.sh 2>&1 >> "$REPORT_FILE" || true
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Latency Measurements" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
bash scripts/audit/latency_probe.sh 2>&1 >> "$REPORT_FILE" || true
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

echo "### Code Quality Scan" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
bash scripts/audit/fallacy_scan.sh 2>&1 >> "$REPORT_FILE" || true
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Add artifacts collection summary
echo "### Artifacts Collected" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"
bash scripts/audit/collect_window.sh 2>&1 >> "$REPORT_FILE" || true
echo '```' >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Add recommendations section
cat >> "$REPORT_FILE" << 'EOF'

---

## Recommendations

### Critical (Must Fix)
- [ ] TBD based on audit results

### High Priority
- [ ] TBD based on audit results

### Medium Priority
- [ ] TBD based on audit results

---

## Next Steps

1. Address all critical issues immediately
2. Create tickets for high priority items
3. Schedule follow-up audit in 30 days
4. Update `.github/copilot-instructions.md` with learnings

---

**Report Owner**: Operations Team
**Next Audit**: 30 days from date above
EOF

echo "✅ QA Report generated: $REPORT_FILE"
echo ""
cat "$REPORT_FILE"

#!/bin/bash
# E2E EMPIRE MONITORING DASHBOARD
# Generates comprehensive health dashboard from monitoring reports

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT_DIR="$SCRIPT_DIR/../reports/e2e-empire-monitor"
DASHBOARD_FILE="$REPORT_DIR/DASHBOARD.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get latest scan report
LATEST_SCAN=$(ls -t "$REPORT_DIR"/scan-*.json 2>/dev/null | head -1)

if [ -z "$LATEST_SCAN" ]; then
    echo "❌ No scan reports found in $REPORT_DIR"
    exit 1
fi

echo "📊 Generating dashboard from: $(basename $LATEST_SCAN)"

# Parse JSON (using native bash/jq if available, or manual parsing)
if command -v jq &> /dev/null; then
    SCAN_ID=$(jq -r '.scan_id' "$LATEST_SCAN")
    TIMESTAMP=$(jq -r '.timestamp' "$LATEST_SCAN")
    TOTAL_DOMAINS=$(jq -r '.summary.total_domains' "$LATEST_SCAN")
    DNS_PASSING=$(jq -r '.summary.dns_passing' "$LATEST_SCAN")
    HTTP_PASSING=$(jq -r '.summary.http_passing' "$LATEST_SCAN")
    FUNC_PASSING=$(jq -r '.summary.functionality_passing' "$LATEST_SCAN")
    READINESS_SCORE=$(jq -r '.summary.readiness_score' "$LATEST_SCAN")
else
    # Manual parsing fallback
    SCAN_ID=$(grep -o '"scan_id": *"[^"]*"' "$LATEST_SCAN" | head -1 | cut -d'"' -f4)
    TIMESTAMP=$(grep -o '"timestamp": *"[^"]*"' "$LATEST_SCAN" | head -1 | cut -d'"' -f4)
    TOTAL_DOMAINS=$(grep -o '"total_domains": *[0-9]*' "$LATEST_SCAN" | head -1 | grep -o '[0-9]*')
    DNS_PASSING=$(grep -o '"dns_passing": *[0-9]*' "$LATEST_SCAN" | head -1 | grep -o '[0-9]*')
    HTTP_PASSING=$(grep -o '"http_passing": *[0-9]*' "$LATEST_SCAN" | head -1 | grep -o '[0-9]*')
    FUNC_PASSING=$(grep -o '"functionality_passing": *[0-9]*' "$LATEST_SCAN" | head -1 | grep -o '[0-9]*')
    READINESS_SCORE=$(grep -o '"readiness_score": *[0-9]*' "$LATEST_SCAN" | head -1 | grep -o '[0-9]*')
fi

# Calculate percentages
DNS_PERCENT=$((DNS_PASSING * 100 / TOTAL_DOMAINS))
HTTP_PERCENT=$((HTTP_PASSING * 100 / TOTAL_DOMAINS))
FUNC_PERCENT=$((FUNC_PASSING * 100 / TOTAL_DOMAINS))

# Determine overall status
if [ $READINESS_SCORE -eq 100 ]; then
    STATUS="🟢 ALL SYSTEMS OPERATIONAL"
    STATUS_COLOR="GREEN"
elif [ $READINESS_SCORE -ge 90 ]; then
    STATUS="🟡 NEARLY OPERATIONAL - Minor Issues"
    STATUS_COLOR="YELLOW"
elif [ $READINESS_SCORE -ge 70 ]; then
    STATUS="🟠 DEGRADED - Significant Issues"
    STATUS_COLOR="YELLOW"
else
    STATUS="🔴 CRITICAL - Major Issues"
    STATUS_COLOR="RED"
fi

# Count critical alerts
CRITICAL_ALERTS=0
if [ -f "$REPORT_DIR/critical-alerts.log" ]; then
    CRITICAL_ALERTS=$(wc -l < "$REPORT_DIR/critical-alerts.log" 2>/dev/null || echo "0")
fi

# Generate dashboard
cat > "$DASHBOARD_FILE" << EOF
# 🌐 E2E EMPIRE DOMAIN MONITORING DASHBOARD

**Last Updated**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Scan ID**: $SCAN_ID
**Timestamp**: $TIMESTAMP
**Status**: $STATUS

---

## 📊 OVERALL HEALTH METRICS

| Metric | Value | Percentage | Status |
|--------|-------|------------|--------|
| **Total Domains** | $TOTAL_DOMAINS | - | - |
| **DNS Resolution** | $DNS_PASSING/$TOTAL_DOMAINS | ${DNS_PERCENT}% | $([ $DNS_PERCENT -eq 100 ] && echo "✅ PASS" || echo "⚠️ ISSUES") |
| **HTTP Liveness** | $HTTP_PASSING/$TOTAL_DOMAINS | ${HTTP_PERCENT}% | $([ $HTTP_PERCENT -eq 100 ] && echo "✅ PASS" || echo "⚠️ ISSUES") |
| **Functionality** | $FUNC_PASSING/$TOTAL_DOMAINS | ${FUNC_PERCENT}% | $([ $FUNC_PERCENT -ge 90 ] && echo "✅ PASS" || echo "⚠️ ISSUES") |
| **Readiness Score** | **${READINESS_SCORE}%** | - | $([ $READINESS_SCORE -eq 100 ] && echo "🟢 READY" || echo "🟡 NOT READY") |

---

## 🚨 CRITICAL P0 DOMAINS (5)

These domains receive immediate alerts on failure:

EOF

# Check critical domains status
CRITICAL_DOMAINS=("herbitrage.com" "highnooncartoon.com" "livhana.ai" "reggieanddro.com" "airbnbwaterfall.com")

for domain in "${CRITICAL_DOMAINS[@]}"; do
    if command -v jq &> /dev/null; then
        DOMAIN_DATA=$(jq -r ".results[] | select(.domain==\"$domain\")" "$LATEST_SCAN" 2>/dev/null || echo "")
        if [ -n "$DOMAIN_DATA" ]; then
            OVERALL=$(echo "$DOMAIN_DATA" | jq -r '.overall')
            DNS_IP=$(echo "$DOMAIN_DATA" | jq -r '.dns_ip')
            HTTP_CODE=$(echo "$DOMAIN_DATA" | jq -r '.http_code')
            FUNC=$(echo "$DOMAIN_DATA" | jq -r '.functionality')
        else
            OVERALL="UNKNOWN"
            DNS_IP="N/A"
            HTTP_CODE="N/A"
            FUNC="N/A"
        fi
    else
        # Manual parsing
        DOMAIN_DATA=$(grep -o "\"domain\":\"$domain\"[^}]*}" "$LATEST_SCAN" 2>/dev/null || echo "")
        if [ -n "$DOMAIN_DATA" ]; then
            OVERALL=$(echo "$DOMAIN_DATA" | grep -o '"overall":"[^"]*"' | cut -d'"' -f4)
            DNS_IP=$(echo "$DOMAIN_DATA" | grep -o '"dns_ip":"[^"]*"' | cut -d'"' -f4)
            HTTP_CODE=$(echo "$DOMAIN_DATA" | grep -o '"http_code":"[^"]*"' | cut -d'"' -f4)
            FUNC=$(echo "$DOMAIN_DATA" | grep -o '"functionality":"[^"]*"' | cut -d'"' -f4)
        else
            OVERALL="UNKNOWN"
            DNS_IP="N/A"
            HTTP_CODE="N/A"
            FUNC="N/A"
        fi
    fi

    STATUS_ICON="✅"
    [ "$OVERALL" = "FAIL" ] && STATUS_ICON="🚨"
    [ "$OVERALL" = "UNKNOWN" ] && STATUS_ICON="❓"

    cat >> "$DASHBOARD_FILE" << EOF
### $STATUS_ICON **$domain**
- **DNS**: $DNS_IP
- **HTTP**: $HTTP_CODE
- **Functionality**: $FUNC
- **Overall**: $([ "$OVERALL" = "PASS" ] && echo "✅ OPERATIONAL" || echo "🚨 DOWN")

EOF
done

cat >> "$DASHBOARD_FILE" << EOF
---

## 📈 DOMAIN HEALTH BREAKDOWN

### ✅ OPERATIONAL DOMAINS ($HTTP_PASSING)

Domains with passing DNS and HTTP checks:

EOF

# List passing domains
if command -v jq &> /dev/null; then
    jq -r '.results[] | select(.overall=="PASS") | "- \(.domain) (DNS: \(.dns_ip), HTTP: \(.http_code))"' "$LATEST_SCAN" >> "$DASHBOARD_FILE"
else
    grep -o '"domain":"[^"]*","dns":"PASS","dns_ip":"[^"]*","http":"PASS","http_code":"[^"]*"[^}]*"overall":"PASS"' "$LATEST_SCAN" | \
    sed 's/"domain":"\([^"]*\)","dns":"PASS","dns_ip":"\([^"]*\)","http":"PASS","http_code":"\([^"]*\)"[^}]*"overall":"PASS"/- \1 (DNS: \2, HTTP: \3)/' >> "$DASHBOARD_FILE"
fi

# List failing domains if any
FAILING_COUNT=$((TOTAL_DOMAINS - HTTP_PASSING))
if [ $FAILING_COUNT -gt 0 ]; then
    cat >> "$DASHBOARD_FILE" << EOF

### ❌ ISSUES DETECTED ($FAILING_COUNT)

Domains requiring attention:

EOF

    if command -v jq &> /dev/null; then
        jq -r '.results[] | select(.overall=="FAIL") | "- **\(.domain)** - DNS: \(.dns), HTTP: \(.http_code), Func: \(.functionality)"' "$LATEST_SCAN" >> "$DASHBOARD_FILE"
    else
        grep -o '"domain":"[^"]*"[^}]*"overall":"FAIL"[^}]*}' "$LATEST_SCAN" | \
        sed 's/.*"domain":"\([^"]*\)".*"dns":"\([^"]*\)".*"http_code":"\([^"]*\)".*"functionality":"\([^"]*\)".*/- **\1** - DNS: \2, HTTP: \3, Func: \4/' >> "$DASHBOARD_FILE"
    fi
fi

cat >> "$DASHBOARD_FILE" << EOF

---

## 🔔 ALERTS & NOTIFICATIONS

**Critical Alerts (Last 24h)**: $CRITICAL_ALERTS

$(if [ $CRITICAL_ALERTS -gt 0 ]; then
    echo "### Recent Critical Alerts"
    echo ""
    tail -10 "$REPORT_DIR/critical-alerts.log" 2>/dev/null | while read line; do
        echo "- $line"
    done
else
    echo "✅ No critical alerts in the last 24 hours."
fi)

---

## 🔧 REMEDIATION STATUS

EOF

# Check if remediation file exists
REMEDIATION_FILE="${LATEST_SCAN%.json}-remediation.md"
if [ -f "$REMEDIATION_FILE" ]; then
    cat >> "$DASHBOARD_FILE" << EOF
📝 **Remediation plan available**: [View Remediation Plan]($(basename $REMEDIATION_FILE))

### Quick Actions Needed:

EOF

    # Extract key issues from remediation file
    if grep -q "DNS Propagation Issues" "$REMEDIATION_FILE"; then
        echo "- ⚠️ **DNS Issues**: Some domains not resolving correctly" >> "$DASHBOARD_FILE"
    fi
    if grep -q "HTTP Liveness Issues" "$REMEDIATION_FILE"; then
        echo "- ⚠️ **HTTP Issues**: Some domains not responding" >> "$DASHBOARD_FILE"
    fi
    if grep -q "Functionality Issues" "$REMEDIATION_FILE"; then
        echo "- ⚠️ **Functionality Issues**: Some API endpoints not responding" >> "$DASHBOARD_FILE"
    fi
else
    echo "✅ **No remediation needed** - All systems operational!" >> "$DASHBOARD_FILE"
fi

cat >> "$DASHBOARD_FILE" << EOF

---

## 📁 MONITORING FILES

- **Latest Scan**: [$(basename $LATEST_SCAN)]($LATEST_SCAN)
- **Full Log**: [monitor.log](monitor.log)
- **Critical Alerts**: [critical-alerts.log](critical-alerts.log)
- **Dashboard**: This file is auto-generated every scan

---

## 🔄 MONITORING CONFIGURATION

- **Scan Interval**: 30 minutes
- **Total Domains**: $TOTAL_DOMAINS
- **Critical Domains**: 5 (P0 priority with instant alerts)
- **Monitoring Started**: $([ -f "$REPORT_DIR/monitor.log" ] && head -1 "$REPORT_DIR/monitor.log" | cut -d' ' -f1-2 || echo "Unknown")
- **Reports Location**: \`$REPORT_DIR\`

---

## 🎯 SUCCESS CRITERIA

- [ ] **DNS Gate**: 100% domains resolving (Current: ${DNS_PERCENT}%)
- [ ] **Liveness Gate**: 100% HTTP responses (Current: ${HTTP_PERCENT}%)
- [ ] **Functionality Gate**: 90%+ API responses (Current: ${FUNC_PERCENT}%)
- [ ] **Readiness Score**: 100% (Current: ${READINESS_SCORE}%)

---

## 📞 ESCALATION

If critical domains remain down for >30 minutes:
1. Check Cloud Run service status
2. Verify domain mappings in GCP
3. Review DNS configuration in GoDaddy
4. Escalate to Jesse Niesen (CEO)

---

**Dashboard Generated**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Monitoring Status**: $([ -f "$REPORT_DIR/monitor.log" ] && echo "🟢 ACTIVE" || echo "🔴 INACTIVE")
**Next Scan**: In 30 minutes

EOF

echo "✅ Dashboard generated: $DASHBOARD_FILE"

# Display dashboard summary to console
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           E2E EMPIRE MONITORING DASHBOARD SUMMARY              ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Status:${NC} $STATUS"
echo -e "${BLUE}📈 Readiness Score:${NC} ${READINESS_SCORE}%"
echo -e "${BLUE}🌐 Total Domains:${NC} $TOTAL_DOMAINS"
echo -e "${BLUE}✅ Operational:${NC} $HTTP_PASSING ($HTTP_PERCENT%)"
echo -e "${BLUE}❌ Issues:${NC} $FAILING_COUNT"
echo -e "${BLUE}🚨 Critical Alerts:${NC} $CRITICAL_ALERTS"
echo ""
echo -e "${GREEN}📄 Full Dashboard:${NC} $DASHBOARD_FILE"
echo ""

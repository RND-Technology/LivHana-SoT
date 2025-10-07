#!/bin/bash
# E2E EMPIRE CONTINUOUS MONITORING - TIER 1
# Scans every 20 minutes, reports every 20% progress
# Tracks: DNS propagation, service liveness, functionality, production readiness

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPORT_DIR="$SCRIPT_DIR/../reports/e2e-empire-monitor"
INTERVAL_SECONDS=1200  # 20 minutes
TARGET_SERVICE="integration-service-plad5efvha-uc.a.run.app"
TARGET_IP="34.143.72.2"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Create report directory
mkdir -p "$REPORT_DIR"

# All E2E Empire domains
DOMAINS=(
    "aaacbdhempflower.com"
    "cannabiscookiestexas.com"
    "exoticcanopysolutions.com"
    "exoticcbdhempflower.com"
    "freeweedsanantonio.com"
    "freeweedtexas.com"
    "getlooseyoga.com"
    "herbitrage.com"
    "highfromhemp.com"
    "jesseniesen.com"
    "loudcbdbuds.com"
    "loudcbdflower.com"
    "oneplantsolution.com"
    "smokingyoga.com"
    "terpwerk.com"
    "texascannabiscookies.com"
    "thcacannabisdispensary.com"
    "thcaflowerstx.com"
    "thcaflowertx.com"
    "thcasanantonio.com"
    "tier1treecare.com"
    "tokinyoga.com"
)

TOTAL_DOMAINS=${#DOMAINS[@]}

log() {
    echo -e "${1}" | tee -a "$REPORT_DIR/monitor.log"
}

timestamp() {
    date +"%Y-%m-%d %H:%M:%S"
}

# Check DNS resolution
check_dns() {
    local domain="$1"
    local result=$(dig +short "$domain" A 2>/dev/null | head -1)

    if [ -n "$result" ]; then
        echo "$result"
        return 0
    else
        echo "FAILED"
        return 1
    fi
}

# Check HTTP/HTTPS liveness
check_http_liveness() {
    local domain="$1"
    local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$domain" 2>/dev/null || echo "000")

    if [ "$status" = "200" ] || [ "$status" = "301" ] || [ "$status" = "302" ]; then
        echo "$status"
        return 0
    else
        echo "$status"
        return 1
    fi
}

# Check service functionality (age gate endpoint)
check_functionality() {
    local domain="$1"
    local response=$(curl -s --max-time 10 "https://$domain/api/age-verification/status" 2>/dev/null || echo "ERROR")

    if echo "$response" | grep -q "service\|status\|ready" 2>/dev/null; then
        echo "FUNCTIONAL"
        return 0
    else
        echo "NO_RESPONSE"
        return 1
    fi
}

# Comprehensive scan of all domains
run_full_scan() {
    local scan_id=$(date +%Y%m%d_%H%M%S)
    local report_file="$REPORT_DIR/scan-$scan_id.json"

    log "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    log "${CYAN}║  E2E EMPIRE CONTINUOUS MONITOR - FULL SCAN                     ║${NC}"
    log "${CYAN}║  Timestamp: $(timestamp)                                  ║${NC}"
    log "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    log ""

    local dns_pass=0
    local http_pass=0
    local func_pass=0
    local total_checks=$TOTAL_DOMAINS

    local results_json="["
    local progress_count=0
    local last_progress_report=0

    for domain in "${DOMAINS[@]}"; do
        progress_count=$((progress_count + 1))
        local current_progress=$((progress_count * 100 / total_checks))

        # Report every 20%
        if [ $((current_progress / 20)) -gt $((last_progress_report / 20)) ]; then
            log "${BLUE}📊 Progress: ${current_progress}% (${progress_count}/${total_checks} domains)${NC}"
            last_progress_report=$current_progress
        fi

        # DNS Check
        local dns_result=$(check_dns "$domain")
        local dns_status="FAIL"
        if [ "$dns_result" != "FAILED" ]; then
            dns_status="PASS"
            dns_pass=$((dns_pass + 1))
        fi

        # HTTP Liveness Check
        local http_result=$(check_http_liveness "$domain")
        local http_status="FAIL"
        if [ "$http_result" = "200" ] || [ "$http_result" = "301" ] || [ "$http_result" = "302" ]; then
            http_status="PASS"
            http_pass=$((http_pass + 1))
        fi

        # Functionality Check
        local func_result=$(check_functionality "$domain")
        local func_status="FAIL"
        if [ "$func_result" = "FUNCTIONAL" ]; then
            func_status="PASS"
            func_pass=$((func_pass + 1))
        fi

        # Overall domain status
        local overall="FAIL"
        if [ "$dns_status" = "PASS" ] && [ "$http_status" = "PASS" ]; then
            overall="PASS"
        fi

        # Status indicator
        if [ "$overall" = "PASS" ]; then
            log "${GREEN}✅ $domain${NC} - DNS: $dns_result | HTTP: $http_result | Func: $func_status"
        else
            log "${RED}❌ $domain${NC} - DNS: $dns_result | HTTP: $http_result | Func: $func_status"
        fi

        # Build JSON result
        results_json+="{\"domain\":\"$domain\",\"dns\":\"$dns_status\",\"dns_ip\":\"$dns_result\",\"http\":\"$http_status\",\"http_code\":\"$http_result\",\"functionality\":\"$func_status\",\"overall\":\"$overall\"},"
    done

    results_json="${results_json%,}]"

    # Calculate percentages
    local dns_percent=$((dns_pass * 100 / total_checks))
    local http_percent=$((http_pass * 100 / total_checks))
    local func_percent=$((func_pass * 100 / total_checks))
    local overall_percent=$(((dns_pass + http_pass + func_pass) / 3))

    # Overall readiness score (weighted)
    local readiness_score=$(((dns_percent * 40 + http_percent * 40 + func_percent * 20) / 100))

    log ""
    log "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    log "${CYAN}║  SCAN RESULTS SUMMARY                                          ║${NC}"
    log "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    log "${BLUE}📊 DNS Propagation:    ${GREEN}${dns_pass}/${total_checks}${NC} (${dns_percent}%)"
    log "${BLUE}📊 HTTP Liveness:      ${GREEN}${http_pass}/${total_checks}${NC} (${http_percent}%)"
    log "${BLUE}📊 Functionality:      ${GREEN}${func_pass}/${total_checks}${NC} (${func_percent}%)"
    log ""
    log "${BLUE}🎯 PRODUCTION READINESS SCORE: ${GREEN}${readiness_score}%${NC}"

    if [ $readiness_score -eq 100 ]; then
        log "${GREEN}🚀 STATUS: READY TO SHIP - ALL SYSTEMS GO!${NC}"
    elif [ $readiness_score -ge 90 ]; then
        log "${YELLOW}⚠️  STATUS: NEARLY READY - Minor issues detected${NC}"
    elif [ $readiness_score -ge 70 ]; then
        log "${YELLOW}⚠️  STATUS: NOT READY - Significant issues detected${NC}"
    else
        log "${RED}🚨 STATUS: CRITICAL - Major issues detected${NC}"
    fi

    # Generate JSON report
    cat > "$report_file" << EOF
{
  "scan_id": "$scan_id",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "summary": {
    "total_domains": $total_checks,
    "dns_passing": $dns_pass,
    "http_passing": $http_pass,
    "functionality_passing": $func_pass,
    "dns_percent": $dns_percent,
    "http_percent": $http_percent,
    "functionality_percent": $func_percent,
    "readiness_score": $readiness_score
  },
  "results": $results_json
}
EOF

    log ""
    log "${BLUE}📄 Report saved: $report_file${NC}"

    # Generate remediation plan if not 100%
    if [ $readiness_score -lt 100 ]; then
        generate_remediation_plan "$report_file" "$dns_pass" "$http_pass" "$func_pass"
    fi

    log ""
    log "${CYAN}════════════════════════════════════════════════════════════════${NC}"
}

# Generate remediation plan for failures
generate_remediation_plan() {
    local report_file="$1"
    local dns_pass="$2"
    local http_pass="$3"
    local func_pass="$4"

    local remediation_file="${report_file%.json}-remediation.md"

    log "${YELLOW}🔧 Generating remediation plan...${NC}"

    cat > "$remediation_file" << 'EOF'
# E2E EMPIRE REMEDIATION PLAN

## Issues Detected

EOF

    if [ $dns_pass -lt $TOTAL_DOMAINS ]; then
        cat >> "$remediation_file" << 'EOF'
### DNS Propagation Issues

**Problem:** Not all domains resolving correctly

**Solutions:**
1. Check DNS propagation status: `dig +short [domain]`
2. Verify GoDaddy DNS records: `host -t A [domain]`
3. Wait for TTL expiry (600 seconds = 10 minutes)
4. Re-run DNS update for failed domains
5. Check if domains are locked or expired in GoDaddy

**Command:**
```bash
for domain in [FAILED_DOMAINS]; do
    dig +short "$domain" A
    host -t A "$domain"
done
```

EOF
    fi

    if [ $http_pass -lt $TOTAL_DOMAINS ]; then
        cat >> "$remediation_file" << 'EOF'
### HTTP Liveness Issues

**Problem:** Domains not responding to HTTP/HTTPS requests

**Solutions:**
1. Verify SSL certificates: `curl -vI https://[domain]`
2. Check Cloud Run service health: `gcloud run services describe integration-service`
3. Verify domain mapping in Cloud Run
4. Check firewall/security rules
5. Verify age verification gate is allowing traffic

**Command:**
```bash
curl -vI https://[domain] 2>&1 | grep -i "http\|ssl\|cert"
```

EOF
    fi

    if [ $func_pass -lt $TOTAL_DOMAINS ]; then
        cat >> "$remediation_file" << 'EOF'
### Functionality Issues

**Problem:** Service endpoints not responding correctly

**Solutions:**
1. Check integration-service logs: `gcloud run services logs read integration-service`
2. Verify API endpoints: `curl https://[domain]/api/age-verification/status`
3. Check database connectivity
4. Verify environment variables in Cloud Run
5. Test age verification flow manually

**Command:**
```bash
curl -v https://[domain]/api/age-verification/status
gcloud run services logs read integration-service --limit 50
```

EOF
    fi

    cat >> "$remediation_file" << 'EOF'

## Critical Verification Checklist

- [ ] All domains resolve to correct IP (34.143.72.2 or other Cloud Run IPs)
- [ ] HTTP 200/301/302 responses from all domains
- [ ] Age verification API endpoints responding
- [ ] SSL certificates valid for all domains
- [ ] Cloud Run service healthy and scaled
- [ ] No 5xx errors in Cloud Run logs
- [ ] Database connections stable
- [ ] Redis cache operational

## Production Readiness Gates

1. **DNS Gate:** 100% domains resolving ✓
2. **Liveness Gate:** 100% HTTP responses ✓
3. **Functionality Gate:** 90%+ API responses ✓
4. **Security Gate:** Valid SSL on all domains ✓
5. **Performance Gate:** Response time < 2s ✓

## Next Steps

1. Run this scan again in 10 minutes to check progress
2. Address critical failures first (DNS, then HTTP, then functionality)
3. Monitor Cloud Run logs during remediation
4. Re-test after each fix
5. Document any persistent issues

EOF

    log "${GREEN}✅ Remediation plan saved: $remediation_file${NC}"
}

# Main monitoring loop
main() {
    log "${BLUE}🚀 E2E EMPIRE CONTINUOUS MONITOR STARTED${NC}"
    log "${BLUE}📊 Monitoring ${TOTAL_DOMAINS} domains${NC}"
    log "${BLUE}⏱️  Scan interval: 20 minutes${NC}"
    log "${BLUE}📁 Reports: $REPORT_DIR${NC}"
    log ""

    local scan_count=0

    while true; do
        scan_count=$((scan_count + 1))
        log "${CYAN}🔄 Starting scan #$scan_count...${NC}"

        run_full_scan

        log ""
        log "${BLUE}⏳ Next scan in 20 minutes...${NC}"
        log "${BLUE}   Press Ctrl+C to stop monitoring${NC}"
        log ""

        sleep $INTERVAL_SECONDS
    done
}

# Single scan mode (for testing)
if [ "${1:-}" = "--once" ]; then
    log "${BLUE}🔍 Running single scan (--once mode)${NC}"
    run_full_scan
    exit 0
fi

# Run continuous monitoring
main

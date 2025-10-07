#!/bin/bash
# Tier-1 GoDaddy DNS Bulk Automation Script - WORKING VERSION
# E2E Empire DNS Management - Production Ready

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="godaddy-dns-automation-$(date +%Y%m%d_%H%M%S).log"
DRY_RUN=false
BACKUP=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${1}" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "${RED}❌ Error: $1${NC}"
    exit 1
}

# Check dependencies
check_dependencies() {
    log "${BLUE}🔍 Checking dependencies...${NC}"
    
    command -v curl >/dev/null 2>&1 || error_exit "curl is required but not installed"
    command -v jq >/dev/null 2>&1 || error_exit "jq is required but not installed"
    command -v op >/dev/null 2>&1 || error_exit "1Password CLI (op) is required but not installed"
    
    log "${GREEN}✅ All dependencies found${NC}"
}

# Validate API access
validate_api_access() {
    log "${BLUE}🔍 Validating GoDaddy API access...${NC}"
    
    # Test API call using op run
    local response
    response=$(op run -- curl -s -w "%{http_code}" -o /tmp/godaddy_api_test.json \
        -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
        -H "Content-Type: application/json" \
        "https://api.godaddy.com/v1/domains")
    
    local http_code="${response: -3}"
    
    case $http_code in
        200)
            local domain_count
            domain_count=$(jq length /tmp/godaddy_api_test.json)
            log "${GREEN}✅ API Access Validated - $domain_count domains accessible${NC}"
            ;;
        401)
            error_exit "API Authentication Failed - Check credentials"
            ;;
        403)
            error_exit "API Access Denied - Need 10+ domains or DDC subscription"
            ;;
        *)
            error_exit "API Error: $http_code"
            ;;
    esac
    
    rm -f /tmp/godaddy_api_test.json
}

# Backup domain records
backup_domain_records() {
    local domain="$1"
    local backup_file="backup_${domain}_$(date +%Y%m%d_%H%M%S).json"
    
    log "${BLUE}💾 Backing up DNS records for $domain...${NC}"
    
    op run -- curl -s -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
        -H "Content-Type: application/json" \
        "https://api.godaddy.com/v1/domains/$domain/records" > "$backup_file"
    
    if [[ -s "$backup_file" ]]; then
        log "${GREEN}✅ Backup created: $backup_file${NC}"
    else
        log "${YELLOW}⚠️ Backup file is empty for $domain${NC}"
    fi
}

# Update domain DNS records
update_domain_dns() {
    local domain="$1"
    local target="$2"
    
    log "${BLUE}🔄 Updating DNS for $domain...${NC}"
    
    # Create DNS record JSON
    local dns_record
    dns_record=$(jq -n --arg target "$target" '[{
        "type": "CNAME",
        "name": "@",
        "data": $target,
        "ttl": 300
    }]')
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "${YELLOW}🔍 DRY RUN - Would update $domain with CNAME @ -> $target${NC}"
        return 0
    fi
    
    # Backup current records
    if [[ "$BACKUP" == "true" ]]; then
        backup_domain_records "$domain"
    fi
    
    # Update DNS records
    local response
    response=$(op run -- curl -s -w "%{http_code}" -o /tmp/godaddy_update_response.json \
        -X PUT \
        -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
        -H "Content-Type: application/json" \
        -d "$dns_record" \
        "https://api.godaddy.com/v1/domains/$domain/records")
    
    local http_code="${response: -3}"
    
    case $http_code in
        200)
            log "${GREEN}✅ DNS updated for $domain${NC}"
            ;;
        *)
            log "${RED}❌ Failed to update $domain: $http_code${NC}"
            if [[ -s /tmp/godaddy_update_response.json ]]; then
                log "${RED}Response: $(cat /tmp/godaddy_update_response.json)${NC}"
            fi
            return 1
            ;;
    esac
    
    rm -f /tmp/godaddy_update_response.json
    return 0
}

# Verify DNS propagation
verify_dns_propagation() {
    local domain="$1"
    local expected_target="$2"
    local timeout="${3:-300}"
    
    log "${BLUE}🔍 Verifying DNS propagation for $domain...${NC}"
    
    local attempts=$((timeout / 10))
    for ((i=1; i<=attempts; i++)); do
        if nslookup "$domain" 2>/dev/null | grep -q "$expected_target"; then
            log "${GREEN}✅ DNS propagation verified for $domain${NC}"
            return 0
        fi
        
        if [[ $i -lt $attempts ]]; then
            log "${YELLOW}⏳ Attempt $i/$attempts - Waiting 10 seconds...${NC}"
            sleep 10
        fi
    done
    
    log "${YELLOW}⏳ DNS propagation timeout for $domain${NC}"
    return 1
}

# Main execution
main() {
    log "${BLUE}🚀 E2E EMPIRE GoDaddy DNS Bulk Automation${NC}"
    log "${BLUE}==========================================${NC}"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --no-backup)
                BACKUP=false
                shift
                ;;
            --help)
                echo "Usage: $0 [--dry-run] [--no-backup]"
                echo "  --dry-run    Show what would be changed without making changes"
                echo "  --no-backup  Skip backing up current DNS records"
                exit 0
                ;;
            *)
                error_exit "Unknown option: $1"
                ;;
        esac
    done
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "${YELLOW}🔍 DRY RUN MODE - No changes will be made${NC}"
    fi
    
    # Check dependencies
    check_dependencies
    
    # Export environment variables for op run
    export GODADDY_API_KEY="op://LivHana-Ops-Keys/GODADDY_API_KEY/credential"
    export GODADDY_API_SECRET="op://LivHana-Ops-Keys/GODADDY_API_SECRET/credential"
    
    # Validate API access
    validate_api_access
    
    # E2E Empire domains configuration
    local -A domains=(
        ["aaacbdhempflower.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["cannabiscookiestexas.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["exoticcanopysolutions.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["exoticcbdhempflower.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["freeweedsanantonio.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["freeweedtexas.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["getlooseyoga.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["herbitrage.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["highfromhemp.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["jesseniesen.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["loudcbdbuds.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["loudcbdflower.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["oneplantsolution.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["smokingyoga.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["terpwerk.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["texascannabiscookies.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["thcacannabisdispensary.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["thcaflowerstx.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["thcaflowertx.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["thcasanantonio.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["tier1treecare.com"]="integration-service-plad5efvha-uc.a.run.app"
        ["tokinyoga.com"]="integration-service-plad5efvha-uc.a.run.app"
    )
    
    local total_domains=${#domains[@]}
    local successful=0
    local failed=0
    
    log "${BLUE}📊 Updating $total_domains domains...${NC}"
    
    # Process each domain
    local count=0
    for domain in "${!domains[@]}"; do
        count=$((count + 1))
        log "${BLUE}📋 Processing $domain ($count/$total_domains)${NC}"
        
        if update_domain_dns "$domain" "${domains[$domain]}"; then
            successful=$((successful + 1))
        else
            failed=$((failed + 1))
        fi
        
        # Rate limiting - 1 second between requests
        if [[ $count -lt $total_domains ]]; then
            sleep 1
        fi
    done
    
    # Print summary
    local success_rate=0
    if [[ $total_domains -gt 0 ]]; then
        success_rate=$((successful * 100 / total_domains))
    fi
    
    log ""
    log "${BLUE}📊 BULK DNS UPDATE SUMMARY:${NC}"
    log "${GREEN}Success: $successful/$total_domains domains ($success_rate%)${NC}"
    
    if [[ $successful -eq $total_domains ]]; then
        log "${GREEN}🎉 E2E EMPIRE DNS DEPLOYMENT 100% COMPLETE!${NC}"
        if [[ "$DRY_RUN" == "false" ]]; then
            log "${YELLOW}⏳ DNS propagation may take 5-30 minutes${NC}"
            log "${YELLOW}🔄 Run validation script to verify propagation${NC}"
        fi
    else
        log "${RED}⚠️ Some domains failed to update. Check logs for details.${NC}"
    fi
    
    # Generate report
    local report_file="dns-update-report-$(date +%Y%m%d_%H%M%S).json"
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total_domains": $total_domains,
  "successful": $successful,
  "failed": $failed,
  "success_rate": $success_rate,
  "dry_run": $DRY_RUN,
  "log_file": "$LOG_FILE"
}
EOF
    
    log "${BLUE}📄 Report saved: $report_file${NC}"
    log "${BLUE}📄 Log saved: $LOG_FILE${NC}"
}

# Run main function
main "$@"

# Tier-1 GoDaddy DNS Bulk Automation

## Overview

This suite provides **Tier-1 Option A** for automated bulk DNS changes in GoDaddy, designed specifically for the E2E Empire deployment across 23 domains.

## Prerequisites

### 1. GoDaddy API Access Requirements
- **Minimum**: 10+ domains in GoDaddy account OR Discount Domain Club (DDC) subscription
- **API Credentials**: Production API Key and Secret from GoDaddy Developer Portal
- **Permissions**: Domain management rights for all target domains

### 2. System Dependencies
```bash
# Required tools
curl          # HTTP requests
jq            # JSON processing
op            # 1Password CLI
nslookup      # DNS validation
```

### 3. 1Password Setup
Create item in `LivHana-Ops-Keys` vault:
- **Item Name**: `GoDaddy API Key`
- **Fields**:
  - `API Key`: Your GoDaddy API key
  - `API Secret`: Your GoDaddy API secret

## Quick Start

### 1. Dry Run (Recommended First)
```bash
# Test what would be changed without making changes
./godaddy-dns-automation.sh --dry-run
```

### 2. Production Deployment
```bash
# Execute bulk DNS changes
./godaddy-dns-automation.sh
```

### 3. Python Version
```bash
# Using 1Password integration
op run -- python3 godaddy-dns-bulk-automation.py

# Or with environment variables
export GODADDY_API_KEY="your_key"
export GODADDY_API_SECRET="your_secret"
python3 godaddy-dns-bulk-automation.py
```

## Script Options

### Shell Script Options
```bash
./godaddy-dns-automation.sh [OPTIONS]

Options:
  --dry-run     Show what would be changed without making changes
  --no-backup   Skip backing up current DNS records
  --help        Show help message
```

### Python Script Options
```bash
python3 godaddy-dns-bulk-automation.py [OPTIONS]

Options:
  --dry-run     Dry run mode
  --no-backup   Skip backup
```

## E2E Empire Configuration

### Target Domains (23 total)
All domains point to: `integration-service-plad5efvha-uc.a.run.app`

1. aaacbdhempflower.com
2. cannabiscookiestexas.com
3. exoticcanopysolutions.com
4. exoticcbdhempflower.com
5. freeweedsanantonio.com
6. freeweedtexas.com
7. getlooseyoga.com
8. herbitrage.com
9. highfromhemp.com
10. jesseniesen.com
11. loudcbdbuds.com
12. loudcbdflower.com
13. oneplantsolution.com
14. smokingyoga.com
15. terpwerk.com
16. texascannabiscookies.com
17. thcacannabisdispensary.com
18. thcaflowerstx.com
19. thcaflowertx.com
20. thcasanantonio.com
21. tier1treecare.com
22. tokinyoga.com

### DNS Record Configuration
```json
{
  "type": "CNAME",
  "name": "@",
  "data": "integration-service-plad5efvha-uc.a.run.app",
  "ttl": 300
}
```

## Safety Features

### 1. Backup System
- **Automatic**: Backs up current DNS records before changes
- **Format**: JSON files with timestamp
- **Location**: `backup_[domain]_[timestamp].json`
- **Retention**: 30 days (configurable)

### 2. Rate Limiting
- **GoDaddy Limit**: 1 request per second
- **Implementation**: 1-second delay between domain updates
- **Total Time**: ~25 seconds for 23 domains

### 3. Validation
- **API Access**: Validates credentials before starting
- **DNS Propagation**: Optional verification after changes
- **Error Handling**: Comprehensive error reporting

### 4. Dry Run Mode
- **Purpose**: Test changes without making them
- **Output**: Shows exactly what would be changed
- **Safety**: No modifications to live DNS

## Monitoring & Validation

### 1. Real-time Validation
```bash
# Check DNS propagation for specific domain
nslookup [domain] | grep integration-service-plad5efvha-uc.a.run.app

# Test service accessibility
curl -I https://[domain]
```

### 2. Bulk Validation Script
```bash
# Use existing validation script
cd ../docs/domains
./validate-dns-propagation.sh
```

### 3. Log Files
- **Shell Script**: `godaddy-dns-automation-[timestamp].log`
- **Python Script**: `godaddy-dns-automation.log`
- **Reports**: `dns-update-report-[timestamp].json`

## Troubleshooting

### Common Issues

#### 1. API Access Denied (403)
**Cause**: Account doesn't meet GoDaddy's API requirements
**Solution**: 
- Ensure account has 10+ domains OR DDC subscription
- Verify API key has domain management permissions

#### 2. Authentication Failed (401)
**Cause**: Invalid API credentials
**Solution**:
- Verify API key and secret in 1Password
- Check credentials are for production environment
- Ensure no extra spaces or characters

#### 3. DNS Update Failed
**Cause**: Domain not found or insufficient permissions
**Solution**:
- Verify domain exists in GoDaddy account
- Check API key has management rights for domain
- Ensure domain is not locked or expired

#### 4. Rate Limiting
**Cause**: Too many requests too quickly
**Solution**:
- Script includes built-in rate limiting
- If issues persist, increase delay between requests

### Debug Mode
```bash
# Enable verbose logging
set -x
./godaddy-dns-automation.sh --dry-run
```

## Security Considerations

### 1. API Key Management
- **Storage**: 1Password vault only
- **Access**: Limited to authorized personnel
- **Rotation**: Regular key rotation recommended
- **Monitoring**: Track API usage and alerts

### 2. DNS Security
- **DNSSEC**: Consider enabling for critical domains
- **Monitoring**: Set up DNS monitoring and alerts
- **Backup**: Maintain DNS record backups
- **Rollback**: Test rollback procedures

### 3. Access Control
- **Principle**: Least privilege access
- **Audit**: Log all DNS changes
- **Approval**: Require approval for production changes
- **Testing**: Always test in sandbox first

## Integration with E2E Empire

### 1. Deployment Pipeline
```bash
# 1. Deploy Cloud Run services
# 2. Update DNS records
./godaddy-dns-automation.sh --dry-run
./godaddy-dns-automation.sh

# 3. Validate deployment
cd ../docs/domains
./validate-dns-propagation.sh
```

### 2. Monitoring Integration
- **Health Checks**: DNS resolution monitoring
- **Alerts**: DNS failure notifications
- **Dashboards**: E2E Empire status dashboard
- **Logs**: Centralized logging system

### 3. Rollback Procedures
```bash
# Restore from backup
jq -r '.[] | "\(.type) \(.name) \(.data) \(.ttl)"' backup_[domain]_[timestamp].json
# Manually restore records or script restoration
```

## Performance Metrics

### Expected Performance
- **Total Domains**: 23
- **Update Time**: ~25 seconds (with rate limiting)
- **DNS Propagation**: 5-30 minutes
- **Success Rate**: 100% (with proper setup)

### Monitoring Points
- **API Response Time**: < 2 seconds per request
- **DNS Propagation**: < 30 minutes
- **Service Availability**: 99.9% uptime
- **Error Rate**: < 1% failure rate

## Support & Resources

### GoDaddy Resources
- [GoDaddy API Documentation](https://developer.godaddy.com/doc)
- [GoDaddy API Status](https://status.godaddy.com/)
- [GoDaddy Support](https://www.godaddy.com/help)

### E2E Empire Resources
- [DNS Validation Script](../docs/domains/validate-dns-propagation.sh)
- [Domain Configuration](../docs/domains/dns-config-all-domains.txt)
- [Deployment Summary](../docs/domains/E2E_EMPIRE_DEPLOYMENT_SUMMARY.md)

### LivHana Resources
- [Tier-1 Architecture Documentation](../../docs/architecture/)
- [Security Guidelines](../../docs/security/)
- [Monitoring Setup](../../docs/monitoring/)

---

**Note**: Always test DNS changes in a sandbox environment before applying to production domains. This automation is designed for the E2E Empire deployment and should be adapted for other use cases.

# GoDaddy DNS Automation Guide

## Overview
This guide provides comprehensive instructions for automating GoDaddy DNS management for Texas Takeover domains and services.

## Current Domains & Services

### Primary Domains
- **reggieanddro.com** - Main e-commerce site
- **texascoa.com** - Texas COA Checker standalone
- **texastakeover.com** - Texas Takeover MVP Cockpit
- **livhana.com** - Liv Hana platform
- **ops.texastakeover.com** - OPS Policy Platform

### Cloud Services
- **Texas Takeover MVP**: https://vibe-cockpit-980910443251.us-central1.run.app
- **Integration Service**: https://integration-service-980910443251.us-central1.run.app
- **Voice Service**: https://voice-service-980910443251.us-central1.run.app
- **Reasoning Gateway**: https://reasoning-gateway-980910443251.us-central1.run.app
- **OPS Full Build**: https://ops-full-build-980910443251.us-central1.run.app
- **Texas COA Standalone**: https://texas-coa-standalone-980910443251.us-central1.run.app

## GoDaddy DNS Configuration

### 1. API Access Setup

#### Enable GoDaddy API
1. Go to [GoDaddy Developer Portal](https://developer.godaddy.com/)
2. Create account and get API key
3. Note your API key and secret

#### API Endpoints
- **Production**: `https://api.godaddy.com/v1`
- **Sandbox**: `https://api.ote-godaddy.com/v1`

### 2. DNS Records Configuration

#### A Records (IPv4)
```
reggieanddro.com → 35.186.224.47 (Cloud Run IP)
texascoa.com → 35.186.224.47
texastakeover.com → 35.186.224.47
livhana.com → 35.186.224.47
ops.texastakeover.com → 35.186.224.47
```

#### CNAME Records
```
www.reggieanddro.com → reggieanddro.com
www.texascoa.com → texascoa.com
www.texastakeover.com → texastakeover.com
www.livhana.com → livhana.com
```

#### MX Records (Email)
```
reggieanddro.com → mail.reggieanddro.com (Priority 10)
texastakeover.com → mail.texastakeover.com (Priority 10)
```

#### TXT Records (Verification)
```
reggieanddro.com → "v=spf1 include:_spf.google.com ~all"
texastakeover.com → "v=spf1 include:_spf.google.com ~all"
```

## Automated DNS Management

### 1. GoDaddy API Script

#### Python Script for Bulk DNS Updates
```python
#!/usr/bin/env python3
"""
GoDaddy DNS Automation Script
Bulk DNS record management for Texas Takeover domains
"""

import requests
import json
import time
from typing import List, Dict

class GoDaddyDNSManager:
    def __init__(self, api_key: str, api_secret: str, use_sandbox: bool = False):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = "https://api.ote-godaddy.com/v1" if use_sandbox else "https://api.godaddy.com/v1"
        self.headers = {
            "Authorization": f"sso-key {api_key}:{api_secret}",
            "Content-Type": "application/json"
        }
    
    def get_domain_records(self, domain: str) -> List[Dict]:
        """Get all DNS records for a domain"""
        url = f"{self.base_url}/domains/{domain}/records"
        response = requests.get(url, headers=self.headers)
        return response.json() if response.status_code == 200 else []
    
    def update_domain_records(self, domain: str, records: List[Dict]) -> bool:
        """Update DNS records for a domain"""
        url = f"{self.base_url}/domains/{domain}/records"
        response = requests.put(url, headers=self.headers, json=records)
        return response.status_code == 200
    
    def add_record(self, domain: str, record_type: str, name: str, data: str, ttl: int = 3600) -> bool:
        """Add a single DNS record"""
        records = self.get_domain_records(domain)
        records.append({
            "type": record_type,
            "name": name,
            "data": data,
            "ttl": ttl
        })
        return self.update_domain_records(domain, records)
    
    def bulk_update_domains(self, domain_configs: Dict[str, List[Dict]]) -> Dict[str, bool]:
        """Bulk update multiple domains"""
        results = {}
        for domain, records in domain_configs.items():
            try:
                success = self.update_domain_records(domain, records)
                results[domain] = success
                print(f"✅ {domain}: {'Success' if success else 'Failed'}")
                time.sleep(1)  # Rate limiting
            except Exception as e:
                print(f"❌ {domain}: Error - {e}")
                results[domain] = False
        return results

# Texas Takeover DNS Configuration
TEXAS_TAKEOVER_DNS_CONFIG = {
    "reggieanddro.com": [
        {"type": "A", "name": "@", "data": "35.186.224.47", "ttl": 3600},
        {"type": "A", "name": "www", "data": "35.186.224.47", "ttl": 3600},
        {"type": "CNAME", "name": "api", "data": "integration-service-980910443251.us-central1.run.app", "ttl": 3600},
        {"type": "CNAME", "name": "voice", "data": "voice-service-980910443251.us-central1.run.app", "ttl": 3600},
        {"type": "CNAME", "name": "reasoning", "data": "reasoning-gateway-980910443251.us-central1.run.app", "ttl": 3600}
    ],
    "texascoa.com": [
        {"type": "A", "name": "@", "data": "35.186.224.47", "ttl": 3600},
        {"type": "A", "name": "www", "data": "35.186.224.47", "ttl": 3600},
        {"type": "CNAME", "name": "api", "data": "texas-coa-standalone-980910443251.us-central1.run.app", "ttl": 3600}
    ],
    "texastakeover.com": [
        {"type": "A", "name": "@", "data": "35.186.224.47", "ttl": 3600},
        {"type": "A", "name": "www", "data": "35.186.224.47", "ttl": 3600},
        {"type": "CNAME", "name": "cockpit", "data": "vibe-cockpit-980910443251.us-central1.run.app", "ttl": 3600},
        {"type": "CNAME", "name": "ops", "data": "ops-full-build-980910443251.us-central1.run.app", "ttl": 3600}
    ],
    "livhana.com": [
        {"type": "A", "name": "@", "data": "35.186.224.47", "ttl": 3600},
        {"type": "A", "name": "www", "data": "35.186.224.47", "ttl": 3600}
    ]
}

def main():
    # Initialize DNS manager
    dns_manager = GoDaddyDNSManager(
        api_key="YOUR_GODADDY_API_KEY",
        api_secret="YOUR_GODADDY_API_SECRET",
        use_sandbox=True  # Set to False for production
    )
    
    # Bulk update all domains
    print("🚀 Starting bulk DNS update for Texas Takeover domains...")
    results = dns_manager.bulk_update_domains(TEXAS_TAKEOVER_DNS_CONFIG)
    
    # Print summary
    successful = sum(1 for success in results.values() if success)
    total = len(results)
    print(f"\n📊 Summary: {successful}/{total} domains updated successfully")
    
    if successful == total:
        print("🎉 All domains updated successfully!")
    else:
        print("⚠️ Some domains failed to update. Check the logs above.")

if __name__ == "__main__":
    main()
```

### 2. Node.js Script for Real-time Updates

```javascript
/**
 * GoDaddy DNS Automation - Node.js Version
 * Real-time DNS management for Texas Takeover
 */

const axios = require('axios');

class GoDaddyDNSManager {
  constructor(apiKey, apiSecret, useSandbox = false) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = useSandbox 
      ? 'https://api.ote-godaddy.com/v1' 
      : 'https://api.godaddy.com/v1';
    this.headers = {
      'Authorization': `sso-key ${apiKey}:${apiSecret}`,
      'Content-Type': 'application/json'
    };
  }

  async getDomainRecords(domain) {
    try {
      const response = await axios.get(`${this.baseUrl}/domains/${domain}/records`, {
        headers: this.headers
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching records for ${domain}:`, error.message);
      return [];
    }
  }

  async updateDomainRecords(domain, records) {
    try {
      const response = await axios.put(`${this.baseUrl}/domains/${domain}/records`, records, {
        headers: this.headers
      });
      return response.status === 200;
    } catch (error) {
      console.error(`Error updating records for ${domain}:`, error.message);
      return false;
    }
  }

  async bulkUpdateDomains(domainConfigs) {
    const results = {};
    
    for (const [domain, records] of Object.entries(domainConfigs)) {
      try {
        const success = await this.updateDomainRecords(domain, records);
        results[domain] = success;
        console.log(`✅ ${domain}: ${success ? 'Success' : 'Failed'}`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ ${domain}: Error - ${error.message}`);
        results[domain] = false;
      }
    }
    
    return results;
  }
}

// Texas Takeover DNS Configuration
const TEXAS_TAKEOVER_DNS_CONFIG = {
  'reggieanddro.com': [
    { type: 'A', name: '@', data: '35.186.224.47', ttl: 3600 },
    { type: 'A', name: 'www', data: '35.186.224.47', ttl: 3600 },
    { type: 'CNAME', name: 'api', data: 'integration-service-980910443251.us-central1.run.app', ttl: 3600 },
    { type: 'CNAME', name: 'voice', data: 'voice-service-980910443251.us-central1.run.app', ttl: 3600 },
    { type: 'CNAME', name: 'reasoning', data: 'reasoning-gateway-980910443251.us-central1.run.app', ttl: 3600 }
  ],
  'texascoa.com': [
    { type: 'A', name: '@', data: '35.186.224.47', ttl: 3600 },
    { type: 'A', name: 'www', data: '35.186.224.47', ttl: 3600 },
    { type: 'CNAME', name: 'api', data: 'texas-coa-standalone-980910443251.us-central1.run.app', ttl: 3600 }
  ],
  'texastakeover.com': [
    { type: 'A', name: '@', data: '35.186.224.47', ttl: 3600 },
    { type: 'A', name: 'www', data: '35.186.224.47', ttl: 3600 },
    { type: 'CNAME', name: 'cockpit', data: 'vibe-cockpit-980910443251.us-central1.run.app', ttl: 3600 },
    { type: 'CNAME', name: 'ops', data: 'ops-full-build-980910443251.us-central1.run.app', ttl: 3600 }
  ],
  'livhana.com': [
    { type: 'A', name: '@', data: '35.186.224.47', ttl: 3600 },
    { type: 'A', name: 'www', data: '35.186.224.47', ttl: 3600 }
  ]
};

async function main() {
  const dnsManager = new GoDaddyDNSManager(
    process.env.GODADDY_API_KEY,
    process.env.GODADDY_API_SECRET,
    true // Set to false for production
  );

  console.log('🚀 Starting bulk DNS update for Texas Takeover domains...');
  const results = await dnsManager.bulkUpdateDomains(TEXAS_TAKEOVER_DNS_CONFIG);

  const successful = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`\n📊 Summary: ${successful}/${total} domains updated successfully`);
  
  if (successful === total) {
    console.log('🎉 All domains updated successfully!');
  } else {
    console.log('⚠️ Some domains failed to update. Check the logs above.');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = GoDaddyDNSManager;
```

### 3. Shell Script for Quick Updates

```bash
#!/bin/bash
# GoDaddy DNS Quick Update Script

# Configuration
GODADDY_API_KEY="YOUR_API_KEY"
GODADDY_API_SECRET="YOUR_API_SECRET"
BASE_URL="https://api.godaddy.com/v1"

# Domains and their configurations
declare -A DOMAINS=(
    ["reggieanddro.com"]="35.186.224.47"
    ["texascoa.com"]="35.186.224.47"
    ["texastakeover.com"]="35.186.224.47"
    ["livhana.com"]="35.186.224.47"
)

# Function to update DNS records
update_dns() {
    local domain=$1
    local ip=$2
    
    echo "🔄 Updating DNS for $domain..."
    
    # Update A record for root domain
    curl -X PUT "$BASE_URL/domains/$domain/records" \
        -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
        -H "Content-Type: application/json" \
        -d "[{\"type\":\"A\",\"name\":\"@\",\"data\":\"$ip\",\"ttl\":3600}]"
    
    # Update A record for www subdomain
    curl -X PUT "$BASE_URL/domains/$domain/records" \
        -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
        -H "Content-Type: application/json" \
        -d "[{\"type\":\"A\",\"name\":\"www\",\"data\":\"$ip\",\"ttl\":3600}]"
    
    echo "✅ DNS updated for $domain"
}

# Main execution
echo "🚀 Starting GoDaddy DNS bulk update..."
echo "📋 Domains to update: ${!DOMAINS[@]}"

for domain in "${!DOMAINS[@]}"; do
    update_dns "$domain" "${DOMAINS[$domain]}"
    sleep 2  # Rate limiting
done

echo "🎉 DNS bulk update completed!"
```

## Deployment Instructions

### 1. Set Up API Credentials
```bash
# Set environment variables
export GODADDY_API_KEY="your_api_key_here"
export GODADDY_API_SECRET="your_api_secret_here"
```

### 2. Run Bulk DNS Update
```bash
# Python version
python3 godaddy_dns_automation.py

# Node.js version
node godaddy_dns_automation.js

# Shell script version
chmod +x godaddy_dns_update.sh
./godaddy_dns_update.sh
```

### 3. Verify DNS Changes
```bash
# Check DNS propagation
dig reggieanddro.com
dig texascoa.com
dig texastakeover.com
dig livhana.com
```

## Monitoring & Maintenance

### 1. DNS Health Checks
- Set up monitoring for DNS resolution
- Alert on DNS failures
- Regular verification of DNS records

### 2. Automated Updates
- Schedule regular DNS updates
- Monitor Cloud Run IP changes
- Update DNS when services migrate

### 3. Backup Strategy
- Maintain DNS record backups
- Document all DNS configurations
- Test DNS changes in sandbox first

## Troubleshooting

### Common Issues
1. **API Rate Limits**: Implement proper rate limiting
2. **DNS Propagation**: Allow 24-48 hours for full propagation
3. **Authentication**: Verify API credentials
4. **Record Conflicts**: Check for existing records

### Support Resources
- [GoDaddy API Documentation](https://developer.godaddy.com/doc)
- [DNS Propagation Checker](https://www.whatsmydns.net/)
- [GoDaddy Support](https://www.godaddy.com/help)

## Security Considerations

### 1. API Key Management
- Store API keys securely
- Use environment variables
- Rotate keys regularly

### 2. Access Control
- Limit API key permissions
- Monitor API usage
- Implement audit logging

### 3. DNS Security
- Enable DNSSEC where possible
- Monitor for DNS hijacking
- Implement DNS filtering

---

**Note**: Always test DNS changes in a sandbox environment before applying to production domains.

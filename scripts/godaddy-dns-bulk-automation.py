#!/usr/bin/env python3
"""
Tier-1 GoDaddy DNS Bulk Automation Script
E2E Empire DNS Management - Production Ready
"""

import requests
import json
import time
import sys
import os
from typing import List, Dict, Optional
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('godaddy-dns-automation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class GoDaddyDNSBulkManager:
    """Tier-1 GoDaddy DNS Bulk Management"""
    
    def __init__(self, api_key: str, api_secret: str, use_sandbox: bool = False):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = "https://api.ote-godaddy.com/v1" if use_sandbox else "https://api.godaddy.com/v1"
        self.headers = {
            "Authorization": f"sso-key {api_key}:{api_secret}",
            "Content-Type": "application/json"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
    def validate_api_access(self) -> bool:
        """Validate GoDaddy API access and permissions"""
        try:
            url = f"{self.base_url}/domains"
            response = self.session.get(url)
            
            if response.status_code == 200:
                domains = response.json()
                logger.info(f"✅ API Access Validated - {len(domains)} domains accessible")
                return True
            elif response.status_code == 401:
                logger.error("❌ API Authentication Failed - Check credentials")
                return False
            elif response.status_code == 403:
                logger.error("❌ API Access Denied - Need 10+ domains or DDC subscription")
                return False
            else:
                logger.error(f"❌ API Error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ API Validation Error: {e}")
            return False
    
    def get_domain_records(self, domain: str) -> List[Dict]:
        """Get all DNS records for a domain"""
        try:
            url = f"{self.base_url}/domains/{domain}/records"
            response = self.session.get(url)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"❌ Failed to get records for {domain}: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"❌ Error getting records for {domain}: {e}")
            return []
    
    def backup_domain_records(self, domain: str) -> bool:
        """Backup current DNS records before changes"""
        try:
            records = self.get_domain_records(domain)
            backup_file = f"backup_{domain}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            with open(backup_file, 'w') as f:
                json.dump(records, f, indent=2)
            
            logger.info(f"✅ Backup created: {backup_file}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Backup failed for {domain}: {e}")
            return False
    
    def update_domain_records(self, domain: str, records: List[Dict], dry_run: bool = False) -> bool:
        """Update DNS records for a domain"""
        try:
            if dry_run:
                logger.info(f"🔍 DRY RUN - Would update {domain} with {len(records)} records")
                for record in records:
                    logger.info(f"  - {record['type']} {record['name']} -> {record['data']}")
                return True
            
            url = f"{self.base_url}/domains/{domain}/records"
            response = self.session.put(url, json=records)
            
            if response.status_code == 200:
                logger.info(f"✅ Updated {domain} with {len(records)} records")
                return True
            else:
                logger.error(f"❌ Failed to update {domain}: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error updating {domain}: {e}")
            return False
    
    def bulk_update_domains(self, domain_configs: Dict[str, List[Dict]], 
                          dry_run: bool = False, backup: bool = True) -> Dict[str, bool]:
        """Bulk update multiple domains with rate limiting and validation"""
        results = {}
        total_domains = len(domain_configs)
        
        logger.info(f"🚀 Starting bulk DNS update for {total_domains} domains")
        logger.info(f"Mode: {'DRY RUN' if dry_run else 'PRODUCTION'}")
        
        for i, (domain, records) in enumerate(domain_configs.items(), 1):
            try:
                logger.info(f"📋 Processing {domain} ({i}/{total_domains})")
                
                # Backup current records
                if backup and not dry_run:
                    self.backup_domain_records(domain)
                
                # Update records
                success = self.update_domain_records(domain, records, dry_run)
                results[domain] = success
                
                # Rate limiting - 1 request per second
                if i < total_domains:
                    time.sleep(1)
                    
            except Exception as e:
                logger.error(f"❌ Error processing {domain}: {e}")
                results[domain] = False
        
        return results
    
    def verify_dns_propagation(self, domain: str, expected_target: str, timeout: int = 300) -> bool:
        """Verify DNS propagation for a domain"""
        import subprocess
        
        logger.info(f"🔍 Verifying DNS propagation for {domain}")
        
        for attempt in range(timeout // 10):
            try:
                result = subprocess.run(
                    ['nslookup', domain], 
                    capture_output=True, 
                    text=True, 
                    timeout=10
                )
                
                if expected_target in result.stdout:
                    logger.info(f"✅ DNS propagation verified for {domain}")
                    return True
                    
            except subprocess.TimeoutExpired:
                pass
            
            time.sleep(10)
        
        logger.warning(f"⏳ DNS propagation timeout for {domain}")
        return False

# E2E Empire DNS Configuration
E2E_EMPIRE_DNS_CONFIG = {
    "aaacbdhempflower.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "cannabiscookiestexas.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "exoticcanopysolutions.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "exoticcbdhempflower.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "freeweedsanantonio.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "freeweedtexas.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "getlooseyoga.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "herbitrage.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "highfromhemp.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "jesseniesen.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "loudcbdbuds.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "loudcbdflower.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "oneplantsolution.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "smokingyoga.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "terpwerk.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "texascannabiscookies.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "thcacannabisdispensary.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "thcaflowerstx.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "thcaflowertx.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "thcasanantonio.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "tier1treecare.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ],
    "tokinyoga.com": [
        {"type": "CNAME", "name": "@", "data": "integration-service-plad5efvha-uc.a.run.app", "ttl": 300}
    ]
}

def main():
    """Main execution function"""
    print("🚀 E2E EMPIRE GoDaddy DNS Bulk Automation")
    print("=" * 50)
    
    # Get API credentials from environment or 1Password
    api_key = os.getenv('GODADDY_API_KEY')
    api_secret = os.getenv('GODADDY_API_SECRET')
    
    if not api_key or not api_secret:
        print("❌ Error: GoDaddy API credentials not found")
        print("Set GODADDY_API_KEY and GODADDY_API_SECRET environment variables")
        print("Or use: op run -- python3 godaddy-dns-bulk-automation.py")
        sys.exit(1)
    
    # Initialize DNS manager
    dns_manager = GoDaddyDNSBulkManager(
        api_key=api_key,
        api_secret=api_secret,
        use_sandbox=False  # Set to True for testing
    )
    
    # Validate API access
    if not dns_manager.validate_api_access():
        print("❌ API access validation failed")
        sys.exit(1)
    
    # Parse command line arguments
    dry_run = '--dry-run' in sys.argv
    no_backup = '--no-backup' in sys.argv
    
    if dry_run:
        print("🔍 DRY RUN MODE - No changes will be made")
    
    # Execute bulk DNS update
    print(f"📊 Updating {len(E2E_EMPIRE_DNS_CONFIG)} domains...")
    results = dns_manager.bulk_update_domains(
        E2E_EMPIRE_DNS_CONFIG, 
        dry_run=dry_run, 
        backup=not no_backup
    )
    
    # Print summary
    successful = sum(1 for success in results.values() if success)
    total = len(results)
    success_rate = (successful / total) * 100 if total > 0 else 0
    
    print("\n📊 BULK DNS UPDATE SUMMARY:")
    print(f"Success: {successful}/{total} domains ({success_rate:.1f}%)")
    
    if successful == total:
        print("🎉 E2E EMPIRE DNS DEPLOYMENT 100% COMPLETE!")
        if not dry_run:
            print("⏳ DNS propagation may take 5-30 minutes")
            print("🔄 Run validation script to verify propagation")
    else:
        print("⚠️ Some domains failed to update. Check logs for details.")
    
    # Generate report
    report_file = f"dns-update-report-{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_file, 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_domains': total,
            'successful': successful,
            'failed': total - successful,
            'success_rate': success_rate,
            'results': results,
            'dry_run': dry_run
        }, f, indent=2)
    
    print(f"📄 Report saved: {report_file}")

if __name__ == "__main__":
    main()

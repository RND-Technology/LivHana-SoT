#!/usr/bin/env bash
# Monitor DNS propagation and SSL certificate provisioning
# Usage: ./monitor-dns-ssl.sh

set -euo pipefail

DOMAINS=(
  "aaacbdhempflower.com"
  "jesseniesen.com"
  "loudcbdflower.com"
  "thcasanantonio.com"
  "420radio.live"
  "cannabisreality.news"
  "cbdshowroom.com"
  "hempnewscompany.com"
)

TARGET_IPS=(
  "216.239.32.21"
  "216.239.34.21"
  "216.239.36.21"
  "216.239.38.21"
)

echo "🔍 Monitoring DNS Propagation and SSL Certificates"
echo "=================================================="
echo

# Check DNS resolution
echo "📡 DNS Resolution Status:"
echo
dns_ready=0
total_domains=${#DOMAINS[@]}

for domain in "${DOMAINS[@]}"; do
  echo -n "  $domain: "
  ips=$(dig +short "$domain" 2>/dev/null | grep -E '^[0-9]+\.' || echo "")
  
  if [[ -z "$ips" ]]; then
    echo "❌ No A records found"
  else
    ip_count=$(echo "$ips" | wc -l | tr -d ' ')
    echo "✅ $ip_count IPs found"
    echo "$ips" | sed 's/^/    /'
    
    # Check if all target IPs are present
    all_ips_present=true
    for target_ip in "${TARGET_IPS[@]}"; do
      if ! echo "$ips" | grep -q "$target_ip"; then
        all_ips_present=false
        break
      fi
    done
    
    if $all_ips_present; then
      ((dns_ready++))
    fi
  fi
  echo
done

dns_percentage=$((dns_ready * 100 / total_domains))
echo "DNS Propagation: $dns_ready/$total_domains domains ready ($dns_percentage%)"
echo

# Check SSL certificates
echo "🔐 SSL Certificate Status:"
echo
ssl_ready=0

for domain in "${DOMAINS[@]}"; do
  echo -n "  https://$domain: "
  response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "https://$domain" 2>/dev/null || echo "000")
  
  if [[ "$response" == "200" ]]; then
    echo "✅ HTTPS working (200 OK)"
    ((ssl_ready++))
  elif [[ "$response" == "000" ]]; then
    echo "⏳ Connection timeout (SSL provisioning)"
  else
    echo "⚠️  HTTP $response"
  fi
done

echo
ssl_percentage=$((ssl_ready * 100 / total_domains))
echo "SSL Certificates: $ssl_ready/$total_domains domains ready ($ssl_percentage%)"
echo

# Overall status
overall_ready=$(( (dns_ready + ssl_ready) * 100 / (total_domains * 2) ))
echo "=================================================="
echo "Overall Production Readiness: $overall_ready%"
echo "=================================================="

if [[ $overall_ready -eq 100 ]]; then
  echo
  echo "🎉 100% PRODUCTION READY - ALL SYSTEMS GO!"
  echo
elif [[ $dns_percentage -eq 100 ]]; then
  echo
  echo "✅ DNS propagation complete. SSL certificates provisioning..."
  echo "⏱️  Estimated SSL completion: 10-15 minutes"
  echo
else
  echo
  echo "⏳ Waiting for DNS propagation to complete..."
  echo "⏱️  Check again in 5-10 minutes"
  echo
fi

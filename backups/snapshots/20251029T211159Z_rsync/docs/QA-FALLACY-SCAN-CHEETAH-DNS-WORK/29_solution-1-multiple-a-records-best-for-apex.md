### Solution 1: Multiple A Records (Best for Apex)

```bash
#!/bin/bash
# Get ALL Cloud Run IPs
IPS=($(dig +short integration-service-plad5efvha-uc.a.run.app | grep -E '^[0-9]'))

# Create A record for each IP (DNS round-robin)
for ip in "${IPS[@]}"; do
    curl -X PUT \
        -H "Authorization: sso-key $KEY:$SECRET" \
        -H "Content-Type: application/json" \
        -d "[{\"type\":\"A\",\"name\":\"@\",\"data\":\"$ip\",\"ttl\":600}]" \
        "https://api.godaddy.com/v1/domains/$domain/records/A/@"
done
```

**Pros:**

- ✅ Valid DNS configuration
- ✅ Load distribution across all IPs
- ✅ Failover resilience
- ✅ No additional GCP cost

**Cons:**

- ⚠️ IPs may change (Cloud Run updates)
- ⚠️ Need periodic verification

---

### Solution 2: www CNAME + @ Forwarding (Recommended)

```bash
# Step 1: Create valid CNAME for www subdomain
curl -X PUT \
    -H "Authorization: sso-key $KEY:$SECRET" \
    -H "Content-Type: application/json" \
    -d "[{\"type\":\"CNAME\",\"name\":\"www\",\"data\":\"integration-service-plad5efvha-uc.a.run.app\",\"ttl\":600}]" \
    "https://api.godaddy.com/v1/domains/$domain/records/CNAME/www"

# Step 2: Set up forwarding (via GoDaddy UI or forwarding API)
# @ → www.$domain (301 redirect)
```

**Pros:**

- ✅ 100% valid DNS
- ✅ Auto-updates with Cloud Run IPs
- ✅ Industry standard pattern
- ✅ No maintenance needed

**Cons:**

- ⚠️ Extra redirect hop (minimal impact)
- ⚠️ Requires GoDaddy forwarding setup

---

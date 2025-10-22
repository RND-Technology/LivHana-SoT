### Solution 3: Cloud Load Balancer + Static IP (Enterprise)

```bash
# Reserve static IP
gcloud compute addresses create e2e-empire-ip --global

# Get the IP
STATIC_IP=$(gcloud compute addresses describe e2e-empire-ip --global --format="value(address)")

# Create single A record
curl -X PUT \
    -H "Authorization: sso-key $KEY:$SECRET" \
    -H "Content-Type: application/json" \
    -d "[{\"type\":\"A\",\"name\":\"@\",\"data\":\"$STATIC_IP\",\"ttl\":600}]" \
    "https://api.godaddy.com/v1/domains/$domain/records/A/@"
```

**Pros:**

- ✅ Single stable IP
- ✅ Advanced load balancing
- ✅ SSL termination at LB
- ✅ DDoS protection

**Cons:**

- 💰 Cost: ~$18/month per IP
- 🔧 Additional GCP infrastructure

---

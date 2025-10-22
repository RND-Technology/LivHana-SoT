### Phase 2: DNS Load Balancing (PARALLEL - 30 min)

**Status:** Script ready, not executed
**Can run:** While waiting for SSL provisioning

**Actions:**

```bash
# Execute the correct solution script
cd scripts
./godaddy-dns-CORRECT-SOLUTION.sh

# Or deploy Agent 2
# This will:
# 1. Get all 8 Cloud Run IPs
# 2. Update GoDaddy DNS for 18 domains
# 3. Add 8 A records per domain (not just 1)
```

**Expected outcome:**

- DNS propagation: 10-30 minutes
- Each domain returns 8 IPs (not 1)
- Proper load distribution ✅
- Improved redundancy ✅

**Verification:**

```bash
$ dig +short aaacbdhempflower.com A
34.143.72.2
34.143.73.2
34.143.74.2
34.143.75.2
34.143.76.2
34.143.77.2
34.143.78.2
34.143.79.2  # All 8 IPs ✅
```

---

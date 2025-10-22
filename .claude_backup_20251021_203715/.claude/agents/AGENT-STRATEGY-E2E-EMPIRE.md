# 🤖 AGENT DEPLOYMENT STRATEGY - E2E EMPIRE MISSION

**Mission:** Get E2E Empire from 48% → 100% production readiness ASAP
**Critical Path:** Cloud Run domain mappings + SSL certificates
**Timeline:** 1-2 hours to completion

---

## 🎯 AGENT DEPLOYMENT PLAN

### Agent 1: Cloud Run Domain Mapping Agent (CRITICAL PATH - Priority 1)
**Task:** Create domain mappings for 18 domains + monitor SSL provisioning
**Blocker:** This is THE critical path - nothing else matters until this is done
**Duration:** 1-2 hours (SSL provisioning time)

```bash
# Deploy this agent NOW
echo "Create Cloud Run domain mappings for all 18 failing domains:

Domains to map:
1. aaacbdhempflower.com
2. cannabiscookiestexas.com
3. exoticcanopysolutions.com
4. exoticcbdhempflower.com
5. freeweedsanantonio.com
6. freeweedtexas.com
7. herbitrage.com
8. jesseniesen.com
9. loudcbdbuds.com
10. loudcbdflower.com
11. smokingyoga.com
12. terpwerk.com
13. texascannabiscookies.com
14. thcacannabisdispensary.com
15. thcaflowerstx.com
16. thcaflowertx.com
17. thcasanantonio.com

Target service: integration-service
Region: us-central1
Project: livhana-439623

For EACH domain:
1. Create domain mapping: gcloud run domain-mappings create --service integration-service --domain [domain] --region us-central1
2. Verify mapping created: gcloud run domain-mappings describe [domain]
3. Monitor SSL certificate status (will show 'Provisioning' then 'Ready')
4. Test HTTPS once SSL is ready: curl -I https://[domain]
5. Report progress after every 20% (every 3-4 domains)

IMPORTANT: Run these in parallel where possible (gcloud allows multiple simultaneous operations)

Once complete, report:
- Total domains mapped: X/18
- SSL certificates ready: X/18
- HTTPS working: X/18
- Any failures with detailed error messages

Target: 100% success rate
" > /tmp/agent1-domain-mapping.txt
```

**Why Agent 1 is critical:**
- Blocks everything else
- Takes longest (SSL provisioning)
- Requires GCP permissions
- Must be done correctly (no retry logic in SSL provisioning)

**Expected output:**
- Domain mappings: 18/18 created ✅
- SSL certificates: 18/18 provisioned ✅
- HTTPS responses: 18/18 working ✅

---

### Agent 2: DNS Load Balancing Optimization (Priority 2)
**Task:** Update DNS to use all 8 Cloud Run IPs (not just 1)
**Blocker:** Can run in parallel with Agent 1
**Duration:** 30 minutes

```bash
echo "Fix DNS load balancing - currently using 1 IP instead of 8:

Current state:
- All domains → 34.143.72.2 (single IP)
- Cloud Run provides 8 IPs for load distribution

Available IPs (verify first):
dig +short integration-service-plad5efvha-uc.a.run.app

Task:
1. Get all 8 Cloud Run IPs
2. For each of the 18 domains, update GoDaddy DNS to create 8 A records (one per IP)
3. Use the CORRECT approach from scripts/godaddy-dns-CORRECT-SOLUTION.sh
4. Verify each domain resolves to all 8 IPs after update
5. Test that DNS round-robin is working

Commands:
- Get IPs: dig +short integration-service-plad5efvha-uc.a.run.app
- Update via GoDaddy API (use 1Password credentials)
- Verify: dig +short [domain] A (should return multiple IPs)

Report:
- Domains updated: X/18
- IPs per domain: 8/8
- Round-robin working: Yes/No
- Any failures

Target: All domains using all 8 IPs for proper load distribution
" > /tmp/agent2-load-balancing.txt
```

**Why Agent 2 matters:**
- Improves redundancy
- Better load distribution
- Reduces single point of failure
- Can run while SSL provisions

---

### Agent 3: API Functionality Verification (Priority 3)
**Task:** Test all API endpoints once HTTPS is working
**Blocker:** Depends on Agent 1 (SSL must be ready)
**Duration:** 20 minutes

```bash
echo "Verify API functionality for all domains:

Wait for: Agent 1 completion (HTTPS working)

For each domain:
1. Test age verification status: GET https://[domain]/api/age-verification/status
2. Test health endpoint: GET https://[domain]/health
3. Verify response codes (200 OK expected)
4. Check response content (valid JSON)
5. Test POST endpoints (if applicable)

Expected responses:
- Age verification: {\"status\":\"ready\"} or similar
- Health: {\"status\":\"ok\"}

Report after every 20%:
- Domains tested: X/18
- API working: X/18
- Specific failures with error messages

If failures:
- Check Cloud Run logs: gcloud run services logs read integration-service
- Check database connectivity
- Verify environment variables

Target: 90%+ API functionality (100% ideal)
" > /tmp/agent3-api-verification.txt
```

---

### Agent 4: Monitoring & Alerting Setup (Priority 4)
**Task:** Set up continuous monitoring + alerts
**Blocker:** None (can run immediately)
**Duration:** 30 minutes

```bash
echo "Set up production monitoring and alerting:

Tasks:
1. Verify continuous monitor is running (scripts/e2e-empire-continuous-monitor.sh)
2. Set up Cloud Monitoring dashboards for:
   - Cloud Run service health
   - Domain response times
   - SSL certificate expiry
   - Error rates
3. Create alerts for:
   - Any domain returning 5xx errors
   - Response time > 5 seconds
   - SSL certificate expiry < 30 days
   - Cloud Run service down
4. Set up log aggregation:
   - Central logging for all domains
   - Error tracking
   - Performance metrics
5. Create status dashboard accessible to team

Tools:
- Google Cloud Monitoring
- Cloud Run metrics
- Custom monitoring script (already deployed)

Deliverables:
- Dashboard URL
- Alert configuration
- Log query examples
- Status page URL

Target: Real-time visibility into E2E Empire health
" > /tmp/agent4-monitoring.txt
```

---

### Agent 5: Documentation & Runbook (Priority 5)
**Task:** Document final configuration + create operational runbook
**Blocker:** Depends on Agents 1-3 completion
**Duration:** 30 minutes

```bash
echo "Create production documentation and runbook:

Document:
1. Final DNS configuration (which domains, which IPs)
2. Cloud Run domain mappings (all 18 domains listed)
3. SSL certificate status and expiry dates
4. API endpoints and expected responses
5. Monitoring setup and alert thresholds
6. Troubleshooting guide for common issues

Create runbook for:
- Adding new domains to E2E Empire
- SSL certificate renewal process
- DNS updates procedure
- Rollback procedure (if needed)
- Incident response (domain down)
- Performance optimization

Save to:
- docs/E2E-EMPIRE-PRODUCTION-GUIDE.md
- docs/E2E-EMPIRE-RUNBOOK.md

Include:
- Architecture diagrams
- Configuration examples
- Common issues and solutions
- Contact information for escalation

Target: Complete operational documentation
" > /tmp/agent5-documentation.txt
```

---

## 📊 AGENT EXECUTION PLAN

### Parallel Execution (Optimal):

```
Time  │ Agent 1               │ Agent 2              │ Agent 3        │ Agent 4         │ Agent 5
──────┼───────────────────────┼──────────────────────┼────────────────┼─────────────────┼────────────
0min  │ Create domain mapping │ Get Cloud Run IPs    │ [WAITING]      │ Setup monitoring│ [WAITING]
20min │ Monitor SSL (0-5/18)  │ Update DNS (0-5/18)  │ [WAITING]      │ Create alerts   │ [WAITING]
40min │ Monitor SSL (6-12/18) │ Update DNS (6-12/18) │ [WAITING]      │ Setup dashboard │ [WAITING]
60min │ SSL ready (13-18/18)  │ Verify DNS (13-18)   │ Test APIs 0-5  │ Configure logs  │ [WAITING]
80min │ ✅ COMPLETE           │ ✅ COMPLETE          │ Test APIs 6-12 │ ✅ COMPLETE     │ Start docs
100min│                       │                      │ ✅ COMPLETE    │                 │ Write runbook
120min│                       │                      │                │                 │ ✅ COMPLETE
```

### Sequential Execution (Safer):

```
1. Agent 1: Domain mapping + SSL (60-90 min) [BLOCKING]
2. Agent 2: Load balancing (30 min) [Can overlap with #1]
3. Agent 3: API verification (20 min) [After #1]
4. Agent 4: Monitoring (30 min) [Anytime]
5. Agent 5: Documentation (30 min) [After all]

Total time: 2.5-3 hours
```

---

## 🚀 DEPLOYMENT COMMANDS

### Deploy Agent 1 (CRITICAL - Start Now):
```bash
# Use autonomous agent endpoint
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Create Cloud Run domain mappings for 18 E2E Empire domains and monitor SSL certificate provisioning",
    "context": "Domains are currently resolving to 34.143.72.2 but returning SSL errors. Need domain mappings created in GCP project livhana-439623 for integration-service in us-central1 region.",
    "priority": "critical",
    "domains": ["aaacbdhempflower.com","cannabiscookiestexas.com","exoticcanopysolutions.com","exoticcbdhempflower.com","freeweedsanantonio.com","freeweedtexas.com","herbitrage.com","jesseniesen.com","loudcbdbuds.com","loudcbdflower.com","smokingyoga.com","terpwerk.com","texascannabiscookies.com","thcacannabisdispensary.com","thcaflowerstx.com","thcaflowertx.com","thcasanantonio.com"]
  }'
```

### Deploy Agent 2 (Parallel with Agent 1):
```bash
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Update DNS records to use all 8 Cloud Run IPs for load balancing",
    "context": "Currently using single IP (34.143.72.2). Need to add all 8 IPs from integration-service-plad5efvha-uc.a.run.app as A records using GoDaddy API.",
    "priority": "high"
  }'
```

### Deploy Agent 3 (After Agent 1):
```bash
# Wait for Agent 1 to complete SSL provisioning
curl -X POST http://localhost:4002/api/autonomous/execute \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Test API functionality for all 18 E2E Empire domains",
    "context": "Verify age verification API endpoints and health checks work correctly after SSL provisioning",
    "priority": "high"
  }'
```

---

## 📈 PROGRESS TRACKING

### Real-time Status Checks:

```bash
# Check Agent 1 progress
gcloud run domain-mappings list --region us-central1 | grep -c "Ready"

# Check Agent 2 progress
for domain in aaacbdhempflower.com jesseniesen.com; do
    dig +short "$domain" A | wc -l
done

# Check Agent 3 progress
cat reports/e2e-empire-monitor/scan-*.json | tail -1 | jq '.summary.functionality_passing'

# Overall readiness
cat reports/e2e-empire-monitor/scan-*.json | tail -1 | jq '.summary.readiness_score'
```

### Success Criteria:

```
✅ Agent 1: 18/18 domain mappings, 18/18 SSL certificates, 18/18 HTTPS working
✅ Agent 2: 18/18 domains with 8 A records, DNS round-robin verified
✅ Agent 3: 16/18+ API endpoints functional (90%+)
✅ Agent 4: Monitoring dashboard live, alerts configured
✅ Agent 5: Documentation complete, runbook published

Overall: 100% production readiness score
```

---

## 🎯 RECOMMENDATION: START AGENT 1 IMMEDIATELY

**Critical Path:** Domain mapping + SSL provisioning
**Blocking:** Everything else depends on this
**Time Sensitive:** SSL provisioning takes 15-60 minutes per domain

**Start with:**
1. Agent 1 (critical path)
2. Agent 2 (parallel, improves resilience)
3. Agent 4 (parallel, monitoring)
4. Wait for Agent 1 completion
5. Agent 3 (API testing)
6. Agent 5 (documentation)

**Expected outcome:**
- Hour 1: Domain mappings created, SSL provisioning started
- Hour 2: SSL certificates ready, HTTPS working, APIs tested
- Hour 2.5: Load balancing optimized, monitoring live, documentation complete
- Result: 100% production readiness, ready to ship

---

## 🚨 FALLBACK PLAN

If Agent 1 fails (domain mapping issues):

**Alternative:** Cloud Load Balancer with static IP
- Reserve static IP in GCP
- Create Cloud Load Balancer
- Point all domains to static IP (single A record)
- Configure SSL certificates in Load Balancer
- Time: 2-3 hours, but more reliable

**Command:**
```bash
gcloud compute addresses create e2e-empire-ip --global
gcloud compute ssl-certificates create e2e-empire-cert \
    --domains=aaacbdhempflower.com,cannabiscookiestexas.com,[...all 18 domains]
# Create load balancer forwarding rule
```

---

**BOTTOM LINE:** Deploy Agent 1 NOW. It's the critical path. Everything else waits for SSL certificates.

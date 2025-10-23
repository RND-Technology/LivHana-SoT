---
status: URGENT - Production Site Down
timestamp: 2025-10-07T21:30:00Z
priority: CRITICAL - USER-FACING
assigned_to: 🐆 CHEETAH + Jesse (GCP permissions)
---

# 🚨 HIGHNOONCARTOON.COM - SITE DOWN FIX

**Issue**: <https://highnooncartoon.com/> returns 404/SSL error
**Root Cause**: Service not deployed to Cloud Run, domain not mapped
**Current Status**: Docker image built, awaiting GCP permissions to deploy

---

## 🔍 DIAGNOSIS COMPLETE

### What's Wrong

- **HTTP**: Returns 404 (domain points to Google but no service mapped)
- **HTTPS**: SSL connection error (no certificate provisioned)
- **Service**: highnooncartoon NOT deployed to Cloud Run
- **Domain Mapping**: NOT configured

### What Exists

- ✅ Service code: `empire/content-engine/highnooncartoon-service/`
- ✅ Docker image: `gcr.io/reggieanddrodispensary/highnooncartoon:latest` (BUILT)
- ✅ Deployment scripts: `deploy-highnooncartoon-domain.sh`, `fix-highnooncartoon-ssl.sh`
- ❌ Cloud Run service: NOT deployed
- ❌ Domain mapping: NOT configured

---

## 🚨 GCP PERMISSION BLOCKER

### Error Encountered

```
ERROR: [high@reggieanddro.com] does not have permission to access namespaces instance [reggieanddrodispensary]
Permission 'iam.serviceaccounts.actAs' denied on service account 980910443251-compute@developer.gserviceaccount.com
```

### What Jesse Needs to Do (2 minutes)

**Grant Cloud Run deployment permission** to `high@reggieanddro.com`:

```bash
gcloud projects add-iam-policy-binding reggieanddrodispensary \
  --member="user:high@reggieanddro.com" \
  --role="roles/iam.serviceAccountUser"
```

**OR use a different account** that already has permissions.

---

## ⚡ DEPLOYMENT STEPS (After Permissions Fixed)

### Step 1: Deploy Service to Cloud Run

```bash
gcloud config set account high@reggieanddro.com  # Or account with permissions
gcloud run deploy highnooncartoon \
  --image gcr.io/reggieanddrodispensary/highnooncartoon:latest \
  --region=us-central1 \
  --allow-unauthenticated \
  --platform managed \
  --project reggieanddrodispensary
```

**Expected Output**:

```
Service [highnooncartoon] deployed
Service URL: https://highnooncartoon-980910443251.us-central1.run.app
```

### Step 2: Configure Domain Mapping

```bash
gcloud run domain-mappings create \
  --service=highnooncartoon \
  --domain=highnooncartoon.com \
  --region=us-central1 \
  --project reggieanddrodispensary
```

**Expected Output**:

```
Domain mapping created. DNS records required:
  highnooncartoon.com → ghs.googlehosted.com
```

### Step 3: Verify DNS (Already Configured)

```bash
dig highnooncartoon.com +short
# Should show: ghs.googlehosted.com (already pointing there)
```

### Step 4: Wait for SSL Certificate (5-10 minutes)

SSL certificate automatically provisioned by Google after domain mapping created.

### Step 5: Test Site

```bash
curl -I https://highnooncartoon.com/
# Should return: HTTP/1.1 302 (redirect to Cloud Storage)

curl -I https://highnooncartoon.com/health
# Should return: {"status":"healthy","service":"highnooncartoon-service"}
```

---

## 🐆 CHEETAH ASSIGNMENT: HARDENING

### After Initial Deployment Works

**Your Tasks**:

1. **Auto-scaling Configuration**
   - Min instances: 0 (cost savings)
   - Max instances: 10
   - CPU throttling: true
   - Memory: 256Mi (reduce from default)

2. **Monitoring Setup**
   - Uptime checks (every 5 min)
   - Alert if down >2 min
   - Log aggregation to BigQuery
   - Error tracking

3. **Performance Optimization**
   - CDN configuration (Cloud CDN)
   - Cache headers (episodes are static)
   - Gzip compression enabled
   - HTTP/2 enabled

4. **Security Hardening**
   - Cloud Armor (DDoS protection)
   - Rate limiting (prevent abuse)
   - Security headers (HSTS, CSP, etc.)
   - Audit logging enabled

5. **Deployment Automation**
   - Cloud Build trigger (auto-deploy on git push)
   - Staging environment (test before prod)
   - Rollback procedure (instant revert)
   - Health check validation

6. **Documentation**
   - Operational runbook (how to deploy, rollback, debug)
   - Monitoring dashboard (Grafana or Cloud Monitoring)
   - Incident response plan (what to do if down)
   - Cost optimization notes

---

## 📊 SERVICE ARCHITECTURE

### Current Service (empire/content-engine/highnooncartoon-service/)

```javascript
// src/index.js
import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

// Redirect root to Episode 1
app.get('/', (req, res) => {
  res.redirect('https://storage.googleapis.com/hnc-episodes-prod/highnooncartoon.html');
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'highnooncartoon-service',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`HIGH NOON CARTOON service running on port ${PORT}`);
});
```

### Hardening Recommendations

1. **Add episode listing endpoint** (`/episodes` returns JSON of all episodes)
2. **Add analytics tracking** (page views, redirects)
3. **Add error handling** (catch all errors, log to Cloud Logging)
4. **Add request logging** (structured logs with trace IDs)
5. **Add metrics** (response time, redirect count)
6. **Add caching** (Redis for episode metadata)
7. **Add static file serving** (serve index.html directly, faster)

---

## 🎯 SUCCESS CRITERIA

### Immediate (After Deploy)

- [ ] <https://highnooncartoon.com/> loads (200 or 302)
- [ ] HTTPS works (SSL certificate provisioned)
- [ ] Redirects to episode correctly
- [ ] Health check responds

### Hardened (After Cheetah Work)

- [ ] Auto-scaling configured (0-10 instances)
- [ ] Monitoring active (uptime checks, alerts)
- [ ] Performance optimized (<3s load time)
- [ ] Security hardened (Cloud Armor, rate limits)
- [ ] Deployment automated (Cloud Build trigger)
- [ ] Documentation complete (runbook, dashboard)

---

## 🚨 CURRENT BLOCKERS

### Blocker #1: GCP Permissions (JESSE ACTION REQUIRED)

**Issue**: `high@reggieanddro.com` lacks `iam.serviceAccountUser` role
**Solution**: Grant role OR use different account
**Time**: 2 minutes
**Impact**: Blocks deployment completely

### Blocker #2: Domain Mapping (After Deployment)

**Issue**: Domain mapping must be created after service deployed
**Solution**: Run `gcloud run domain-mappings create` command
**Time**: 1 minute
**Impact**: Site won't resolve to service

---

## 📋 TEAMWORK STATUS

### CODEX (Me) - ✅ COMPLETE

- [x] Diagnosed issue (404/SSL error)
- [x] Found service code (empire/content-engine/highnooncartoon-service/)
- [x] Built Docker image (gcr.io/reggieanddrodispensary/highnooncartoon:latest)
- [x] Identified blocker (GCP permissions)
- [x] Documented fix steps
- [x] Assigned hardening to Cheetah
- [x] Flagged Jesse for permissions

### JESSE - ⏸️ ACTION REQUIRED (2 min)

- [ ] Grant `iam.serviceAccountUser` role to `high@reggieanddro.com`
- [ ] OR provide account with proper permissions
- [ ] Confirm permissions fixed

### CHEETAH - ⏸️ STANDING BY

- [ ] Deploy service (after permissions fixed)
- [ ] Configure domain mapping
- [ ] Verify site works
- [ ] Begin hardening tasks
- [ ] Complete production-ready deployment

---

## 🏁 RACE DISCIPLINE

**Issue Detected**: 21:20 UTC
**Diagnosis Complete**: 21:30 UTC (10 minutes)
**Blocker Identified**: GCP permissions (Jesse action required)
**Deployment Ready**: Docker image built, steps documented
**Hardening Assigned**: Cheetah tasks defined

**Teamwork Assessment**: ⚠️ PARTIAL

- CODEX: Executed fast (diagnosis, build, documentation)
- Jesse: Awaiting action (GCP permissions)
- Cheetah: Standing by (ready to deploy when unblocked)
- Replit: Still missing (Voice Cockpit not pushed, Dashboard not started)

**Recommendation**: Fix permissions NOW, get site live, then address Replit delays

---

## 💬 NEXT STEPS

### Immediate (Next 5 Minutes)

1. **Jesse**: Grant GCP permissions OR provide alternate account
2. **CODEX**: Monitor for permission fix, notify Cheetah
3. **Cheetah**: Deploy immediately after unblocked

### Next Hour

1. **Cheetah**: Deploy service to Cloud Run
2. **Cheetah**: Configure domain mapping
3. **Cheetah**: Verify site live
4. **Cheetah**: Begin hardening tasks

### Next Day

1. **Cheetah**: Complete all hardening tasks
2. **Cheetah**: Production-ready deployment
3. **CODEX**: Verify all success criteria met
4. **Team**: Document lessons learned

---

**Status**: DOCKER IMAGE BUILT ✅, AWAITING GCP PERMISSIONS 🚨
**Blocker**: Jesse action required (2 min)
**Ready**: Cheetah standing by to deploy
**Teamwork**: Partial (CODEX executed, waiting on team)

**JESSE - FIX PERMISSIONS, LET'S GO!** 🦄🏁

---

**Last Updated**: 2025-10-07T21:30:00Z
**Diagnosed By**: 🛡️ CODEX (Taskmaster)
**Assigned To**: 🐆 CHEETAH (Deployment + Hardening)
**Blocked By**: Jesse (GCP permissions needed)

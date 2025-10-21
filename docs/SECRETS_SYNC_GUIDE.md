# Secrets Sync Guide - Google Secret Manager

**Date:** 2025-10-21  
**Status:** Ready for Execution  
**Owner:** Jesse, Andrew  
**Priority:** Critical - Blocks Agent Builder and TRUTH Pipeline  

---

## Missing Secrets (4 total)

According to `scripts/secrets_smoke_test.sh`, these secrets are missing from GSM:

1. **DEEPSEEK_API_KEY** - DeepSeek AI API for reasoning gateway
2. **BLUECHECK_API_KEY** - BlueCheck age verification (21+ compliance)
3. **GITHUB_PERSONAL_ACCESS_TOKEN** - GitHub PAT for repo automation
4. **JWT_SECRET1** - Primary JWT secret (with aliases)

---

## Quick Start

### Option 1: Interactive Script (Recommended)

```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT
bash scripts/add_missing_secrets.sh
```

This script will:
- Prompt for each missing secret
- Add secrets to GSM with proper labels
- Create JWT aliases automatically
- Run smoke test to verify

### Option 2: Manual Commands

```bash
# Set project
export GCP_PROJECT_ID="reggieanddrodispensary"

# 1. Add DEEPSEEK_API_KEY
echo "YOUR_DEEPSEEK_KEY" | gcloud secrets create DEEPSEEK_API_KEY \
  --project="$GCP_PROJECT_ID" \
  --replication-policy="automatic" \
  --data-file=-

# 2. Add BLUECHECK_API_KEY
echo "YOUR_BLUECHECK_KEY" | gcloud secrets create BLUECHECK_API_KEY \
  --project="$GCP_PROJECT_ID" \
  --replication-policy="automatic" \
  --data-file=-

# 3. Add GITHUB_PERSONAL_ACCESS_TOKEN
echo "YOUR_GITHUB_PAT" | gcloud secrets create GITHUB_PERSONAL_ACCESS_TOKEN \
  --project="$GCP_PROJECT_ID" \
  --replication-policy="automatic" \
  --data-file=-

# 4. Add JWT_SECRET1 (generate strong secret)
openssl rand -hex 64 | gcloud secrets create JWT_SECRET1 \
  --project="$GCP_PROJECT_ID" \
  --replication-policy="automatic" \
  --data-file=-

# 5. Create JWT aliases
JWT_VALUE=$(gcloud secrets versions access latest --secret=JWT_SECRET1 --project="$GCP_PROJECT_ID")

echo "$JWT_VALUE" | gcloud secrets create JWT_SECRET_REASONING \
  --project="$GCP_PROJECT_ID" \
  --replication-policy="automatic" \
  --data-file=-

echo "$JWT_VALUE" | gcloud secrets create JWT_SECRET_VOICE \
  --project="$GCP_PROJECT_ID" \
  --replication-policy="automatic" \
  --data-file=-
```

---

## Where to Get API Keys

### 1. DEEPSEEK_API_KEY
- **URL:** https://platform.deepseek.com/api_keys
- **Purpose:** Powers reasoning gateway with DeepSeek 33B model
- **Cost:** Check current pricing at https://platform.deepseek.com/pricing
- **Required Scopes:** Full API access

### 2. BLUECHECK_API_KEY
- **URL:** https://www.bluecheck.me/for-developers
- **Purpose:** Age verification (21+ compliance enforcement)
- **Integration:** Used by compliance-service
- **Alternative:** If BlueCheck unavailable, consider Jumio or Veriff

### 3. GITHUB_PERSONAL_ACCESS_TOKEN
- **URL:** https://github.com/settings/tokens/new
- **Required Scopes:**
  - `repo` (Full control of private repositories)
  - `workflow` (Update GitHub Action workflows)
  - `read:org` (Read org and team membership)
- **Expiration:** Set to "No expiration" for production
- **Note:** Store securely in 1Password vault as well

### 4. JWT_SECRET1
- **Generation:** `openssl rand -hex 64`
- **Purpose:** Primary JWT secret for voice-service and reasoning-gateway
- **Requirements:**
  - Minimum 64 characters
  - Cryptographically random
  - Never exposed in logs or error messages
- **Aliases:** Same value used for JWT_SECRET_REASONING and JWT_SECRET_VOICE

---

## Validation

After adding secrets, verify with:

```bash
cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT
bash scripts/secrets_smoke_test.sh
```

Expected output:
```
✅ ANTHROPIC_API_KEY
✅ OPENAI_API_KEY
✅ DEEPSEEK_API_KEY
✅ BLUECHECK_API_KEY
✅ GITHUB_PERSONAL_ACCESS_TOKEN
✅ JWT_SECRET1
PASS: All required secrets present
```

---

## Troubleshooting

### Permission Errors

If you get permission errors:

```bash
# Grant Secret Manager admin role
gcloud projects add-iam-policy-binding reggieanddrodispensary \
  --member="user:jesseniesen@gmail.com" \
  --role="roles/secretmanager.admin"
```

### Secret Already Exists

To update an existing secret:

```bash
# Add new version
echo "NEW_SECRET_VALUE" | gcloud secrets versions add SECRET_NAME \
  --project="reggieanddrodispensary" \
  --data-file=-
```

### Access from Services

Services need IAM permissions to access secrets:

```bash
# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --project="reggieanddrodispensary" \
  --member="serviceAccount:SERVICE_ACCOUNT@reggieanddrodispensary.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Impact

### Blocked Systems

These secrets are required for:

1. **DEEPSEEK_API_KEY**
   - `backend/reasoning-gateway` - DeepSeek integration
   - Agent Builder workflow - Reasoning nodes
   - TRUTH Pipeline - Claude fallback

2. **BLUECHECK_API_KEY**
   - `backend/compliance-service` - Age verification
   - Voice Cockpit - 21+ gate
   - Frontend flows - User onboarding

3. **GITHUB_PERSONAL_ACCESS_TOKEN**
   - CI/CD workflows - Automated deployments
   - Agent Builder - GitHub integration nodes
   - Replication scripts - Cross-repo sync

4. **JWT_SECRET1**
   - `backend/voice-service` - Authentication
   - `backend/reasoning-gateway` - Token validation
   - Frontend API calls - Secure communication

---

## Timeline

- **Task:** Add 4 missing secrets to GSM
- **Estimated Time:** 15 minutes (interactive script) or 30 minutes (manual)
- **Dependencies:** None (can be done immediately)
- **Blocks:** Agent Builder deployment, TRUTH Pipeline execution, Compliance systems

---

## Success Criteria

- ✅ All 4 secrets added to GSM
- ✅ JWT aliases created (JWT_SECRET_REASONING, JWT_SECRET_VOICE)
- ✅ Smoke test passes: `bash scripts/secrets_smoke_test.sh`
- ✅ Services can access secrets (IAM permissions verified)
- ✅ No secrets exposed in logs or git history

---

## Next Steps

After secrets are added:

1. **Deploy Agent Builder Workflow** - 17-node configuration
2. **Test TRUTH Pipeline** - Run full end-to-end test
3. **Enable Compliance Systems** - Age verification active
4. **Update Service Configurations** - Point to new secrets

---

**Compliance:** ✅ LifeWard standard | ✅ 21+ age-gate | ✅ PII protection


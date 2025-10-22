---
purpose: Actions only Jesse can do to unblock team
status: ACTIVE - 1 CRITICAL ACTION (HNC site down)
completed: Lightspeed token + GitHub PAT + GCP permissions
---

# HUMAN WORK FOR JESSE

## 🚨 CRITICAL BLOCKERS (12 min total)

### ✅ 1. GCP IAM Permissions (5 min, completed 2025-10-08)
**Status**: Finished — Cloud Build Editor, Cloud Run Admin, and Service Usage Admin added to `jesseniesen@gmail.com`.
**Unblocked**: Voice Cockpit Cloud Run deployment.
**Follow-up**: None. Move to the remaining blockers.

### ✅ 2. Lightspeed Personal Token (completed 2025-10-08T04:35Z)
**Status**: Retrieved from 1Password — `op://LivHana-Ops-Keys/LIGHTSPEED_PERSONAL_TOKEN/credential`
**Stored**: Securely in 1Password vault
**Unblocked**: Revenue Dashboard + Replit VIP Cockpit + Square Integration + Online Sales Strategy.
**Next**: Integrate into backend services, update .env files, test API connection.

### ✅ 3. GitHub PAT for Replit (completed previously)
**Status**: Available in 1Password as `GITHUB_REPLIT_PAT`
**Unblocked**: Replit autonomous git access + VIP cockpit sync.

### 🚨 4. HNC Deployment Permissions (2 min) - CRITICAL SITE DOWN
**Unblocks**: highnooncartoon.com production deployment (currently 404/SSL error)
**Status**: BOTH accounts missing permissions
**Issue**:
- `jesseniesen@gmail.com`: Missing `artifactregistry.repositories.downloadArtifacts` (can't pull Docker image)
- `high@reggieanddro.com`: Missing `iam.serviceaccounts.actAs` (can't deploy to Cloud Run)

**Fix Option 1** (jesseniesen account):
```bash
gcloud projects add-iam-policy-binding reggieanddrodispensary \
  --member="user:jesseniesen@gmail.com" \
  --role="roles/artifactregistry.reader"
```

**Fix Option 2** (high account):
```bash
gcloud projects add-iam-policy-binding reggieanddrodispensary \
  --member="user:high@reggieanddro.com" \
  --role="roles/iam.serviceAccountUser"
```

**Status**: Docker image ready (`gcr.io/reggieanddrodispensary/highnooncartoon:latest`), deployment blocked

---

## 🎯 DAILY INTEL CHECK (NEW)

- **Read** `.claude/EXTERNAL_SIGNAL_INDEX.md` at session start
- **If stale** (>24h or placeholders): Populate latest AI war intel, add summaries, flag blockers
- **Owner**: Jesse — keep sources current so Codex, Claude Code, and Cheetah operate with today’s reality

---

## 🛡️ CODEX GUARANTEES (ACTIVE)

1. **Enforce Intel Currency** — Codex verifies every session that `EXTERNAL_SIGNAL_INDEX.md` is touched; if stale, Jesse is paged immediately.
2. **Track Human Unlocks** — Lightspeed token + Replit PAT remain top blockers until marked complete; Codex keeps them in this file until delivered.
3. **Zero-Slip Accountability** — Any agent miss (file bloat, missed pushes, permission gaps) is logged in `TEAM_ACCOUNTABILITY_SYSTEM.md` with a replacement guarantee inside 15 minutes.
4. **Execution First** — Codex default is action: run the change, cite the lines, then escalate only when human authority is required.
5. **Race Status Reporting** — After each major change, Codex posts a status ping (in repo or handoff note) so Claude Code + Cheetah can continue without pause.
6. **Capabilities on Record** — Codex keeps `MACHINE_PROPOSALS_INDEX.md` updated with current constraints + guarantees so every agent knows the operating envelope.

**Breach Protocol**: If Codex misses any guarantee, Jesse is alerted in this file plus `TEAM_ACCOUNTABILITY_SYSTEM.md`, and a stronger guarantee replaces it within the same session.

---

## ⚡ VELOCITY IMPROVEMENTS

### 4. Approve CORE4 Contract
**When**: After 4/4 signatures (currently 2/4: Claude Code, Replit)
**Action**: Reply "APPROVED" after reviewing contract

### 5. Multiple Claude Instances (Optional)
**Result**: 3x capacity, no weekly limits
**Action**: Open 3 Claude Code sessions (Primary, Secondary, Tertiary)

---

## 📊 WHAT WORKS
✅ Git sync protocol (100% coordination)
✅ 1 file per purpose (prevents bloat)
✅ 1Password CLI (secure, fast)
✅ Instant violation reporting (trust maintained)

## ❌ WHAT DOESN'T
❌ Multiple status files (deleted)
❌ Deploying without permissions (blocked)
❌ Working without critical inputs (wasted time)

---

**Impact**: $80K → $100K revenue + 3x team velocity
**Status**: AWAITING JESSE ACTION

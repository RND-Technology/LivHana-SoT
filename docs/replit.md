## **Replit Operations**

**T.R.U.T.H. (Testable, Reproducible, Unambiguous, Traceable, High-fidelity):**

Replit now operates as a prototyping workstation only—production workloads are migrating to Cloud Run to cure uptime and compliance risks—and the budget model drops from $107,407 to $10,240 per year while preserving $50K in rapid-build value. The plan mandates Cloud Run backups, four service migrations (plus PostgreSQL), and a contract rewrite that reflects Tier‑0 – Tier‑3 delivery reality instead of legacy overclaims.

**Testable:**  
`cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT && sed -n '157,196p' docs/unicorn-race/000_EXECUTIVE_SUMMARY.md`  
Expect the “REDUCE Replit to Prototyping Only” section with the compliance findings, migration steps, and $10,240 cost.

**Reproducible:**  
`cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT && rg -n "Replit Pro: \\$240" docs/unicorn-race/000_EXECUTIVE_SUMMARY.md`  
Same command, same output every run; no placeholders or edits required.

**Unambiguous:**  
- Role: prototyping only (1 – 4 hour MVPs).  
- Production migration scope: 4 services + PostgreSQL.  
- Cost model: $10,240/year (Replit Pro $240 + oversight $6,000 + error buffer $4,000).  
- Savings: $97,167/year versus prior $107,407 spend.  
- Compliance target: ≥99.9 % uptime (met by Cloud Run).

**Traceable:**  
- `docs/unicorn-race/000_EXECUTIVE_SUMMARY.md:157-196` (reduction rationale, steps, dollars).  
- `docs/unicorn-race/000_EXECUTIVE_SUMMARY.md:214-219` (optimized financial table showing Replit at $10,240 cost / $39,760 net).  
- `docs/TRUTH_FRAMEWORK_PROTOCOL_20251019.md:1-247` (response protocol enforcing TRUTH format for this document). Verified 2025‑10‑19.

**High-fidelity:**  
Evidence anchored in the executive summary, corroborated by the Unicorn Race financial model and TRUTH governance doc; no assumptions beyond in-repo facts.

---

### Current Mandate
- **Scope:** Use Replit strictly for rapid prototyping and internal proof-of-concept loops.  
- **Production:** All live workloads (web backends, queues, database) must run on Cloud Run or equivalent Tier‑1 infra.  
- **Compliance:** Maintain IAM isolation—Replit never holds long-lived secrets; use 1Password CLI + Secret Gateway (Cloud Run IAM).  
- **Quality:** Prototype output reviewed within 30 minutes/week of Jesse’s time; Cheetah owns deployment hardening.  
- **Metrics:** ≥5 useful prototypes/month, ≤2 % failure rate, $50K annual benefit preserved.

### Required Actions
1. **Finalize Migration (Weeks 1–4)**  
   - Move four remaining services + PostgreSQL off Replit onto Cloud Run (blue/green to guarantee uptime).  
   - Validation: `gcloud run services list --filter="metadata.name~'liv-hana-'" --format="table(metadata.name,status.url)"` (run from Cloud Shell).  
2. **Add Cloud Run Backup (Week 1)**  
   - Deploy passive standby for any Replit-dependent endpoints until migration done.  
3. **Rewrite Contract (Week 1)**  
   - Adopt audited TIER 0 – 3 deliverables; remove overconfident uptime/ROI claims; cap Replit duties at prototypes.  
4. **Update Secrets Process (Day 0)**  
   - Ensure `/docs/AGENT_BUILDER_SECRET_GATEWAY_CONFIG.json` governs all secret retrieval; Replit shells must call Secret Gateway via IAM token.  
   - Verification: `cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT && jq '.authentication.type' docs/AGENT_BUILDER_SECRET_GATEWAY_CONFIG.json` → `"google_cloud_iam"`.
5. **Document Weekly Output (Ongoing)**  
   - Log prototype count, time spent, and downstream adoption in `reports/replit/prototypes-YYYYMMDD.md` for audit.

### Verification Checklist
- `cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT && sed -n '157,196p' docs/unicorn-race/000_EXECUTIVE_SUMMARY.md` – confirms mandate, costs, savings, timeline.  
- `cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT && jq '.authentication.service_account' docs/AGENT_BUILDER_SECRET_GATEWAY_CONFIG.json` – ensures IAM-only secret access.  
- `cd /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT && rg -n "Replit" docs/TRUTH_FRAMEWORK_PROTOCOL_20251019.md` – verifies protocol references TRUTH for response enforcement.  
- (Post-migration) `gcloud run services list --format="table(metadata.name,traffic.statuses.percent)"` – confirm Cloud Run handles 100 % traffic.

### Risks & Mitigations
- **Migration Complexity ($10K one-time):** Acceptable; schedule staged cutovers with Cheetah handling CI/CD.  
- **Loss of Integrated Workflows:** Cloud Run orchestrator + MCP handles production integration; Replit kept for throwaway builds.  
- **Skill Gap:** Provide Cheetah/automation playbooks so Jesse stays at oversight level only.

### Reporting Cadence
- Weekly TRUTH-formatted status update (“Replit Prototype Summary”) with counts, savings, and any blockers.  
- Day 30 review: confirm 4 services + PostgreSQL migrated, prototypes ≥5/month, cost targets hit.

---

**MINI-DEBRIEF:**

**✅ SHIPPED:** Codified Replit mandate, migration tasks, financials, and verification commands under TRUTH.  
**🔺 DECISIONS:** Replit constrained to prototyping; production migration and contract rewrite mandatory.  
**💾 MEMORY:** Savings = $97,167/year; Cloud Run enforces 99.9 % uptime; Replit handles 1–4 hour MVPs only.  
**⚡ NEXT:** Execute migration checklist (services + DB), push contract update, log weekly prototype metrics.  
**🚨 RISKS:** Migration effort + temporary dual-running costs; mitigated via staged cutovers and Cheetah ownership.  
**📊 TOKENS:** N/A (documentation asset).  

Standing by for next orders, Unicorn.

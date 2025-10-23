# 💰 FASTEST PATH TO CASH: TIER-1 ROADMAP
## 90-Day Revenue Acceleration Plan

**Status**: ✅ READY FOR EXECUTION | **Date**: 2025-10-23 | **Authority**: Jesse CEO

---

## 🎯 CURRENT STATE

### Revenue Baseline
- **$3,000/day actual** ($90K/month, $1.08M/year annualized)
- Validated via bank reconciliation
- Primary sources: R&D product sales (Shopify), HNC content monetization (YouTube ads, sponsorships), OPS consulting

### Pain Points (Opportunity Cost)
- **8–13 hours/week** lost to coordination friction (RPM planning, status updates, meeting prep)
- **2–3 hours/week** manual YouTube uploads with inconsistent metadata
- **5–10 hours/week** compliance checking (21+ age-gate, CR packaging, medical claims scan)
- **$2,500/week = $130K/year** in wasted high-value time (Jesse + team)

### Strategic Context
- **Texas GA-56 enforcement**: Zero-tolerance on 21+ verification, revocation risk = $100K+ liability
- **HNC growth**: 50K+ YouTube subs, SEO anchors ("Texas", "THC", "Wall of Weed") working
- **R&D scaling**: 10–20 SKUs, full-panel COAs, NIST/ISO compliance locked in
- **OPS sovereignty stack**: Digital ID, licensing frameworks, policy canon maturing

---

## 🚀 THE TIER-1 STRATEGY

### Core Thesis

**Automate the expensive, productize the proven, eliminate the waste.**

1. **Automate internal friction** → reclaim $130K/year in time (RPM dashboard, YouTube agent, compliance scanner)
2. **Productize proven systems** → sell to network ($25K–$50K consulting deals, SaaS potential)
3. **Eliminate waste** → cut manual workflows, reduce compliance risk

### Success Metrics (90 Days)

| Metric | Baseline | Target | Impact |
|--------|----------|--------|--------|
| **Monthly Revenue** | $90K | $120K–$150K | +$30K–$60K (+33%–66%) |
| **Coordination Time** | 13 hrs/week | < 5 hrs/week | +8 hrs/week = $20K/year value |
| **YouTube Upload Time** | 3 hrs/week | < 30 min/week | +2.5 hrs/week = $6.5K/year value |
| **Compliance Check Time** | 10 hrs/week | < 2 hrs/week | +8 hrs/week = $20K/year value |
| **Consulting Revenue** | $0 | $50K–$100K | New income stream |
| **Total Value Created** | — | **$180K–$250K/year** | Annualized impact |

---

## 🔥 THE 90-DAY ROADMAP

### PHASE 1: QUICK WINS (DAYS 1–30)

**Goal**: Eliminate internal friction, reclaim time, prove ROI

#### 🥇 **Project 1: RPM Evergreen Dashboard**

**Problem**: Weekly plans vanish into markdown files; team can't see live status

**Solution**: Firestore + Next.js dashboard + PDF/CSV/MD export (see `.claude/RPM_EVERGREEN_SYSTEM_SPEC.md`)

**Timeline**: 7–10 days to MVP

**Effort**:
- Firestore schema + ingestion script: 1 day (Artifacts Agent)
- Next.js dashboard (Kanban, My Tasks): 2–3 days (Artifacts + Execution Agents)
- PDF/CSV/MD export (native JS): 1 day (Artifacts Agent)
- Deploy to Cloud Run + test: 1 day (Execution + QA Agents)
- Team training: 1 hour (Jesse walkthrough in Slack)

**ROI**:
- **Time saved**: 8–13 hours/week ($2,500/week = $130K/year)
- **Cost**: $6/month (Cloud Run)
- **Net value**: **$130K/year** (internal efficiency)

**Revenue Opportunity**:
- **Consulting**: Offer "RPM Dashboard Setup + 30-Day Support" for $25K
- **Target**: 5–10 warm leads in Liv Hana network (other THC operators, wellness brands)
- **Immediate revenue**: Close 2–3 deals in 30 days = **$50K–$75K**

**Acceptance Criteria**:
- ✅ Jesse can log in at `https://cockpit.livhana.com` and see current week's tasks
- ✅ Real-time updates (Firestore `.onSnapshot()`)
- ✅ PDF/CSV/MD exports work, include branding and compliance notes
- ✅ Andrew/Christopher/Charlie can manage their own tasks
- ✅ First consulting client signed by Day 30

---

#### 🥈 **Project 2: Automated YouTube Publishing**

**Problem**: Manual uploads delay HNC episode releases, metadata inconsistencies hurt SEO

**Solution**: Drive → Cloud Run → YouTube Data API v3 (see backlog table in `.claude/TIER1_HIGH5_AGENT_FUNNEL.md`)

**Timeline**: 5–7 days to MVP

**Effort**:
- Cloud Run microservice (Drive webhook → upload): 2 days (Artifacts Agent)
- YouTube API integration (videos.insert, metadata): 1 day (Execution Agent)
- Metadata autogeneration from RPM/HNC canon: 1 day (Research Agent)
- Secret Manager (YouTube tokens): 0.5 days (Ops)
- Deploy + test with 3 real episodes: 0.5 days (QA Agent)

**ROI**:
- **Time saved**: 2–3 hours/week ($1,000/week = $52K/year)
- **SEO improvement**: Consistent titles/tags → +10%–20% organic views (+$5K–$10K/year ad revenue)
- **Cost**: $10/month (Cloud Run + Storage)
- **Net value**: **$57K–$62K/year**

**Revenue Opportunity**:
- **None immediate** (internal tool only)
- **Future**: If HNC scales to daily publishing, this unlocks $100K+ in ad revenue at 100K+ subs

**Acceptance Criteria**:
- ✅ New Google Meet recording in Drive auto-triggers upload to YouTube
- ✅ Title/description/tags generated from HNC canon (episode #, date, CTA)
- ✅ Sovereignty kept as micro-CTA only (no DID/contract details)
- ✅ Compliance notes (21+ age-gate) in description
- ✅ 3 successful live uploads with zero manual intervention

---

#### 🥉 **Project 3: Compliance Auto-Scanner**

**Problem**: Manual compliance checks are error-prone, GA-56 revocation risk = $100K+ liability

**Solution**: Pre-commit hooks + CI/CD scanner + dashboard alerts (see `.claude/TIER1_HIGH5_AGENT_FUNNEL.md`)

**Timeline**: 5–7 days to MVP

**Effort**:
- Pre-commit hook (scan markdown/code for violations): 1 day (Artifacts Agent)
- GitHub Actions workflow (scan on every PR): 1 day (Execution Agent)
- Scanner rules (21+ age-gate, medical claims, CR packaging): 1 day (Research Agent)
- Slack/email alerts on violations: 0.5 days (Ops)
- Dashboard widget (live compliance status): 1 day (Artifacts Agent)
- Backfill historical docs (scan last 3 months): 0.5 days (QA Agent)

**ROI**:
- **Risk mitigation**: Prevents single $100K+ license revocation = **$100K–$300K/year** in avoided liability
- **Time saved**: 5–10 hours/week ($2,000/week = $104K/year) on manual audits
- **Cost**: $0 (GitHub Actions free tier)
- **Net value**: **$204K–$404K/year** (risk + time)

**Revenue Opportunity**:
- **Consulting**: Offer "Compliance Scanner Setup" for $15K–$25K to other THC operators
- **Target**: 3–5 clients in 60 days = **$45K–$125K**

**Acceptance Criteria**:
- ✅ Pre-commit hook blocks commits with violations (medical claims, missing age-gate)
- ✅ GitHub Actions PR checks show compliance status (red/green badge)
- ✅ Slack alerts fire when violations detected
- ✅ Dashboard widget shows live compliance score (% of docs passing)
- ✅ Historical backfill identifies 0 critical violations (or fixes them)

---

### PHASE 2: PRODUCTIZATION (DAYS 31–60)

**Goal**: Monetize proven systems, close consulting deals

#### 🎯 **Action 1: Package RPM Dashboard as Consulting Offer**

**Offer**: "RPM Dashboard Setup + 30-Day Support" for $25K

**Deliverables**:
- Custom Firestore schema + ingestion script tailored to client's workflow
- Next.js dashboard deployed to their GCP project (or Vercel)
- PDF/CSV/MD export functions with their branding
- 30-day Slack support (async, 1-hour response time)
- Documentation + team training (2-hour Zoom session)

**Target Clients**:
- Other THC operators (Texas, Oklahoma, Arkansas)
- Wellness brands (CBD, supplements, functional foods)
- Tech-forward SMBs using RPM or similar planning frameworks

**Sales Strategy**:
- Warm outreach to 10 contacts in Jesse's network (DM + Loom video demo)
- Post case study on LinkedIn (Jesse's profile): "How we automated our weekly planning and reclaimed 13 hours/week"
- Offer first 3 clients a $5K discount ($20K instead of $25K) for testimonials

**Timeline**:
- Week 5: Outreach to 10 leads
- Week 6–7: Close 2–3 deals
- Week 8: Deliver first client implementation

**Revenue**: 2–3 clients × $20K–$25K = **$40K–$75K**

---

#### 🎯 **Action 2: Pilot Compliance Scanner with Partner**

**Offer**: "Compliance Scanner Beta Program" — free setup in exchange for testimonial + case study

**Target**: 1–2 THC operators facing GA-56 enforcement pressure

**Deliverables**:
- Pre-commit hook + GitHub Actions setup (1 day)
- Custom scanner rules for their state's regulations (Texas, Oklahoma, etc.)
- Dashboard widget + Slack alerts
- 60-day support (async)

**Goal**: Prove ROI, collect testimonial, prepare for $15K paid product in Phase 3

**Timeline**:
- Week 5: Identify 2 beta partners
- Week 6: Deliver beta (1 day per partner)
- Week 7–8: Monitor, collect data, refine rules
- Week 9: Case study writeup, testimonial video

**Revenue**: $0 (beta program), but unlocks $45K–$125K in Phase 3

---

### PHASE 3: SCALING (DAYS 61–90)

**Goal**: Maximize revenue from consulting, prepare for SaaS transition

#### 💎 **Action 1: Close 3–5 More RPM Dashboard Deals**

**Offer**: Full price ($25K) + optional add-ons:
- Gantt chart view: +$5K
- Analytics dashboard (velocity, cycle time, etc.): +$5K
- XLSX export (rich Excel): +$2K
- Custom integrations (Slack, Notion, etc.): +$10K

**Target**: 3–5 clients (mix of THC operators and wellness brands)

**Sales Strategy**:
- Leverage testimonials from Phase 2 clients
- Post 2–3 LinkedIn articles showing ROI (time saved, faster decision velocity)
- Host 1 webinar: "How to Automate Your Weekly Planning with RPM + Firestore" (30 min + Q&A)
- Offer referral bonus: $2K for every new client referred by existing customer

**Timeline**:
- Week 10–11: Outreach + sales calls (15–20 leads)
- Week 12: Close 3–5 deals

**Revenue**: 3–5 clients × $25K–$42K = **$75K–$210K**

---

#### 💎 **Action 2: Launch Paid Compliance Scanner**

**Offer**: "Compliance Scanner Setup + 60-Day Support" for $15K

**Deliverables**:
- Same as beta program
- + Monthly compliance reports (PDF sent to CEO/compliance officer)
- + Annual audit prep package (evidence ledger, fallacy scan logs)

**Target**: THC operators in Texas, Oklahoma, Arkansas (10–15 total addressable market in network)

**Sales Strategy**:
- Use beta case studies as proof
- Frame as "insurance policy" against $100K+ license revocation
- Bundle with RPM Dashboard for $35K (save $5K vs buying separately)

**Timeline**:
- Week 10: Launch paid offer, outreach to 10 leads
- Week 11–12: Close 2–3 deals

**Revenue**: 2–3 clients × $15K = **$30K–$45K**

---

## 📊 90-DAY FINANCIAL SUMMARY

| Phase | Revenue Source | Revenue | Cost | Net | Timeline |
|-------|----------------|---------|------|-----|----------|
| **Phase 1** (Days 1–30) | RPM Dashboard consulting (2–3 clients) | $50K–$75K | $500 (Cloud Run, tools) | $49.5K–$74.5K | Weeks 1–4 |
| **Phase 2** (Days 31–60) | Compliance Scanner beta (free) | $0 | $0 | $0 | Weeks 5–8 |
| **Phase 3** (Days 61–90) | RPM Dashboard (3–5 clients) | $75K–$210K | $1K (Cloud Run, marketing) | $74K–$209K | Weeks 9–12 |
| **Phase 3** (Days 61–90) | Compliance Scanner (2–3 clients) | $30K–$45K | $0 | $30K–$45K | Weeks 10–12 |
| **TOTAL (90 Days)** | | **$155K–$330K** | **$1.5K** | **$153.5K–$328.5K** | **Q1 2026** |

### Internal Value (Time Saved)

| Project | Time Saved | Hourly Value | Annualized Value |
|---------|------------|--------------|------------------|
| RPM Dashboard | 8–13 hrs/week | $192/hr avg | **$130K/year** |
| YouTube Automation | 2–3 hrs/week | $400/hr (Jesse) | **$52K–$62K/year** |
| Compliance Scanner | 5–10 hrs/week | $200/hr avg | **$104K–$208K/year** |
| **TOTAL** | **15–26 hrs/week** | — | **$286K–$400K/year** |

### Combined Impact (Revenue + Internal Value)

**90-Day Cash**: $153.5K–$328.5K (consulting revenue)
**Annual Value**: $286K–$400K (time saved)
**Total Year-1 Impact**: **$439.5K–$728.5K**

---

## 🎯 DECISION MATRIX: WHICH PROJECTS TO PRIORITIZE?

| Project | Revenue Potential | Time to Cash | Effort | Risk | Priority |
|---------|------------------|--------------|--------|------|----------|
| **RPM Dashboard (internal)** | $0 (internal value) | Immediate | 1 week | Low | 🥇 **CRITICAL** |
| **RPM Dashboard (consulting)** | $50K–$75K (Phase 1) | 30 days | 1 week + sales | Medium | 🥇 **CRITICAL** |
| **YouTube Automation** | $0 (internal value) | Immediate | 1 week | Low | 🥈 **HIGH** |
| **Compliance Scanner (internal)** | $0 (risk mitigation) | Immediate | 1 week | Low | 🥇 **CRITICAL** |
| **Compliance Scanner (beta)** | $0 (testimonials) | 60 days | 1 week + partner mgmt | Medium | 🥈 **HIGH** |
| **RPM Dashboard (Phase 3)** | $75K–$210K | 90 days | 3 weeks + sales | Medium | 🥉 **MEDIUM** |
| **Compliance Scanner (paid)** | $30K–$45K | 90 days | 1 week + sales | Medium | 🥉 **MEDIUM** |

### Recommendation: TIER-1 SEQUENCE

**Week 1–2**:
1. 🥇 RPM Dashboard (internal MVP) → immediate $130K/year value
2. 🥇 Compliance Scanner (internal MVP) → immediate $100K–$300K risk mitigation

**Week 3**:
3. 🥈 YouTube Automation → immediate $52K–$62K/year value

**Week 4**:
4. 🥇 Package RPM Dashboard as consulting offer, outreach to 10 leads

**Week 5–8** (Phase 2):
5. 🥈 Close 2–3 RPM Dashboard deals ($50K–$75K)
6. 🥈 Launch Compliance Scanner beta with 2 partners

**Week 9–12** (Phase 3):
7. 🥉 Close 3–5 more RPM Dashboard deals ($75K–$210K)
8. 🥉 Close 2–3 Compliance Scanner deals ($30K–$45K)

---

## 🛡️ RISK MITIGATION

### Risk 1: Sales Execution (Medium)

**Risk**: Consulting deals don't close as fast as projected

**Mitigation**:
- Start outreach in Week 1 (while building MVP) to compress sales cycle
- Offer discount to first 3 clients ($20K instead of $25K)
- Leverage Jesse's network (warm intros, not cold outreach)
- Use Loom video demos (low-friction, async sales)

**Contingency**: If < 2 deals close by Week 6, pivot to SaaS model (lower price, self-serve onboarding)

---

### Risk 2: Implementation Complexity (Low)

**Risk**: Firestore schema or Next.js dashboard takes longer than 1 week

**Mitigation**:
- Use proven tech stack (Next.js, Firestore, Tailwind, shadcn/ui — all battle-tested)
- Agent-driven development (Planning → Research → Artifacts → Execution → QA)
- Scope cut: MVP includes only Kanban + PDF export; defer Gantt/analytics to Phase 2

**Contingency**: If Week 2 arrives and MVP isn't done, cut CSV/MD export and ship PDF-only first

---

### Risk 3: Client Support Burden (Medium)

**Risk**: 5+ consulting clients demand too much support time, eating into high-value work

**Mitigation**:
- **Async support only** (Slack, email — no live calls unless critical)
- **1-hour response time SLA** (not instant)
- **Documentation-first** (comprehensive `docs/rpm-dashboard-guide.md` reduces questions)
- **30-day support window** (after that, offer paid retainer: $2K/month)

**Contingency**: If support load > 10 hrs/week, hire part-time contractor ($50/hr) or build self-serve knowledge base

---

### Risk 4: Compliance Scanner False Positives (Low)

**Risk**: Scanner flags legitimate content as violations, causing user frustration

**Mitigation**:
- **Allowlist system** (exceptions for known-safe patterns)
- **Human review gate** (scanner flags, but doesn't block — Jesse approves)
- **Beta program** (test with 2 partners before selling, refine rules)

**Contingency**: If false positive rate > 10%, add "suppress this warning" button and log for later review

---

## 🚀 EXECUTION PLAN (NEXT 7 DAYS)

### Week 1: Foundation

**Day 1** (TODAY):
- ✅ Approve this spec
- ✅ Assign RPM Dashboard build to Artifacts Agent
- ✅ Spin up Firestore project: `liv-hana-rpm-dashboard`
- ✅ Create Next.js repo: `cockpit`

**Day 2**:
- ✅ Implement Firestore schema + ingestion script
- ✅ Test ingestion with `docs/RPM_WEEKLY_2025-43.md`
- ✅ Deploy Next.js skeleton to Cloud Run

**Day 3**:
- ✅ Build Kanban view (real-time Firestore sync)
- ✅ Add Firebase Auth (email/password)
- ✅ Deploy to staging: `https://cockpit-staging.livhana.com`

**Day 4**:
- ✅ Implement PDF export with `jsPDF`
- ✅ Add Liv Hana branding (logo, footer)
- ✅ Test with 100-task week

**Day 5**:
- ✅ Implement CSV export with `papaparse`
- ✅ Implement Markdown export
- ✅ QA testing (security, performance, mobile)

**Day 6**:
- ✅ Deploy to production: `https://cockpit.livhana.com`
- ✅ Team walkthrough (Jesse, Andrew, Christopher, Charlie)
- ✅ Document usage in `docs/rpm-dashboard-guide.md`

**Day 7**:
- ✅ Package consulting offer (pricing, deliverables, contract template)
- ✅ Create Loom demo video (5 min: problem, solution, results)
- ✅ List 10 warm leads for outreach (DM draft ready)

---

## 📋 ACCEPTANCE CRITERIA (90-DAY GOALS)

### Revenue
- ✅ Close **$150K–$330K** in consulting revenue (5–8 clients total)
- ✅ Pipeline of **$100K+** in qualified leads for Q2 2026

### Internal Efficiency
- ✅ Reclaim **15–26 hours/week** (Jesse + team)
- ✅ RPM Dashboard live and used daily by all 4 core team members
- ✅ YouTube uploads automated (0 manual intervention)
- ✅ Compliance scanner catches **100%** of critical violations pre-commit

### Productization
- ✅ RPM Dashboard consulting offer: **5+ clients**, **90%+ satisfaction** (NPS > 50)
- ✅ Compliance Scanner beta: **2 partners**, case study published
- ✅ **3+ testimonials** collected (video + written)

### Strategic
- ✅ Proven consulting model → clear path to SaaS (next 6 months)
- ✅ Brand reputation: Liv Hana known as "automation experts" in THC/wellness space
- ✅ Compliance risk reduced to **< 1%** (no violations in 90 days)

---

## 🦄 MASTER REINTEGRATION

### 1) What Was Delivered

- ✅ Tier-1 90-day roadmap: RPM Dashboard, YouTube Automation, Compliance Scanner
- ✅ Financial projections: $153.5K–$328.5K cash + $286K–$400K internal value = **$439.5K–$728.5K total**
- ✅ Risk mitigation strategies for sales, implementation, support, false positives
- ✅ Week-1 execution plan (Day 1–7 checklist)

### 2) Key Decisions/Assumptions

- Prioritize RPM Dashboard (internal + consulting) as **Tier-1 critical**
- YouTube Automation as **high priority** (internal value only)
- Compliance Scanner as **critical** (risk mitigation + future consulting revenue)
- Consulting model first, SaaS later (validate market, collect testimonials)

### 3) Memory Updates

- **Revenue target**: $150K–$330K in 90 days (5–8 consulting clients)
- **Internal value**: $286K–$400K/year in time saved
- **Timeline**: Week 1–2 (build), Week 3–4 (internal use), Week 5–12 (sales + delivery)

### 4) Next Best Step (Single Action)

**Approve this spec, then immediately launch Artifacts Agent to build RPM Dashboard MVP (Firestore + Next.js).**

### 5) Risks/Blockers

- Sales execution (mitigated by warm intros, Loom demos, discount for early clients)
- Implementation complexity (mitigated by agent-driven dev, proven tech stack)
- Client support burden (mitigated by async-only, 30-day window, documentation)

---

**Document Authority**: Jesse CEO (Liv Hana Command)
**Last Updated**: 2025-10-23 03:30 CST
**Status**: READY FOR EXECUTION → WEEK 1 STARTS NOW
**Next Review**: Day 7 (end of Week 1, before sales outreach)

---

🦄 **Liv Hana Trinity**: Grow, Sell, Heal.
💰 **Mission**: $150K–$330K consulting revenue in 90 days
⚡ **Method**: Automate internal friction, productize proven systems
✅ **Standard**: Lifeward (Is it true? Show the receipt.)

**LFG. Stay TOONED.** 🚀

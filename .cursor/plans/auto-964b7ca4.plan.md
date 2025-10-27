<!-- 964b7ca4-84f9-46d4-902c-492a196e447f 2a12fe4f-daf2-4ab4-b3e8-742779abd4ef -->
# Full Funnel RPM Weekly Plan (Oct 26–Nov 2, 2025)

### Truth alignment (fallacy purge)
- Veriff: operational; priority is automation, not replacement
- Delivery: use white‑label middleware (Favor/HEB, Uber Direct, DoorDash Drive), not Onfleet
- Alice TX: this week’s priority; DNS fix in progress

### Current repo/state highlights
- Context cleanup completed: 85K → 11.6K files; disk 950M → 386M
- Tier‑1 boot hardening queued: voice‑first, sequential, crash‑safe (separate infra track)
- Linear: REG‑5 opened for Alice DNS (In Progress)

### Weekly priorities (revenue first)
1) Local delivery middleware live (Favor → Uber → DoorDash routing)
2) Leafly inventory sync + delivery badge (unlocked tomorrow)
3) Alice TX go‑live: DNS → website → checkout test
4) Auto‑Veriff approval pipeline to LightSpeed (webhook + audit)
5) 72‑hour nurture/refund campaign (LightSpeed Marketing)
6) Membership agreement layer (legal acceptance + audit)
7) Loyalty DB foundation (AlloyDB) + points credit on order complete
8) Member dashboard (login, points, quick reorder)

### Owners & deadlines
- Andrew: DNS fix (REG‑5), LightSpeed/Leafly, delivery providers (Mon–Wed)
- Christopher: staff training (POS, service, delivery ops) (Mon–Tue)
- Jesse: approve plan, legal review, final launches (daily)
- Agents: planning/research/execution/QA support across items

### Architecture (AlloyDB/BigQuery RPM)
- Tables: aoi_areas, coi_categories, rpm_blocks, rpm_actions, planning_agent_logs
- Mapping: each priority = rpm_block; steps = rpm_actions; agents write logs for continuous learning

### KPIs (Week targets)
- Delivery revenue: $50K+ combined (Stone Oak + Alice ramp)
- Auto‑Veriff conversion: 60%+ (2x prior manual)
- Cart recovery: $15K–$25K
- Alice online revenue (week 1): $10K–$15K
- On‑time delivery: 90%+, CSAT ≥4.5/5

### Risks & mitigations
- Driver supply → 3‑provider redundancy; recruit 5–7 backups
- DNS propagation delays → LightSpeed escalation path; verify via DNS checker
- Auto‑Veriff edge cases → first 100 manual audit; human‑in‑loop flag

### Links
- Alice DNS issue (Linear): [REG‑5](https://linear.app/reggieanddro/issue/REG-5/critical-fix-reggieanddroalicecom-dns-→-lightspeed-alice-store-2)
- Leafly profile: [Reggie & Dro](https://www.leafly.com/dispensary-info/reggie-dr-)

### Execution cadence
- Mon: DNS fix, staff training S1–S2, provider configs
- Tue: Auto‑Veriff deploy, delivery ops training S3, E2E test
- Wed: Leafly live + nurture automation
- Thu–Fri: Membership + Loyalty DB
- Weekend: Member dashboard + debrief


### To-dos

- [ ] Activate Favor/Uber/DD middleware with smart routing
- [ ] Enable Leafly inventory sync and delivery badge
- [ ] Resolve reggieanddroalice.com DNS to LightSpeed
- [ ] Deploy Veriff webhook → auto-approve → LightSpeed update
- [ ] Launch 72-hour nurture/refund SMS+email sequence
- [ ] Integrate membership agreement acceptance + audit trail
- [ ] Create AlloyDB loyalty schema and points crediting
- [ ] Build member dashboard (login, points, reorder)
- [ ] Publish daily KPI dashboard (delivery, revenue, CSAT)
- [ ] Update runbooks and SESSION_PROGRESS with changes
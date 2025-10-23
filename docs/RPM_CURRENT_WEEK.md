# RPM WEEKLY PLAN — FIRE TIER‑1 FLOW (Integrated)  
**Window:** Oct 23–30, 2025 • **Owner:** Jesse Niesen (CEO) • **Standard:** Lifeward (21+, truth, safety)  
**Version:** 1.0 (Generated 2025-10-23)

---

## R — RESULT (One Sentence)
By Thu Oct 30, the **FIRE TIER‑1** stack is booting clean every morning with **3 ROI flags live** (Custom GPT, Slack Bot, Replit PWA), **Savanna’s Lightspeed label/packing loop stable**, and **TRUTH guardrails** enforcing 21+ and compliance across all funnels—end‑to‑end measurable in the cockpit.

## P — PURPOSE (Why this matters)
Stabilize revenue and compliance while giving Jesse a zero‑drag orchestration lane: agents handle planning, research, and QA; humans focus on “Grow • Sell • Heal.”

## M.A.P. — MASSIVE ACTION PLAN (Humans + Machines)
### A) Human Owners (Today → next 7 days)
- **Jesse (CEO):** Approve ROI Flag sequence; voice‑orchestrate daily; green‑light deploys; record 60–90s updates for HNC/OPS.  
- **Savanna (Labels/Operations):** 
  - Generate/print labels for **CD08 (CDIZZLE)**; file to **Dropbox**; place on pick/pack carts.  
  - Post Office → Amazon supplies pickup → **Ranch audit** (note any gaps).  
  - Keep Lightspeed product records tidy; use X‑Series **Print labels** flow for items / POs.  
- **Andrew (Ops), Christopher (Store), Charlie (Procurement):**
  - Enforce 21+ ID checks; evidence snapshots for audit; escalate COA gaps.  
  - Prep KCA full‑panel re‑tests queue (priority lanes) and update product pages/labels.  
- **VIPs/Partners:** Attend 30‑min demo Friday (Slack Bot + PWA).

### B) Machine/Agent Owners (Tier‑1 loop)
- **Planning Agent:** Break high‑level objectives → SMART tasks; emit `planning.status.json`.
- **Research Agent:** Scan canon and receipts; emit `research.status.json`.
- **Artifacts Agent:** Generate docs/scripts; emit `artifact.status.json`.
- **Execution Agent:** Run code/deploy; emit `exec.status.json`.
- **QA Agent:** TRUTH checks (Testable, Reproducible, Unambiguous, Traceable, High‑fidelity); emit `qa.status.json`.
- **Watcher:** Poll status every 5s; write `funnel.ready` when all “passed”.

---

## TODAY — Thu Oct 23 (T‑0) — “Boot + Ship”
**08:00** Boot `START.sh` (MAX_AUTO=1) → spawn 5 agents (tmux) → verify `{tmp/agent_status}` writes.  
**09:00** Stand‑up (10 min): goals, blockers, deploy order.  
**10:00–12:00** **ROI Flag #1 — Custom GPT** (Agent Builder): scaffold action, connect Secrets, publish private beta.  
**13:00–14:00** **Savanna**: print/apply **CD08** labels → pack queue; ranch needs list.  
**14:00–16:00** **Slack Bot** skeleton (greet, /labels queue, /coa status).  
**16:00–17:00** TRUTH pipeline smoke (8/8) + compliance audit; EOD report.

**Deliverables (EOD):**  
- `tmp/agent_status/*.json` + `funnel.ready`  
- Custom GPT (private) + test transcript  
- Slack Bot basic commands live in test workspace  
- CD08 labels printed/applied; ranch checklist  
- TRUTH/Compliance report (1‑pager)

---

## FRI–SUN Oct 24–26 — “Harden + Demo”
- **Slack Bot**: add `/hnc daily`, `/labels PO <id>`, `/coa <sku>`; role‑gated.  
- **Replit PWA**: installable shell (manifest + SW), “Age 21+” gate, CTA tiles.  
- **HNC**: 2 shorts (Fri/Sun) aligned to “Texas • THC • Wall of Weed • Stay TOONED.”  
- **Demo (Fri 4:00p)**: show Custom GPT + Slack Bot + PWA; capture approvals.

## MON–THU Oct 27–30 — “Scale + Measure”
- **Slack Bot**: webhooks to Lightspeed label queue; COA checker stub.  
- **PWA**: add “Scan COA” entry + offline cache for FAQs; push to VIPs.  
- **Custom GPT**: add MCP nodes for Drive/Calendar/LightSpeed; log receipts.  
- **KPIs**: daily label throughput, COA coverage %, 21+ pass rate, funnel CTR.

---

## ROI FLAGS (Ready‑to‑Deploy)

### 1) Custom GPT (Agent Builder) — **ROI ≈ $300/day**
- **Steps:** Create agent → add **Actions** (API auth) → wire MCP nodes (Calendar, Gmail, Drive, Lightspeed) → publish private beta; export code.  
- **Guardrails:** 21+ gating; no medical claims; link sovereignty via microcopy only.  
- **Evidence links (setup/auth):** see “OpenAI Actions auth” and Agent/Builder guides.  

### 2) Slack Bot — **ROI ≈ $500/day**
- **Steps:** Bolt quickstart → Events (`app_mention`, slash cmds) → OAuth install → post label/COA updates to #ops; add `/labels` flow for CD08/CDxx.  
- **Guardrails:** staff‑only scopes; PII redaction in logs.

### 3) Replit PWA — **ROI ≈ $400/day**
- **Steps:** Create installable shell (manifest.json, service‑worker.js), offline cache for FAQs/receipts, home‑screen icons, A2HS banners; route to R&D/OPS CTAs.  
- **Guardrails:** show 21+ interstitial before any THC content.

---

## COMPLIANCE & SAFETY (Non‑negotiable)
- **21+ ID REQUIRED** at sale; violations risk **license revocation**.  
- Maintain product COAs (full‑panel) and accredited lab links; no claims of diagnosis/treatment.  
- HNC: satire, 60–120s, CTA “Secure your freedom—see OPS,” brands **not** as characters.

---

## SCHEDULE GRID (Humans + Machines)

| Date | Human Focus | Agent Focus | Ship |
|---|---|---|---|
| Thu 10/23 | Boot, Custom GPT, CD08 labels | Plan→Exec→QA loop | GPT private, Slack greet, labels |
| Fri 10/24 | Slack bot flows; HNC short | Artifact→Exec | Bot demo; HNC Short #1 |
| Sat 10/25 | PWA shell | QA | PWA installable |
| Sun 10/26 | COA tidy; HNC short | Research | HNC Short #2 |
| Mon 10/27 | Bot↔Lightspeed | Exec | Labels webhook |
| Tue 10/28 | PWA COA scan entry | QA | COA entry in PWA |
| Wed 10/29 | GPT MCP wiring | QA | MCP nodes live |
| Thu 10/30 | KPI review + harden | QA | Week retro & next plan |

---

## IMPLEMENTATION NOTES (Pointers)
- **Lightspeed labels:** print from Products or POs; verify printer profile before batch.  
- **Slack Bolt:** use “app_mention” + slash commands; protect tokens/secrets.  
- **PWA:** manifest + service worker; test install + offline cache via DevTools.  
- **OpenAI Agent Builder:** Actions auth (API key/OAuth); wire MCP; export code for CI.

---

## KPIs (Daily)
- Label batches printed (#, error rate) • COA coverage (%) • 21+ verification pass rate (%) • Custom GPT sessions (#) • Slack Bot commands used (#) • PWA A2HS installs (#) • HNC watch time / CTR.

---

## APPENDIX — References (operational)
- Lightspeed X‑Series labels: official guides.  
- Slack Bolt quickstart & package.  
- PWA basics: manifest/service worker; DevTools debugging.  
- OpenAI Actions auth & Agents/Builder docs.  
- Texas 21+ enforcement context: DSHS/TABC emergency rules, GA‑56.

---

### MASTER REINTEGRATION (Mini‑Debrief)
**Shipped now:** One‑week RPM (humans + machines), day‑by‑day, deliverables, KPIs.  
**Assumptions:** Team/time windows aligned; label printer configured; secrets present.  
**Memory updates:** FIRE TIER‑1 = default boot; ROI Flag order = GPT → Slack → PWA.  
**Next best step (today):** Boot + ship Custom GPT (private) and CD08 labels; Slack bot greet.  
**Risks:** Label printer/profile drift; COA gaps; token/secret mis‑scopes; age‑gate lapses.
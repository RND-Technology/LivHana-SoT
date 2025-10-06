# CONTEXT - TIER-1 SNAPSHOT (Oct 2025)

## Business Overview
- **Brand:** Reggie & Dro (Texas hemp retail + delivery)
- **Mission:** Texas Takeover campaign (Oct 2025) to exceed $100K profit.
- **Channels:** LightSpeed POS (current), KAJA/Authorize.Net payments, historical Square archive (analytics only).
- **Compliance:** Texas DSHS License #690, PCI scan scheduled via KAJA contact.

## Technology Stack
- **Frontend:** Vibe Cockpit (React/Vite) + Lightspeed web store (reggieanddro.company.site).
- **Backend Services:**
  - `integration-service` (LightSpeed, Leafly, verification)
  - `payment-service` (KAJA/Authorize.Net)
  - `voice-service` (ElevenLabs TTS + webhook gateway)
  - `reasoning-gateway` (Claude Sonnet 4.5 proxy)
  - `cannabis-service` (COA + compliance APIs)
- **Infrastructure:** GCP Cloud Run, Secret Manager, BigQuery warehouse, Cloud DNS.
- **Secrets:** Stored in 1Password vault (LivHana-Ops-Keys) and replicated to GCP via `./scripts/upload-secrets-to-gcp.sh` every session.

## Data Pipelines
- **Historical:** Square order/customer exports → BigQuery (`square_orders`, `square_customers`).
- **Current:** LightSpeed order/customer ingest + KAJA transactions → BigQuery (`lightspeed_orders`, `kaja_transactions`).
- **Analytics:** Cockpit dashboards read from BigQuery views merging historical + live data.

## Critical Rules
1. **Tier-1 Option A Discipline** – No stubs, no placeholders, every claim backed by proof.
2. **1Password First** – Session starts with Touch ID sign-in (`op signin reggiedro.1password.com` → `./scripts/upload-secrets-to-gcp.sh`).
3. **Square = History Only** – Read-only analytics; all new verifications/payments flow through LightSpeed + KAJA.
4. **Evidence Protocol** – Logs + screenshots stored under `.evidence/YYYY-MM-DD/` for every mission.
5. **5-Minute Verification Rule** – Execute → verify within 5 minutes → log timestamped proof.

## Active Missions (Oct 6, 2025)
1. **Finance Layer Unlocked** – Sovereign Life OS Master Monday Edition launched
2. **Product Page Compliance** – Update 8 LightSpeed SKUs with ingredient lists; remove the word "weed."
2. **LightSpeed Verification API** – Replace demo response with real Retail API lookup.
3. **Voice & Reasoning Deployment** – Deploy Cloud Run services + wire cockpit health status.
4. **Cockpit UI Makeover v1** – Apply Texas Takeover styling after backend stable.

## Key Contacts & Tools
- **LightSpeed Admin:** `<provide admin email>`
- **KAJA/Authorize.Net Support:** `<contact>`
- **Google Analytics 4 Property ID:** `<ga4-id>`
- **Facebook Ads Manager:** `<ad-account>`
- **PCI Hotline:** `1-888-543-4743`
- **Claude Sonnet 4.5:** 200k token context, auto-applies Tier-1 boot sequence.

## Evidence Expectations
- `./scripts/run_full_sweep.sh` after major changes (Shellcheck <50 warnings, ESLint 0 errors).
- Health checks for each service recorded in `.claude/SESSION_PROGRESS.md`.
- Cockpit screenshots showing compliance changes stored under `.evidence/2025-10-04/product-pages/`.

## Historical Notes (Apr–Sep 2025)
- **Apr 2025:** Square banned smokable hemp payments → migration planning.
- **Jun 2025:** DSHS inspection (Age verification + labeling fixed same day).
- **Sep 2025:** KAJA/Authorize.Net approved (payment gateway live).
- **Oct 2–3 2025:** DNS + SSL restoration, deployment plan created, Tier-1 protocols enforced.

For detailed legacy history see `.claude/archive/PERSISTENT_MEMORY_20251003.md`.

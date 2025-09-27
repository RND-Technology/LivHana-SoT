# LivHana-Potential – Agent Ingestion Refresh (2025-09-25)

## Current Repository Shape
- **Automation**
  - `.github/workflows/wizzbang-cya-ci.yaml` – multi-repo CI skeleton; still needs secrets (`GCP_*`, GitHub PAT) and validation.
  - `schedulers/` – timing scripts for T-90/T-30/High Noon, currently referencing helper scripts that do not exist yet.
  - `data-layer/` – ingestion scripts for AlloyDB, news, YouTube, WhatsApp; `update_attribution_ledger.sh` and `validate_ingested_data.sh` are missing.
- **Cloud Deploy**
  - `cloud-run/` – manifests for `scriptwright`, `creditsmith`, `whatsapp-consent`, `attribution-ledger` services (images assumed to live in Artifact Registry `us-central1-docker.pkg.dev/liv-hana-sovereign/...`).
- **Ops Context**
  - `highnoon/README.md` & `context_manifest.yaml` – describe daily sync intent.
  - `swarm-orchestration/deepseek-liv-scale-plan.md` – task scaling roadmap.
  - `web-surfaces/upgrade-plan.md` – outlines site/SEO/raffle objectives.
  - `issues/` – markdown resolutions for GitHub issues #1-12 (documentation only).

## Recent Commits
1. `af37930d` – Added automation scaffolding, issue resolution docs (2,147 LOC).
2. `b2493a04` – Earlier backlog sweep (CI scaffold references).
3. `e07682e8`, `4ef3094b`, `7ad979c9` – Genesis docs & merge fix.

## Outstanding Work (Tier-1 Critical)
- **Automation Hardening**
  - Implement the helper scripts referenced by `schedulers/*.sh` (`scripts/check_trinity_status.sh`, `scripts/validate_compliance.sh`, `scripts/prep_ingestion_data.sh`, `scripts/check_service_readiness.sh`).
  - Create `data-layer/update_attribution_ledger.sh` and `data-layer/validate_ingested_data.sh` (currently invoked but absent).
  - Parameterize CI workflow secrets and add guardrails to skip external checkout when tokens unavailable.
- **Validation**
  - Dry-run the ingestion + scheduler scripts locally once helpers exist; capture logs for reproducibility.
  - Confirm Cloud Run manifests match actual container images/Env; add deploy instructions or terraform state.
- **Documentation Follow-up**
  - Move supporting assets from `.cursor/issues/issue-*.md` into tracked directories (`docs/domains/`, `docs/landing-pages/`, etc.).
  - Update `CURRENT_STATUS.md` once automation validated.

## Integration Targets for Replit Agent3
1. Wire helper scripts so scheduler cron jobs succeed on local run.
2. Build a `Makefile` or `taskfile` to orchestrate ingestion → validation pipeline.
3. Prepare Cloud Run deployment commands (gcloud, terraform, or skaffold) with placeholders for credentials.

## Integration Targets for GitHub Copilot
- When editing automation, enforce POSIX shell compatibility (`set -euo pipefail`).
- Use `[[ -x file ]]` checks before invocation; generate informative log output for each stage.
- Prefer writing helper scripts alongside main script directories (e.g., `scripts/` new folder) with testable units.

## Testing Expectations
- Provide sample `.env.local.example` or `secrets.sample` for required env vars.
- Add `README_DEPLOYMENT.md` steps for running schedulers locally (`bash schedulers/t-90-prep.sh --dry-run`).
- Ensure 21+ compliance checks enforce gating (even in dry-run) by toggling `COMPLIANCE_LEVEL` env.

## Blocking Dependencies
- GCP Workload Identity Federation credentials not yet configured locally.
- WhatsApp consent webhook requires verified endpoint + secrets.
- Artifact Registry images need to exist before Cloud Run deployment.

## Next Actions (recommended order)
1. **Create missing helper scripts** with safe no-op defaults (logging + TODO placeholders).
2. **Refine CI workflow** to guard against missing secrets and limit scheduled run to local repository until multi-repo tokens provided.
3. **Execute dry-run of `data-layer/alloydb-ingestion.sh`** after helper creation; capture output to `logs/data-ingestion-*.log`.
4. **Update `CURRENT_STATUS.md`** with verified progress + remaining blockers.

Deliver this document to Replit Agent3 and GitHub Copilot before initiating new automation work.

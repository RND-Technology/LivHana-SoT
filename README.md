# LivHana-SoT (Source of Truth)

This repository is the canonical home for the Liv Hana platform. It consolidates the previously scattered `LivHana-Kinetic`, `LivHana-Potential`, and `LivHana-Entropic` repos into a single, documented tree.

## Structure

- `frontend/` – web experiences (e.g., the Cloud Cockpit `vibe-cockpit/` React app).
- `backend/` – API services (placeholder for future consolidation).
- `automation/` – operational scripts, schedulers, data pipelines, and agent-swarm configs.
- `infra/` – infrastructure manifests (Cloud Run, Terraform, etc.).
- `docs/` – ADRs, mission briefings, and living documentation.
- `legacy/` – archived artifacts from the old repos (reference only).

See [`CLEAN_REPO_STRUCTURE.md`](CLEAN_REPO_STRUCTURE.md) for a detailed tree.

## Using the Repo

1. Clone the repo.
2. Install and run the `frontend/vibe-cockpit` app with the usual Node/Vite flow (`npm install && npm run build`).
3. Use the automation scripts under `automation/` for context sync, compliance checks, and deployment cadences.

## Migration Notes

- Kinetic/Potential/Entropic directories now contain only archival data. Do not treat them as active sources.
- When adding new automation or docs, place them directly inside the `automation/` and `docs/` directories here.
- Update `CURRENT_STATUS.md` whenever platform state changes.

## Next Steps

- Wire backend services into `backend/` (migrating from existing microservices).
- Continue deduplicating docs from the legacy archives into the active `docs/` tree.

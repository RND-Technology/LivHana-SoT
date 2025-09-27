# Legacy Asset Migration Plan

This document maps existing code/assets in the legacy repositories to their destination inside the consolidated `LivHana-SoT` repo.

| Source Repo & Path | Description | Action | Destination in SoT |
|--------------------|-------------|--------|--------------------|
| `LivHana-Kinetic/services/commerce/cockpit` | React/Tailwind cockpit frontend | Move (without build outputs / node_modules) | `frontend/vibe-cockpit/` |
| `LivHana-Kinetic/services/commerce/web_empire` | Legacy static assets / web experiments | Archive for reference | `legacy/kinetic/web_empire/` |
| `LivHana-Kinetic/_legacy_code` | Early orchestrator scripts, Dockerfiles, MCP configs | Archive | `legacy/kinetic/_legacy_code/` |
| `LivHana-Kinetic/agents`, `engines`, `tools` | Agent scaffolding & utilities (superseded by automation scripts) | Review; archive unless required | `legacy/kinetic/{agents,engines,tools}/` |
| `LivHana-Potential/cloud-run` | Cloud Run service manifests | Move | `infra/cloud-run/` |
| `LivHana-Potential/data-layer` | AlloyDB ingestion + data scripts | Move | `automation/data-pipelines/` |
| `LivHana-Potential/schedulers` | T-90/T-30/High-Noon scheduler scripts | Move | `automation/schedulers/` |
| `LivHana-Potential/scripts` | Automation helper scripts (context, compliance, etc.) | Move | `automation/scripts/` |
| `LivHana-Potential/swarm-orchestration` | DeepSeek↔Liv scale plan, swarm configs | Move | `automation/swarm/` |
| `LivHana-Potential/web-surfaces` | SEO & site upgrade plans | Move | `docs/web-surfaces/` |
| `LivHana-Potential/issues/*.md` | Issue resolution records | Move to docs archive | `docs/ARCHIVE/issues/` |
| `LivHana-Potential/logs` | Local build logs / dry runs | Archive or delete (keep key artifacts) | `legacy/potential/logs/` |
| `LivHana-Potential/n8n_*` | n8n runtime data | Delete (if no longer needed) or archive | `legacy/potential/n8n/` |
| `LivHana-Potential/docs/*` (non-duplicated) | Strategic docs, prompts, ADRs | Merge/dedupe into `docs/` | `docs/` |
| `LivHana-Entropic/artifacts`, `products`, `logs` | AI outputs / artifacts | Archive (reference only) | `legacy/entropic/` |

We will build the target structure first, then move/clean in phases to avoid accidental loss.

# LivHana-SoT – Repository Structure

```
LivHana-SoT/
├── README.md                     # project overview
├── CURRENT_STATUS.md             # live status tracker
├── SYSTEM_PROMPT.md / ADRs       # foundational docs
│
├── frontend/                     # web clients
│   └── vibe-cockpit/             # React/Tailwind cockpit (migrated from LivHana-Kinetic)
│
├── backend/                      # API / worker services (placeholder)
│
├── automation/                   # operational automation stack
│   ├── scripts/                  # compliance/context helpers
│   ├── schedulers/               # T-90/T-30/High-Noon cadence scripts
│   ├── data-pipelines/           # AlloyDB + ingestion tooling
│   └── swarm/                    # DeepSeek↔Liv swarm orchestration
│
├── infra/
│   └── cloud-run/                # Cloud Run manifests & infra configs
│
├── docs/                         # active architecture & mission documents
│   └── web-surfaces/             # site/SEO upgrade materials
│
└── legacy/                       # archive of retired repos
    ├── kinetic/                  # assets from LivHana-Kinetic
    ├── potential/                # automation/logs from LivHana-Potential
    └── entropic/                 # artifacts from LivHana-Entropic
```

The `legacy/` tree is reference-only; all active development lives under the top-level `frontend/`, `backend/`, `automation/`, `infra/`, and `docs/` directories.

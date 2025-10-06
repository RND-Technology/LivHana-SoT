# AGENT ONBOARDING (TIER-1)

## Repo Overview

- **Purpose:** Texas hemp e-commerce + automation platform.
- **Core Services:** integration-service (LightSpeed/Leafly), payment-service (KAJA/Authorize.Net), voice-service, reasoning-gateway, cannabis-service.
- **Frontends:** Vibe Cockpit (mission control), LightSpeed storefront (reggieanddro.company.site).

## Boot Checklist (60 sec)

1. `eval "$(op signin reggiedro.1password.com)"` → Touch ID.
2. `cd ~/LivHana-Trinity-Local/LivHana-SoT && ./scripts/upload-secrets-to-gcp.sh`.
3. Read `.claude/STARTUP.md` + `.claude/STATE.md`.
4. `git status --short` and `./START.sh status || true`.
5. Announce readiness with mission summary + timestamp.

## Deployment Pipeline

1. Work inside feature branch.
2. `npm test` (backend + frontend as required).
3. `./scripts/run_full_sweep.sh` (shellcheck, markdownlint, ESLint).
4. `./scripts/deploy.sh --service=<name>` (Cloud Run deploy).
5. `./scripts/smoke-test.sh --service=<name>`.
6. Record results in `.claude/SESSION_PROGRESS.md` + `.evidence/<date>/`.

## Verification

- Every service exposes `/health` endpoint; must return 200 JSON.
- Playwright tests live under `frontend/vibe-cockpit/tests/`.
- API contract docs in `services/<name>/api-spec.yaml`.

## Evidence Storage

```
.evidence/YYYY-MM-DD/
├── api/
├── logs/
├── screenshots/
├── test-results/
└── README.md (summary)
```

## Human-in-Loop Triggers

- Blocked >15 min.
- External credentials needed.
- Compliance/legal decisions.
- Production release ready.

## Key Contacts

- **Jesse Niesen (Commander)** – <high@reggieanddro.com>
- **DSHS/Compliance:** Andrea Steel
- **Payments:** KAJA Support (Authorize.Net)

Stay Tier-1: no stubs, no fake status, proof before claims.

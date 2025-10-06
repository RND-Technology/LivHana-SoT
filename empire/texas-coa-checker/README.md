# Texas COA Checker Prototype

This module contains the Texas Full Panel Certificate of Analysis (COA) validation
prototype.  The tooling came from Downloads on 2025-10-03 and has been brought into
the repo so Sonnet can iterate against it under Tier‑1 protocols.

## Structure

```
empire/texas-coa-checker/
  backend/main.py           # FastAPI service – OCR/parsing + compliance logic
  frontend/index.html       # Responsive uploader + mobile camera capture
  deploy/deploy_cloud_run.sh  # Cloud Run build/deploy script
```

## Immediate Next Steps

1. Wire the backend into the monorepo build system (poetry/requirements).
2. Containerise with the provided Dockerfile stub in `deploy_cloud_run.sh` or move
   into our existing Cloud Build pipeline.
3. Replace prototype OCR with Google Vision (service account + secret).
4. Persist results (PostgreSQL/BigQuery) and integrate with the free public checker.
5. Add Playwright smoke tests for the frontend once deployed.

All integration work must be logged in `.claude/SESSION_PROGRESS.md` with proof.

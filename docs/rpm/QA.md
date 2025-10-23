# RPM Evergreen — QA Acceptance

## Boot (MAX_AUTO)
- Expect: memory pressure line (macOS) or vm_stat fallback
- Model gate: Sonnet 4.5 OCT listed; ALLOW_TEXT_ONLY=1 permits text‑only fallback
- tmux: `tmux ls` shows liv-voice, planning, research, artifact, execmon, qa

## API
- 401 on missing/invalid JWT for write routes
- `GET /api/rpm/weeks/current` returns `{id}`
- `GET /api/rpm/weeks/:id/items` returns items
- `POST /api/rpm/weeks/:id/items` creates item; `PATCH /api/rpm/items/:id` updates item

## Exports
- `GET /api/rpm/weeks/:id/export?format=md|csv` -> returns signed URL < 1s
- `...format=pdf` -> job queued; signed URL within 10s (HTML stub until PDF wired)
- GCS object path: `gs://$GCS_BUCKET/rpm/<weekId>/plan.<ext>`

## Cockpit
- RpmPanel loads current week; filters work; downloads trigger
- Mermaid gantt renders from `/out/gantt.md`

## CLI
- `node scripts/generate_out_artifacts.js` -> writes all required /out files
- `python3 scripts/rpm/fallacy_scan.py` -> out/fallacy_report.md, classification.json, owners_rationale.md
- index.json includes guardrail flags

## Commands
```bash
# API + worker (example env)
cd backend/integration-service && \
export DATABASE_URL=postgres://user:pass@host:5432/db JWT_SECRET=dev \
REDIS_HOST=localhost REDIS_PORT=6379 GCP_PROJECT_ID=reggieanddrodispensary \
GCS_BUCKET=livhana-rpm-exports && \
npm i --silent && npx ts-node src/worker.export.ts & npx ts-node src/index.js
```


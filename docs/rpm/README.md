# RPM Evergreen — Schema and API

Env: `DATABASE_URL`, `JWT_SECRET`, `REDIS_HOST`, `REDIS_PORT`, `GCS_BUCKET`, `GCP_PROJECT_ID`.

Schema: see `backend/integration-service/sql/rpm/001_init.sql`, `002_indexes.sql`.

API:
- GET `/api/rpm/weeks/current`
- POST `/api/rpm/weeks/upsert` (JWT)
- GET `/api/rpm/weeks/:id/items`
- POST `/api/rpm/weeks/:id/items` (JWT)
- PATCH `/api/rpm/items/:id` (JWT)
- POST `/api/rpm/weeks/:id/export?format=md|csv|pdf` (JWT)
- GET `/api/rpm/exports/:exportId`

Worker: `ts-node src/worker.export.ts` — writes artifacts to `/out` and (next) uploads to `gs://$GCS_BUCKET` with signed URLs.



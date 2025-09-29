# Data Pipelines

## Square Payments → BigQuery

- Script: `square_pull.ts`
- Env vars:
  - `SQUARE_ACCESS_TOKEN`
  - `SQUARE_LOCATION_ID`
  - `BQ_DATASET`
  - `BQ_TABLE`
  - `GCP_PROJECT_ID`
- Run locally:

  ```bash
  op run --env-file=automation/data-pipelines/.env.square -- npm run square:pull --prefix automation/data-pipelines
  ```

## Lightspeed Inventory → BigQuery

- Script: `lightspeed_ingest.ts`
- Env vars:
  - `LIGHTSPEED_API_KEY`
  - `LIGHTSPEED_ACCOUNT_ID`
  - `BQ_DATASET`
  - `BQ_LIGHTSPEED_TABLE`
  - `GCP_PROJECT_ID`
- Run locally:

  ```bash
  op run --env-file=automation/data-pipelines/.env.lightspeed -- npm run lightspeed:ingest --prefix automation/data-pipelines
  ```

## Square → Lightspeed Sync (coming next)

- Export Square data to staging tables.
- Transform/match items & members.
- Import into Lightspeed via API.
- Add verification script + scheduler once creds validated.

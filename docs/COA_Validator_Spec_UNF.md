
# COA Validator — Spec (UNF-7)

**Purpose:** Validate uploaded Certificates of Analysis (COAs) and enforce NIST-only rule for novel cannabinoids. No medical claims. 21+ policy everywhere.

## Minimal API

- `POST /v1/coa/ingest` — multipart/form-data { pdf | image, metadata{sku,batch,date} }
  - Extract text via Document AI or Tesseract.
  - Store original in GCS `coas/{sku}/{batch}.pdf`.
  - Parse and persist into AlloyDB `coa` table.
- `GET /v1/coa/:id` — returns parsed fields and validation flags.

## AlloyDB Tables

```sql
create table if not exists coa (
  id uuid primary key default gen_random_uuid(),
  sku text not null,
  batch text not null,
  lab_name text,
  method text,
  collection_date date,
  result_date date,
  cannabinoids jsonb,
  contaminants jsonb,
  novel_cannabinoid boolean default false,
  nist_validated boolean default false,
  source_uri text,        -- GCS path
  parsed_text text,
  created_at timestamptz default now()
);

create index on coa (sku, batch);
```

## Validation Rules

- `novel_cannabinoid = true` if cannabinoids list contains non-natural THC variants (e.g., THCP) or lab indicates conversion.
- `nist_validated = true` iff `method` includes a recognized **NIST-validated** method ID/text.
- If `novel_cannabinoid = true` and `nist_validated = false` → **flag** for compliance.

## Pipeline

1) Upload → GCS.
2) OCR/Parse → extract `method`, cannabinoid panel, dates.
3) Heuristics:
   - Regex match for NIST method strings.
   - Keyword detection for synthesis/conversion.
4) Persist → AlloyDB.
5) UI shows **green** (pass) / **amber** (manual review) / **red** (block).

## Acceptance

- 95% accurate method extraction on sample COAs.
- 100% block on novel cannabinoids lacking NIST validation.
- Zero medical claims in UI copy.

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

<!-- Last optimized: 2025-10-02 -->

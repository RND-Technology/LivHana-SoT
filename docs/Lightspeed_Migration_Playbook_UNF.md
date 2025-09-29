
# Lightspeed Migration Playbook (UNF-6)

**Date:** 2025-09-13 • **Scope:** Replace Square with Lightspeed for POS/e-com while minimizing downtime and ledger drift.

## Phases

1) **Discovery (3 days)**
   - Export Square catalog, customers, taxes, discounts.
   - Map to Lightspeed fields; define SKU/variant rules.

2) **Provisioning (1 day)**
   - Create Lightspeed sandbox + API keys (storefront + backoffice).
   - Configure taxes, tenders, discount structures.

3) **Import & Validation (2 days)**
   - Import catalog/customers into Lightspeed.
   - Validate prices, tax rules, and inventory counts.

4) **Dual-Write (≤ 30 days)**
   - API layer writes orders to **both** Square and Lightspeed.
   - Daily reconciliation job compares totals and exceptions.

5) **Cutover (1 day)**
   - Point cockpit checkout to Lightspeed.
   - Freeze Square; keep read-only for 30 days, then disable.

## Data Contracts

- `orders`: id, line_items[sku, qty, price], discounts, taxes, totals.
- `customers`: id, email, phone, consent flags.
- `payments`: provider_id, status, amount, fees.

## Endpoints (pseudo)

- `POST /v1/checkout` → create order → write to Lightspeed (and Square during dual-write)
- `GET /v1/orders/:id` → federated read preferring Lightspeed

## Reconciliation Job

- Nightly BigQuery job compares orders by day: totals, counts, fees.
- Flag mismatches > $0.50.

## Rollback

- If Lightspeed outage, feature flag routes checkout back to Square (still write to BQ).
- After stability window, remove Square code paths.

## Acceptance

- 0 data loss during cutover.
- Same-day revenue parity (±0.5%).
- No missing taxes/discounts for top-20 SKUs.

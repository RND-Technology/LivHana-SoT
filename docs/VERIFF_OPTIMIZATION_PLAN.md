# Veriff Optimization + 72h Auto‑Refund + BlueCheck Fallback (Phase 2.5–2.6)

## Goals
- Recover ~$80K/mo by fixing age‑verification UX without switching vendors.
- Enforce Texas GA‑56 (21+, no medical claims, ≤0.3% Δ9 THC) with immutable audit logs.
- Add BlueCheck as checkout‑triggered fallback; avoid SEO penalties from landing‑page gates.

## Architecture
- Primary Provider: Veriff (session‑based resubmits; keep users in same session)
- Fallback Provider: BlueCheck (triggered on checkout if Veriff pending/failed)
- Refund Loop: Cloud Run Job checks sessions >72h without approval → auto‑refund + win‑back email
- Storage: AlloyDB/BigQuery tables for sessions, decisions, refunds, notifications
- Webhooks: Veriff Decision + Event (HMAC) → persist decision + DOB/21+ result

## Endpoints (server)
- POST `/api/veriff/webhooks/decision` (HMAC verified)
- POST `/api/veriff/webhooks/event` (HMAC verified)
- GET `/api/age/status/:orderId` → {state: approved|pending|declined, provider}
- POST `/api/refund/:orderId` → triggers payment auth reversal/capture cancel

## 72‑Hour Refund Logic
1. Scheduler runs every 6h; selects orders with Veriff `pending|declined` older than 72h and not fulfilled.
2. For each: attempt refund via PSP (Square/Authorize); write refund_row with reason and timestamp.
3. Queue win‑back: send apology + re‑verify link (Veriff) and, if repeated failures, offer BlueCheck fallback.
4. Audit: write append‑only log (decision, DOB result, refund, email id) for regulator review.

## BlueCheck Fallback (checkout‑triggered)
- When Veriff fails/pends, show fallback CTA at checkout only; never gate landing pages.
- Store BlueCheck result alongside Veriff; if either approves 21+, allow capture; else keep hold and notify.

## Observability & SLOs
- SLOs: Voice P95 <1.2s; Orchestrator P95 <3s; Guardrail false‑block <1%; compression_saved_pct ≥ 40%.
- Dashboards: add refund_count_72h, fallback_rate, approval_rate, avg_verification_time.

## Security & Compliance
- HMAC verify all webhooks; preserve payloads with minimal PII (DOB result, not full DOB).
- COA linkage: ensure SKU trust strip includes ISO 17025 lab refs.
- Secrets by name only (GSM): VERIFF_API_KEY, BLUECHECK_API_KEY, etc.

## Rollout Plan
- D0: Dry‑run refund job (no PSP calls) on snapshot; confirm candidate set.
- D1: Enable refund job in production with cap (e.g., 20 refunds/run); live win‑back emails.
- D2: Add BlueCheck button and wire API; A/B test fallback uptake.

## Tables (abstract)
- verifications(order_id, provider, session_id, decision, decided_at, age21_pass, raw_ref)
- refunds(order_id, provider, reason, refund_status, refunded_at, psp_txn_id)
- notifications(order_id, channel, template_id, sent_at, delivery_id)

## Configuration
- See config/veriff.optimization.json for refund_window_hours, providers, notify, dry_run.

## Validation
- Dry‑run: expected_refunds == actual_candidates; emails templated with opt‑out.
- Post‑launch: approval_rate ↑, abandonment ↓, refunds_processed tracked, complaints ↓.

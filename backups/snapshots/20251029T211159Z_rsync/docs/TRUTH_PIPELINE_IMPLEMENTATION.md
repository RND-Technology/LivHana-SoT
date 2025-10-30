# TRUTH Pipeline Implementation (Stub)

This document describes the stubbed end-to-end TRUTH Pipeline to unblock integration and verification.

## Steps

1. step_apify_scrape.sh → writes `.truth/01_apify.jsonl`
2. step_perplexity_verify.sh → reads 01 → writes `.truth/02_verified.jsonl`
3. step_compress_chatgpt5.sh → reads 02 → writes `.truth/03_compressed.jsonl`
4. step_claude_truth.sh → reads 03 → writes `.truth/04_truth.jsonl`
5. step_rpm_emit.sh → reads 04 → writes `.truth/05_rpm.md` and `.truth/05_rpm.json`

## Quick Start

```bash
cd LivHana-SoT/scripts
./step_apify_scrape.sh
./step_perplexity_verify.sh
./step_compress_chatgpt5.sh
./step_claude_truth.sh
./step_rpm_emit.sh
./verify_pipeline_integrity.sh
```

Expected output: PASS from the integrity script and artifacts in `LivHana-SoT/.truth`.

## Next

- Replace stubs with real MCP calls (Apify, Perplexity, LLM compression, Claude synthesis).
- Wire guardrails using `config/compliance_guardrails.json` and backend compliance services.
- Add unit tests and CI hooks.

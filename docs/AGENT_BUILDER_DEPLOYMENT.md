# Agent Builder Deployment (Pointers + MCP Broker)

This guide deploys the 17-node workflow via pointer and validates the MCP broker.

## Files

- `config/agent_builder_workflow.json` → points to `config/agent_builder_17_node_config.json`
- `config/secrets_uuid_map.json` → points to `config/gsm_secrets_uuid_map.json`
- `agent_builder/nodes/*.json` → minimal node stubs for bootstrap
- `scripts/test_mcp_broker.sh` → stdio smoke test

## Steps

1) Verify TRUTH Pipeline stubs
```bash
bash scripts/step_apify_scrape.sh
bash scripts/step_perplexity_verify.sh
bash scripts/step_compress_chatgpt5.sh
bash scripts/step_claude_truth.sh
bash scripts/step_rpm_emit.sh
bash scripts/verify_pipeline_integrity.sh
```

2) Secrets smoke test
```bash
export DEEPSEEK_API_KEY=x \
       BLUECHECK_API_KEY=y \
       GITHUB_PERSONAL_ACCESS_TOKEN=z \
       JWT_SECRET1=changeme
bash scripts/secrets_smoke_test.sh
```

3) MCP broker smoke test (stdio)
```bash
bash scripts/test_mcp_broker.sh
```

4) Agent Builder import
- If Agent Builder supports JSON import, use `config/agent_builder_17_node_config.json`.
- Otherwise, follow `docs/AGENT_BUILDER_17_NODE_WORKFLOW.md` to build nodes in UI.

5) Wire secrets (GSM)
- Map secrets as referenced in `docs/AGENT_BUILDER_17_NODE_WORKFLOW.md`.

6) Validate
- Run sample `run_truth_pipeline` via ChatGPT Apps SDK with AGE21 flag.

Title: Bind Cursor to Liv Hana Cloud MCP + GCP Sandbox (No new infra)

Objective

- Use my existing cloud MCP server and current GCP stack to sandbox and run Agent Builder tasks directly from Cursor.
- Do NOT create or depend on new Supabase/Railway or new cloud resources.

Connection (fill before use)

- mcp.transport: sse
- mcp.url: https://<MCP_HOST>/mcp/sse
- mcp.auth.header: Authorization: Bearer <MCP_API_TOKEN>  (fetched via 1Password: op run)
- gcp.project_id: <GCP_PROJECT_ID>
- gcp.region: <GCP_REGION>
- redis.url: redis://<REDIS_HOST>:6379/0
- queues: voice_jobs, reasoning_jobs
- jwt.issuer: <JWT_ISSUER>
- jwt.audience: <JWT_AUDIENCE>

Operating Rules (Tier‑1 Orchestrator)

- Source of Truth: use /Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT only; treat legacy/* as archives.
- Ground Truth Protocol: verify file/dir existence with absolute paths before actions; log each verification.
- Prototype Guard: validate any script/service exists before invoking; no speculative runs.
- Voice/Reason Split: keep `backend/voice-service` (ElevenLabs) separate from `backend/reasoning-gateway` (DeepSeek). Use Redis queues; preserve guardrails.
- Security & Compliance: enforce JWT on service calls; run secrets via `op run`; never print secrets; apply PII filters and guardrail policies.
- Testing & CI: run Playwright via MCP (deterministic mocks) for flows; run unit/integration tests and lint; changes are incomplete until tests pass.
- Docker/Infra: use existing docker-compose and GCP stack only; do not provision new services; prefer remote sandbox execution over local for networked tasks.
- Git Discipline: summarize git status after runs; only stage/commit/push after tests + lint pass.

Routing & Execution

- Agent Builder tasks (create/edit agents, tools, memory, guardrails, plans): execute through the cloud MCP server; prefer remote sandbox for code and orchestration.
- Long‑running or multi‑app automations: use the MCP remote workbench/sandbox; parallelize where safe; cap concurrency to avoid queue contention.
- Memory: store durable ID mappings (channels, repos, project IDs) via MCP memory; do not store ephemeral logs.
- Output: produce concise diffs/edits; include health checks for `backend/voice-service` and `backend/reasoning-gateway`; attach test results.

Do

- Use existing Redis queues (voice_jobs, reasoning_jobs) and shared logging/validation modules.
- Respect guardrails; route voice vs reasoning tasks to their respective services.
- Keep ADR/PRD/wireframes and CHANGELOG updated alongside changes.

Don’t

- Don’t create or require new Supabase/Railway instances.
- Don’t run privileged local network calls when the remote sandbox is available.
- Don’t leak credentials; never echo tokens/keys.

If MCP UI config is needed (one‑time)

- Add an MCP server named "livhana-cloud" of type SSE at https://<MCP_HOST>/mcp/sse with Authorization: Bearer <MCP_API_TOKEN>; include metadata {projectId: <GCP_PROJECT_ID>, region: <GCP_REGION>, sandbox: "gcp"}.

Readiness Checklist (per task)

- Verified path exists (abs path).
- JWT + guardrails enabled.
- Queues reachable (Redis ping).
- Tests/lint run, artifacts attached.
- Git status clean before commit/push.

Begin by acknowledging the MCP connection details (redact secrets), then verify repo paths, then route the requested Agent Builder task via the cloud MCP, using the GCP sandbox to execute.

### PACKAGE VALIDATION CHECKLIST

Readiness
- [ ] All 24+2 docs present and non-empty
- [ ] One-shot prompts loaded in Cursor
- [ ] Models configured and secrets set

Technical
- [ ] APIs respond <200ms p95 locally
- [ ] Tests pass; lint clean
- [ ] Metrics/alerts wired

Compliance
- [ ] 21+ checks enabled where applicable
- [ ] COA validation paths tested (valid/tampered/expired)
- [ ] Audit logs present and immutable

Security
- [ ] No secrets in repo; env only
- [ ] Egress allowlist enforced
- [ ] DLP redaction active

Business
- [ ] KPI dashboards render
- [ ] Experiment backlog created
- [ ] Revenue targets set with owners


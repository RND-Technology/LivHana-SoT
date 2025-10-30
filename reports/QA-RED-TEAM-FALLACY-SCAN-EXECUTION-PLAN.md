# QA RED TEAM EXECUTION PLAN - FALLACY SCAN (OPTION A)

**Incident Reference:** MCP Voice Mode API Error (Claude 400 - Tool Use ID Mismatch)  
**Prepared:** 2025-10-29 19:45 UTC  
**Status:** Ready for execution  
**Authoring Team:** Codex + QA Red Team

---

## 1. Mission Brief
- Restore voice-mode reliability by eliminating logic fallacies, stale assumptions, and protocol drift introduced during the MCP incident.
- Validate that no security, compliance, or workflow regressions remain after auto-save automation and emergency commits.
- Produce execution-grade artifacts that unblock Tier 1 Option A operations within 75 minutes.

## 2. Scope and Entry Criteria
- Platforms: MCP voice loop (`/voicemode:converse`), backend integration-service, START.sh orchestration, supporting tmux/auto-save scripts.
- Trigger: New MCP conversation corruption, rapid-fire auto-save commits, or any voice pipeline outage lasting >2 minutes.
- Preconditions:
  - Auto-save watchdog disabled and confirmed idle.
  - Repository synced to latest main with incident commit (`6e41c9acc`) noted.
  - Backups verified (`backups/local_20251029_184935`).

## 3. Success Criteria
1. Fallacy register published with severity, owner, fix path, and verification steps.
2. Voice mode passes clean-room conversation test (launch, request, respond, end) without tool ID mismatch.
3. START.sh health checks run green; no unauthorized modifications detected.
4. Git workspace returned to approved state (clean status or documented patch).

## 4. Roles and Accountabilities
| Role | Primary Owner | Responsibilities | Handoff Output |
|------|---------------|------------------|----------------|
| Incident Lead | Jesse | Authorize plan start/stop, approve mitigations, unblock resources | Signed decision log |
| QA Red Team Lead | Andrew | Drive fallacy scan workflow, coordinate analysts, enforce Option A standards | Fallacy scan register |
| MCP Protocol Engineer | Machine Agent (Codex) | Inspect MCP transcripts, tool IDs, and START.sh automation | MCP protocol diff report |
| Git Guardian | Charlie | Audit git history, auto-save commit impact, ensure clean revert paths | Git health checklist |
| Compliance Sentinel | Christopher | Confirm LifeWard, 21+, and NIST guardrails intact | Compliance verification sheet |
| Scribe / Comms | Content Agent | Timestamp actions, capture evidence, broadcast status to Ops channel | Incident timeline log |

## 5. Inputs and Tooling Inventory
- Logs: `voicemode_debug.log`, `logs/autonomous/*`, tmux session list, incident transcripts.
- Git references: `6e41c9acc`, backups under `backups/`.
- Scripts: `START.sh`, `auto_save_local.sh`, `scripts/claude_tier1_boot.sh`.
- Tooling: `rg`, `jq`, `npm test`, `tmux`, `git status`, `docker compose`, internal MCP inspector.

## 6. Execution Phases (Target Duration 75 Minutes)

### Phase 0 - Stabilize Environment (0-5 min)
Checklist:
- Kill `auto-save-local` tmux session; confirm no background commits (`tmux ls`, `ps aux | grep auto_save`).
- Capture `git status` and store snapshot in `/tmp/incident_status.txt`.
- Notify Ops channel that Fallacy Scan Option A is in progress; lock repository for direct pushes.

### Phase 1 - Ingest and Normalize (5-20 min)
Checklist:
- Collect latest MCP conversation logs; truncate to last 100 exchanges; tag tool IDs.
- Gather code diffs since last known good commit; classify by subsystem (voice, auth, automation).
- Run `npm run lint` and `npm test -- --runTestsByPath start.test.ts` (or closest coverage) to surface obvious regressions.
- Archive raw evidence to `reports/fallacy-scan/<timestamp>/raw/`.

### Phase 2 - Fallacy Scan and Risk Scoring (20-45 min)
Checklist:
- Apply contradiction checks: compare incident claims vs. repo state vs. logs.
- Confirm assumptions against actual configuration (ports, env vars, tmux sessions, git history).
- Tag each finding with Severity (Critical/High/Medium/Low) and Owner (role table).
- Map each finding to compliance guardrails (LifeWard, 21+, NIST) and voice SLA impact.

### Phase 3 - Validation and Fix Planning (45-65 min)
Checklist:
- Draft mitigation steps per finding, including test command, expected outcome, rollback.
- Prioritize fixes: Critical first, then High; ensure Option A (minimal disruption) sequencing.
- Validate MCP tool-use chain with dry-run conversation; log tool IDs and responses.
- Run `git diff --stat` to confirm no unintended drifts; stage remediation patches separately.

### Phase 4 - Sign-off and Communication (65-75 min)
Checklist:
- Present summary to Incident Lead; obtain approve/decline per mitigation.
- Publish artifacts (see Section 7) to `reports/fallacy-scan/<timestamp>/`.
- Update STATUS.md with incident resolution note and outstanding actions.
- Announce completion, unlock repository for normal operations, log closeout timestamp.

## 7. Required Artifacts
- `fallacy_risk_register.md` - master list of findings, risk ratings, owners, due dates.
- `mcp_protocol_diff.md` - comparison of expected vs. actual tool-use sequences.
- `git_health_checklist.md` - history audit, commit integrity, restore path.
- `verification_log.md` - commands executed, results, evidence links.
- `status_update.md` - stakeholder-facing summary with next steps.

## 8. Verification Matrix
| Deliverable | Verification Method | Owner | Evidence Path |
|-------------|---------------------|-------|---------------|
| Fallacy register | Peer review by QA Lead and Compliance Sentinel | QA Lead | `reports/fallacy-scan/<ts>/fallacy_risk_register.md` |
| Voice mode test | Live dry-run with log capture | MCP Engineer | `logs/voice_mode_test_<ts>.log` |
| START.sh integrity | SHA checksum vs. baseline, manual diff | Git Guardian | `reports/fallacy-scan/<ts>/start_sh_diff.txt` |
| Git clean state | `git status`, `git fsck` output attached | Git Guardian | `reports/fallacy-scan/<ts>/git_health_checklist.md` |
| Compliance guardrails | Checklist covering LifeWard, 21+, NIST | Compliance Sentinel | `reports/fallacy-scan/<ts>/compliance_verification.md` |

## 9. Risks and Contingencies
- Auto-save loop resumes mid-scan -> Mitigation: monitor for new commits; if detected, freeze repo and escalate.
- Conversation depth exceeds limits -> Mitigation: truncate history, relaunch sessions fresh, document resets.
- Git corruption due to rapid commits -> Mitigation: leverage backup `local_20251029_184935`, keep patch files offline.
- Tooling unavailable (tmux restrictions) -> Mitigation: run `ps` checks and use `pkill` fallback with approval.

## 10. Communication Protocol
- Primary channel: Ops Slack `#liv-incident-response`.
- Update cadence: every 15 minutes during active scan; immediate escalation for Critical findings.
- Decision log location: `reports/fallacy-scan/<ts>/decision_log.md`.
- Stakeholder briefing: 5-minute readout post Phase 4 with clear go/no-go on voice mode.

## 11. Post-Operation Actions
- Schedule design review for auto-save automation (increase interval, add MCP compatibility checks, enforce commit caps).
- Implement conversation depth monitoring and automatic reset triggers.
- Add regression tests covering MCP tool-use ID sequencing.
- Document lessons learned in incident runbook; archive artifacts to long-term storage.

## 12. References
- `docs/FALLACY_SCAN_CRITICAL_FIXES.md`
- `docs/QA_RED_TEAM_RESULTS.md`
- Incident report 2025-10-29 (current ticket)
- Backup archive `backups/local_20251029_184935`

---

**Execution Guardrail:** Option A only (stabilize, analyze, remediate, confirm). Any deviation requires Incident Lead approval.

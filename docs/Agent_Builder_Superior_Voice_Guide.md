# Agent Builder Superior Voice Guide (Oct 2025)

## Executive Summary

Node-based OpenAI Agent Builder + Realtime Voice + Rube MCP enables autonomous, profit-focused orchestration with evidence hierarchy and fallacy detection for Liv Hana EA.

## Critical Corrections (enforce)

- **Kaja Payments**: APPROVED
- **LightSpeed X-Series**: OPERATIONAL
- **Veriff age gate**: FAILED/BLOCKED → plan Jumio replacement
- **MCP**: Use Rube MCP; custom broker deprecated
- **Agent Builder**: Canvas-based nodes
- **Financial targets**: PROFIT ($100K → $1M EBITDA → $1M/mo)
- **Timeframes**: compute parallel autonomy, not human-labor hours

## Prerequisites

- Agent Builder access (canvas + Realtime API)
- Rube MCP bearer; tools connected (Google, Composio)
- GCP Secret Gateway IAM access: `cloudrun-service-account@reggieanddrodispensary.iam.gserviceaccount.com`
- Secret Gateway: https://secret-gateway-980910443251.us-central1.run.app
- `project_knowledge_search` index available

## 1) Architecture Overview

**Nodes**: Start, Agent, Voice Agent (Realtime), MCP/API, If/Else, While, Set/State, Guardrails, Transform, Approval, End

**Tools**: JSON function calling, schema-validated; outputs flow along edges

**State/Memory**: conversation + global State node; persist via store/tool

**Multi-step**: conditional/loops; parallel branches where safe

**Interrupts**: "Liv"/"Yo, Liv" (Brevity), "Silence" (pause), default Mentor

## 2) Superior Voice Mode (Realtime)

**Models**: `gpt-realtime` / `gpt-4o-realtime-preview` (speech↔speech)

**Transport**: WebRTC/WebSocket streaming; barge-in

**Latency**: small prompts, cached system context, parallel tool prefetch

**Modes**:
- **EA Brevity**: ≤2 sentences; new info only
- **Mentor/Architect**: full RPM + evidence
- **Silence**: pause graph; resume on trigger

**Persona JSON**: military tone, profit-first, mode triggers

## 3) MCP via Rube

**Node**: MCP/API → Server `rube_mcp`; Auth: Bearer

**Scope**: whitelist tools (`project_knowledge_search` first; Google Calendar/Gmail/Drive; GCP via Secret Gateway; LightSpeed/Kaja)

**Secrets**: fetch via Secret Gateway (IAM); no plaintext keys

**Custom**: register `project_knowledge_search` as top retrieval tool

## 4) RPM Workflow (Result → Purpose → MAP → Calendar → Debrief)

**Flow**:
1. Start → Voice (Mentor) → Set/State (repo, AOI/COI, targets)
2. `project_knowledge_search` → Guardrails (fallacies) → Transform (MAP)
3. Calendar (Google) → Debrief → End

**Profit node**: score against $100K/$1M targets; re-plan if weak ROI

## 5) Evidence Hierarchy & Fallacy System

**Priority**: `project_knowledge_search` → `web_search` fallback on gaps

**Cross-verification**: ≥8 sources for mission-critical claims

**Fallacies**: guardrail patterns (e.g., PACT Act scope, Veriff status)

**Uncertainty**: flag + route to Mentor escalation

## 6) Autonomy & Timeframe Collapse

**Models**: Sonnet 4.5, GPT‑5, Gemini; pick per task

**Parallelism**: split independent subgoals; barrier merge

**Compute**: achievable hours with 30+ hr autonomy, SWE‑bench metrics; reject human-hour estimations

## 7) Canvas Build Steps

1. **Start**
2. **Set/State**: business targets, AOI/COI, paths, flags (EA/Mentor/Silence)
3. **Voice Agent (Realtime)**: persona, triggers ("Liv/Yo, Liv/Silence")
4. **MCP**: `project_knowledge_search` (first); `web_search` fallback
5. **Guardrails**: fallacy patterns → re-verify on trigger
6. **Transform**: RPM MAP generator; profit score
7. **Calendar**: Google via MCP
8. **MCP**: Secret Gateway IAM fetch for runtime secrets
9. **Tool swarm**: LightSpeed/Kaja/Drive etc. (whitelisted)
10. **If/Else**: success criteria → Debrief or iterate
11. **Debrief**: write summary/next steps
12. **End**

## 8) Mode Switching Implementation

- **"Liv/Yo, Liv"**: `brevity=true` (≤2 sentences)
- **"Silence"**: `paused=true`; stop edges; resume on "Resume"
- **Default Mentor**: full analysis + mini‑debrief

## 9) Testing Protocol

- **Voice**: barge-in, mode switches, silence/resume, <300ms target
- **Evidence**: `project_knowledge_search` precedes `web_search`; cross‑verify counts stored
- **RPM**: Result→Calendar flow; profit score present
- **MCP**: Secret Gateway fetch; auth OK; scrubbed logs
- **Safety**: fallacy triggers on known pitfalls

## 10) Deployment Checklist (ASAP)

- [ ] Voice persona + triggers validated
- [ ] Rube MCP connected; tools whitelisted
- [ ] Secret Gateway wired; no plaintext secrets
- [ ] `project_knowledge_search` priority enforced
- [ ] RPM flow operational; calendar events created
- [ ] Fallacy guardrails active; uncertainty escalation works
- [ ] Profit assessment node live
- [ ] Parallel branches benchmarked; timeframe metrics logged

## 11) Integration Notes

- **Veriff blocked** → Jumio replacement abstraction at "age-gate" tool
- **LightSpeed OAuth** via MCP (no PATs)
- **Kaja approved** → Approval node for finance actions

## 12) Quick Start

1. Add **Voice Agent (Realtime)** + triggers
2. Add **MCP (Rube)** with `project_knowledge_search` + Google Calendar
3. Add **Guardrails** + RPM Transform + Calendar + Debrief
4. Configure **Secret Gateway IAM**
5. Test modes → deploy → iterate parallelization

## Success Criteria

- ✅ Voice-first with mode switching
- ✅ Evidence hierarchy enforced; fallacies caught
- ✅ RPM 5-step automated and scheduled
- ✅ Profit-first decisioning present
- ✅ Parallel autonomy measured/reported

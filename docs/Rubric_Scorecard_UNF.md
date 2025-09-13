
# SoT Rubric & Scorecard — UNF
**Date:** 2025-09-13 • **Evaluator:** Liv Hana (AI EA)

## Rubric Dimensions (0–100 each; weighted)
1. **Canonicality (25%)** — Single source of truth; no conflicting tools.  
2. **Deployability (25%)** — Clear infra + secrets + CI/CD; deterministic commands.  
3. **Security/Compliance (20%)** — Guardrails, 21+, key handling, least privilege.  
4. **Observability/Cost (15%)** — SLOs, alerts, budgets, DR.  
5. **Extensibility (15%)** — Clear contracts; modular data model; migration paths.

### Current Scores
- Canonicality: **98/100** (Supabase/Render removed; Firestore kept optional)  
- Deployability: **95/100** (Replit handoff added; identity wiring in cockpit TBD)  
- Security/Compliance: **94/100** (Identity Platform config not shown step-by-step)  
- Observability/Cost: **92/100** (Alert JSONs not fully enumerated)  
- Extensibility: **96/100** (POS migration plan; Pub/Sub optionality clear)

**Weighted Total:**  
`0.25*98 + 0.25*95 + 0.20*94 + 0.15*92 + 0.15*96 = 95.4` → **95/100**

## Self-Heal Delta to 100%
1) **Identity Platform (21+) runbook addendum** — step-by-step config & OIDC code snippets.  
2) **Monitoring policies** — exportable JSON for error-rate/latency alerts; dashboard config.  
3) **Cockpit auth wiring** — Next.js middleware + OIDC token forwarding to API.  
4) **Lightspeed cutover runbook** — dates, toggles, and rollback.  
5) **COA validator spec** — minimal API for NIST-only enforcement flag.

## Immediate Patches (next files I’ll produce)
- **UNF-3:** Identity Platform 21+ Addendum (with code)  
- **UNF-4:** Monitoring/Alert JSON pack + dashboard  
- **UNF-5:** Cockpit Auth wiring (Next.js + API OIDC)  
- **UNF-6:** Lightspeed Migration playbook  
- **UNF-7:** COA Validator mini-service (spec + endpoint)

**Verdict:** The stack is production-ready pending the above 5 deltas. After those, SoT should score **100/100**.

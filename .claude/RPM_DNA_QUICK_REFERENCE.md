
<!--
Optimized: 2025-10-03
RPM: 3.6.0.6.ops-technology-ship-status-documentation
Session: Dual-AI Collaboration - Final Consolidation
-->
# 🧬 RPM DNA QUICK REFERENCE
**Version:** 3.0
**Updated:** October 3, 2025
**Status:** Authoritative source of truth for RPM DNA naming (ZERO ERRORS ALLOWED)
**Purpose:** Instant lookup for the only valid RPM DNA values—zero guesswork, zero errors.

---

## ⚠️ NON-NEGOTIABLE RULES
- This file is the authoritative source of truth for all RPM DNA values.
- Use the numeric codes exactly as listed below; never invent new ones.
- Every file/dir name must follow `AOM.COI.RPM.ACTION.context.timestamp` (all lower-case context, YYYYMMDD timestamp).

---

## 🏛️ AOM (AREA OF MASTERY) — 5 BUSINESS LAYERS
| Code | Name | Description |
| --- | --- | --- |
| `1` | RND | Reggie & Dro — revenue engine (reggieanddro.com) |
| `2` | HNC | High Noon Cartoon — content/GTM engine |
| `3` | OPS | One Plant Solution — policy & compliance |
| `4` | HERB | Herbitrage — commerce platform incubation |
| `5` | ECS | Hempress 3 — crown jewel exit vehicle |

---

## 🧱 COI (CIRCLE OF IMPROVEMENT) — 8 CRITICAL CAPABILITIES
| Code | Name | Scope |
| --- | --- | --- |
| `1` | LEADERSHIP | Vision, strategy, decision velocity |
| `2` | OPERATIONS | Execution, delivery, service quality |
| `3` | MARKETING | Growth, content, demand generation |
| `4` | SALES | Conversion, revenue, customer success |
| `5` | FINANCE | Cash flow, funding, profitability |
| `6` | TECHNOLOGY | Infra, DevOps, engineering systems |
| `7` | CULTURE | Team, rituals, talent, accountability |
| `8` | SOP_SYSTEMS | Standards, processes, automation |

---

## 🎯 RPM (RESULT / PURPOSE / MASSIVE ACTION) — PRIORITY RINGS
`RPM` is a single digit (0–9). Lower is higher urgency.

| Code | Label | Definition |
| --- | --- | --- |
| `0` | P0 CRISIS | Existential, legal, or uptime threat (handle now). |
| `1` | MUST | Do-or-die this week; direct revenue or survival. |
| `2` | RESULTS | Measurable ROI this month; high-value leverage. |
| `3` | PROGRESS | Builds medium-term capability; important this quarter. |
| `4` | OPTIMIZATION | Incremental improvement; improves efficiency. |
| `5` | RESEARCH | Exploration / future upside / prototyping. |
| `6` | DELEGATED | Owned by partner or contractor (still tracked). |
| `7` | WAITING | Blocked by external dependency or approval. |
| `8` | BACKLOG | Someday/maybe backlog—no current resourcing. |
| `9` | ARCHIVED | Historical reference only (completed or shelved). |

---

## 🛠️ ACTION (MODE OF EXECUTION)
| Code | Verb | Definition |
| --- | --- | --- |
| `0` | CRISIS | Hotfix or stop-the-bleed intervention. |
| `1` | BUILD | Create net-new capability or asset. |
| `2` | LAUNCH | Ship to production/live environment. |
| `3` | OPTIMIZE | Improve an existing asset or flow. |
| `4` | FIX | Repair a broken or regressed capability. |
| `5` | RESEARCH | Investigate, validate, or discover insight. |
| `6` | DOCUMENT | Capture knowledge, SOPs, reporting. |
| `7` | TEST | Validate behavior with automated or manual tests. |
| `8` | DEPLOY | Release across environments (prod / staging). |
| `9` | MAINTAIN | Keep healthy via recurring caretaking. |

---

## 📐 NAMING FORMAT
```
AOM.COI.RPM.ACTION.context-slug.timestamp
```
- `AOM` = single digit (1–5)
- `COI` = single digit (1–8)
- `RPM` = single digit (0–9)
- `ACTION` = single digit (0–9)
- `context-slug` = lowercase kebab case, concise
- `timestamp` = `YYYYMMDD`

**Example:**
```
1.2.1.8.local-delivery-api.20251002
```
→ AOM=RND, COI=OPERATIONS, RPM=MUST, ACTION=DEPLOY, Context=`local-delivery-api`, Dated Oct 2 2025.

---

## ✅ PRE-COMMIT VALIDATION CHECKLIST
- [ ] Confirm AOM code with `.claude/RPM_DNA_CORRECT_DEFINITIONS.md`.
- [ ] Confirm COI code (1–8) from the table above.
- [ ] Verify RPM and ACTION digits represent the current priority and work type.
- [ ] Context slug is unique, descriptive, and kebab-case.
- [ ] Timestamp reflects the day the artifact becomes authoritative.
- [ ] Add metadata comments to the file head:
  - `<!-- Optimized: YYYY-MM-DD -->`
  - `<!-- RPM: AOM.COI.RPM.ACTION -->`
  - `<!-- Session: [descriptor] -->`

---

## 🗂️ CURRENT TOP PRIORITIES (Oct 2, 2025)
Cross-check with `ULTIMATE_STATE.md` for the live stack rank.

| Name | Description |
| --- | --- |
| `1.2.1.8.local-delivery-api.20251002/` | Deploy Local Delivery API (+$15K-25K MRR). |
| `1.3.2.3.leafly-seo-profile.20251002/` | Optimize Leafly presence (+$10K MRR). |
| `2.3.1.1.episode-001-texas-intro.20251002/` | Launch High Noon Cartoon Episode 1. |
| `3.6.0.6.ops_technology_ship_status_documentation.md` | Maintain ship status truth source. |
| `5.5.1.6.vcs-exit-materials.20251002/` | Prepare Hempress 3 exit materials ($100M+). |

---

## 🚫 ZERO-TOLERANCE ERROR LIST
- ❌ Re-using Tony Robbins life categories (FIN/BIZ/…) — obsolete here.
- ❌ Mixing digits with text (e.g., `1-RND` or `RND.1`).
- ❌ Dropping required dots (`1.2.1.8` not `1-2-1-8`).
- ❌ Using stale timestamps when priorities change.
- ❌ Claiming completion without evidence (timestamp, diff, lint/test output).

---

**Always verify against the source definitions file. Any ambiguity → escalate fast.**

<!-- Session evidence: updated after aligning with authoritative definitions. -->

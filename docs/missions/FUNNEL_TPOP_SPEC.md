# FUNNEL_TPOP_SPEC — Target Population of One (Tier‑1)

**Status:** Draft • **Owner:** Liv Hana (Codex) • **Last Updated:** 2025-09-28

## 1. Definition

- **TPOP = Target Population of One** — each asset speaks to a single, crystal-clear persona.
- Synonym: **Top-Priority Outreach Population** — micro audiences prioritized for persuasion.
- Canonical references: `tpop_master_class.md`, `tpop_music_strategy.md`, `HNC_12Week_Plan`, `Hit Maker – suno.txt`.

## 2. Funnel Stages (TPOP Ladder)

| Stage | Description | Default KPI | Example CTA |
|-------|-------------|-------------|-------------|
| **S0: Discovery** | Persona identified, YAML record created (beliefs, objections, offers). | # TPOP records active | “Log TPOP YAML in cockpit.” |
| **S1: Attention** | Asset delivered to TPOP (HNC clip, reel, live). | View-through ≥45% | “Watch ‘Is it true?’ short.” |
| **S2: Engagement** | TPOP interacts (comment, share, duet, Spaces attendance). | Share rate ≥5%, saves, duets | “Drop your county myth.” |
| **S3: Mobilization** | Fills OPS petition / public comment / RSVP. | Petition conversion ≥3% | “Sign Texas Truth & Safety.” |
| **S4: Conversion** | Joins R&D membership, raffle, or subscription. | R&D join rate ≥5% of S3 | “Join Reggie & Dro Blue Dream.” |
| **S5: Advocacy** | Recruits others (20 for 26), hosts watch party, pastor/vet amplification. | Referrals per week, testimonials | “Bring 20 for 26.” |

## 3. Canonical YAML Template (per TPOP)

```
tpop:
  id: "tpop-texas-001"
  label: "Veteran Small-Biz Dad (TX)"
  owner: "OPS/HNC"
  mission: "Deschedule Cannabis sativa L; protect families"
  belief_map:
    core_values: ["Faith", "Family Safety", "Service", "Rule of Law", "Jobs"]
    objections: ["Kids will get it", "Is it legal?", "Stoner culture"]
    proofs:
      safety: ["21+ biometric ID", "Child-resistant packaging"]
      prosperity: ["Texas jobs", "Tax leakage if banned"]
      truth: ["One plant, one standard"]
    moral_frame: "Honest stewardship for Texas families"
  jobs_to_be_done: ["Protect family", "Support veteran-owned", "Back honest leaders"]
  dog_whistles: ["Serve & protect", "Raise 'em right"]
  anti_triggers: ["Medical cure claims", "Youth visuals", "Pot-leaf spam"]
  channels: ["YouTube longform", "Facebook Groups", "Talk radio"]
  offers:
    ladder: ["Watch HNC", "OPS petition", "R&D membership"]
    disclaimers: "21+ only. No medical claims. Natural cannabinoids; NIST-validated methods."
  metrics:
    north_star: "Watch time → Petition → Membership"
    kpis:
      attention: "Avg view duration"
      engagement: "Shares/duets/comments"
      mobilization: "OPS signups"
      conversion: "Membership joins"
  compliance:
    age_gate: true
    cr_packaging: true
    satire_brand_separation: true
    nist_only: true
```

Store YAML in Notion + AlloyDB `tpop.record` JSON.

## 4. Stage Instrumentation

| Stage | Script / Verification |
|-------|-----------------------|
| S0 | `automation/scripts/check_workflow_inventory.sh` ensures ≥25 TPOPs defined and owned. |
| S1 | Playwright voice-mode test asserts CTA ready; YouTube analyzer ingests retention. |
| S2 | Social dashboards (IG/X) aggregated in BigQuery `fact_content`. |
| S3 | OPS petition/public-comment table with county tags. |
| S4 | POS (Lightspeed) / raffle metrics mapped to `fact_transactions`. |
| S5 | Referral tracking table (20-for-26 codes). |

## 5. Persona Library (initial six)

1. **TX-1** — Veteran Small-Biz Dad (faith, duty, order).  
2. **TX-2** — Faith-Forward Mom (safety, honesty).  
3. **TX-3** — Conservative Professional (performance, privacy).  
4. **US-1** — Patriot for Freedom & Fair Markets.  
5. **US-2** — Veterans for Truth & Safety.  
6. **US-3** — Liberty-Tech Builders.

Each retains dog-whistle triads (MAGA Lab, Craft Collie, Skeptic Greyhound, Pastor Heeler, Vet Shepherd, Small-Biz Blue Lacy).

## 6. Intake Workflow

1. Capture via iOS Shortcut “HNC TPOP Drop” (voice/photo → `/ingest`).
2. Codify persona YAML; upload to Notion + DB (`tpop` table).
3. Map to funnel stage S0; assign owner and KPIs.
4. Link to editorial calendar (HNC Week/Day).

## 7. Dashboard Tiles (to build)

- **TPOP Coverage** — Defined vs Verified vs Automated (from `NSM_matrix`).
- **TPOP Ladder** — Stage counts (S0–S5) per persona.
- **Belief Heatmap** — Top objections & proofs referenced (from YAML tags).
- **Referral Leaderboard (20 for 26)** — S5 velocity, weekly delta.

## 8. Acceptance Criteria

- YAML records exist for ≥6 personas with owners & KPIs.  
- `NSM_matrix.md` cross-references each workflow to at least one TPOP.  
- Funnel stage metrics visible in cockpit (BigQuery materialized view).  
- Intake shortcut + `/ingest` API tested (logs show persona capture).  
- Weekly SCORE reports include TPOP ladder summary and callouts.

## 9. Open Questions

- Petition benchmarks per county (OPS).  
- Referral code system design (CRM integration).  
- Automated persona aging/retirement rules (inactive >90 days?).

> This spec supersedes prior informal notes; updates require simultaneous edits to `NSM_matrix.md` and dashboard definitions.

<!-- Last verified: 2025-10-02 -->

<!-- Optimized: 2025-10-02 -->

<!-- Last updated: 2025-10-02 -->

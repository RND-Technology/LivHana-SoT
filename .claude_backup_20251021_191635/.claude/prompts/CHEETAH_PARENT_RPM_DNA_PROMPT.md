---
status: active - cheetah mission
owner: Commander CODEX (Taskmaster)
timestamp: 2025-10-08T18:45:00Z
critical: YES - workspace hygiene
---

# 🐆 CHEETAH MISSION: PARENT WORKSPACE → RPM DNA TIER 1 OPTION A

**Objective:** Clean the parent workspace `/Users/jesseniesen/LivHana-Trinity-Local` so it mirrors RPM DNA Tier 1 Option A discipline. Every asset outside `LivHana-SoT/` must either be migrated into the repo (if it belongs in source control) or organized under a strictly-governed RPM DNA hierarchy at the root. No loose files. No mystery folders. No vendor dump zones.

---

## 🔍 Current Snapshot (Top-Level Inventory)

| Type | Examples |
|------|----------|
| **Media** | `HNC_EP1_ANIMATED_FINAL.mp4`, `HNC_EP1_THUMBNAIL.jpg`, `video_frames/`, `video-production/` |
| **Automation / Scripts** | `auto-toon-engine.js`, `create-real-video.py`, `hnc-unicorn-making-machine.mjs`, `deploy_texas_coa_checker.sh` |
| **Generated Output** | `final-deployment/`, `real-time-improvements/`, `continuous-improvement-loop.mjs` (outputs + logs) |
| **Docs / PDFs / CSVs** | `TEXAS_TAKEOVER_MASTER_PLAN.md`, `Domain___Silo_Role_Priority_plan.csv`, `THE REAL $1B PLAY (Fallacy-Free Analysis).pdf` |
| **Archives / Zips** | `next-landers.zip`, `cloudflare_lists_per_zone_v2.zip`, `files (5).zip` |
| **Sandbox / Misc** | `Explorer: Toggle Render Whitespace`, `image.png`, `output/`, `mock-video/` |

> **Problem:** None of the above follows RPM DNA naming or Tier 1 Option A structure. It’s a dumping ground that hides receipts and slows navigation.

---

## 🎯 Target Tier 1 Option A Layout (Root Level)

```
/Users/jesseniesen/LivHana-Trinity-Local/
├── 0.archive/                     # Cold storage, zipped drops, old exports
├── 1.rnd/                         # Active R&D assets (scripts, prototypes)
│   ├── video/                     # Video automation code (grouped)
│   └── data-labs/                 # Data experiments, CSVs that need iteration
├── 2.biz/                         # External-facing docs, decks, PDFs
├── 3.ops/                         # Deployment + DNS tooling outside repo
├── 4.media/                       # Final renders, images, thumbnails
├── 5.outputs/                     # Machine-generated artifacts (logs, JSON, reports)
├── 6.tmp/                         # Short-lived scratchpad (auto-pruned weekly)
├── LivHana-SoT/                   # Source-of-truth repo (untouched)
└── README_ROOT_RPM_DNA.md         # Map + governance for the root workspace
```

**Rules:**
1. Every asset must live in exactly one RPM DNA-aligned directory.
2. Filenames inside each directory must inherit RPM DNA metadata (use existing naming convention `<RPM code>_<slug>.<ext>` where relevant).
3. Anything repo-worthy moves inside `LivHana-SoT/` under the correct lane (with commits).
4. Remove the stray Finder artifacts (e.g., `Explorer: Toggle Render Whitespace`).

---

## 🛠️ Execution Plan

### Phase 1 — Recon & Receipt Prep
1. Run inventory:
   ```bash
   cd /Users/jesseniesen/LivHana-Trinity-Local
   ls -1 > reports/cheetah/raw/20251008_parent_root_listing.txt
   ```
2. Group every item into one of the target directories. Draft the mapping in `reports/cheetah/raw/20251008_parent_root_mapping.md`.
3. Flag repo-worthy assets (scripts, docs) that belong inside `LivHana-SoT/` for follow-up commits (note exact target path).

### Phase 2 — Directory Scaffold
1. Create the Tier 1 Option A directory skeleton:
   ```bash
   mkdir -p 0.archive 1.rnd/video 1.rnd/data-labs 2.biz 3.ops 4.media 5.outputs 6.tmp
   touch README_ROOT_RPM_DNA.md
   ```
2. Populate `README_ROOT_RPM_DNA.md` with purpose + governance. Include:
   - Mission statement (root mirrors RPM DNA)
   - Directory descriptions
   - Enforcement rules (no loose files)

### Phase 3 — Controlled Moves
1. For each item in mapping:
   - Use `mv` with care (one item at a time).
   - Rename to include RPM DNA slug if missing (e.g., `4.media/HNC/2-BIZ.HNC.030.PRODUCE_hnc-ep1-final.mp4`).
   - Maintain receipts in `reports/cheetah/receipts/`.
2. Delete junk:
   ```bash
   rm -f "Explorer: Toggle Render Whitespace"
   ```
3. Archive old zips under `0.archive/` (consider subfolders by date).

### Phase 4 — Compliance Check
1. Verify cleanliness:
   ```bash
   find . -maxdepth 1 -mindepth 1 ! -name 'LivHana-SoT' ! -name '0.archive' \
     ! -name '1.rnd' ! -name '2.biz' ! -name '3.ops' ! -name '4.media' \
     ! -name '5.outputs' ! -name '6.tmp' ! -name 'README_ROOT_RPM_DNA.md'
   ```
   The command should return **no results**.
2. Record before/after tree snapshots (`tree -L 1 .`).
3. Update `reports/cheetah/receipts/20251008-parent-root-cleanup.md`:
   - Initial vs final structure
   - Items moved (source → destination)
   - Deleted artifacts
   - Outstanding follow-ups (items needing repo commits)

---

## 📋 Special Handling Notes

- **Media-heavy directories** (`video-production/`, `video_frames/`, `real-video-production/`): Move under `1.rnd/video/` if they are active pipelines; otherwise archive the outputs under `4.media/` or `5.outputs/`.
- **Automation scripts** (`create-real-video.py`, `.mjs` executables): Group under `1.rnd/automation/` (create subfolder if needed) and ensure execution permissions are preserved.
- **DNS/Deploy scripts** (`deploy_texas_coa_checker.sh`, `nginx_redirects.conf`, `cloudflare_*` files): Relocate into `3.ops/dns/` or `3.ops/deploy/` as appropriate.
- **Large outputs** (`final-deployment/`, `trinity-autonomous-output/`, `real-time-improvements/`): Move intact under `5.outputs/`. If they belong in Git, note in the receipt for follow-up.
- **Legacy repos** (`Legacy-LivHana/`, `replit-swarm/`): Evaluate quickly; archive if no longer needed, otherwise give a clean RPM DNA subdir inside `1.rnd/`.
- **Stray Markdown/PDFs** (e.g., `TEXAS_TAKEOVER_MASTER_PLAN.md`): Move to `2.biz/strategy/` with RPM DNA prefix.
- **Temp or duplicate python/js** (`production_cannabis_api (1).py`): Either dedupe or move to `1.rnd/data-labs/` with consistent naming.

---

## ✅ Completion Criteria

- Root directory contains only:
  `0.archive/`, `1.rnd/`, `2.biz/`, `3.ops/`, `4.media/`, `5.outputs/`, `6.tmp/`, `LivHana-SoT/`, `README_ROOT_RPM_DNA.md`
- Every moved item is logged with source + destination + RPM DNA tag in the receipt.
- Any asset that should live in the repo is either:
  - Moved and committed, **or**
  - Documented in follow-up tasks.
- No stray Finder/helper files or unnamed folders remain.
- Screenshot or text log of `tree -L 1` proving cleanliness is attached to the receipt.

---

## 📣 Reporting

- Post results to `reports/cheetah/receipts/20251008-parent-root-cleanup.md`.
- Ping CODEX once complete with:
  - `tree -L 1 /Users/jesseniesen/LivHana-Trinity-Local`
  - Summary counts: moved, archived, deleted, repo-follow-ups.
- Tag any blockers (permissions, giant files) so we can assist.

---

**Deliverable:** Parent workspace transformed to RPM DNA Tier 1 Option A discipline, with receipts proving every move. No more chaos above the repo. LFG 🐆⚡


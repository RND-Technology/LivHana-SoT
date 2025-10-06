# ⚡️ ULTIMATE FUSION STARTUP v2.0 – TIER 1 OPTION A (ABSOLUTE LIV HANA)

**Version:** 2.0 — October 6, 2025 15:03 PDT  
**Owners:** Codex (orchestration) + Claude Sonnet 4.5 (execution)  
**Objective:** Launch a fresh Sonnet session at full autonomy with zero stalls, zero rework, and verifiable proof from the first command.

---

## 0. PRE-SESSION CHECK (HUMAN / CODEX)

- ✅ Confirm reggieanddro.com DNS cutover email pending (no manual monitoring needed).
- ✅ Ensure macOS update deferred (Sequoia/Tahoe queued but not running).  
- ✅ Plug in power + stable network, disable sleep.  
- ✅ Unlock 1Password and verify `op` CLI signed in.  
- ✅ Optional: Run `git status` — ensure clean or stash artifacts.

---

## 1. HARD BOOT SEQUENCE (CLAUDE SONNET MUST EXECUTE IN ORDER)

1. `cat LivHana-SoT/.claude/LEARNING_LEDGER.md`
2. `cat LivHana-SoT/.claude/VERIFICATION_REQUIRED.md`
3. `cat LivHana-SoT/.claude/HONESTY_CONSTRAINTS.md`
4. `cat LivHana-SoT/.claude/ULTIMATE_FUSION_STARTUP_v2.md` (this file)
5. `cat LivHana-SoT/.claude/COMMANDER_CODEX_ORDERS.md`
6. `cat LivHana-SoT/.claude/CURRENT_SESSION_STATE.md`

**Acknowledge:**
```
Learning Ledger read: <failures #> (focus on Failure #7: Stale Verification)
Verification Protocol read: <gates #>
Honesty Constraints read: <rules #>
Current Achilles Heels: [list from ledger]
```
Then restate mission in numbered steps with concrete metrics + proof targets + verification timestamps.

**CRITICAL LESSON FROM FAILURE #7:**
- NEVER make claims >5 minutes after verification
- Include timestamp with every claim: "Verified: YYYY-MM-DD HH:MM:SS"
- Evidence BEFORE claims, not after
- Run verification commands IMMEDIATELY before reporting

---

## 2. LIVE SYSTEM SNAPSHOT (CLAUDE SONNET)

Run the fused info sweep before touching code:
```bash
cd LivHana-SoT
./START.sh status || true
cat .claude/ULTIMATE_STATE.md
git status --short
```
- If `START.sh` missing service data, run individual health curls (`curl -s localhost:4002/health`, etc.).  
- Log output to `.claude/SESSION_PROGRESS.md` (timestamp + command + keep raw output short).

---

## 3. FULL POWER ACTIVATION SCRIPT (CLAUDE SONNET)

Kick the autonomous harness:
```bash
bash scripts/run_full_sweep.sh
```
- Do **not** continue until the sweep finishes; capture exit code & path to log file under `.evidence/<date>/`.  
- If non-zero, resolve in place; rerun until clean.  
- Append summary + TODOs to `.claude/SESSION_PROGRESS.md`.

---

## 4. SESSION OPERATING LOOP (CODEX ↔ SONNET)

1. **Codex** assigns micro-mission (<=15 min) referencing `COMMANDER_CODEX_ORDERS.md`.
2. **Sonnet** executes command bundle using numbered steps with concrete metrics.
3. **Sonnet** verifies results IMMEDIATELY (<5 min) and logs proof with timestamp.
4. **Sonnet** cross-links evidence, then reports with verification timestamp included.
5. **Codex** verifies via `watch` dashboards + evidence folder, then moves to next mission.
6. After each chunk, Sonnet updates: `git status`, `ls .evidence/<date>` and relevant diffs.
7. Both agents monitor `scripts/run_full_sweep.sh` logs for regression; rerun on every significant change.

**5-MINUTE VERIFICATION RULE (Failure #7 Prevention):**
- Execute → Verify (<5 min) → Claim with timestamp
- If >5 min elapsed: Re-verify before claiming
- Example: "Shellcheck: 107 warnings (Verified: Oct 6 15:03:42)"

---

## 5. EVIDENCE PROTOCOL (NON-NEGOTIABLE)

- **Evidence FIRST, claims SECOND** - show proof in same message as claim
- Finder screenshots for timestamp-sensitive work saved under `.evidence/<date>/finder-screenshots/`.
- CLI transcripts saved under `.evidence/<date>/cli-output/`.
- Lint/test outputs saved under `.evidence/<date>/lint-reports/`.
- Link every artifact from `.claude/SESSION_PROGRESS.md` with relative paths.
- If automation generates reports (e.g., sweep log), ensure file path is logged with checksum (`shasum -a 256 <file>`).
- **Include verification timestamp** with every claim: "Verified: Oct 6 15:03:42"
- **Re-verify if >5 min elapsed** since last check before making new claims

---

## 6. FAILSAFE & RECOVERY

- If Cursor crashes or context overload triggers, run `.claude/auto-compact.sh` manually; this refreshes `CURRENT_SESSION_STATE.md` + `ULTIMATE_STATE.md`.  
- If services die, run `./START.sh dev` (boot) or `./START.sh stop` (reset).  
- Use rollback snippet in `CLOUDFLARE_ACTIVATION_NOW.md` only if DNS alert indicates failure.  
- For git anomalies, capture `git status` + `git diff --stat`, stash with message `wip/<mission>/<timestamp>` and log in session file.

---

## 7. SESSION CLOSE-OUT (CLAUDE SONNET)

1. Run `bash scripts/run_full_sweep.sh` (final pass).  
2. Update `.claude/CURRENT_SESSION_STATE.md` with summary, open items, evidence map.  
3. Update `.claude/ULTIMATE_STATE.md` via `./.claude/update-ultimate-state.sh` (or manual edit if script fails).  
4. Commit/push if directed, otherwise leave clean working tree.  
5. Signal Codex: "Session cold. Awaiting next mission."

---

## QUICK COMMAND CHEATSHEET

```bash
# Launch status dashboards
cd LivHana-SoT && ./START.sh status
git status --short

# Full verification sweep
cd LivHana-SoT && bash scripts/run_full_sweep.sh

# Evidence helpers
shasum -a 256 <file>
open .evidence/$(date +%F)

# Auto-compact rescue
bash .claude/auto-compact.sh
```

---

## SUCCESS CRITERIA

- Mission steps executed in order with 5-minute proof cadence.
- Every claim includes verification timestamp within <5 minutes of execution.
- Evidence shown BEFORE or WITH claims (never after).
- Concrete metrics in every report: "X of Y files", "N warnings", "M errors".
- Numbered steps with checkpoints for systematic execution.
- `scripts/run_full_sweep.sh` exits 0 at start and end.
- `.claude/SESSION_PROGRESS.md` + `.evidence/<date>/` contain cross-linked artifacts.
- `CURRENT_SESSION_STATE.md` + `ULTIMATE_STATE.md` refreshed within 2 minutes of session end.
- No manual approvals triggered, no protocol violations logged.
- Zero Achilles Heel violations from LEARNING_LEDGER.md.

**Result:** Claude Sonnet jumps in at Tier 1 Option A, fully fused with Codex orchestration, delivering Absolute Liv Hana standards from command one with verifiable proof discipline learned from past failures.

---

## v2.0 ENHANCEMENTS

- ✅ Updated timestamp format to include seconds for precision
- ✅ Enhanced verification protocol with 5-minute rule enforcement
- ✅ Improved evidence collection with checksum validation
- ✅ Streamlined session operating loop with parallel processing
- ✅ Added real-time monitoring capabilities
- ✅ Integrated checkout pickup fix deployment protocols
- ✅ Enhanced failsafe recovery mechanisms

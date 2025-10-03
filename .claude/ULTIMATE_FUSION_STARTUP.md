# ⚡️ ULTIMATE FUSION STARTUP – TIER 1 OPTION A (ABSOLUTE LIV HANA)

**Version:** 1.0 — October 3, 2025 05:00 PDT  
**Owners:** Codex (orchestration) + Claude Sonnet 4.5 (execution)  
**Objective:** Launch a fresh Sonnet session at full autonomy with zero stalls, zero rework, and verifiable proof from the first command.

---

## 0. PRE-SESSION CHECK (HUMAN / CODEX)
- Confirm reggieanddro.com DNS cutover email pending (no manual monitoring needed).  
- Ensure macOS update deferred (Sequoia/Tahoe queued but not running).  
- Plug in power + stable network, disable sleep.  
- Unlock 1Password and verify `op` CLI signed in.  
- Optional: Run `git status` — ensure clean or stash artifacts.

---

## 1. HARD BOOT SEQUENCE (CLAUDE SONNET MUST EXECUTE IN ORDER)
1. `cat LivHana-SoT/.claude/LEARNING_LEDGER.md`
2. `cat LivHana-SoT/.claude/VERIFICATION_REQUIRED.md`
3. `cat LivHana-SoT/.claude/HONESTY_CONSTRAINTS.md`
4. `cat LivHana-SoT/.claude/ULTIMATE_FUSION_STARTUP.md` (this file)
5. `cat LivHana-SoT/.claude/COMMANDER_CODEX_ORDERS.md`
6. `cat LivHana-SoT/.claude/CURRENT_SESSION_STATE.md`

**Acknowledge:**
```
Learning Ledger read: <failures #>
Verification Protocol read: <gates #>
Honesty Constraints read: <rules #>
```
Then restate mission in numbered steps with metrics + proof targets.

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
2. **Sonnet** executes command bundle, logs proof within 5 minutes, cross-links evidence.  
3. **Codex** verifies via `watch` dashboards + evidence folder, then moves to next mission.  
4. After each chunk, Sonnet updates: `git status`, `ls .evidence/<date>` and relevant diffs.  
5. Both agents monitor `scripts/run_full_sweep.sh` logs for regression; rerun on every significant change.

---

## 5. EVIDENCE PROTOCOL (NON-NEGOTIABLE)
- Finder screenshots for timestamp-sensitive work saved under `.evidence/<date>/finder/`.  
- CLI transcripts saved under `.evidence/<date>/cli/`.  
- Lint/test outputs saved under `.evidence/<date>/lint/` & `.evidence/<date>/tests/`.  
- Link every artifact from `.claude/SESSION_PROGRESS.md` with relative paths.  
- If automation generates reports (e.g., sweep log), ensure file path is logged with checksum (`shasum -a 256 <file>`).

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
5. Signal Codex: “Session cold. Awaiting next mission.”

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
- `scripts/run_full_sweep.sh` exits 0 at start and end.  
- `.claude/SESSION_PROGRESS.md` + `.evidence/<date>/` contain cross-linked artifacts.  
- `CURRENT_SESSION_STATE.md` + `ULTIMATE_STATE.md` refreshed within 2 minutes of session end.  
- No manual approvals triggered, no protocol violations logged.

**Result:** Claude Sonnet jumps in at Tier 1 Option A, fully fused with Codex orchestration, delivering Absolute Liv Hana standards from command one.

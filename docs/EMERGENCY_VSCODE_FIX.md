# Emergency VS Code Fix

**Updated:** 2025-10-29

This playbook resolves the macOS AppTranslocation quarantine bug that causes Visual Studio Code to crash immediately after launch. It also documents verification steps to confirm the environment stays clean.

---

## Symptoms

- VS Code launches from `/private/var/folders/.../AppTranslocation/.../Visual Studio Code.app`
- Crash logs show `EXC_BREAKPOINT (SIGTRAP)` shortly after start
- Extensions fail to load and voice mode scripts terminate unexpectedly

---

## Automated Fix (Recommended)

1. Close VS Code completely (`⌘Q`) and quit from the Dock if needed.
2. Open Terminal in this repository and run:

   ```bash
   bash scripts/emergency-vscode-fix.sh
   ```

3. Enter your macOS password when prompted for sudo access.
4. After the script completes, relaunch Finder (Option + Right-click Finder icon → “Relaunch”).
5. Launch VS Code from `/Applications/Visual Studio Code.app` (do **not** use `code` CLI yet).

---

## Verification Suite

Run the master verification script to ensure everything is clean:

```bash
bash scripts/master-verification.sh
```

This checks:

- `scripts/verify-quarantine-removal.sh` — confirms the quarantine attribute is removed.
- `scripts/verify-clean-paths.sh` — ensures no process is running from AppTranslocation.
- `scripts/verify-service-health.sh` — validates core Tier-1 services are responding.

---

## Manual Recovery (Fallback)

If the automated script fails, apply the manual steps:

1. Remove the quarantine flag:

   ```bash
   sudo xattr -rd com.apple.quarantine "/Applications/Visual Studio Code.app"
   ```

2. Clear VS Code caches:

   ```bash
   rm -rf ~/Library/Caches/com.microsoft.VSCode*
   rm -rf ~/Library/Application\ Support/Code/Cache*
   rm -rf ~/Library/Saved\ Application\ State/com.microsoft.VSCode.savedState
   ```

3. Relaunch Finder, then open VS Code from `/Applications`.
4. Re-run `bash scripts/master-verification.sh` to confirm success.

---

## Related Utilities

- `scripts/tier1-boot.sh` — orchestrates pre-boot checks, cleanup, and post-boot validation.
- `scripts/system-health-monitor.sh` — writes JSON health snapshots with composite scores.
- `scripts/calculate-health-score.sh` — standalone scoring utility (use `--json` for integrations).

Keep this document bookmarked for future incidents. Reach out in the ops channel if VS Code crashes persist after completing all remediation steps.

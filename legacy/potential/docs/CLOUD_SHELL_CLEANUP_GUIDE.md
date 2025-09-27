# Cloud Shell Cleanup & Verification Checklist

Use this when you want to prove the Google Cloud Shell environment is clean and our truth scripts remain intact.

## 1. Launch Cloud Shell
1. Open https://console.cloud.google.com/
2. Click the Cloud Shell icon (top-right) and wait for the terminal prompt.
3. Confirm you are in your home directory (`~`). Run:
   ```bash
   pwd
   ```

## 2. Pull the latest scripts (if needed)
If the repo is not present in Cloud Shell or is stale, clone/refresh the Liv Hana SoT repository:
```bash
cd ~
rm -rf LivHana-SoT
git clone https://github.com/RND-Technology/LivHana-SoT.git
```
(Use the SSH URL if your keys are configured.)

## 3. Run the cleanup utility
The repository now ships with `scripts/cloudshell_cleanup.sh`. Execute it to capture inventories and disk usage logs:
```bash
cd ~/LivHana-SoT
bash scripts/cloudshell_cleanup.sh
```
- Outputs live under `~/livhana_cleanup/logs/` with timestamped filenames:
  - `ls_home_<timestamp>.log` — top-level listing
  - `find_home_<timestamp>.log` — recursive listing (max depth 3)
  - `top50_sizes_<timestamp>.log` — largest files/directories
  - `hidden_files_<timestamp>.log` — hidden files in `$HOME`

Verify the script finishes with `✅ Cleanup scan finished.`

### Optional: Nuke loose files
If you want to delete everything in `$HOME` except truth scripts, rerun with:
```bash
bash scripts/cloudshell_cleanup.sh --nuke
```
This preserves:
- `.livhana_absolute_truth.sh`
- Standard shell dotfiles (`.bashrc`, `.profile`, `.zshrc`, `.bash_history`)
- SSH and git configuration
- Any `*.json`, `*.yaml`, `*.yml`, `*.env`, `*.key`, `*.pem` files
- Existing `livhana_cleanup` logs

## 4. Review & archive proof
1. Inspect the logs (example):
   ```bash
   less ~/livhana_cleanup/logs/top50_sizes_<timestamp>.log
   ```
2. (Recommended) Upload the log directory to the repo or attach to the ChangeLog entry.
3. Update status documents:
   - Check off the “Cloud Shell cleanup script verified” item in `LivHana-SoT/CURRENT_STATUS.md` (or the relevant status file) with date/time and log path.

## 5. Next steps
- After verification, commit or share the relevant log artifact so auditors can confirm the cleanup.
- Run this utility again whenever a new Cloud Shell session is spun up.

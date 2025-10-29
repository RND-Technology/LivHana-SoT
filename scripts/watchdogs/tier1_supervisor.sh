#!/usr/bin/env bash
# Tier-1 Supervisor - Consolidated Master Watchdog (Principle of One)
# Replaces: boot_script_auto_commit.sh, dependency_auto_save.sh, universal_auto_save.sh, boot_deps_master.sh
# Tracks ALL tier-1 boot dependencies with 60s intervals + jitter
# Created: 2025-10-29 by Liv Hana Trinity (Five-Agent Architecture)

set -euo pipefail
shopt -s nullglob

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MANIFEST="$ROOT/config/tier1_watchdog.json"
STATE_FILE="$ROOT/tmp/tier1_supervisor.state"
STATUS_FILE="$ROOT/tmp/watchdog_status.json"
LOCK_FILE="$ROOT/tmp/tier1_supervisor.lock"
CHECK_INTERVAL=60
JITTER=3

mkdir -p "$ROOT/tmp" "$ROOT/logs" "$ROOT/config"

# Lockfile enforcement (single instance only)
exec 200>"$LOCK_FILE"
flock -n 200 || { echo "ERROR: Another supervisor instance running (PID $(cat "$LOCK_FILE" 2>/dev/null || echo unknown))"; exit 1; }
echo $$ > "$LOCK_FILE"

# Load manifest or create default
if [[ ! -f "$MANIFEST" ]]; then
  cat > "$MANIFEST" <<'EOF'
{
  "boot_scripts": ["START.sh", "TIER1_BOOT_LOCK_3_AGENTS_24_7.sh"],
  "vscode_settings": [".vscode/settings.json"],
  "package_files": ["**/package.json", "**/package-lock.json"],
  "script_dirs": ["scripts/**/*.sh", "scripts/**/*.py", "scripts/**/*.js", "scripts/**/*.ts"],
  "agent_registry": ["tmp/agent_status/shared/agent_registry.json"],
  "exclude_patterns": ["**/node_modules/**", "**/backups/**", "**/.git/**", "**/tmp/**", "**/logs/**"]
}
EOF
fi

# Expand manifest patterns to file list
expand_manifest() {
  python3 - "$ROOT" "$MANIFEST" <<'PY'
import json, sys, pathlib

root = pathlib.Path(sys.argv[1])
manifest = json.loads(pathlib.Path(sys.argv[2]).read_text())
files = set()

def matches_exclude(path, excludes):
    p = str(path)
    return any(pathlib.Path(p).match(ex.replace('**/', '')) or ex in p for ex in excludes)

excludes = manifest.get("exclude_patterns", [])

# Direct paths
for key in ["boot_scripts", "vscode_settings", "agent_registry"]:
    for pattern in manifest.get(key, []):
        for match in root.glob(pattern):
            if match.is_file() and not matches_exclude(match, excludes):
                files.add(str(match))

# Glob patterns
for key in ["package_files", "script_dirs"]:
    for pattern in manifest.get(key, []):
        for match in root.glob(pattern):
            if match.is_file() and not matches_exclude(match, excludes):
                files.add(str(match))

for f in sorted(files):
    print(f)
PY
}

# Initialize state with file hashes
init_state() {
  > "$STATE_FILE"
  local count=0
  while IFS= read -r file; do
    [[ -f "$file" ]] || continue
    local hash=$(shasum -a 256 "$file" 2>/dev/null | awk '{print $1}')
    echo "$file:$hash" >> "$STATE_FILE"
    ((count++))
  done < <(expand_manifest)
  echo "$count"
}

# Git guard: selective staging based on changes
git_guard() {
  local changes=()
  while IFS= read -r file; do
    [[ -f "$file" ]] || continue
    local current=$(shasum -a 256 "$file" 2>/dev/null | awk '{print $1}')
    local stored=$(grep "^${file}:" "$STATE_FILE" 2>/dev/null | cut -d: -f2-)
    if [[ "$current" != "$stored" ]]; then
      changes+=("$file")
      if grep -q "^${file}:" "$STATE_FILE" 2>/dev/null; then
        sed -i.bak "s|^${file}:.*|${file}:${current}|" "$STATE_FILE" 2>/dev/null
      else
        echo "${file}:${current}" >> "$STATE_FILE"
      fi
    fi
  done < <(expand_manifest)

  if [[ ${#changes[@]} -gt 0 ]]; then
    cd "$ROOT"
    for file in "${changes[@]}"; do
      git add "$file" 2>/dev/null || true
    done

    if ! git diff --cached --quiet 2>/dev/null; then
      local msg="🔄 AUTO: Tier-1 boot dependencies update

Changed files: ${#changes[@]}
Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')

Co-Authored-By: Claude <noreply@anthropic.com>"

      git commit -m "$msg" 2>/dev/null || true
      git push origin "$(git branch --show-current)" 2>/dev/null || true
    fi
  fi

  echo "${#changes[@]}"
}

# Dependency guard: npm install only when package.json changes
dependency_guard() {
  local updated=0
  while IFS= read -r pkg; do
    [[ -f "$pkg" ]] || continue
    local dir=$(dirname "$pkg")
    local current=$(shasum -a 256 "$pkg" 2>/dev/null | awk '{print $1}')
    local stored=$(grep "^${pkg}:" "$STATE_FILE" 2>/dev/null | cut -d: -f2-)

    if [[ "$current" != "$stored" && -f "$dir/package.json" ]]; then
      cd "$dir"
      npm install --package-lock-only --no-audit --no-fund >/dev/null 2>&1 && ((updated++)) || true
      cd "$ROOT"
    fi
  done < <(expand_manifest | grep "package.json$")
  echo "$updated"
}

# Status guard: update consolidated metrics JSON
status_guard() {
  local changed_count=$1
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local commit_hash=$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo "null")
  local tracked=$(wc -l < "$STATE_FILE" 2>/dev/null || echo 0)

  cat > "$STATUS_FILE" <<EOF
{
  "supervisor": "tier1",
  "last_check": "$timestamp",
  "files_tracked": $tracked,
  "last_commit": "$commit_hash",
  "changed_files_count": $changed_count,
  "interval_seconds": $CHECK_INTERVAL,
  "pid": $$,
  "uptime_seconds": $SECONDS
}
EOF
}

# Main loop
main() {
  if [[ ! -f "$STATE_FILE" ]]; then
    local count=$(init_state)
    echo "🔄 TIER-1 SUPERVISOR - 60s intervals - Protecting $count files"
  else
    local count=$(wc -l < "$STATE_FILE")
    echo "🔄 TIER-1 SUPERVISOR - 60s intervals - Protecting $count files"
  fi

  while true; do
    local dep_updates=$(dependency_guard)
    local changed_count=$(git_guard)
    status_guard "$changed_count"

    [[ $changed_count -gt 0 ]] && echo "[$(date '+%H:%M:%S')] Changed: $changed_count file(s), Deps: $dep_updates"

    sleep $((CHECK_INTERVAL + RANDOM % JITTER))
  done
}

trap 'rm -f "$LOCK_FILE"; echo "Supervisor stopping"; exit 0' SIGTERM SIGINT
main

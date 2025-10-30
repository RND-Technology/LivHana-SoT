#!/usr/bin/env bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1


# shellcheck source=automation/scripts/common.sh
source "$(dirname "$0")/common.sh"

IFS=',' read -r -a repos <<< "${SOVEREIGN_TRINITY:-LivHana-SoT,LivHana-Kinetic,LivHana-Potential}"

for repo in "${repos[@]}"; do
  repo_path="$TRINITY_ROOT/$repo"
  if [ ! -d "$repo_path/.git" ]; then
    log_warn "Skipping $repo – git repository not found at $repo_path"
    continue
  fi
  log_info "Checking repository: $repo"
  if git -C "$repo_path" remote >/dev/null 2>&1; then
    if ! git -C "$repo_path" remote update >/dev/null 2>&1; then
      log_warn "Failed to contact remote for $repo (network or auth issue)."
    fi
  fi
  check_repo_clean "$repo_path"
  log_info "Latest commit: $(git -C "$repo_path" --no-pager log -1 --pretty='%h %s')"

done

log_info "Trinity repository sync check complete"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

#!/usr/bin/env bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1


source "$(dirname "$0")/common.sh"

log_info "Checking Trinity repository status"
IFS=',' read -r -a repos <<< "${SOVEREIGN_TRINITY:-LivHana-SoT,LivHana-Kinetic,LivHana-Potential}"
for repo in "${repos[@]}"; do
  repo_path="$TRINITY_ROOT/$repo"
  if [ ! -d "$repo_path" ]; then
    log_warn "Repository directory missing: $repo_path"
    continue
  fi
  log_info "$repo_path exists"
  check_repo_clean "$repo_path"

done

log_info "Trinity status check complete"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

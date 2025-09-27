#!/usr/bin/env bash
set -euo pipefail

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

#!/usr/bin/env bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1


source "$(dirname "$0")/common.sh"

log_info "Updating highnoon/context_manifest.yaml"

ensure_dir "$ROOT_DIR/highnoon"

IFS=',' read -r -a repos <<< "${SOVEREIGN_TRINITY:-LivHana-SoT,LivHana-Kinetic,LivHana-Potential}"

{
  echo "version: 1.0"
  echo "timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "repositories:"
  for repo in "${repos[@]}"; do
    repo_path="$TRINITY_ROOT/$repo"
    status="missing"
    if [ -d "$repo_path" ]; then
      status="present"
    fi
    printf "  - name: %s\n" "$repo"
    printf "    path: %s\n" "$repo_path"
    printf "    status: %s\n" "$status"
  done
} > "$ROOT_DIR/highnoon/context_manifest.yaml"

log_info "Context manifest refreshed"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

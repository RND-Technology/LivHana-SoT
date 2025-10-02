#!/usr/bin/env bash
# Shared helper functions for Liv Hana automation scripts.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TRINITY_ROOT="$(cd "$ROOT_DIR/.." && pwd)"

log_info() {
  printf '\033[1;34m[INFO]\033[0m %s\n' "$*"
}

log_warn() {
  printf '\033[1;33m[WARN]\033[0m %s\n' "$*" >&2
}

log_error() {
  printf '\033[1;31m[ERROR]\033[0m %s\n' "$*" >&2
}

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    log_error "Required command '$cmd' not found in PATH"
    return 1
  fi
}

ensure_dir() {
  local dir="$1"
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    log_info "Created directory: $dir"
  fi
}

check_repo_clean() {
  local repo_path="$1"
  if [ ! -d "$repo_path/.git" ]; then
    log_warn "No git repo found at $repo_path"
    return 0
  fi
  if git -C "$repo_path" status --short | grep -q '.'; then
    log_warn "Repository $repo_path has uncommitted changes"
  else
    log_info "Repository $repo_path is clean"
  fi
}


# Last updated: 2025-10-02

# Last optimized: 2025-10-02

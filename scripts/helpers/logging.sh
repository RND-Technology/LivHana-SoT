#!/usr/bin/env bash
# scripts/helpers/logging.sh
# Provides standardized logging functions.

# Include guard: If this variable is already set, we've already sourced this file.
if [[ -n "${LOGGING_SH_SOURCED:-}" ]]; then
  return 0
fi
readonly LOGGING_SH_SOURCED=1

set -euo pipefail

# ANSI color codes
# shellcheck disable=SC2034
readonly NC='\033[0m'
# shellcheck disable=SC2034
readonly RED='\033[0;31m'
# shellcheck disable=SC2034
readonly GREEN='\033[0;32m'
# shellcheck disable=SC2034
readonly YELLOW='\033[0;33m'
# shellcheck disable=SC2034
readonly BLUE='\033[0;34m'

info() {
  echo -e "${BLUE}[INFO]${NC} $*"
}

warning() {
  echo -e "${YELLOW}[WARN]${NC} $*" >&2
}

error() {
  echo -e "${RED}[ERROR]${NC} $*" >&2
}

success() {
  echo -e "${GREEN}[SUCCESS]${NC} $*"
}

# Allow sourcing without execution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  error "This script is a library and should be sourced, not executed directly."
  exit 1
fi

#!/usr/bin/env bash
# Common helper library for verification scripts.
# Source this in other check_*.sh scripts:  . "$(dirname "$0")/lib_common.sh"
set -euo pipefail

COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[1;33m'
COLOR_RESET='\033[0m'

# Emit a JSON line (key=value pairs turned into JSON) – simplistic.
json_kv() {
  # Usage: json_kv "key" "value" ...
  local total=$#
  if (( total % 2 != 0 )); then
    echo "json_kv requires even number of args" >&2
    return 1
  fi
  printf '{'
  local i=1
  while (( i <= total )); do
    local k v
    k="${!i}"; ((i++))
    v="${!i}"; ((i++))
    printf '"%s":"%s"' "$(echo "$k" | sed 's/"/\\"/g')" "$(echo "$v" | sed 's/"/\\"/g')"
    (( i <= total )) && printf ','
  done
  printf '}\n'
}

ok()    { printf "%b[OK]%b %s\n" "$COLOR_GREEN" "$COLOR_RESET" "${1:-}"; }
warn()  { printf "%b[WARN]%b %s\n" "$COLOR_YELLOW" "$COLOR_RESET" "${1:-}"; }
fail()  { printf "%b[FAIL]%b %s\n" "$COLOR_RED" "$COLOR_RESET" "${1:-}"; }

# Require that we are at repo root (heuristic: expect README.md and docs/)
assert_repo_root() {
  if [[ ! -f README.md || ! -d docs ]]; then
    fail "Not at repo root (README.md or docs/ missing)"
    exit 90
  fi
}

# Simple dependency check
need_cmd() {
  local c="${1:?cmd}"
  command -v "$c" >/dev/null 2>&1 || { fail "Missing required command: $c"; exit 91; }
}

# Exit codes (centralized)
# 0 = success
# 1–20 = generic script logic errors
# 30 = validation failure (counts as CI fail)
# 90+ = environment/precondition errors

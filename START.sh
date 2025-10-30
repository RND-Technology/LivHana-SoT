#!/usr/bin/env bash
# LivHana System of Truth - Modular Boot (Principle of One)
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$ROOT_DIR/scripts/boot/lib/environment_setup.sh"
source "$ROOT_DIR/scripts/boot/lib/service_management.sh"
source "$ROOT_DIR/scripts/boot/lib/agent_management.sh"
source "$ROOT_DIR/scripts/boot/lib/validation.sh"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎖️  LivHana System of Truth - Marine Corps Precision"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

main() {
  # Pre-flight validation (BEFORE starting anything)
  if ! preflight_checks; then
    echo ""
    echo "❌ Pre-flight checks failed - aborting startup"
    exit 1
  fi

  echo ""
  setup_environment "$ROOT_DIR"
  start_services "$ROOT_DIR"
  spawn_agents "$ROOT_DIR"
  validate_system

  echo ""
  echo "✅ LivHana Ready - Mode: $LIV_MODE"
  echo "🛑 Stop: bash STOP.sh"
}

main "$@"

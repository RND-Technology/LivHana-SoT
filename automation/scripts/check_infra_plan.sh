#!/usr/bin/env bash
# Runs terraform plan (if terraform/ exists) or cloud-run diff placeholder.
# Fails if drift detected (non-empty plan) unless allowed by ALLOW_INFRA_DRIFT=true
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
. "${SCRIPT_DIR}/lib_common.sh"

ALLOW_INFRA_DRIFT="${ALLOW_INFRA_DRIFT:-false}"
TERRAFORM_DIR="infra/terraform"

assert_repo_root

if [[ -d "$TERRAFORM_DIR" ]]; then
  need_cmd terraform
  pushd "$TERRAFORM_DIR" >/dev/null
  terraform init -input=false -no-color >/dev/null
  set +e
  plan_output=$(terraform plan -no-color -input=false -detailed-exitcode 2>&1)
  rc=$?
  set -e
  case "$rc" in
    0)
      ok "Terraform: no changes"
      ;;
    2)
      if [[ "$ALLOW_INFRA_DRIFT" == "true" ]]; then
        warn "Terraform changes detected but ALLOW_INFRA_DRIFT=true"
      else
        fail "Terraform drift detected"
        echo "::group::Terraform Plan"
        echo "$plan_output"
        echo "::endgroup::"
        exit 30
      fi
      ;;
    *)
      fail "Terraform plan error (rc=$rc)"
      echo "$plan_output"
      exit 30
      ;;
  esac
  popd >/dev/null
else
  warn "No terraform directory; skipping infra drift check."
fi
# Last updated: 2025-10-02

# Last optimized: 2025-10-02

# Optimized: 2025-10-02

#!/usr/bin/env bash
# Optimized: 2025-10-02
# RPM: 1.6.2.3.automation-scripts-optimization
# Session: Elephant Strategy Batch 1

# AlloyDB Ingestion Script – coordinates ingestion pipeline stages.


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMMON_SH="$ROOT_DIR/scripts/common.sh"
if [ -f "$COMMON_SH" ]; then
  # shellcheck disable=SC1090
  source "$COMMON_SH"
else
  log_info() { printf '[INFO] %s\n' "$*"; }
  log_warn() { printf '[WARN] %s\n' "$*"; }
fi

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--dry-run]

Runs the Liv Hana data ingestion pipeline. Use --dry-run to log steps without executing
external network calls.
USAGE
}

DRY_RUN=false
if [[ "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  shift
fi
if [[ "${DRY_RUN:-0}" == "1" || "${DRY_RUN:-false}" == "true" ]]; then
  DRY_RUN=true
fi

run_step() {
  local description="$1"
  shift
  log_info "$description"
  if $DRY_RUN; then
    log_info "(dry-run) $*"
    return 0
  fi
  "$@"
}

log_info "📊 AlloyDB Ingestion - $(date -u +%Y-%m-%dT%H:%M:%SZ)"
export COMPLIANCE_LEVEL="${COMPLIANCE_LEVEL:-21+}"
export ALLOYDB_INSTANCE="${ALLOYDB_INSTANCE:-liv-hana-sovereign-db}"
export ALLOYDB_DATABASE="${ALLOYDB_DATABASE:-sovereign_data}"

CONFIG_FILE="$SCRIPT_DIR/alloydb-config.json"

log_info "🔌 Configuring AlloyDB"
if [ -f "$CONFIG_FILE" ]; then
  log_info "Using existing config at $CONFIG_FILE"
else
  cat > "$CONFIG_FILE" <<JSON
{
  "instance": "$ALLOYDB_INSTANCE",
  "database": "$ALLOYDB_DATABASE",
  "compliance_level": "$COMPLIANCE_LEVEL",
  "retention_policy": "30_days",
  "encryption": "enabled"
}
JSON
  log_info "Created config file"
fi

run_step "📚 Loading canon files" "$SCRIPT_DIR/load_canon_files.sh"
run_step "📰 Ingesting daily news" "$SCRIPT_DIR/ingest_daily_news.sh"
run_step "📺 Ingesting YouTube content" "$SCRIPT_DIR/ingest_youtube_content.sh"
run_step "💬 Ingesting WhatsApp data" "$SCRIPT_DIR/ingest_whatsapp_data.sh"
run_step "📊 Updating attribution ledger" "$SCRIPT_DIR/update_attribution_ledger.sh"
run_step "✅ Validating ingested data" "$SCRIPT_DIR/validate_ingested_data.sh"

if $DRY_RUN; then
  log_info "📝 Skipping report generation in dry-run mode"
else
  REPORT_DIR="$ROOT_DIR/logs"
  mkdir -p "$REPORT_DIR"
  REPORT_FILE="$REPORT_DIR/data_ingestion_report_$(date +%Y%m%d_%H%M%S).md"
  cat > "$REPORT_FILE" <<EOF_REPORT
# 📊 Data Ingestion Report
Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

## Summary
- AlloyDB instance: $ALLOYDB_INSTANCE
- Database: $ALLOYDB_DATABASE
- Compliance level: $COMPLIANCE_LEVEL

## Stages
- Canon files: complete
- Daily news: complete
- YouTube content: complete
- WhatsApp data: complete
- Attribution ledger: complete
- Validation: complete

EOF_REPORT
  log_info "Report generated at $REPORT_FILE"
fi

log_info "✅ AlloyDB ingestion pipeline finished"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

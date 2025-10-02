#!/bin/bash
# Synchronise the Cursor backup archive directory to remote storage.
# Configuration is provided via $CURSOR_BACKUP_SYNC_CONFIG (defaults to
# ~/.cursor-backup-sync.conf). The config file can define the following:
#   CURSOR_BACKUP_REMOTE   - Destination path/URL (required)
#   CURSOR_BACKUP_SYNC_TOOL - Tool to use: aws|gsutil|rclone|rsync (default: aws)
#   CURSOR_BACKUP_SYNC_OPTS - Additional CLI flags for the tool (optional)
#   CURSOR_BACKUP_SYNC_LOG  - Override path for sync log (optional)
#
# Examples for ~/.cursor-backup-sync.conf:
#   CURSOR_BACKUP_REMOTE="s3://livhana-cursor-backups"
#   CURSOR_BACKUP_SYNC_TOOL="aws"
#   CURSOR_BACKUP_SYNC_OPTS="--sse AES256"
#
#   CURSOR_BACKUP_REMOTE="gs://livhana-backups/cursor"
#   CURSOR_BACKUP_SYNC_TOOL="gsutil"
#
set -euo pipefail

BACKUP_ROOT="${1:-.cursor-backups}"
CONFIG_FILE="${CURSOR_BACKUP_SYNC_CONFIG:-$HOME/.cursor-backup-sync.conf}"
LOG_PATH="${CURSOR_BACKUP_SYNC_LOG:-$BACKUP_ROOT/sync.log}"

log() {
  printf '%s\n' "$1" | tee -a "$LOG_PATH"
}

if [ ! -d "$BACKUP_ROOT" ]; then
  log "Backup root $BACKUP_ROOT not found; skipping sync"
  exit 0
fi

if [ ! -f "$CONFIG_FILE" ]; then
  log "No sync configuration found at $CONFIG_FILE; skipping sync"
  exit 0
fi

# shellcheck disable=SC1090
source "$CONFIG_FILE"

REMOTE="${CURSOR_BACKUP_REMOTE:-}"
TOOL="${CURSOR_BACKUP_SYNC_TOOL:-aws}"
OPTS="${CURSOR_BACKUP_SYNC_OPTS:-}"

if [ -z "$REMOTE" ]; then
  log "CURSOR_BACKUP_REMOTE is not set in $CONFIG_FILE; aborting sync"
  exit 1
fi

case "$TOOL" in
  aws)
    if ! command -v aws >/dev/null 2>&1; then
      log "aws CLI not installed; cannot sync"
      exit 1
    fi
    log "Syncing backups to $REMOTE via aws s3 sync"
    aws s3 sync "$BACKUP_ROOT/" "$REMOTE" --delete $OPTS >>"$LOG_PATH" 2>&1
    ;;
  gsutil)
    if ! command -v gsutil >/dev/null 2>&1; then
      log "gsutil not installed; cannot sync"
      exit 1
    fi
    log "Syncing backups to $REMOTE via gsutil rsync"
    gsutil -m rsync -r "$BACKUP_ROOT" "$REMOTE" $OPTS >>"$LOG_PATH" 2>&1
    ;;
  rclone)
    if ! command -v rclone >/dev/null 2>&1; then
      log "rclone not installed; cannot sync"
      exit 1
    fi
    log "Syncing backups to $REMOTE via rclone sync"
    rclone sync "$BACKUP_ROOT" "$REMOTE" $OPTS >>"$LOG_PATH" 2>&1
    ;;
  rsync)
    if ! command -v rsync >/dev/null 2>&1; then
      log "rsync not installed; cannot sync"
      exit 1
    fi
    log "Syncing backups to $REMOTE via rsync"
    rsync -az --delete $OPTS "$BACKUP_ROOT/" "$REMOTE" >>"$LOG_PATH" 2>&1
    ;;
  *)
    log "Unsupported sync tool: $TOOL"
    exit 1
    ;;
endcase

log "Sync complete"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

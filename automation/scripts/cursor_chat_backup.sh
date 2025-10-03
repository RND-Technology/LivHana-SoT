#!/bin/bash
# Cursor chat backup helper. Copies relevant Cursor data into a timestamped archive
# so chat history and related context are preserved outside the IDE.

set -euo pipefail

BACKUP_ROOT="${1:-.cursor-backups}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DEST_DIR="$BACKUP_ROOT/chats/$TIMESTAMP"
LOG_FILE="$DEST_DIR/backup.log"
ARCHIVE_PATH=""

CURSOR_BASE="$HOME/Library/Application Support/Cursor"
WORKSPACE_STORAGE="$CURSOR_BASE/User/workspaceStorage"
LOGS_DIR="$CURSOR_BASE/logs"
AGENT_DIR="$HOME/.local/share/cursor-agent"
ROOT_ROUTE="/Users/jesseniesen/LivHana-Trinity-Local/.cursor"

mkdir -p "$DEST_DIR"

note() {
  printf '%s\n' "$1" | tee -a "$LOG_FILE"
}

copy_path() {
  local src="$1"
  local dst="$DEST_DIR/$2"

  if [ -e "$src" ]; then
    mkdir -p "$(dirname "$dst")"
    rsync -a "$src" "$dst" >/dev/null 2>&1 || cp -R "$src" "$dst"
    note "Copied: $src -> $dst"
  else
    note "Missing: $src"
  fi
}

note "Backing up Cursor data at $TIMESTAMP"

copy_path "$WORKSPACE_STORAGE" "workspaceStorage"
copy_path "$LOGS_DIR" "logs"
copy_path "$AGENT_DIR" "cursor-agent"
copy_path "$ROOT_ROUTE" "local-cursor"

MANIFEST="$DEST_DIR/manifest.txt"
{
  echo "Backup Timestamp: $TIMESTAMP"
  echo "Backup Destination: $DEST_DIR"
  echo "Workspace Storage: $WORKSPACE_STORAGE"
  echo "Logs Directory: $LOGS_DIR"
  echo "Cursor Agent: $AGENT_DIR"
  echo "Local Cursor Root: $ROOT_ROUTE"
} > "$MANIFEST"

# Compress the backup folder to reduce footprint and make transport easier.
if command -v zip >/dev/null 2>&1; then
  ARCHIVE_PATH="$BACKUP_ROOT/chats/${TIMESTAMP}.zip"
  if (cd "$BACKUP_ROOT/chats" && zip -qr "${TIMESTAMP}.zip" "$TIMESTAMP") >>"$LOG_FILE" 2>&1; then
    external_log="$BACKUP_ROOT/chats/${TIMESTAMP}.log"
    cp "$LOG_FILE" "$external_log"
    LOG_FILE="$external_log"
    note "Compressed archive created at $ARCHIVE_PATH"
    rm -rf "$DEST_DIR"
  else
    note "Failed to create zip archive. Leaving directory in place."
    ARCHIVE_PATH="$DEST_DIR"
  fi
else
  ARCHIVE_PATH="$BACKUP_ROOT/chats/${TIMESTAMP}.tar.gz"
  if tar -czf "${ARCHIVE_PATH}" -C "$BACKUP_ROOT/chats" "$TIMESTAMP" >>"$LOG_FILE" 2>&1; then
    external_log="$BACKUP_ROOT/chats/${TIMESTAMP}.log"
    cp "$LOG_FILE" "$external_log"
    LOG_FILE="$external_log"
    note "Compressed archive created at $ARCHIVE_PATH"
    rm -rf "$DEST_DIR"
  else
    note "Failed to create tar archive. Leaving directory in place."
    ARCHIVE_PATH="$DEST_DIR"
  fi
fi

note "Backup complete. Archive stored at $ARCHIVE_PATH"

# Optional off-site sync. Users can place a custom sync script at
# automation/scripts/sync_cursor_backups.sh or set CHAT_BACKUP_SYNC_COMMAND.
SYNC_COMMAND=${CHAT_BACKUP_SYNC_COMMAND:-}
SYNC_SCRIPT="${CHAT_BACKUP_SYNC_SCRIPT:-automation/scripts/sync_cursor_backups.sh}"

if [ -n "$SYNC_COMMAND" ]; then
  note "Running custom sync command: $SYNC_COMMAND"
  if eval "$SYNC_COMMAND '$ARCHIVE_PATH'" >>"$LOG_FILE" 2>&1; then
    note "Custom sync command completed successfully"
  else
    note "Custom sync command failed (see log for details)"
  fi
elif [ -x "$SYNC_SCRIPT" ]; then
  if "$SYNC_SCRIPT" "$BACKUP_ROOT" >>"$LOG_FILE" 2>&1; then
    note "Sync script $SYNC_SCRIPT completed successfully"
  else
    note "Sync script $SYNC_SCRIPT failed (see log for details)"
  fi
else
  note "No sync command or script configured. Skipping off-site sync."
fi

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

# Optimized: 2025-10-02

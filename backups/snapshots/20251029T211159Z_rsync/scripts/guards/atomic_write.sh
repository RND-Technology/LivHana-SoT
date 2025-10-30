#!/usr/bin/env bash
# Atomic write helper: reads stdin and writes to target file safely
# Usage: echo "content" | atomic_write.sh <target_path>

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <target_path>" >&2
  exit 64
fi

TARGET="$1"
TMP="${TARGET}.tmp.$$"
DIR="$(dirname "$TARGET")"

mkdir -p "$DIR"

# Read from stdin and write to temp file
cat > "$TMP"

# Atomic rename
mv -f "$TMP" "$TARGET"

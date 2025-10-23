#!/usr/bin/env bash
# Atomic write helper: reads stdin and writes to target file safely.
# Usage: atomic_write.sh <target_path>

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <target_path>" >&2
  exit 64
fi

TARGET="$1"
TMP="$(mktemp "${TARGET}.XXXXXX")"
LOCKDIR="$(dirname "$TARGET")"
LOCKFILE="$LOCKDIR/.$(basename "$TARGET").lock"

mkdir -p "$LOCKDIR"

python3 - "$TARGET" "$TMP" "$LOCKFILE" <<'PY'
import fcntl, os, shutil, sys

target, tmp, lockfile = sys.argv[1:4]

fd = os.open(lockfile, os.O_CREAT | os.O_RDWR)
try:
    fcntl.flock(fd, fcntl.LOCK_EX)
    data = sys.stdin.buffer.read()
    with open(tmp, "wb") as tmp_fp:
        tmp_fp.write(data)
    os.makedirs(os.path.dirname(target), exist_ok=True)
    shutil.move(tmp, target)
finally:
    fcntl.flock(fd, fcntl.LOCK_UN)
    os.close(fd)
PY

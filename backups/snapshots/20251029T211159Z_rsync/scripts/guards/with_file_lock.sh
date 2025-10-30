#!/usr/bin/env bash
# Usage: with_file_lock.sh <lockfile> <command...>

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <lockfile> <command...>" >&2
  exit 64
fi

LOCKFILE="$1"
shift

python3 - "$LOCKFILE" "$@" <<'PY'
import fcntl, os, subprocess, sys

lockfile = sys.argv[1]
cmd = sys.argv[2:]

fd = os.open(lockfile, os.O_CREAT | os.O_RDWR)
try:
    fcntl.flock(fd, fcntl.LOCK_EX)
    result = subprocess.run(cmd)
    sys.exit(result.returncode)
finally:
    fcntl.flock(fd, fcntl.LOCK_UN)
    os.close(fd)
PY

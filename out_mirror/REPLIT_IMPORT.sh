#!/usr/bin/env bash
set -euo pipefail
DEST="/home/runner/app/out"
TARFILE="${1:-}"
if [ -z "${TARFILE}" ]; then
  TARFILE="$(ls -t replit_out_*.tar.gz | head -n 1)"
fi
if [ ! -f "$TARFILE" ]; then
  echo "Tarball not found: $TARFILE"
  exit 1
fi
mkdir -p "/home/runner/app"
tar -xzf "$TARFILE" -C "/home/runner/app"
mkdir -p "$DEST"
echo "Extracted to /home/runner/app; listing $DEST:"
ls -la "$DEST"
required=(ingestion.md index.json gantt.md kanban.json pdr_additions.md adr_additions.md cockpit_deltas.md rpm_weekly.md repo_reconciliation.md commit_suggestions.md fallacy_risk_register.md cockpit_blueprints.md RPM_THIS_WEEK.md email_sms_sequences.md activations.md)
missing=0
for f in "${required[@]}"; do
  if [ ! -f "$DEST/$f" ]; then
    echo "MISSING: $DEST/$f"
    missing=$((missing+1))
  fi
done
echo "Missing count: $missing"
if [ "$missing" -eq 0 ]; then
  echo "Replit mirror verified."
fi

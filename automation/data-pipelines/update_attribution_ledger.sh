#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

LEDGER_DIR="$ROOT_DIR/logs"
LEDGER_FILE="$LEDGER_DIR/attribution-ledger.jsonl"

mkdir -p "$LEDGER_DIR"

touch "$LEDGER_FILE"

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) - ledger_refresh" >> "$LEDGER_FILE"

printf 'Updated attribution ledger (%s)\n' "$LEDGER_FILE"

# Last updated: 2025-10-02

# Last optimized: 2025-10-02

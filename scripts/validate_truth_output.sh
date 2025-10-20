#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
OUT="$ROOT/data/truth_outputs/truth_output.json"
SCHEMA="$ROOT/schemas/truth_output.schema.json"
if [ ! -s "$OUT" ]; then
  echo "❌ truth_output.json missing or empty" >&2
  exit 1
fi
python3 - <<PYTHON
import json
from jsonschema import validate
schema = json.load(open("$SCHEMA"))
data = json.load(open("$OUT"))
validate(instance=data, schema=schema)
print("✅ TRUTH output schema validation passed")
PYTHON

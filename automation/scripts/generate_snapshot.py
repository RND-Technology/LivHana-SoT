#!/usr/bin/env python3
"""
Generates a snapshot JSON file under docs/snapshots/YYYY/MM/.
Relies on lightweight placeholder metrics; extend when real telemetry available.
"""
from __future__ import annotations
import json, os, sys, datetime, pathlib, random

BASE = pathlib.Path("docs/snapshots")
TARGET_WORKFLOW_COUNT = int(os.environ.get("WORKFLOW_TARGET_COUNT", "25"))

def load_runtime_state() -> dict:
    f = pathlib.Path("automation/swarm/runtime_state.json")
    if f.exists():
        try:
            return json.loads(f.read_text())
        except Exception:
            return {}
    return {}

def approximate_router_metrics(state: dict) -> dict:
    runs = state.get("recent_runs", [])
    latencies = [r.get("latency_ms", 0) for r in runs if isinstance(r, dict)]
    if not latencies:
        return {"runs_ok": 0, "runs_fail": 0, "p95_ms": 0}
    lat_sorted = sorted(latencies)
    p95_index = max(0, int(round(0.95 * (len(lat_sorted)-1))))
    p95 = lat_sorted[p95_index]
    fails = len([r for r in runs if not r.get("ok", True)])
    oks = len(runs) - fails
    return {"runs_ok": oks, "runs_fail": fails, "p95_ms": p95}

def random_placeholder() -> float:
    return round(random.uniform(0.75, 0.98), 3)

def main():
    now = datetime.datetime.utcnow()
    y_path = BASE / f"{now.year:04d}" / f"{now.month:02d}"
    y_path.mkdir(parents=True, exist_ok=True)
    runtime = load_runtime_state()
    router = approximate_router_metrics(runtime)

    snapshot = {
        "version": "1.0",
        "timestamp_utc": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "orchestration": router,
        "models": {
            "gpt": {"calls": 0},
            "claude": {"calls": 0},
            "gemini": {"calls": 0},
            "deepseek": {"calls": 0}
        },
        "revenue_proxy": {
            "checkout_success_rate": random_placeholder()
        },
        "compliance": {
            "age_gate_pass": True,
            "coa_pass": True
        },
        "workflow_coverage": {
            "defined": 0,
            "verified": 0,
            "target": TARGET_WORKFLOW_COUNT
        },
        "infra": {
            "drift": False
        },
        "risk_flags": []
    }

    filename = y_path / f"snapshot_{now.strftime('%Y-%m-%d_%H%MZ')}.json"
    filename.write_text(json.dumps(snapshot, indent=2))
    print(f"Snapshot written: {filename}")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        sys.exit(1)
# Last optimized: 2025-10-02

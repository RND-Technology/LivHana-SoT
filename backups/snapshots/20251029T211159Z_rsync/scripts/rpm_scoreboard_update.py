#!/usr/bin/env python3
import argparse, json, os, glob, time
from typing import Dict, Any, List


def load_json(path: str) -> Dict[str, Any]:
    try:
        with open(path, "r") as f:
            return json.load(f)
    except Exception:
        return {}


def safe_get(dct: Dict[str, Any], path: List[str], default=None):
    cur = dct
    for k in path:
        if not isinstance(cur, dict) or k not in cur:
            return default
        cur = cur[k]
    return cur


def compute_scores(cards_dir: str, cfg: Dict[str, Any]) -> List[Dict[str, Any]]:
    weights = cfg.get("weights", {})
    penalties = cfg.get("guardrail_penalties", {})

    entries: List[Dict[str, Any]] = []

    for path in glob.glob(os.path.join(cards_dir, "*.json")):
        card = load_json(path)
        # Extract core fields
        agent = safe_get(card, ["metadata", "agent"], "unknown")
        model = safe_get(card, ["metadata", "model"], "unknown")
        human = safe_get(card, ["metadata", "human"], "unknown")
        roi_per_day = safe_get(card, ["metrics", "roi_per_day"], 0.0) or 0.0
        time_acc = safe_get(card, ["metrics", "time_accuracy_pct"], 0.0) or 0.0
        cost_acc = safe_get(card, ["metrics", "cost_accuracy_pct"], 0.0) or 0.0
        guardrails = safe_get(card, ["guardrails_status"], {}) or {}

        # Normalize
        roi_norm = max(0.0, float(roi_per_day))
        time_norm = max(0.0, min(1.0, float(time_acc)))
        cost_norm = max(0.0, min(1.0, float(cost_acc)))

        compliance_score = 1.0
        # Deduct penalties for violations
        if guardrails:
            if guardrails.get("age21_violation"):
                compliance_score -= penalties.get("age21_violation", 0)
            if guardrails.get("pii_leak"):
                compliance_score -= penalties.get("pii_leak", 0)
            if guardrails.get("medical_claim"):
                compliance_score -= penalties.get("medical_claim", 0)
            if guardrails.get("secrets_misuse"):
                compliance_score -= penalties.get("secrets_misuse", 0)
        compliance_score = max(0.0, compliance_score)

        # Weighted score
        score = (
            weights.get("roi_per_day", 0.5) * roi_norm +
            weights.get("time_accuracy", 0.2) * time_norm +
            weights.get("cost_accuracy", 0.2) * cost_norm +
            weights.get("guardrail_compliance", 0.1) * compliance_score
        )

        entries.append({
            "score": round(score, 4),
            "roi_per_day": roi_norm,
            "time_accuracy_pct": time_norm,
            "cost_accuracy_pct": cost_norm,
            "compliance": round(compliance_score, 3),
            "agent": agent,
            "model": model,
            "human": human,
            "source": path,
        })

    # Sort high to low
    entries.sort(key=lambda e: e["score"], reverse=True)
    return entries


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--cards_dir", default="data/rpm_outputs")
    ap.add_argument("--config", default="config/scoring_config.json")
    ap.add_argument("--out", default=".claude/rpm_scoreboard.json")
    args = ap.parse_args()

    cfg = load_json(args.config)
    entries = compute_scores(args.cards_dir, cfg)

    out = {
        "generated_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "count": len(entries),
        "leaderboard": entries[: cfg.get("leaderboard", {}).get("max_entries", 100)]
    }

    os.makedirs(os.path.dirname(args.out), exist_ok=True)
    with open(args.out, "w") as f:
        json.dump(out, f, indent=2)
    print(f"Scoreboard written: {args.out} (entries={len(entries)})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

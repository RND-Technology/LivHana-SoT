#!/usr/bin/env python3
import argparse
import json
import os
from datetime import datetime, timedelta, timezone


def parse_iso(ts: str | None) -> datetime | None:
    if not ts:
        return None
    try:
        # Support Z suffix
        if ts.endswith("Z"):
            return datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return datetime.fromisoformat(ts)
    except Exception:
        return None


def safe_str(obj) -> str:
    if obj is None:
        return ""
    try:
        return str(obj)
    except Exception:
        return ""


def extract(jsonl_path: str, minutes: int, out_path: str) -> int:
    start_ts: datetime | None = None
    end_ts: datetime | None = None
    lines: list[str] = []

    with open(jsonl_path, "r", encoding="utf-8", errors="ignore") as f:
        for raw in f:
            try:
                rec = json.loads(raw)
            except Exception:
                continue
            ts = rec.get("timestamp") or rec.get("time")
            dt = parse_iso(ts)
            if dt is None:
                continue
            if start_ts is None:
                start_ts = dt
                end_ts = start_ts + timedelta(minutes=minutes)
            if end_ts is not None and dt > end_ts:
                break

            typ = rec.get("type")
            if typ not in ("user", "assistant"):
                continue

            # prefer nested message object
            message = rec.get("message") or {}
            role = message.get("role") or typ
            content = message.get("content")
            if not content:
                continue
            content_s = safe_str(content).replace("\n", " ")
            lines.append(f"{dt.isoformat()} [{safe_str(role)}]: {content_s}")

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as w:
        w.write("# First 10 minutes – Voice Mode Birth Transcript (UTC)\n\n")
        if start_ts is not None:
            w.write(f"Start: {start_ts.isoformat()}\n")
            w.write(f"End: {(start_ts + timedelta(minutes=minutes)).isoformat()}\n\n")
        for line in lines:
            w.write(line + "\n")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Extract first N minutes from JSONL session log")
    ap.add_argument("--jsonl", required=True)
    ap.add_argument("--minutes", type=int, default=10)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    return extract(args.jsonl, args.minutes, args.out)


if __name__ == "__main__":
    raise SystemExit(main())



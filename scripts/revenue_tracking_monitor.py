#!/usr/bin/env python3
"""
Revenue Tracking Monitor - Three-Flag System
Monitors $1,200/day ROI target across Custom GPT, Slack Bot, Replit PWA
"""

import json
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List

# Revenue targets per flag
TARGETS = {
    "custom_gpt": {
        "daily_target": 300,  # $300/day
        "metric": "queries",
        "unit_price": 0.10,
        "target_volume": 3000,  # 3000 queries/day
    },
    "slack_bot": {
        "daily_target": 500,  # $500/day
        "metric": "team_members",
        "unit_price": 50,  # $50/month per member
        "target_volume": 10,  # 10 team members
    },
    "replit_pwa": {
        "daily_target": 400,  # $400/day
        "metric": "active_users",
        "unit_price": 4,  # $4/month per user
        "target_volume": 100,  # 100 active users
    }
}

TOTAL_DAILY_TARGET = 1200  # $1,200/day
TOTAL_MONTHLY_TARGET = 36000  # $36,000/month
TOTAL_ANNUAL_TARGET = 432000  # $432,000/year

# File paths
TRACKING_DIR = Path("/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/revenue_tracking")
TRACKING_DIR.mkdir(exist_ok=True)

DAILY_LOG = TRACKING_DIR / "daily_revenue_log.jsonl"
SUMMARY_FILE = TRACKING_DIR / "revenue_summary.json"


def log_revenue_event(flag: str, event_type: str, amount: float, metadata: Dict = None):
    """Log a revenue event to the daily log"""
    event = {
        "timestamp": datetime.now().isoformat(),
        "flag": flag,
        "event_type": event_type,
        "amount": amount,
        "metadata": metadata or {}
    }

    with open(DAILY_LOG, "a") as f:
        f.write(json.dumps(event) + "\n")


def calculate_daily_revenue(date: datetime = None) -> Dict:
    """Calculate revenue for a specific date"""
    if date is None:
        date = datetime.now()

    date_str = date.strftime("%Y-%m-%d")

    if not DAILY_LOG.exists():
        return {
            "date": date_str,
            "custom_gpt": 0,
            "slack_bot": 0,
            "replit_pwa": 0,
            "total": 0
        }

    revenue = {
        "date": date_str,
        "custom_gpt": 0,
        "slack_bot": 0,
        "replit_pwa": 0,
        "total": 0
    }

    with open(DAILY_LOG, "r") as f:
        for line in f:
            event = json.loads(line)
            event_date = datetime.fromisoformat(event["timestamp"]).strftime("%Y-%m-%d")

            if event_date == date_str:
                revenue[event["flag"]] += event["amount"]
                revenue["total"] += event["amount"]

    return revenue


def generate_performance_report() -> Dict:
    """Generate comprehensive performance report"""
    today = datetime.now()
    daily_revenue = calculate_daily_revenue(today)

    report = {
        "timestamp": today.isoformat(),
        "date": today.strftime("%Y-%m-%d"),
        "daily_performance": {
            "custom_gpt": {
                "actual": daily_revenue["custom_gpt"],
                "target": TARGETS["custom_gpt"]["daily_target"],
                "percent": (daily_revenue["custom_gpt"] / TARGETS["custom_gpt"]["daily_target"] * 100) if TARGETS["custom_gpt"]["daily_target"] > 0 else 0,
                "status": "ON_TARGET" if daily_revenue["custom_gpt"] >= TARGETS["custom_gpt"]["daily_target"] else "BELOW_TARGET"
            },
            "slack_bot": {
                "actual": daily_revenue["slack_bot"],
                "target": TARGETS["slack_bot"]["daily_target"],
                "percent": (daily_revenue["slack_bot"] / TARGETS["slack_bot"]["daily_target"] * 100) if TARGETS["slack_bot"]["daily_target"] > 0 else 0,
                "status": "ON_TARGET" if daily_revenue["slack_bot"] >= TARGETS["slack_bot"]["daily_target"] else "BELOW_TARGET"
            },
            "replit_pwa": {
                "actual": daily_revenue["replit_pwa"],
                "target": TARGETS["replit_pwa"]["daily_target"],
                "percent": (daily_revenue["replit_pwa"] / TARGETS["replit_pwa"]["daily_target"] * 100) if TARGETS["replit_pwa"]["daily_target"] > 0 else 0,
                "status": "ON_TARGET" if daily_revenue["replit_pwa"] >= TARGETS["replit_pwa"]["daily_target"] else "BELOW_TARGET"
            },
            "total": {
                "actual": daily_revenue["total"],
                "target": TOTAL_DAILY_TARGET,
                "percent": (daily_revenue["total"] / TOTAL_DAILY_TARGET * 100) if TOTAL_DAILY_TARGET > 0 else 0,
                "status": "ON_TARGET" if daily_revenue["total"] >= TOTAL_DAILY_TARGET else "BELOW_TARGET"
            }
        },
        "monthly_projection": {
            "current": daily_revenue["total"] * 30,
            "target": TOTAL_MONTHLY_TARGET,
            "percent": (daily_revenue["total"] * 30 / TOTAL_MONTHLY_TARGET * 100) if TOTAL_MONTHLY_TARGET > 0 else 0
        },
        "annual_projection": {
            "current": daily_revenue["total"] * 365,
            "target": TOTAL_ANNUAL_TARGET,
            "percent": (daily_revenue["total"] * 365 / TOTAL_ANNUAL_TARGET * 100) if TOTAL_ANNUAL_TARGET > 0 else 0
        }
    }

    # Save summary
    with open(SUMMARY_FILE, "w") as f:
        json.dump(report, f, indent=2)

    return report


def print_dashboard():
    """Print real-time revenue dashboard"""
    report = generate_performance_report()

    print("\n" + "="*60)
    print("🎯 THREE-FLAG REVENUE TRACKING DASHBOARD")
    print("="*60)
    print(f"\n📅 Date: {report['date']}")
    print(f"⏰ Timestamp: {datetime.now().strftime('%H:%M:%S')}\n")

    print("💰 DAILY PERFORMANCE:")
    print("-" * 60)

    for flag, data in [
        ("Custom GPT", report["daily_performance"]["custom_gpt"]),
        ("Slack Bot", report["daily_performance"]["slack_bot"]),
        ("Replit PWA", report["daily_performance"]["replit_pwa"])
    ]:
        status_emoji = "✅" if data["status"] == "ON_TARGET" else "⚠️"
        print(f"{status_emoji} {flag:15} ${data['actual']:7.2f} / ${data['target']:7.2f} ({data['percent']:6.2f}%)")

    print("-" * 60)
    total = report["daily_performance"]["total"]
    total_emoji = "✅" if total["status"] == "ON_TARGET" else "⚠️"
    print(f"{total_emoji} {'TOTAL':15} ${total['actual']:7.2f} / ${total['target']:7.2f} ({total['percent']:6.2f}%)")

    print("\n📊 PROJECTIONS:")
    print("-" * 60)
    monthly = report["monthly_projection"]
    print(f"📅 Monthly:  ${monthly['current']:10,.2f} / ${monthly['target']:10,.2f} ({monthly['percent']:6.2f}%)")

    annual = report["annual_projection"]
    print(f"📆 Annual:   ${annual['current']:10,.2f} / ${annual['target']:10,.2f} ({annual['percent']:6.2f}%)")

    print("\n" + "="*60 + "\n")


def integration_with_rpm_competition():
    """Integrate with RPM competition framework"""
    report = generate_performance_report()

    # Write to RPM competition log
    rpm_log = Path("/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT/.claude/rpm_logs/revenue_tracking.json")
    rpm_log.parent.mkdir(exist_ok=True)

    rpm_entry = {
        "timestamp": report["timestamp"],
        "metric": "revenue_roi_per_day",
        "actual": report["daily_performance"]["total"]["actual"],
        "target": report["daily_performance"]["total"]["target"],
        "accuracy_percent": report["daily_performance"]["total"]["percent"],
        "flags": {
            "custom_gpt": report["daily_performance"]["custom_gpt"],
            "slack_bot": report["daily_performance"]["slack_bot"],
            "replit_pwa": report["daily_performance"]["replit_pwa"]
        }
    }

    with open(rpm_log, "w") as f:
        json.dump(rpm_entry, f, indent=2)


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        command = sys.argv[1]

        if command == "log":
            # Example: python revenue_tracking_monitor.py log custom_gpt query 0.10
            flag = sys.argv[2]
            event_type = sys.argv[3]
            amount = float(sys.argv[4])
            log_revenue_event(flag, event_type, amount)
            print(f"✅ Logged ${amount} revenue for {flag}")

        elif command == "dashboard":
            print_dashboard()

        elif command == "report":
            report = generate_performance_report()
            print(json.dumps(report, indent=2))

        elif command == "integrate":
            integration_with_rpm_competition()
            print("✅ Integrated with RPM competition framework")

    else:
        # Default: show dashboard
        print_dashboard()

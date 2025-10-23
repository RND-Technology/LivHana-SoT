#!/usr/bin/env python3
"""
Fallacy-Scan CLI for RPM Evergreen System
Processes meeting transcripts and generates /out artifacts with guardrail validation.

Usage:
    python scripts/rpm/fallacy_scan.py --input transcripts.txt --canon-path .claude --output out/

Output artifacts:
    - ingestion.md (consolidated decisions, actions, blockers)
    - RPM_THIS_WEEK.md (weekly plan with CST time blocks)
    - gantt.md (Mermaid timeline)
    - kanban.json (board state)
    - index.json (metadata + cross-references)
    - pdr_additions.md (product design records)
    - adr_additions.md (architectural decision records)
    - cockpit_deltas.md (missing features by role)
"""

import argparse
import json
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple

# Guardrail patterns for compliance checking
GUARDRAIL_PATTERNS = {
    "medical_claims": [
        r"\b(cures?|treats?|prevents?|heals?|diagnose[sd]?|therapy|treatment)\b",
        r"\b(disease|illness|condition|symptom|disorder|syndrome)\b.*\b(THC|cannabis|CBD)\b",
    ],
    "age_gate_missing": [
        r"\b(THC|cannabis|marijuana|weed)\b(?!.{0,100}\b(21\+|age.?gate|adult.?only))",
    ],
    "sovereignty_leak": [
        r"\b(DID|digital.?identity|licensing.?framework|sovereignty.?stack)\b",
    ],
}

# Fallacy detection patterns
FALLACY_PATTERNS = {
    "contradiction": [
        r"(we will|we must|decision:)\s+(.+?)\n.*\n.*\b(but|however|instead)\b.*\2",
    ],
    "outdated_reference": [
        r"\b(2024|last year|old version|deprecated|legacy)\b",
    ],
    "unclear_ownership": [
        r"\b(someone|anybody|they|team)\s+(should|needs to|will)\b",
    ],
}

# Role cockpit features by persona
ROLE_COCKPIT_FEATURES = {
    "ceo": ["Strategic KPIs", "Cash flow forecast", "Board report generator", "Crisis alerts"],
    "cto": ["Deployment status", "Tech debt tracker", "API health dashboard", "Security audit log"],
    "cmo": ["Campaign performance", "Loyalty cohorts", "Brand sentiment", "Content calendar"],
    "cfo": ["Burn rate", "Revenue forecast", "Vendor payment queue", "Tax deadline tracker"],
    "coo": ["Process adherence", "Vendor SLA monitor", "Compliance checklist", "Ops runbooks"],
}

# Cialdini ethical influence principles
CIALDINI_PRINCIPLES = [
    "reciprocity",
    "commitment_consistency",
    "social_proof",
    "authority",
    "liking",
    "scarcity",
    "unity",
]

# RACI org chart (example - should be loaded from canon)
RACI_ORG_CHART = {
    "strategic": {"R": "ceo", "A": "ceo", "C": ["cto", "cfo"], "I": ["all"]},
    "technical": {"R": "cto", "A": "cto", "C": ["ceo"], "I": ["dev_team"]},
    "financial": {"R": "cfo", "A": "cfo", "C": ["ceo"], "I": ["accounting"]},
    "marketing": {"R": "cmo", "A": "cmo", "C": ["ceo"], "I": ["marketing_team"]},
    "operations": {"R": "coo", "A": "coo", "C": ["ceo"], "I": ["ops_team"]},
}


def parse_transcripts(input_path: Path) -> List[Dict]:
    """Parse transcript file into session-delimited entries."""
    content = input_path.read_text()
    sessions = []
    
    # Split by session markers (e.g., "=== SESSION: 2025-10-23 ===")
    session_blocks = re.split(r'={3,}\s*SESSION:\s*(.+?)\s*={3,}', content)
    
    for i in range(1, len(session_blocks), 2):
        timestamp = session_blocks[i].strip()
        text = session_blocks[i + 1].strip() if i + 1 < len(session_blocks) else ""
        
        sessions.append({
            "timestamp": timestamp,
            "content": text,
            "lines": text.split("\n"),
        })
    
    return sessions


def scan_guardrails(text: str) -> List[Dict]:
    """Scan for guardrail violations (medical claims, age-gate, sovereignty leaks)."""
    violations = []
    
    for category, patterns in GUARDRAIL_PATTERNS.items():
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                violations.append({
                    "category": category,
                    "pattern": pattern,
                    "match": match.group(0),
                    "line": text[:match.start()].count("\n") + 1,
                    "severity": "critical",
                })
    
    return violations


def scan_fallacies(text: str) -> List[Dict]:
    """Detect logical fallacies, contradictions, and outdated references."""
    fallacies = []
    
    for fallacy_type, patterns in FALLACY_PATTERNS.items():
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                fallacies.append({
                    "type": fallacy_type,
                    "match": match.group(0),
                    "line": text[:match.start()].count("\n") + 1,
                    "suggestion": generate_suggestion(fallacy_type, match.group(0)),
                })
    
    return fallacies


def generate_suggestion(fallacy_type: str, match: str) -> str:
    """Generate correction suggestion for detected fallacy."""
    suggestions = {
        "contradiction": "Resolve conflicting statements. Review decisions and confirm which takes precedence.",
        "outdated_reference": "Update to current date/version. Verify information is still accurate.",
        "unclear_ownership": "Assign explicit owner with RACI matrix. Use role-based assignment.",
    }
    return suggestions.get(fallacy_type, "Review and clarify.")


def extract_action_items(sessions: List[Dict], canon_path: Path) -> List[Dict]:
    """Extract action items with RACI assignments from sessions."""
    action_items = []
    
    for session in sessions:
        content = session["content"]
        
        # Extract todo items (markdown checklist or bullet points)
        todo_pattern = r'^[-*]\s*\[[ x]\]\s*(.+?)(?:\((.+?)\))?$'
        decision_pattern = r'^(DECISION|ACTION|TODO):\s*(.+?)(?:\((.+?)\))?$'
        
        for line in session["lines"]:
            # Check for markdown todos
            todo_match = re.match(todo_pattern, line.strip(), re.IGNORECASE)
            if todo_match:
                task_text = todo_match.group(1).strip()
                owner_hint = todo_match.group(2).strip() if todo_match.group(2) else None
                
                action_items.append(extract_action_item(task_text, owner_hint, session["timestamp"]))
            
            # Check for explicit ACTION/DECISION markers
            decision_match = re.match(decision_pattern, line.strip(), re.IGNORECASE)
            if decision_match:
                task_text = decision_match.group(2).strip()
                owner_hint = decision_match.group(3).strip() if decision_match.group(3) else None
                
                action_items.append(extract_action_item(task_text, owner_hint, session["timestamp"]))
    
    return action_items


def extract_action_item(task_text: str, owner_hint: str, timestamp: str) -> Dict:
    """Extract structured action item with inferred RACI assignment."""
    # Infer domain from keywords
    domain = infer_domain(task_text)
    raci = RACI_ORG_CHART.get(domain, RACI_ORG_CHART["strategic"])
    
    # Override owner if explicit hint provided
    owner = owner_hint if owner_hint else raci["A"]
    
    # Infer priority from urgency keywords
    priority = infer_priority(task_text)
    
    # Infer status (default to pending)
    status = "pending"
    if re.search(r'\[x\]', task_text, re.IGNORECASE):
        status = "done"
    elif re.search(r'(blocked|waiting)', task_text, re.IGNORECASE):
        status = "blocked"
    
    return {
        "task": task_text,
        "owner": owner,
        "domain": domain,
        "raci": raci,
        "priority": priority,
        "status": status,
        "created": timestamp,
        "due_date": None,  # Could be inferred from "by Friday" etc.
    }


def infer_domain(task_text: str) -> str:
    """Infer task domain from keywords."""
    keywords = {
        "technical": ["deploy", "bug", "API", "database", "code", "server", "CI/CD"],
        "financial": ["budget", "invoice", "revenue", "expense", "forecast", "payment"],
        "marketing": ["campaign", "content", "brand", "social", "SEO", "engagement"],
        "operations": ["process", "vendor", "compliance", "SOP", "contract", "runbook"],
    }
    
    for domain, terms in keywords.items():
        if any(term.lower() in task_text.lower() for term in terms):
            return domain
    
    return "strategic"


def infer_priority(task_text: str) -> str:
    """Infer priority from urgency keywords."""
    if re.search(r'\b(urgent|critical|blocker|ASAP|emergency)\b', task_text, re.IGNORECASE):
        return "critical"
    elif re.search(r'\b(high|important|priority|soon)\b', task_text, re.IGNORECASE):
        return "high"
    elif re.search(r'\b(low|minor|nice.?to.?have)\b', task_text, re.IGNORECASE):
        return "low"
    else:
        return "medium"


def generate_ingestion_md(
    sessions: List[Dict],
    action_items: List[Dict],
    violations: List[Dict],
    fallacies: List[Dict],
    output_path: Path,
):
    """Generate consolidated ingestion.md report."""
    md = f"""# 📋 Meeting Ingestion Report
**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M CST')}
**Sessions Processed**: {len(sessions)}
**Action Items**: {len(action_items)}
**Guardrail Violations**: {len(violations)}
**Fallacies Detected**: {len(fallacies)}

---

## 🚨 GUARDRAIL VIOLATIONS

"""
    
    if violations:
        for v in violations:
            md += f"""### {v['category'].upper()} (Line {v['line']})
- **Match**: `{v['match']}`
- **Severity**: {v['severity']}
- **Action**: Review and correct before publishing

"""
    else:
        md += "*No violations detected. ✅*\n\n"
    
    md += "---\n\n## ⚠️ FALLACIES & CONTRADICTIONS\n\n"
    
    if fallacies:
        for f in fallacies:
            md += f"""### {f['type'].replace('_', ' ').title()} (Line {f['line']})
- **Match**: `{f['match']}`
- **Suggestion**: {f['suggestion']}

"""
    else:
        md += "*No fallacies detected. ✅*\n\n"
    
    md += "---\n\n## ✅ ACTION ITEMS\n\n"
    
    # Group by status
    solved = [a for a in action_items if a["status"] == "done"]
    unsolved = [a for a in action_items if a["status"] == "pending"]
    blocked = [a for a in action_items if a["status"] == "blocked"]
    
    md += f"### Solved ({len(solved)})\n\n"
    for item in solved:
        md += f"- ✅ **{item['task']}** (@{item['owner']}) — {item['created']}\n"
    
    md += f"\n### Unsolved ({len(unsolved)})\n\n"
    for item in unsolved:
        md += f"- ⏳ **{item['task']}** (@{item['owner']}, Priority: {item['priority']}) — {item['created']}\n"
    
    md += f"\n### Blocked ({len(blocked)})\n\n"
    for item in blocked:
        md += f"- 🚫 **{item['task']}** (@{item['owner']}) — {item['created']}\n"
    
    md += "\n---\n\n🦄 **Liv Hana Trinity**: Grow, Sell, Heal.\n"
    
    output_path.write_text(md)
    print(f"✅ Generated: {output_path}")


def generate_rpm_weekly(action_items: List[Dict], output_path: Path):
    """Generate RPM_THIS_WEEK.md with MAP sections by owner."""
    week_start = datetime.now()
    week_end = week_start + timedelta(days=7)
    
    md = f"""# 📅 RPM Weekly Plan
**Week**: {week_start.strftime('%Y-%m-%d')} → {week_end.strftime('%Y-%m-%d')}
**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M CST')}

---

## 🎯 RESULTS (Outcomes This Week)

"""
    
    # Extract results from action items
    results = set([item["task"] for item in action_items if item["priority"] in ["critical", "high"]])
    for result in list(results)[:5]:  # Top 5
        md += f"- {result}\n"
    
    md += "\n---\n\n## 🔥 PURPOSE (Why This Matters)\n\n"
    md += "Drive Liv Hana Trinity (Grow, Sell, Heal) forward with shippable, compliant, revenue-generating deliverables.\n\n"
    md += "---\n\n## 💪 MASSIVE ACTION PLAN\n\n"
    
    # Group by owner
    owners = {}
    for item in action_items:
        owner = item["owner"]
        if owner not in owners:
            owners[owner] = []
        owners[owner].append(item)
    
    for owner, items in owners.items():
        md += f"### @{owner.upper()}\n\n"
        for item in items:
            status_emoji = {"done": "✅", "pending": "⏳", "blocked": "🚫"}.get(item["status"], "⏳")
            md += f"- {status_emoji} **{item['task']}** (Priority: {item['priority']})\n"
        md += "\n"
    
    md += "---\n\n🦄 **Liv Hana Trinity**: Grow, Sell, Heal.\n"
    
    output_path.write_text(md)
    print(f"✅ Generated: {output_path}")


def generate_gantt(action_items: List[Dict], output_path: Path):
    """Generate gantt.md with Mermaid timeline."""
    md = """# 📊 Gantt Timeline

```mermaid
gantt
    title RPM Weekly Plan
    dateFormat YYYY-MM-DD
    section Critical
"""
    
    # Add critical items
    critical_items = [a for a in action_items if a["priority"] == "critical"]
    for item in critical_items[:10]:  # Limit to 10
        task_name = item["task"][:30]  # Truncate
        md += f"    {task_name} :active, {datetime.now().strftime('%Y-%m-%d')}, 3d\n"
    
    md += "    section High\n"
    high_items = [a for a in action_items if a["priority"] == "high"]
    for item in high_items[:10]:
        task_name = item["task"][:30]
        md += f"    {task_name} :{datetime.now().strftime('%Y-%m-%d')}, 5d\n"
    
    md += "```\n\n---\n\n🦄 **Liv Hana Trinity**: Grow, Sell, Heal.\n"
    
    output_path.write_text(md)
    print(f"✅ Generated: {output_path}")


def generate_kanban(action_items: List[Dict], output_path: Path):
    """Generate kanban.json board state."""
    kanban = {
        "generated": datetime.now().isoformat(),
        "columns": {
            "todo": [a for a in action_items if a["status"] == "pending"],
            "in_progress": [],  # Would need session context to infer
            "blocked": [a for a in action_items if a["status"] == "blocked"],
            "done": [a for a in action_items if a["status"] == "done"],
        },
    }
    
    output_path.write_text(json.dumps(kanban, indent=2))
    print(f"✅ Generated: {output_path}")


def generate_index(sessions: List[Dict], action_items: List[Dict], output_path: Path):
    """Generate index.json metadata and cross-references."""
    index = {
        "generated": datetime.now().isoformat(),
        "summary": {
            "sessions": len(sessions),
            "action_items": len(action_items),
            "owners": list(set([a["owner"] for a in action_items])),
            "domains": list(set([a["domain"] for a in action_items])),
        },
        "cross_references": {
            "pdr": [],  # Would extract from sessions
            "adr": [],
            "sop": [],
        },
    }
    
    output_path.write_text(json.dumps(index, indent=2))
    print(f"✅ Generated: {output_path}")


def generate_cockpit_deltas(output_path: Path):
    """Generate cockpit_deltas.md showing missing features by role."""
    md = """# 🎛️ Role Cockpit Deltas
**Status**: Missing features by role persona

---

"""
    
    for role, features in ROLE_COCKPIT_FEATURES.items():
        md += f"## {role.upper()}\n\n"
        md += "**Missing Features**:\n"
        for feature in features:
            md += f"- [ ] {feature}\n"
        md += "\n"
    
    md += "---\n\n🦄 **Liv Hana Trinity**: Grow, Sell, Heal.\n"
    
    output_path.write_text(md)
    print(f"✅ Generated: {output_path}")


def generate_pdr_additions(action_items: List[Dict], output_path: Path):
    """Generate pdr_additions.md (Product Design Records)."""
    md = f"""# 📐 Product Design Records (PDR) Additions
**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M CST')}

---

## New Product Decisions

"""
    
    # Extract product-related items
    product_items = [a for a in action_items if a["domain"] in ["marketing", "operations"]]
    
    for item in product_items[:10]:
        md += f"### {item['task']}\n"
        md += f"- **Owner**: @{item['owner']}\n"
        md += f"- **Priority**: {item['priority']}\n"
        md += f"- **Rationale**: [To be documented]\n\n"
    
    md += "---\n\n🦄 **Liv Hana Trinity**: Grow, Sell, Heal.\n"
    
    output_path.write_text(md)
    print(f"✅ Generated: {output_path}")


def generate_adr_additions(action_items: List[Dict], output_path: Path):
    """Generate adr_additions.md (Architectural Decision Records)."""
    md = f"""# 🏗️ Architectural Decision Records (ADR) Additions
**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M CST')}

---

## New Technical Decisions

"""
    
    # Extract technical items
    tech_items = [a for a in action_items if a["domain"] == "technical"]
    
    for item in tech_items[:10]:
        md += f"### {item['task']}\n"
        md += f"- **Owner**: @{item['owner']}\n"
        md += f"- **Priority**: {item['priority']}\n"
        md += f"- **Technical Rationale**: [To be documented]\n\n"
    
    md += "---\n\n🦄 **Liv Hana Trinity**: Grow, Sell, Heal.\n"
    
    output_path.write_text(md)
    print(f"✅ Generated: {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Fallacy-Scan CLI for RPM Evergreen System")
    parser.add_argument("--input", required=True, help="Input transcript file")
    parser.add_argument("--canon-path", default=".claude", help="Path to canon directory")
    parser.add_argument("--output", default="out", help="Output directory for artifacts")
    
    args = parser.parse_args()
    
    input_path = Path(args.input)
    canon_path = Path(args.canon_path)
    output_path = Path(args.output)
    
    # Create output directory
    output_path.mkdir(parents=True, exist_ok=True)
    
    print(f"📋 Parsing transcripts from: {input_path}")
    sessions = parse_transcripts(input_path)
    
    print(f"🔍 Scanning for guardrail violations...")
    all_violations = []
    for session in sessions:
        violations = scan_guardrails(session["content"])
        all_violations.extend(violations)
    
    print(f"🧠 Detecting fallacies and contradictions...")
    all_fallacies = []
    for session in sessions:
        fallacies = scan_fallacies(session["content"])
        all_fallacies.extend(fallacies)
    
    print(f"✅ Extracting action items with RACI assignments...")
    action_items = extract_action_items(sessions, canon_path)
    
    print(f"\n📊 Summary:")
    print(f"  - Sessions: {len(sessions)}")
    print(f"  - Action Items: {len(action_items)}")
    print(f"  - Guardrail Violations: {len(all_violations)}")
    print(f"  - Fallacies: {len(all_fallacies)}")
    
    print(f"\n🚀 Generating /out artifacts...")
    
    generate_ingestion_md(sessions, action_items, all_violations, all_fallacies, output_path / "ingestion.md")
    generate_rpm_weekly(action_items, output_path / "RPM_THIS_WEEK.md")
    generate_gantt(action_items, output_path / "gantt.md")
    generate_kanban(action_items, output_path / "kanban.json")
    generate_index(sessions, action_items, output_path / "index.json")
    generate_pdr_additions(action_items, output_path / "pdr_additions.md")
    generate_adr_additions(action_items, output_path / "adr_additions.md")
    generate_cockpit_deltas(output_path / "cockpit_deltas.md")
    
    print(f"\n✅ All artifacts generated in: {output_path}")
    
    if all_violations:
        print(f"\n🚨 WARNING: {len(all_violations)} guardrail violations detected!")
        sys.exit(1)
    else:
        print(f"\n✅ No guardrail violations. Safe to proceed.")
        sys.exit(0)


if __name__ == "__main__":
    main()

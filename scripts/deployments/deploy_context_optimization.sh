#!/bin/bash
# PHASE 1: Eliminate context overload

echo "=== PHASE 1: CONTEXT OPTIMIZATION ==="

# 1. Analyze current token usage
python3 << PYTHON
from pathlib import Path
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")
total_tokens = 0

for file in Path(".").rglob("*.py"):
    try:
        content = file.read_text()
        tokens = len(enc.encode(content))
        total_tokens += tokens
        if tokens > 5000:
            print(f"WARNING: {file} = {tokens} tokens")
    except: pass

print(f"\nTOTAL CODEBASE: {total_tokens:,} tokens")
print(f"AGENT BUDGET: 20,000 tokens each")
print(f"OVERLOAD FACTOR: {total_tokens / (5 * 20000):.1f}x")
PYTHON

# 2. Generate context maps per agent
mkdir -p .context_maps

cat > .context_maps/planning_agent.txt << PLANNING
glue_index.md
RPM_WEEKLY_PLAN_OCT412_2025.md
project_roadmap.md
PLANNING

cat > .context_maps/research_agent.txt << RESEARCH
docs/**/*.md
README.md
CONTRIBUTING.md
RESEARCH

cat > .context_maps/execution_agent.txt << EXECUTION
scripts/**/*.sh
src/**/*.py
!tests/**/*
EXECUTION

cat > .context_maps/artifacts_agent.txt << ARTIFACTS
templates/**/*
static/**/*
ARTIFACTS

cat > .context_maps/qa_agent.txt << QA
tests/**/*
*.test.py
QA

# 3. Wire context maps to agent spawner
python3 << PYTHON
import json

config = {
    "agents": [
        {"name": "planning", "context_map": ".context_maps/planning_agent.txt", "max_tokens": 20000},
        {"name": "research", "context_map": ".context_maps/research_agent.txt", "max_tokens": 25000},
        {"name": "execution", "context_map": ".context_maps/execution_agent.txt", "max_tokens": 30000},
        {"name": "artifacts", "context_map": ".context_maps/artifacts_agent.txt", "max_tokens": 15000},
        {"name": "qa", "context_map": ".context_maps/qa_agent.txt", "max_tokens": 50000}
    ]
}

with open(".context_maps/config.json", "w") as f:
    json.dump(config, f, indent=2)

print("✅ Context maps generated")
PYTHON

echo "=== PHASE 1 COMPLETE ==="
echo "Next: Update start.sh to use context maps"

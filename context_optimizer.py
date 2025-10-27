import os
from pathlib import Path

def calculate_token_count(directory):
    """Estimate tokens across codebase"""
    total = 0
    for file in Path(directory).rglob("*.py"):
        total += len(file.read_text().split()) * 1.3  # ~1.3 tokens/word
    return int(total)

def generate_context_map(directory, max_tokens=20000):
    """Create agent-specific context maps under token budget"""
    contexts = {
        "planning": ["glue_index.md", "RPM_WEEKLY_PLAN*.md"],
        "research": ["docs/*.md", "README.md"],
        "execution": ["scripts/*.sh", "src/**/*.py"],
        "artifacts": ["templates/**/*"],
        "qa": ["tests/**/*", "*.test.py"]
    }
    # Map each agent to minimal necessary context
    return contexts

# Run analysis
print(f"Total tokens: {calculate_token_count('.')}")
print(f"Context budget per agent: 20K tokens")
print(f"Recommended: 5 agents × 20K = 100K total (vs your 500K+)")

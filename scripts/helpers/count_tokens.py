import tiktoken
from pathspec import PathSpec
from pathlib import Path

# Load .contextignore patterns
with open(".contextignore") as f:
    spec = PathSpec.from_lines("gitwildmatch", f)

enc = tiktoken.get_encoding("cl100k_base")
total_tokens = 0
included_files = 0

for file in Path(".").rglob("*"):
    if file.is_file() and not spec.match_file(str(file)):
        try:
            with open(file, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                tokens = len(enc.encode(content))
                total_tokens += tokens
                included_files += 1
        except:
            pass

print(f"\n✅ TOKEN COUNT:")
print(f"   Files: {included_files:,}")
print(f"   Tokens: {total_tokens:,}")
print(f"   Target: <100,000")
print(f"   Status: {'🟢 PASS' if total_tokens < 100000 else '🔴 FAIL'}")

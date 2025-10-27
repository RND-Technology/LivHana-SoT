<!-- 964b7ca4-84f9-46d4-902c-492a196e447f c026ba32-40d9-4a06-8555-dc0b992c06f7 -->
# Context Crisis Quick‑Fix (bloat prune + venv + token verify)

### Scope
- Do not change application logic. Only remove ignored artifacts, add ignores, and add a small utility script.
- Target result: <100,000 tokens included; file count <10,000; clean git status.

### Pre‑flight (read‑only)
- Confirm branch: `fix/mobile-control-po1`
- Show status: `git status -sb` (should be clean except tmp files)

### Steps
1) Snapshot (safety)
- Create a lightweight snapshot commit (no node_modules). Do NOT force‑add anything.
- Optional: tag `pre-context-cleanup-<date>`

2) Canonical ignores
- Ensure `.gitignore` contains at least:
```gitignore
node_modules/
logs/
.venv/
*.log
__pycache__/
*.pyc
.next/
dist/
coverage/
.cache/
.DS_Store
out/
out_mirror/
```
- Ensure `.contextignore` exists and mirrors the above (plus large media, datasets) to keep agents under 100K tokens.

3) Physical cleanup (ignored files only)
- Use git‑native removal so only ignored/untracked cruft is deleted:
  - Preview: `git clean -ffdX -e .venv -n`
  - Execute: `git clean -ffdX -e .venv`
- This removes ignored files (e.g., node_modules, logs) but preserves tracked files and your venv.

4) Python venv for token counter
- Create venv: `python3 -m venv .venv`
- Install deps: `.venv/bin/pip install -U pip tiktoken pathspec`

5) Add deterministic token counter
- Create `tools/token_counter.py`:
```python
#!/usr/bin/env python3
import json
from pathlib import Path
from pathspec import PathSpec
import tiktoken

ROOT = Path('.')
enc = tiktoken.get_encoding('cl100k_base')
patterns = []
for f in ['.contextignore', '.gitignore']:
    if Path(f).exists():
        patterns += Path(f).read_text().splitlines()
spec = PathSpec.from_lines('gitwildmatch', patterns)

total = 0
files = []
for p in ROOT.rglob('*'):
    if not p.is_file():
        continue
    sp = str(p)
    # exclude hidden VCS regardless
    if sp.startswith('./.git') or '/.git/' in sp:
        continue
    if spec.match_file(sp):
        continue
    try:
        text = p.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        continue
    tokens = len(enc.encode(text))
    total += tokens
    files.append({'path': sp, 'tokens': tokens})

files.sort(key=lambda x: x['tokens'], reverse=True)
report = {
    'total_tokens': total,
    'file_count': len(files),
    'top_20': files[:20],
}
print(json.dumps(report, indent=2))
```
- Run: `.venv/bin/python tools/token_counter.py > reports/context_token_report.json`
- Quick view: `jq '.total_tokens, .file_count' reports/context_token_report.json`

6) Verify acceptance
- Pass if:
  - `total_tokens < 100000`
  - `file_count < 10000`
  - `git status -s` is clean

7) Commit and push
- Commit `.gitignore`, `.contextignore`, `tools/token_counter.py`, `reports/context_token_report.json`
- Push to `fix/mobile-control-po1`

### Rollback
- `git reset --hard HEAD~1 && git clean -ffdX -e .venv -n` (preview)
- Or restore via the snapshot commit/tag

### Notes
- Using `git clean -X` prunes ignored files only; safer than `find ... -exec rm -rf` and avoids traversal race conditions.
- Use direct venv executables (`.venv/bin/python`) to avoid PATH confusion on macOS.
- This does not affect voice agents or services; purely hygiene and tooling.


### To-dos

- [ ] Create snapshot commit and optional tag before cleanup
- [ ] Update .gitignore and .contextignore with canonical bloat rules
- [ ] Prune ignored artifacts with git clean -ffdX preserving .venv
- [ ] Create .venv and install tiktoken and pathspec
- [ ] Add tools/token_counter.py and generate JSON report
- [ ] Verify thresholds then commit and push changes
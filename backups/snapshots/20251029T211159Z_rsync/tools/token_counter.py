#!/usr/bin/env python3
import json
from pathlib import Path
from pathspec import PathSpec
import tiktoken

ROOT = Path('.').resolve()
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
    try:
        rel = str(p.relative_to(ROOT))
    except:
        continue
    if rel.startswith('.git') or '/.git/' in rel or spec.match_file(rel):
        continue
    try:
        tokens = len(enc.encode(p.read_text(encoding='utf-8', errors='ignore')))
        total += tokens
        files.append({'path': rel, 'tokens': tokens})
    except: pass

files.sort(key=lambda x: x['tokens'], reverse=True)
report = {'total_tokens': total, 'file_count': len(files), 'status': 'PASS' if total < 100000 else 'FAIL', 'top_20': files[:20]}

print(f"\nTOKEN COUNT: {total:,} | FILES: {len(files):,} | STATUS: {report['status']}\n")
if total >= 100000:
    for f in report['top_20']: print(f"  {f['tokens']:>8,} - {f['path']}")

Path('reports').mkdir(exist_ok=True)
Path('reports/context_token_report.json').write_text(json.dumps(report, indent=2))
print(f"Report saved: reports/context_token_report.json")

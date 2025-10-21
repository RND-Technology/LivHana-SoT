---
status: active - cheetah mission
author: Commander CODEX (GPT-5)
last_updated: 2025-10-08T12:40:00Z
---

# Cheetah Markdown Refactor Runbook

## 🎯 Mission
Eliminate every markdown file over 500 lines by modularizing content, preserving context, and recording receipts. Use `scripts/modularize_markdown.py` for automated splitting and keep final modules under 400 lines whenever possible.

## ⚙️ Tooling
- `scripts/modularize_markdown.py --input <file> [--out-dir <dir>] [--updated ISO8601]`
- `scripts/check_markdown_size.py --threshold 500 --exclude .archive`
- Priority queue: `reports/oversize_priority_20251008.md`
- Receipts directory: `reports/cheetah/receipts/`

## 📡 Execution Loop
1. Pull the latest priority list (top rows first).
2. For each file:
   - Run `scripts/modularize_markdown.py --input <path> --updated 2025-10-08T12:40:00Z`
   - Review generated modules + `INDEX.md` and ensure headings render correctly.
   - Confirm pointer file replaces the original and references the index.
   - If file lacks headings, manually create logical sections before rerunning.
3. After each batch, run `scripts/check_markdown_size.py --threshold 500 --exclude .archive` and record remaining count.
4. Create a receipt `reports/cheetah/receipts/<timestamp>-markdown-refactor.md` containing:
   - List of files processed (before → after paths)
   - `git status -sb` excerpt
   - `scripts/check_markdown_size.py` summary output

## ✅ Completion Criteria
- `scripts/check_markdown_size.py` returns `✅ All markdown files...` (exit code 0).
- Every oversized file has an index + modules and a short pointer file.
- Receipts cover each run with evidence (commands, outputs, diffs).

## 🔐 Guardrails
- Do **not** modify vendor or generated docs (node_modules, third-party). They are already excluded.
- Preserve timestamps/metadata in pointer files (`--updated` argument).
- Keep module filenames deterministic `<NN>_<slug>.md` to ease cross linking.
- If context requires cross-file links, note them in the receipt so team can update references.

## 🚀 Escalation
- If a file cannot be modularized automatically (e.g., no headings), escalate to CODEX for manual restructuring.
- If `scripts/modularize_markdown.py` fails, capture the traceback, move to next file, and flag blocker in receipt.

LFG 🐆⚡

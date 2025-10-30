#!/usr/bin/env python3
"""Report markdown files exceeding a line-count threshold."""
from __future__ import annotations
import argparse
from pathlib import Path

DEFAULT_EXCLUDE = {
    '.git',
    'node_modules',
    '__pycache__',
    'dist',
    'build',
    '.archive',
    'archives',
    '.venv',
    'venv',
    '.next',
    '.turbo',
}

DEFAULT_THRESHOLD = 500


def should_skip(path: Path, exclude: set[str]) -> bool:
    return any(part in exclude for part in path.parts)


def scan_markdown(root: Path, threshold: int, exclude: set[str]):
    results: list[tuple[int, Path]] = []
    for path in root.rglob('*.md'):
        if should_skip(path, exclude):
            continue
        try:
            with path.open('r', encoding='utf-8', errors='ignore') as fh:
                lines = sum(1 for _ in fh)
        except OSError:
            continue
        if lines > threshold:
            results.append((lines, path))
    results.sort(reverse=True)
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path('.'), help='Repository root to scan')
    parser.add_argument('--threshold', type=int, default=DEFAULT_THRESHOLD, help='Line threshold (default: 500)')
    parser.add_argument('--exclude', action='append', default=[], help='Additional directories to exclude')
    args = parser.parse_args()

    root = args.root.resolve()
    threshold = args.threshold
    exclude = DEFAULT_EXCLUDE | set(args.exclude)

    results = scan_markdown(root, threshold, exclude)
    if not results:
        print(f'✅ All markdown files are <= {threshold} lines (exclusions: {sorted(exclude)})')
        return 0

    print(f'⚠️ Markdown files exceeding {threshold} lines:')
    for lines, path in results:
        rel_path = path.relative_to(root)
        print(f'{lines:6d}  {rel_path}')
    print(f"\nTotal: {len(results)}")
    return 1


if __name__ == '__main__':
    raise SystemExit(main())

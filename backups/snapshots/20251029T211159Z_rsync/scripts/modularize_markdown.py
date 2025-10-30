
#!/usr/bin/env python3
"""Split a markdown file into modular sections with index/pointer files."""
from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Iterable, List, Tuple

SECTION_PATTERN = re.compile(r'^(#{2,6})\s+(.*)$', re.MULTILINE)


def parse_sections(markdown: str) -> List[Tuple[str, str, int, int]]:
    """Return list of (heading, title, start_index, end_index).

    Includes a synthetic "intro" section if content precedes the first heading.
    """
    matches = list(SECTION_PATTERN.finditer(markdown))
    sections: List[Tuple[str, str, int, int]] = []

    if matches:
        first_start = matches[0].start()
        if first_start > 0:
            sections.append(("intro", "Introduction", 0, first_start))
    else:
        sections.append(("intro", "Full Document", 0, len(markdown)))
        return sections

    for idx, match in enumerate(matches):
        heading = match.group(1)
        title = match.group(2).strip()
        start = match.start()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(markdown)
        sections.append((heading, title, start, end))

    return sections


def slugify(title: str) -> str:
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', title.strip().lower()).strip('-')
    return slug or 'section'


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def write_modules(sections: Iterable[Tuple[str, str, int, int]], markdown: str, out_dir: Path) -> List[Path]:
    module_paths: List[Path] = []
    for idx, (_, title, start, end) in enumerate(sections):
        body = markdown[start:end].strip() + '\n'
        index_prefix = f"{idx:02d}"
        slug = slugify(title)[:60]
        filename = out_dir / f"{index_prefix}_{slug}.md"
        filename.write_text(body, encoding='utf-8')
        module_paths.append(filename)
    return module_paths


def build_index(modules: List[Path], index_path: Path, relative: Path) -> None:
    lines = [
        "---",
        "diataxis: reference",
        "status: active - modular index",
        "---",
        "",
        f"# {relative.stem.replace('-', ' ').title()} Index",
        "",
        "| Module | Description |",
        "|--------|-------------|",
    ]
    for path in modules:
        title_line = next((line for line in path.read_text(encoding='utf-8').splitlines() if line.strip()), path.stem)
        display = title_line.lstrip('#').strip() if title_line.startswith('#') else path.stem
        rel_link = path.name
        lines.append(f"| [{path.name}]({rel_link}) | {display} |")
    index_path.write_text('\n'.join(lines) + '\n', encoding='utf-8')


def write_pointer(original: Path, out_dir: Path, index: Path, updated_ts: str | None) -> None:
    pointer_lines = [
        f"# {original.stem.replace('-', ' ').title()}",
        "",
        "This document has been modularized for faster access.",
        f"See [`{index.relative_to(out_dir.parent)}`]({index.relative_to(original.parent)}) for the full specification.",
    ]
    if updated_ts:
        pointer_lines.append("")
        pointer_lines.append(f"Updated: {updated_ts}")
    original.write_text('\n'.join(pointer_lines) + '\n', encoding='utf-8')


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True, type=Path, help='Markdown file to modularize')
    parser.add_argument('--out-dir', type=Path, help='Output directory for modules')
    parser.add_argument('--updated', type=str, default=None, help='Timestamp string to embed in pointer file')
    args = parser.parse_args()

    input_path: Path = args.input.resolve()
    if not input_path.is_file():
        parser.error(f"Input file not found: {input_path}")

    markdown = input_path.read_text(encoding='utf-8')
    sections = parse_sections(markdown)
    if len(sections) <= 1 and sections[0][0] == 'intro':
        parser.error('File does not contain multiple sections to split.')

    out_dir = (args.out_dir or input_path.parent / input_path.stem).resolve()
    ensure_dir(out_dir)

    modules = write_modules(sections, markdown, out_dir)
    index_path = out_dir / 'INDEX.md'
    build_index(modules, index_path, out_dir)
    write_pointer(input_path, out_dir, index_path, args.updated)

    print(f"✅ Modularized {input_path} -> {out_dir} ({len(modules)} modules)")
    return 0


if __name__ == '__main__':
    raise SystemExit(main())

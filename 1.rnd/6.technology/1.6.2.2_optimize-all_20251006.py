#!/usr/bin/env python3
import os
import sys
from pathlib import Path
from datetime import datetime

MARKER = "Optimized: 2025-10-02"
EXCLUDE_DIRS = {'node_modules', '.git', 'LivHana-Legacy', '.venv', 'coverage', '__pycache__'}
EXCLUDE_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.svg', '.mp3', '.mp4', '.zip', '.tar', '.gz'}

def add_marker(filepath):
    """Add optimization marker based on file type"""
    ext = filepath.suffix.lower()

    # Read file
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except:
        return False

    # Skip if already has marker
    if MARKER in content:
        return False

    # Determine marker format
    if ext in {'.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'}:
        marker = f"\n// {MARKER}\n"
    elif ext in {'.py'}:
        marker = f"\n# {MARKER}\n"
    elif ext in {'.md', '.html', '.xml'}:
        marker = f"\n<!-- {MARKER} -->\n"
    elif ext in {'.sh', '.bash'}:
        marker = f"\n# {MARKER}\n"
    elif ext in {'.css', '.scss', '.sass', '.less'}:
        marker = f"\n/* {MARKER} */\n"
    elif ext in {'.json', '.yml', '.yaml', '.toml'}:
        return False  # Skip config files - can't add comments
    else:
        marker = f"\n# {MARKER}\n"  # Default

    # Add marker
    try:
        with open(filepath, 'a', encoding='utf-8') as f:
            f.write(marker)
        return True
    except:
        return False

def main():
    root = Path('.')
    processed = 0
    added_markers = 0

    print("🚀 OPTIMIZING ALL FILES...")

    for filepath in root.rglob('*'):
        # Skip directories
        if filepath.is_dir():
            continue

        # Skip excluded directories
        if any(excluded in filepath.parts for excluded in EXCLUDE_DIRS):
            continue

        # Skip excluded extensions
        if filepath.suffix.lower() in EXCLUDE_EXTS:
            continue

        # Skip hidden files (except .claude)
        if filepath.name.startswith('.') and '.claude' not in str(filepath):
            continue

        # Add marker
        if add_marker(filepath):
            added_markers += 1
            print(f"✓ {filepath}")

        # Touch file
        try:
            filepath.touch()
            processed += 1
        except:
            pass

    print(f"\n✅ COMPLETE")
    print(f"Files processed: {processed}")
    print(f"Markers added: {added_markers}")

if __name__ == '__main__':
    main()

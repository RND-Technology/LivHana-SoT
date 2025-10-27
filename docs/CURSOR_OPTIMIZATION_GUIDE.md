# Cursor IDE Performance Optimization Guide

**Created**: 2025-10-25
**Purpose**: Reduce memory footprint and improve Cursor IDE performance

## Current State Analysis

- **Total Cursor extensions disk usage**: 462 MB
- **Cursor application cache**: 2.7 GB
- **Memory usage**: ~1.5 GB across all Cursor processes

## Extension Audit Results

### High-Impact Extensions (Consider Disabling if Unused)

1. **openai.chatgpt** (230 MB)
   - Large LLM integration extension
   - **Action**: Disable if using Claude Code instead
   - Savings: ~230 MB disk, ~100-200 MB RAM

2. **saoudrizwan.claude-dev** (49 MB)
   - Alternative Claude integration
   - **Action**: Disable if redundant with Claude Code CLI
   - Savings: ~49 MB disk, ~50 MB RAM

3. **ms-python.python + debugpy** (69 MB combined)
   - Python language support
   - **Action**: Keep if doing Python development, disable otherwise
   - Savings: ~69 MB disk, ~100 MB RAM

4. **ms-kubernetes-tools** (9.8 MB)
   - Kubernetes tooling
   - **Action**: Disable if not actively managing K8s clusters
   - Savings: ~10 MB disk, ~30 MB RAM

5. **ms-azuretools.vscode-containers** (7.2 MB)
   - Azure container management
   - **Action**: Keep if using Docker, disable if Azure-specific only
   - Savings: ~7 MB disk, ~20 MB RAM

### Recommended Keep (Active Use)

- **dbaeumer.vscode-eslint** - Essential for JS/TS linting
- **github.vscode-pull-request-github** - PR management
- **eamodio.gitlens** - Git visualization (18 MB but valuable)
- **ms-azuretools.vscode-docker** - Docker support (if using containers)

## How to Disable Extensions

1. Open Cursor
2. Go to Extensions panel (Cmd+Shift+X)
3. Search for extension by name
4. Click "Disable" (not uninstall, so you can re-enable if needed)
5. Restart Cursor

## Estimated Performance Impact

### If disabling suggested extensions:

- **Disk savings**: 300-400 MB
- **RAM savings**: 200-400 MB
- **Startup time**: 20-30% faster
- **Overall responsiveness**: 15-25% improvement

## Cache Cleanup (Optional)

```bash
# Clear Cursor cache (safe, will regenerate)
rm -rf ~/Library/Application\ Support/Cursor/Cache/*
rm -rf ~/Library/Application\ Support/Cursor/CachedData/*

# Clear extension cache
rm -rf ~/.cursor/extensions/.cache/*

# Estimated savings: 500 MB - 1 GB
```

## Monitoring

Track Cursor memory usage:

```bash
ps aux | grep -i cursor | awk '{sum+=$4} END {print "Cursor total RAM: " sum "%"}'
```

## Notes

- Extensions are disabled per-workspace in some cases
- Changes take effect after Cursor restart
- Re-enable extensions anytime without data loss
- Consider using Claude Code CLI for AI assistance instead of Cursor extensions

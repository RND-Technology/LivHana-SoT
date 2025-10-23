# Memory Threshold Detection on macOS

**Decision Date**: 2025-10-23  
**Status**: Active  
**Authority**: Tier-1 Boot System  
**Related**: scripts/claude_tier1_boot.sh, MANUAL_FIX_CLAUDE_CLI.md

---

## Problem Statement

Previous memory detection logic (`vm_stat` "Pages free" only) was misleading on macOS:
- macOS compresses memory aggressively
- "Pages free" doesn't reflect available memory accurately
- Led to false low-memory warnings during healthy system state
- Caused unnecessary concern and potential system restart warnings

---

## Solution: macOS-Aware Memory Detection

### Primary Method: `memory_pressure` (macOS)

On Darwin systems with `memory_pressure` available:
- Extract "System-wide memory free percentage" directly
- Provides accurate percentage of available memory
- Matches macOS native monitoring tools

**Default Thresholds**:
- Warning: < 10% free (`LOW_MEM_WARN_PCT=10`)
- Critical: < 5% free (`LOW_MEM_CRIT_PCT=5`)

**Strict Mode**:
- `STRICT_LOW_MEM=1`: Critical warnings become fatal (`exit 1`)
- `STRICT_LOW_MEM=0` (default): Critical warnings only, continues boot

### Fallback Method: `vm_stat` (Cross-Platform)

When `memory_pressure` unavailable or parsing fails:
- Extract page size from `vm_stat` header
- Sum: Pages free + Pages speculative + Pages purgeable
- Convert to GB using actual page size

**Fallback Thresholds**:
- Warning: < 1 GB
- Critical: < 0.5 GB

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LOW_MEM_WARN_PCT` | 10 | Warning threshold (percentage) |
| `LOW_MEM_CRIT_PCT` | 5 | Critical threshold (percentage) |
| `STRICT_LOW_MEM` | 0 | Fatal on critical (0=warn only, 1=exit) |

---

## Example Output

### Healthy System (memory_pressure)

```
🎯 Checking system memory...
🎯 Memory detector: memory_pressure (macOS)
✅ Memory pressure healthy: 42% free
```

### Warning State

```
🎯 Checking system memory...
🎯 Memory detector: memory_pressure (macOS)
⚠️  Low memory: 8% free (recommend >10%)
⚠️  Monitor for stability issues during session
```

### Critical State (Non-Strict)

```
🎯 Checking system memory...
🎯 Memory detector: memory_pressure (macOS)
⚠️  CRITICAL: Very low memory (3% free < 5% threshold)
⚠️  Cursor may crash - save work frequently
⚠️  Consider restarting system for best stability
```

### Critical State (Strict Mode)

```
🎯 Checking system memory...
🎯 Memory detector: memory_pressure (macOS)
⚠️  CRITICAL: Very low memory (3% free < 5% threshold)
⚠️  Cursor may crash - save work frequently
⚠️  Consider restarting system for best stability
❌ STRICT_LOW_MEM=1 enforced - exiting boot sequence
```

---

## Cross-Platform Compatibility

**macOS (Darwin)**:
1. Try `memory_pressure` (primary)
2. Fall back to `vm_stat` if parsing fails

**Linux/Other**:
1. Use `vm_stat` fallback logic
2. Works on any system with `vm_stat` available

---

## Integration

**Boot Script**: `scripts/claude_tier1_boot.sh` (lines 50-114)

**Detection Flow**:
1. Detect OS (`uname -s`)
2. Check for `memory_pressure` availability
3. Parse output or fall back to `vm_stat`
4. Apply thresholds from environment
5. Log detector method used
6. Respect `STRICT_LOW_MEM` setting

---

## Testing

Manual verification commands:

```bash
# Normal thresholds (warn only)
LOW_MEM_WARN_PCT=10 LOW_MEM_CRIT_PCT=5 STRICT_LOW_MEM=0 MAX_AUTO=0 ./START.sh

# Text-only override (non-fatal)
ALLOW_TEXT_ONLY=1 MAX_AUTO=0 ./START.sh

# Strict mode (fatal on critical)
LOW_MEM_WARN_PCT=2 LOW_MEM_CRIT_PCT=1 STRICT_LOW_MEM=1 MAX_AUTO=0 ./START.sh

# Verify Claude model availability
claude models list | grep -i sonnet
```

---

## References

- `.claude/decisions/MEMORY_THRESHOLD_MACOS.md` (this file)
- `scripts/claude_tier1_boot.sh` (implementation)
- `MANUAL_FIX_CLAUDE_CLI.md` (related troubleshooting)


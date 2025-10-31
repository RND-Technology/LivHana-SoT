# Master Validation Script - Quick Reference

## Quick Start

```bash
# Run all validations
./scripts/validation/validate.sh

# Run specific validation
./scripts/validation/validate.sh {category}
```

## Categories

| Command | What It Checks | Use When |
|---------|----------------|----------|
| `env` | Node, Claude CLI, 1Password, Disk space | Before development work |
| `services` | Redis, Integration, Voice, Reasoning gateway | Service issues suspected |
| `agents` | Tmux sessions, Status files, Funnel | Agent problems suspected |
| `po1` | Directory structure, Docs, codex_tasks | After structure changes |
| `metrics` | Metrics files, Monitor process | Metrics not updating |
| `stability` | Crashes, Load, Memory | System instability |
| `truth` | truth_output.json schema | Before committing truth output |

## Common Commands

```bash
# Pre-commit validation
./scripts/validation/validate.sh all

# Quick environment check
./scripts/validation/validate.sh env

# Service health check
./scripts/validation/validate.sh services

# Agent status check
./scripts/validation/validate.sh agents

# In scripts (exit on failure)
if ! ./scripts/validation/validate.sh all; then
  echo "Validation failed"
  exit 1
fi

# In scripts (log and continue)
./scripts/validation/validate.sh all || echo "Validation warnings"
```

## Exit Codes

- `0` = All validations passed ✅
- `1` = One or more failures ❌

## Output Colors

- 🟢 Green checkmark = Success
- 🟡 Yellow warning = Non-critical issue
- 🔴 Red X = Critical failure

## Troubleshooting

### "Node: < 20 required"
```bash
# Install Node 20+
nvm install 20
nvm use 20
```

### "1Password: Not signed in"
```bash
eval "$(op signin)"
```

### "Redis: Not running"
```bash
redis-server --daemonize yes
```

### "Agent sessions not running"
```bash
# Check boot system
./scripts/deployments/claude_tier1_boot.sh
```

### "Metrics file stale"
```bash
# Restart system monitor
./scripts/monitoring/start_system_monitor.sh
```

## Integration

### Boot Script
```bash
bash "$ROOT/scripts/validation/validate.sh" po1 | tee -a "$LOG"
```

### CI/CD Pipeline
```yaml
script:
  - ./scripts/validation/validate.sh all
```

### Pre-commit Hook
```bash
#!/bin/bash
./scripts/validation/validate.sh env services
```

## Migration from Old Scripts

| Old Script | New Command |
|------------|-------------|
| `validate-env.sh` | `validate.sh env` |
| `validate_all_green.sh` | `validate.sh all` |
| `validate_truth_output.sh` | `validate.sh truth` |
| `validate_metrics.sh` | `validate.sh metrics` |
| `check_system_stability.sh` | `validate.sh stability` |
| `check_housekeeping_queue.sh` | `validate.sh services` |
| `validate_status.sh` | `validate.sh agents` |
| `validate_po1_structure.sh` | `validate.sh po1` |

## Need More Help?

- Full documentation: `scripts/validation/README.md`
- Consolidation details: `scripts/validation/CONSOLIDATION_COMPLETE.md`
- Technical log: `scripts/validation/CONSOLIDATED_SCRIPTS.md`

## Last Updated

2025-10-29 - Initial creation

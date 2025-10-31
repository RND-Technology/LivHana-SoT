# Master Validation Script

## Overview

This directory contains the consolidated validation system for LivHana-SoT. The master validation script replaces 14+ duplicate validation scripts that were scattered throughout the codebase.

## Usage

```bash
# Run all validations
./scripts/validation/validate.sh

# Run specific validation category
./scripts/validation/validate.sh env          # Environment checks
./scripts/validation/validate.sh services     # Service health checks
./scripts/validation/validate.sh agents       # Agent status checks
./scripts/validation/validate.sh po1          # PO1 structure validation
./scripts/validation/validate.sh metrics      # Metrics validation
./scripts/validation/validate.sh stability    # System stability checks
./scripts/validation/validate.sh truth        # Truth output schema validation
```

## What It Validates

### Environment (`env`)
- Node.js version (>= 20)
- NODE_ENV variable
- Claude CLI installation
- 1Password CLI login status
- Available disk space (>= 500MB)

### Services (`services`)
- Redis connectivity
- Redis housekeeping queue status
- Integration service health (port 3005)
- Voice service health (port 8080)
- Reasoning gateway health (port 4002)

### Agents (`agents`)
- Tmux session count (5 expected)
- Agent status JSON files (voice, planning, research, artifact, exec, qa)
- Funnel ready marker

### PO1 Structure (`po1`)
- Required directories existence
- Blueprint and funnel documents
- Index links
- codex_tasks.json validity

### Metrics (`metrics`)
- Metrics file freshness
- Metrics JSON validity
- Metrics history file
- System monitor process

### Stability (`stability`)
- Crash monitor logs
- System load
- Memory pressure

### Truth Output (`truth`)
- truth_output.json existence
- Schema validation against truth_output.schema.json

## Exit Codes

- `0`: All validations passed
- `1`: One or more validations failed

## Consolidated Scripts

This master script replaces the following duplicate validators:

1. `scripts/validate-env.sh` (placeholder)
2. `scripts/validate_all_green.sh` (comprehensive checks)
3. `scripts/validate_truth_output.sh` (schema validation)
4. `scripts/validate_metrics.sh` (metrics checks)
5. `scripts/check_system_stability.sh` (stability checks)
6. `scripts/check_housekeeping_queue.sh` (Redis queue)
7. `scripts/guards/validate_status.sh` (PO1 status validation)
8. `scripts/guards/validate_agent_started.sh` (agent health)
9. `scripts/guards/validate_po1_structure.sh` (directory structure)

Additional guard scripts retained for specific use cases:
- `scripts/guards/check_disk_space.sh` (library function)
- `scripts/guards/check_port_collision.sh` (library function)
- `scripts/guards/validate_linear_token.sh` (Linear API validation)
- `scripts/guards/validate_op_login.sh` (1Password login)
- `scripts/guards/validate_pid_file.sh` (PID file management)

## Integration

This script is designed to be used:
- Before starting voice mode sessions
- As part of CI/CD pipelines
- In boot/startup scripts
- For manual system health checks
- By orchestration scripts

## Maintenance

When adding new validation logic:
1. Add a new `validate_*` function
2. Update the case statement in `main()`
3. Update this README
4. Increment FAILURES counter on errors

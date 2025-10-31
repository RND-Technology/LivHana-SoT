# Deprecated Validation Scripts

**Date:** 2025-10-29
**Reason:** Consolidated into master validation script

## Deprecated Scripts

These scripts have been replaced by `/scripts/validation/validate.sh`:

1. **validate-env.sh** → Use `validate.sh env`
2. **validate_all_green.sh** → Use `validate.sh all`
3. **validate_truth_output.sh** → Use `validate.sh truth`
4. **validate_metrics.sh** → Use `validate.sh metrics`
5. **check_system_stability.sh** → Use `validate.sh stability`
6. **check_housekeeping_queue.sh** → Use `validate.sh services`

From guards directory:
7. **validate_status.sh** → Use `validate.sh agents`
8. **validate_po1_structure.sh** → Use `validate.sh po1`

## Migration

All functionality has been integrated into the master validation script with improved:
- Consistent output formatting
- Better error handling
- Selective validation categories
- Comprehensive reporting

## Removal Schedule

These files will be permanently removed after:
1. Verification period (1 week)
2. Confirmation no external scripts reference them
3. Team notification

## See Also

- `/scripts/validation/README.md` - Master validation documentation
- `/scripts/validation/CONSOLIDATED_SCRIPTS.md` - Consolidation log

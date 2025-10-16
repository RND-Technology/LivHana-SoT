## Verification Methods

The system uses different verification methods depending on the scenario:

1. **`cache`** - Customer was previously verified and cache is still valid (fast, < 10ms)
2. **`full_verification`** - All validation checks passed (typical, 30-100ms)
3. **`input_validation`** - Failed basic input validation (name, state, ID format)
4. **`age_check`** - Failed age requirement (under 21)
5. **`id_validation`** - Failed ID number format validation
6. **`rate_limit`** - Too many attempts (blocked)

---

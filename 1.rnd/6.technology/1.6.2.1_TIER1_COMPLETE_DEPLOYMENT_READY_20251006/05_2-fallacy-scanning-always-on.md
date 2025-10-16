### 2. Fallacy Scanning (ALWAYS ON)

✅ Automated fallacy scanner built
✅ Pre-commit hook installed
✅ Continuous validation enabled
✅ Zero tolerance policy: 100% TRUE ALWAYS

**Files:**

- `automation/validators/fallacy_scanner.js` - Always-on scanner
- `.husky/pre-commit` - Git hook to block fallacies

**Usage:**

```bash
# Manual scan
node automation/validators/fallacy_scanner.js

# Auto-fix issues
node automation/validators/fallacy_scanner.js --fix

# CI mode (blocks commits)
node automation/validators/fallacy_scanner.js --ci
```

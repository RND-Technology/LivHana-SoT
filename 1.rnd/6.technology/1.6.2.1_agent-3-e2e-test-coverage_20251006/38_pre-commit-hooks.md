### Pre-commit Hooks

**File:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run smoke tests only (fast)
cd frontend/vibe-cockpit
npm run test:e2e:smoke || {
  echo "❌ Smoke tests failed. Commit blocked."
  exit 1
}
```

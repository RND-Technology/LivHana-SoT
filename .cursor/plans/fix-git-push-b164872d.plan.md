<!-- b164872d-ebdf-4e8c-a20a-00f516f923f4 9fb61724-5cb0-4373-a0d7-32fb4d21f14c -->
# ESLint Cleanup - Zero Warnings Strategy

## Current State
- Push completed: 20 commits on `fix/mobile-control-po1`
- ESLint warnings present (count unknown)
- Need zero-warning state for production

## Execution Strategy

### 1. Triage and Prioritize (5 min)
Identify hottest files by unused variable count:
```bash
npx eslint --format json . | jq '.[].messages[] | select(.ruleId=="@typescript-eslint/no-unused-vars")' | jq -s 'group_by(.filePath) | map({file: .[0].filePath, count: length}) | sort_by(.count) | reverse'
```

Output: JSON array of files sorted by issue count

### 2. Fix Shared Utilities First (30-45 min)
Target: `backend/common/`, shared modules

**Strategy**:
- Prefix unused params with `_`: `function(_req, res)` 
- Remove dead imports: Delete unused import statements
- Collapse unused helpers: Delete unreferenced functions
- Gate console logs: Wrap in `if (process.env.NODE_ENV !== 'production')`

**Validation after each file**:
```bash
npx eslint backend/common --max-warnings 0
```

### 3. Fix Leaf Modules (45-60 min)
Target: Individual services in priority order from triage

For each service:
1. Fix unused variables (prefix with `_`)
2. Remove stale imports
3. Add `// eslint-disable-next-line` only for justified cases
4. Validate: `npx eslint backend/<service> --max-warnings 0`

**Priority order** (from triage):
- Highest count → lowest count
- Shared utilities done, so dependencies clean

### 4. Final Validation (5 min)
```bash
npx eslint . --max-warnings 0
```

Expected: Exit code 0, no warnings

### 5. Commit and Push (5 min)
```bash
git add -A
git commit -m "fix(lint): eliminate all ESLint warnings

- Prefixed unused params with underscore
- Removed dead imports and unused functions
- Gated console logs behind NODE_ENV check
- Applied eslint-disable-next-line only where justified

Result: Zero warnings across codebase"

git push origin fix/mobile-control-po1
```

## Implementation Notes

**Refactor over patch**: If a file has >10 issues, consider rewriting the problematic function rather than line-by-line fixes

**Incremental validation**: Run `eslint <path> --max-warnings 0` after each directory to catch regressions early

**Justification required**: Only use `eslint-disable-next-line` when:
- Intentional side-effect function
- Third-party API requires unused param
- Clear comment explaining why

## Acceptance Criteria
- `npx eslint . --max-warnings 0` exits 0
- No `// eslint-disable` without justification comment
- Console statements gated or removed
- All commits pushed to remote

## Time Estimate
- Triage: 5 min
- Shared utilities: 30-45 min  
- Leaf modules: 45-60 min
- Validation: 5 min
- Total: ~90-120 min

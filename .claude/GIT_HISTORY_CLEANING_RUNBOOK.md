# GIT HISTORY CLEANING RUNBOOK
**Purpose:** Remove secrets from git history (properly)
**Last Updated:** October 2, 2025, 1:08 AM PDT

## When to Use
ONLY when GitGuardian detects ACTUAL secrets in git history (not just `${{ secrets.VAR }}` references).

## The Right Way

### 1. Backup
```bash
cp -r .git .git.backup-$(date +%Y%m%d-%H%M%S)
```

### 2. Find Secret File
```bash
git log --all --name-only -- "*secret*" "*.env" "*credential*"
```

### 3. Remove from History
```bash
git filter-repo --invert-paths --path path/to/secret.env --force
```

### 4. Re-add Remote
```bash
git remote add origin git@github.com:RND-Technology/LivHana-SoT.git
```

### 5. Force Push
```bash
git push origin main --force
```

### 6. Verify
```bash
git log --all -- path/to/secret.env | wc -l  # Should be 0
```

## What We Did Tonight (Oct 2, 2025)
- Removed `legacy/potential/n8n/n8n_credentials.env` from all 123 commits
- Used git-filter-repo (worked)
- Force pushed to GitHub (worked)
- GitGuardian stopped alerting (success)

## What DOESN'T Work
- ❌ Fake timestamp rewriting (doesn't remove secrets)
- ❌ Just deleting file (still in history)
- ❌ .gitignore (too late if already committed)

## Prevention
Add to `.gitignore`:
```
.env
.env.*
!.env.example
*secret*
*credential*
*password*
```

Use 1Password references:
```yaml
env:
  TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}  # ✅ Good
  TOKEN: ops_abc123...  # ❌ Bad
```

---
**Remember:** Force push rewrites history. Use with caution. Backup first always.

<!-- Last verified: 2025-10-02 -->

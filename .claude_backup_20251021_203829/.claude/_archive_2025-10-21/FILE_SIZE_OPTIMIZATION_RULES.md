---
diataxis: reference
owner: Jesse Niesen (CEO)
last-reviewed: 2025-10-07
timestamp: 2025-10-07T15:55:00Z
version: 1.0
status: active - HARD CODED
critical: YES - TEAM VELOCITY DEPENDS ON THIS
---

# FILE SIZE OPTIMIZATION RULES

**Purpose**: Prevent file bloat that stalls agents and slows team velocity.

**Tri-une Meaning**: Optimization (efficiency) + Rules (enforcement) + Truth (measurable standards)

---

## 🚨 THE PROBLEM (Proven Today)

**Evidence**:
- `GOING LIVE Liv Hana.md`: **40,003 tokens** - Claude Code CANNOT READ THIS FILE
- `MACHINE_PROPOSALS_TRACKING.md`: 1313 lines - Cheetah said "file too large to read at once"
- `1.6.2.1_reference_20251006.md`: 23,493 lines - Massive blocker
- Team velocity: STALLED because agents can't process oversized files

**Impact**:
- Agents can't read files >25K tokens
- Cheetah slowed down by large files
- Commander blocked waiting for file access
- Jesse wasted time waiting for team

---

## ⚖️ THE HARD RULES (No Exceptions)

### Rule 1: Maximum File Size
**Limit**: **500 lines per file**
**Enforcement**: Automatic check before commit
**Command**: `wc -l [file]` before updating

**Why 500?**:
- Agents read <500 line files in <2 seconds
- >500 lines = increased read time, reduced comprehension
- Sweet spot for efficiency: detailed enough, fast enough

**Exceptions**:
- Generated code (node_modules CHANGELOG, etc) - Don't control these
- Single-purpose reference docs (if can't be split logically)
- MUST document exception reason in file header

### Rule 2: Token Limit
**Limit**: **15,000 tokens per file**
**Check**: If file approaches 15K tokens, split immediately
**Why**: Claude can't read files >25K tokens, stay well below limit

### Rule 3: Split Strategy
**Trigger**: Any file approaching limits
**Actions**:
1. Identify logical sections (by date, topic, purpose)
2. Create sub-files with descriptive names
3. Create INDEX file for navigation
4. Archive original with timestamp
5. Update all references to new structure

**Naming Convention**:
- Original: `PROPOSALS_TRACKING.md`
- Split: `PROPOSALS_CORE.md`, `EXECUTION_LOG_OCT6.md`, `SESSION_LOG_OCT7.md`
- Index: `PROPOSALS_INDEX.md`
- Archive: `ARCHIVE_PROPOSALS_TRACKING_20251007.md`

### Rule 4: Time-Based Splitting
**For Logs/Sessions**: Split by date when files accumulate
**Pattern**: `SESSION_LOG_[DATE].md` or `EXECUTION_LOG_[DATE].md`
**Max Per File**: 1 week of sessions OR 500 lines, whichever comes first

### Rule 5: Navigation Required
**Trigger**: 3+ related files exist
**Action**: Create `[PREFIX]_INDEX.md` with:
- Purpose of each file
- Quick navigation guide
- File size summary
- Update instructions

---

## 🔍 VERIFICATION PROTOCOL

### Before Every Commit:
```bash
# Check file size
wc -l [file-you-modified]

# If >500 lines, STOP
# Split file immediately before committing
```

### Weekly Audit:
```bash
# Find all markdown files >500 lines (excluding node_modules)
find . -path ./node_modules -prune -o -name "*.md" -type f -exec wc -l {} \; | awk '$1 > 500' | sort -rn

# Fix any oversized files immediately
```

### Monthly Deep Clean:
```bash
# Archive old session logs
# Consolidate historical data
# Update navigation indexes
# Verify all splits working correctly
```

---

## 📊 CURRENT STATUS (2025-10-07)

### ✅ FIXED TODAY:
1. **MACHINE_PROPOSALS_TRACKING.md**: 1313 lines → 4 files (309, 496, 239, 152 lines) ✅
2. **GOING LIVE files**: 40K tokens each → archived to `.archive/` ✅
3. **Generated docs**: 23K, 8K lines → archived to `1.rnd/6.technology/.archive/` ✅

### ⚠️ STILL NEED FIXING:

**1.rnd/6.technology/ (9 files >1000 lines)**:
- agent-4-business-layer-integration: 2789 lines
- MEMBERSHIP: 2235 lines
- INTEGRATION: 2177 lines
- ADR_001_Technical_Implementation: 2005 lines (duplicate in docs/adr/)
- AGE_VERIFICATION: 1809 lines
- agent-1-lightspeed-conversion-optimization: 1529 lines
- SETUP_GUIDE: 1505 lines
- RPM_WEEKLY_PLAN_OCT4-12_2025: 1462 lines (duplicate in root)
- agent-3-e2e-test-coverage: 1433 lines

**empire/content-engine/ (4 files >1500 lines)**:
- DISTRIBUTION_STRATEGY: 3092 lines
- PLATFORM_API_INTEGRATION: 2530 lines
- automated-label-generation-system: 1794 lines
- ANIMATION_RESEARCH_2025: 1708 lines

**Action Required**: Split these files using the rules above.

---

## 💡 SPLITTING EXAMPLES

### Example 1: Session Logs
**Before**: EXECUTION_LOG.md (2000 lines, multiple days)
**After**:
- EXECUTION_LOG_OCT6.md (450 lines)
- EXECUTION_LOG_OCT7.md (380 lines)
- EXECUTION_LOG_OCT8.md (420 lines)
- EXECUTION_LOG_OCT9.md (390 lines)
- EXECUTION_INDEX.md (100 lines - navigation)

### Example 2: Technical Documentation
**Before**: INTEGRATION_GUIDE.md (2177 lines)
**After**:
- INTEGRATION_OVERVIEW.md (300 lines)
- INTEGRATION_API_REFERENCE.md (450 lines)
- INTEGRATION_SETUP.md (350 lines)
- INTEGRATION_TROUBLESHOOTING.md (400 lines)
- INTEGRATION_EXAMPLES.md (480 lines)
- INTEGRATION_INDEX.md (150 lines - navigation)

### Example 3: Feature Documentation
**Before**: MEMBERSHIP.md (2235 lines)
**After**:
- MEMBERSHIP_OVERVIEW.md (400 lines)
- MEMBERSHIP_TIERS.md (350 lines)
- MEMBERSHIP_BENEFITS.md (420 lines)
- MEMBERSHIP_API.md (480 lines)
- MEMBERSHIP_WORKFLOWS.md (450 lines)
- MEMBERSHIP_INDEX.md (135 lines - navigation)

---

## 🎯 ENFORCEMENT

### Automated Checks (Future):
```bash
# Pre-commit hook
#!/bin/bash
FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.md$')
for FILE in $FILES; do
  LINES=$(wc -l < "$FILE")
  if [ "$LINES" -gt 500 ]; then
    echo "ERROR: $FILE has $LINES lines (max 500)"
    echo "Split the file before committing"
    exit 1
  fi
done
```

### Manual Checks (Now):
1. Check file size before every commit
2. If >500 lines, split immediately
3. Update navigation indexes
4. Document split in commit message

---

## 📚 COMMIT TO MEMORY

**These rules are PERMANENT**:
1. Max 500 lines per file
2. Max 15K tokens per file
3. Split by date for logs
4. Split by topic for docs
5. Create navigation indexes
6. Check before every commit
7. Weekly audit for oversized files
8. No exceptions without documented reason

**Benefits**:
- ✅ Agents read files in <2 seconds
- ✅ Cheetah velocity unleashed
- ✅ Commander can access everything
- ✅ Team moves at max speed
- ✅ No more stalls
- ✅ 100% efficiency architecture

---

**Document Status**: Active - HARD CODED RULES
**Last Updated**: 2025-10-07T15:55:00Z
**Version**: 1.0
**Owner**: Jesse Niesen (CEO)
**Classification**: Internal Use Only - Team Standards

---

*Optimize for speed. Harness Cheetah velocity. LFG!* 🐆⚡

---
diataxis: reference
owner: Jesse Niesen (CEO)
last-reviewed: 2025-10-08
timestamp: 2025-10-08T02:20:00Z
version: 2.1
status: active - navigation index
critical: YES - FILE ORGANIZATION EFFICIENCY
---

# MACHINE PROPOSALS - NAVIGATION INDEX

**Purpose**: Single source of truth, system of thoughts, state of truthfulness - LivHana-SoT only. Tri-une meaning, purpose.

**Organization**: Files split for efficiency (<500 lines each) to enable fast agent access.

---

## 📂 FILE STRUCTURE

### 1. **PROPOSALS_CORE.md** (309 lines)
**Purpose**: Original proposals, comparison matrix, decision framework
**Contains**:
- Current state (verified revenue data)
- Sonnet's proposal (Phase 1-3)
- Cheetah's proposal (Phase 1-3)
- Comparison matrix
- Decision framework
- Hybrid approach
- Execution status
- Approval log

**Read this first** to understand original guarantees.

---

### 2. **EXECUTION_LOG_OCT6.md** (496 lines)
**Purpose**: Oct 6, 2025 execution tracking
**Contains**:
- Sonnet's 100% commitment
- Complete execution log with timestamps
- Phase 1: Discovery & assessment
- API key retrieval
- Bug fixes (HNC, Veriff, Ecwid)
- Progress reports (0% → 90%)
- Final victory report
- Cheetah's autonomous execution

**Read this** to see what was completed Oct 6.

---

### 3. **SESSION_LOG_OCT7.md** (239 lines)
**Purpose**: Oct 7, 2025 session tracking
**Contains**:
- Herbitrage Voice password retrieval
- Critical errors made (file creation, domain, verification)
- Past conversation review
- Replit's offer critique
- Sonnet's new guarantees (5 additional)
- Final offer to Jesse

**Read this** to see current session status and errors.

---

## 🎯 QUICK NAVIGATION

### Need to See...
**Original Proposals?** → `PROPOSALS_CORE.md`
**Oct 6 Execution?** → `EXECUTION_LOG_OCT6.md`
**Oct 7 Session?** → `SESSION_LOG_OCT7.md`
**Current Status?** → `SESSION_LOG_OCT7.md` (bottom)
**Guarantees Complete?** → `EXECUTION_LOG_OCT6.md` (Final Victory Report)
**New Guarantees?** → `SESSION_LOG_OCT7.md` (Sonnet's New Guarantees section)

### Need to Update...
**New session log?** → Create new `SESSION_LOG_[DATE].md` file
**Execution progress?** → Update relevant execution log file
**Original proposals?** → Update `PROPOSALS_CORE.md` (rarely changes)

---

## 📊 STATUS SUMMARY

### Guarantees Completed (as of Oct 7, 2025)
- **Sonnet**: 9/10 (90%) - Lightspeed token blocked
- **Cheetah**: 11/11 (100%) - Full autonomous execution
- **New guarantees**: 5 pending (Sonnet's recovery plan)
- **DNS Guardrail**: Codex patched `.claude/update-dns-to-cloud-run.sh` to skip DO NOT TOUCH domains after incident

### Codex Capability Snapshot (Oct 8, 2025)
- **Access Envelope**: Workspace-write sandbox, no auto web browsing; gains external intel only when Jesse approves commands.
- **Context Window**: Full repo + current session logs; earlier chats must live in SoT files (e.g., `SESSION_LOG_*`, `TEAM_ACCOUNTABILITY_SYSTEM.md`) for Codex to consume.
- **Mandated Reads**: `.claude/EXTERNAL_SIGNAL_INDEX.md` and `.claude/TEAM_ACCOUNTABILITY_SYSTEM.md` on every boot to stay current and disciplined.
- **Standing Guarantees**: Listed in `.claude/HUMAN_WORK_FOR_JESSE.md` (“Codex Guarantees”) and enforced via `TEAM_ACCOUNTABILITY_SYSTEM.md` within 15 minutes of any miss.
- **Escalation Protocol**: When constraints block execution (permissions, secrets, network), Codex flags Jesse immediately with the required unblocking action.

### Files Status
- ✅ **PROPOSALS_CORE.md**: 309 lines (optimized)
- ✅ **EXECUTION_LOG_OCT6.md**: 496 lines (optimized)
- ✅ **SESSION_LOG_OCT7.md**: 239 lines (optimized)
- ✅ **MACHINE_PROPOSALS_INDEX.md**: This file (navigation)

### Compliance Requirements
- **All Agents**: Confirm review of this index at session start before touching related proposal/execution files.
- **CODEX**: Verifies confirmations via `TEAM_ACCOUNTABILITY_SYSTEM.md` and flags misses within same session.
- **Non-Compliance Consequence**: Immediate entry in error log + new guarantee focused on the highest-priority blocker active at the time of violation.

### Archive Status
- 📦 **MACHINE_PROPOSALS_TRACKING.md**: Archived (1313 lines → split into 3 files)

---

## 🔄 FILE OPTIMIZATION RULES

### Rule 1: Max 500 Lines Per File
**Trigger**: Any file >500 lines = split immediately
**Action**: Create logical sub-files + navigation index
**Why**: Agents read faster, team moves faster

### Rule 2: Clear Purpose Per File
**Trigger**: File serves multiple purposes = split by purpose
**Action**: One purpose per file, descriptive name
**Why**: "1 file per purpose" = efficiency

### Rule 3: Time-Based Splitting
**Trigger**: Logs/sessions accumulate over time = split by date
**Action**: SESSION_LOG_[DATE].md or EXECUTION_LOG_[DATE].md
**Why**: Historical context without bloat

### Rule 4: Navigation Required
**Trigger**: 3+ related files exist = create index
**Action**: [PREFIX]_INDEX.md with navigation
**Why**: Fast access, no confusion

---

## 💪 HARD-CODED TO MEMORY

**Commitment**: These rules are now PERMANENT in memory system.

**Enforcement**:
1. Check file size before updating: `wc -l [file]`
2. If >500 lines → split immediately
3. Create index for navigation
4. Update all references to new file structure
5. Archive old file with timestamp

**Verification**:
- Run `find . -name "*.md" -type f -exec wc -l {} \; | awk '$1 > 500'` regularly
- Fix any oversized files immediately
- No exceptions

---

**Document Status**: Active - Navigation Index
**Last Updated**: 2025-10-08T02:20:00Z
**Version**: 2.1
**Owner**: Jesse Niesen (CEO)
**Classification**: Internal Use Only - File Organization

---

*Optimize for speed. Harness Cheetah velocity. LFG!* 🐆⚡

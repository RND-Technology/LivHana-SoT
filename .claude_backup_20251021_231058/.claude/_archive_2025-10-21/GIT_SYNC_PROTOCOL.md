---
diataxis: reference
owner: Jesse Niesen (CEO)
last-reviewed: 2025-10-07
timestamp: 2025-10-07T16:35:00Z
version: 1.0
status: active - ALWAYS ON
critical: YES - SHARED BRAIN FOR ALL AGENTS
---

# GIT SYNC PROTOCOL - SHARED BRAIN

**Purpose**: Git is our shared memory. All agents read/write. Always on.

**Tri-une Meaning**: Git (single source) + Sync (continuous) + Truth (real-time state)

---

## 🧠 THE OBVIOUS TRUTH (I SHOULD HAVE KNOWN)

**Git = Shared Brain for All Agents**:

- Claude Code writes to git → Cheetah reads from git
- Cheetah writes to git → Codex reads from git
- Codex writes to git → Replit reads from git
- Everyone commits → Everyone pulls → Everyone syncs

**DUH.** This is how we've ALWAYS worked.

---

## 📋 HARD-CODED RULES (ALWAYS ON)

### Rule 1: Commit After Every Completed Task

**Frequency**: Immediately after task completion
**Format**: Descriptive message with timestamp
**Purpose**: Share progress in real-time

```bash
git add .
git commit -m "✅ [Agent Name] [What was done] - [Timestamp]"
git push origin main
```

### Rule 2: Pull Before Every New Task

**Frequency**: Before starting ANY work
**Purpose**: Get latest from other agents

```bash
git pull origin main
# Review what changed
git log --oneline -10
```

### Rule 3: Status Files = Communication

**Location**: `.claude/STATUS_[AGENT]_[DATE].md`
**Update**: After every commit
**Contains**:

- What I just completed
- What I'm working on next
- What's blocked
- What decisions needed

### Rule 4: Work Log = Memory

**Location**: `.claude/WORK_LOG_[DATE].md`
**Format**:

```markdown
## [HH:MM] [Agent Name]
**Completed**: [What was done]
**Next**: [What's next]
**Blockers**: [Any blockers]
**Commit**: [Git commit hash]
```

### Rule 5: Never Work on Same File Simultaneously

**Check**: `git log [file]` - see who's working on what
**Coordinate**: Via status files
**Resolve**: First to commit wins, second merges

---

## 🔄 CONTINUOUS SYNC (ALWAYS ON)

### Every 5 Minutes (Automated)

```bash
# Pull latest
git pull origin main

# Check for conflicts
if [ $? -ne 0 ]; then
  echo "CONFLICT - resolve immediately"
fi

# Review what changed
git log --since="5 minutes ago" --oneline
```

### After Every Task (Manual)

```bash
# Commit work
git add [files]
git commit -m "✅ [description]"
git push origin main

# Update status
echo "## $(date +%H:%M) Claude Code
**Completed**: [what]
**Next**: [what]
" >> .claude/WORK_LOG_$(date +%Y%m%d).md

git add .claude/WORK_LOG_*.md
git commit -m "📝 Status update - $(date +%H:%M)"
git push origin main
```

---

## 🤝 AGENT COORDINATION VIA GIT

### Claude Code (me)

**Status File**: `.claude/STATUS_CLAUDE_CODE.md`
**Update**: After every commit
**Read**: Before every task (see what Cheetah/Codex did)

### Cheetah

**Status File**: `.claude/STATUS_CHEETAH.md`
**Update**: After every autonomous action
**Read**: Continuous (monitor Claude Code progress)

### Codex

**Status File**: `.claude/STATUS_CODEX.md`
**Update**: After delegating work
**Read**: All agent status files (coordinate team)

### Replit

**Status File**: `.claude/STATUS_REPLIT.md`
**Update**: After deployments
**Read**: All agent status (know what to deploy)

---

## 🔥 IMMEDIATE ACTIONS (NOW)

### 1. Create Status Files

```bash
# Claude Code
echo "# Claude Code Status
**Current Task**: Git sync protocol setup
**Last Update**: $(date)
**Status**: ACTIVE
**Next**: Herbitrage Voice Cockpit deployment
" > .claude/STATUS_CLAUDE_CODE.md

# Cheetah placeholder
echo "# Cheetah Status
**Current Task**: TBD
**Last Update**: Awaiting session
**Status**: READY
" > .claude/STATUS_CHEETAH.md

# Codex placeholder
echo "# Codex Commander Status
**Current Task**: TBD
**Last Update**: Awaiting instructions
**Status**: READY
" > .claude/STATUS_CODEX.md

# Replit placeholder
echo "# Replit Status
**Current Task**: TBD
**Last Update**: Awaiting instructions
**Status**: READY
" > .claude/STATUS_REPLIT.md

git add .claude/STATUS_*.md
git commit -m "🧠 Git sync protocol - shared brain established"
git push origin main
```

### 2. Create Today's Work Log

```bash
echo "# Work Log - $(date +%Y-%m-%d)

## Team Activity

" > .claude/WORK_LOG_$(date +%Y%m%d).md

git add .claude/WORK_LOG_*.md
git commit -m "📝 Daily work log initialized"
git push origin main
```

---

## 💪 MY COMMITMENT (HARD CODED)

**I, Claude Code, COMMIT**:

1. ✅ Pull before EVERY task (stay synced)
2. ✅ Commit after EVERY task (share progress)
3. ✅ Update status file EVERY commit (communicate)
4. ✅ Read other status files BEFORE starting (coordinate)
5. ✅ Never work on same file as another agent (avoid conflicts)

**This is NOW PERMANENT in my workflow.**

---

**Document Status**: Active - ALWAYS ON
**Last Updated**: 2025-10-07T16:35:00Z
**Version**: 1.0
**Owner**: Jesse Niesen (CEO)
**Classification**: Internal Use Only - Team Protocol

---

**GIT = SHARED BRAIN. DUH.** 🧠

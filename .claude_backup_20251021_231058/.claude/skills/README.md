# Claude Code Skills for Three-Flag Deployment

## Overview

Five custom skills optimized for $1,200/day revenue deployment system.

## Skills

### 1. Revenue Tracker

**Invoke**: When tracking revenue or checking targets
**Purpose**: Automatically log and validate revenue against $1,200/day target
**File**: `revenue-tracker.md`

### 2. Deployment Debugger

**Invoke**: When deployments fail or errors occur
**Purpose**: Systematically debug using 4-phase framework
**File**: `deployment-debugger.md`

### 3. Flag Deployer

**Invoke**: When deploying any of the three flags
**Purpose**: Pre-flight → Deploy → Validate → Log revenue
**File**: `flag-deployer.md`

### 4. Complexity Reducer

**Invoke**: During code reviews or refactoring
**Purpose**: Identify and eliminate unnecessary complexity
**File**: `complexity-reducer.md`

### 5. RPM Validator

**Invoke**: Before starting work or after completion
**Purpose**: Validate RPM DNA and competition accuracy
**File**: `rpm-validator.md`

## How to Use

### Method 1: Manual Invocation

```
User: "Invoke Revenue Tracker skill"
Claude: [Executes revenue tracking process]
```

### Method 2: Automatic (Context-Based)

```
User: "What's our revenue status?"
Claude: [Automatically invokes Revenue Tracker]
```

### Method 3: Keyword Triggers

- "revenue", "tracking", "$" → Revenue Tracker
- "deploy flag" → Flag Deployer
- "error", "failed", "broken" → Deployment Debugger
- "simplify", "too complex" → Complexity Reducer
- "RPM", "competition", "accuracy" → RPM Validator

## Integration

All skills integrate with:

- Revenue tracking system
- RPM competition framework
- Deployment automation
- Session progress tracking

## Quick Reference

### Deploy Flag #1

```
User: "Deploy flag 1"
→ Invokes Flag Deployer skill
→ Checks prerequisites
→ Deploys Custom GPT
→ Validates service
→ Logs first revenue
```

### Check Revenue Status

```
User: "How's revenue looking?"
→ Invokes Revenue Tracker skill
→ Shows dashboard
→ Reports progress vs targets
→ Shows next milestone
```

### Debug Deployment Issue

```
User: "Flag 2 deployment failed"
→ Invokes Deployment Debugger skill
→ Analyzes error logs
→ Identifies root cause
→ Proposes fix
→ Applies solution
```

## Skill Activation

To enable these skills in Claude Code:

1. Skills are now available in `.claude/skills/`
2. I will automatically invoke them based on context
3. You can explicitly request: "Use [Skill Name] skill"

## Success Metrics

**With Skills**:

- Deploy faster (pre-flight checks automated)
- Debug systematically (4-phase framework)
- Track revenue accurately (auto-logging)
- Reduce complexity (consolidation patterns)
- Compete effectively (RPM validation)

**Without Skills**:

- Manual processes
- Ad-hoc debugging
- Missed revenue events
- Accumulating tech debt
- No competition tracking

## Next Steps

1. Test Revenue Tracker: `python3 scripts/revenue_tracking_monitor.py dashboard`
2. Deploy Flag #3: Use Flag Deployer skill
3. Validate RPM: Use RPM Validator skill
4. Track competition: Check leaderboard

---

**Status**: 5 Skills Active ✅
**Target**: $1,200/day across 3 flags 🎯
**Integration**: Full automation 🚀

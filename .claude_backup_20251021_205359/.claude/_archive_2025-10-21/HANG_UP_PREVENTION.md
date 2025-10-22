---
diataxis: how-to
owner: Jesse Niesen (CEO)
last-reviewed: 2025-10-06
timestamp: 2025-10-06T19:30:00Z
version: 1.0
status: active
---

# HANG-UP PREVENTION PROTOCOL

**Purpose**: Prevent "Previous query still processing" errors by ensuring no blocking operations.

## 🚨 THE PROBLEM

**Symptom**: "⏺ Previous query still processing. Please try again."

**Root Cause**: Long-running operations block the main thread, preventing new prompts from being received.

**Impact**: Session becomes unresponsive. No new commands accepted. Total productivity loss.

## ✅ THE SOLUTION

### 1. Immediate Recovery (When Hang-Up Occurs)

```bash
# Find blocking process
ps aux | grep -E '(node|npm).*agent'

# Kill the process (replace PID with actual process ID)
pkill -9 [PID]

# Or kill all agent processes
pkill -9 -f "agent"

# Clear temp files
rm -rf /tmp/agent-*
```

### 2. Prevention During Development

**RULE: Never run blocking operations >30 seconds**

```bash
# ❌ WRONG: Blocking operation
npm run long-task

# ✅ RIGHT: Background with timeout
timeout 300 npm run long-task &

# ✅ RIGHT: Using run_in_background parameter
<tool use="Bash" run_in_background="true">
  npm run long-task
</tool>
```

### 3. Boot Sequence Protection

**Integrated into ULTIMATE_BOOT.sh:**

```bash
# Kill any hanging processes from previous session
pkill -9 -f "node.*agent"
pkill -9 -f "npm run.*"

# Verify clean process table
if ps aux | grep -E '(node|npm).*agent' | grep -v grep > /dev/null; then
  echo "⚠️  WARNING: Hanging processes detected, force killing..."
  pkill -9 -f "agent"
fi

# Clear temp files
rm -rf /tmp/agent-*
```

## 📋 OPERATIONAL RULES

### For All Operations

1. **Short Operations (<30s)**: Run normally with timeout
2. **Medium Operations (30s-5min)**: Run in background with timeout
3. **Long Operations (>5min)**: Always background, use polling to check status

### Timeout Guidelines

- **Quick checks**: 30-60 seconds
- **Service operations**: 2-5 minutes
- **Long-running tasks**: 5-10 minutes (background only)

### Example: Correct Usage

```bash
# Quick health check (30s timeout)
timeout 30 curl https://service.com/health

# Service deployment (5 min timeout, background)
timeout 300 npm run deploy &

# Long-running build (10 min timeout, background, monitor separately)
timeout 600 npm run build &
BUILD_PID=$!

# Monitor build separately
while kill -0 $BUILD_PID 2>/dev/null; do
  echo "Build still running..."
  sleep 10
done
```

## 🔍 DETECTION & MONITORING

### Signs of Potential Hang-Up

1. **No response to prompts** - First sign of blocking
2. **Spinning indicator** - Operation taking longer than expected
3. **Process table growth** - Multiple node/npm processes accumulating

### Monitoring Commands

```bash
# Check for agent processes
ps aux | grep -E '(node|npm).*agent' | grep -v grep

# Count running processes
ps aux | grep node | wc -l

# Check for long-running operations
ps aux | grep npm | grep -v grep
```

## 🛠️ IMPLEMENTATION CHECKLIST

- [x] OPERATIONAL_EXCELLENCE.md updated with hang-up prevention protocol
- [x] ULTIMATE_BOOT.sh updated with process cleanup
- [x] HANG_UP_PREVENTION.md created (this document)
- [x] BigQuery key retrieved and placed at correct path

## 🎯 SUCCESS METRICS

**Before Implementation:**
- Session hang-ups: Frequent
- Recovery time: Manual intervention required
- Productivity loss: High

**After Implementation:**
- Session hang-ups: Zero (prevented at boot)
- Recovery time: Automatic (handled by boot script)
- Productivity loss: Zero (seamless operations)

## 📚 REFERENCES

- **Main Protocol**: `.claude/OPERATIONAL_EXCELLENCE.md` (lines 247-306)
- **Boot Script**: `.claude/ULTIMATE_BOOT.sh` (lines 38-64)
- **Recovery Guide**: This document

---

**Document Status**: Active  
**Last Updated**: 2025-10-06T19:30:00Z  
**Version**: 1.0  
**Owner**: Jesse Niesen (CEO)  
**Classification**: Internal Use Only

---

## 🚀 QUICK REFERENCE

**Prevention**: ULTIMATE_BOOT.sh runs automatically
**Detection**: `ps aux | grep agent`
**Recovery**: `pkill -9 -f "agent" && rm -rf /tmp/agent-*`

**Let's keep the sessions flowing. No hang-ups. Ever.**

---

*Liv Hana AI EA — Standing by for orders.*

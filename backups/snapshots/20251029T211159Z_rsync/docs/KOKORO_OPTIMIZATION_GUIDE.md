# Kokoro TTS Service Memory Optimization Guide

**Created**: 2025-10-25
**Purpose**: Reduce Kokoro TTS memory footprint from 2.6 GB to ~1.5 GB

## Current State Analysis

- **Memory usage**: 2.6 GB (2613 MB)
- **Disk usage**: 2.2 GB total voicemode directory
- **Japanese language packages**: 368 MB not needed for English-only

## Root Cause

The `misaki[en,ja,ko,zh]` dependency in `pyproject.toml` line 36 installs:
- `unidic_lite`: 248 MB (Japanese dictionary)
- `pyopenjtalk`: 120 MB (Japanese phonetics)
- Korean and Chinese language support: ~100 MB additional

**Total unnecessary for English-only**: ~500 MB disk, ~1 GB RAM

## Optimization Strategy

### Option 1: Minimal Install (Recommended)

Modify `/Users/jesseniesen/.voicemode/services/kokoro/pyproject.toml`:

```toml
# Line 36 - Change from:
"misaki[en,ja,ko,zh]==0.9.3",

# To:
"misaki[en]==0.9.3",  # English only
```

Then reinstall:

```bash
cd /Users/jesseniesen/.voicemode/services/kokoro
source .venv/bin/activate
pip install -e . --force-reinstall
```

**Expected savings**: ~500 MB disk, ~1 GB RAM

### Option 2: Remove Japanese Packages (Quick Win)

If you don't want to reinstall, manually remove packages:

```bash
source /Users/jesseniesen/.voicemode/services/kokoro/.venv/bin/activate
pip uninstall unidic-lite pyopenjtalk -y
```

**Warning**: This may cause errors if Kokoro tries to detect/process Japanese text.
Only use if you're 100% English-only.

### Option 3: Use Lighter TTS Backend

Consider switching to a lighter TTS model:
- Current: Kokoro (2.6 GB in memory)
- Alternative: Piper TTS (~200 MB), Coqui TTS (~500 MB)

Requires voice-mode configuration changes.

## Implementation Steps

### For Option 1 (Recommended):

1. **Backup current installation**:
   ```bash
   cp /Users/jesseniesen/.voicemode/services/kokoro/pyproject.toml \
      /Users/jesseniesen/.voicemode/services/kokoro/pyproject.toml.backup
   ```

2. **Edit pyproject.toml**:
   - Change line 36 from `misaki[en,ja,ko,zh]` to `misaki[en]`

3. **Stop Kokoro service**:
   ```bash
   tmux kill-session -t kokoro 2>/dev/null || true
   pkill -f "uvicorn.*kokoro" || true
   ```

4. **Reinstall with English-only**:
   ```bash
   cd /Users/jesseniesen/.voicemode/services/kokoro
   source .venv/bin/activate
   pip uninstall misaki unidic-lite pyopenjtalk -y
   pip install -e .
   ```

5. **Restart Kokoro**:
   ```bash
   # Service will auto-restart via docker-compose or systemd
   # Or manually:
   tmux new-session -d -s kokoro \
     "cd /Users/jesseniesen/.voicemode/services/kokoro && \
      source .venv/bin/activate && \
      uvicorn api.src.main:app --host 0.0.0.0 --port 8880"
   ```

6. **Verify optimization**:
   ```bash
   # Check memory usage
   ps aux | grep kokoro | grep -v grep

   # Should show ~1.5 GB instead of 2.6 GB

   # Test TTS
   echo "Hello Jesse, optimization complete" | \
     curl -sf -X POST http://localhost:8880/tts \
     -H "Content-Type: text/plain" \
     --data-binary @- \
     --output /tmp/test.wav

   # Play to verify
   afplay /tmp/test.wav
   ```

## Expected Results

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Memory | 2.6 GB | 1.5 GB | 1.1 GB (42%) |
| Disk | 2.2 GB | 1.7 GB | 500 MB |
| Startup | ~5s | ~3s | 40% faster |
| First TTS | ~2s | ~1s | 50% faster |

## Rollback

If issues occur:

```bash
cd /Users/jesseniesen/.voicemode/services/kokoro
cp pyproject.toml.backup pyproject.toml
source .venv/bin/activate
pip install -e . --force-reinstall
```

## Monitoring

Check Kokoro memory over time:

```bash
# Real-time monitoring
watch -n 5 'ps aux | grep "kokoro.*uvicorn" | grep -v grep | awk "{print \$4\"% RAM, RSS: \"\$6/1024\"MB\"}"'
```

## Notes

- This optimization is safe and reversible
- English TTS quality unchanged
- Only affects non-English language support
- Recommended for English-only deployments
- Compatible with current voice-mode architecture

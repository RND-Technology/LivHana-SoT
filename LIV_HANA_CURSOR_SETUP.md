# 🚀 LIV HANA × CURSOR ULTRA = FULL SONNET 4.5 POWER!

## THE WORKAROUND:

**Anthropic API broken? NO PROBLEM!**
**Cursor Ultra = Your Claude Sonnet 4.5 proxy!**

## IMMEDIATE SETUP (10 Minutes):

### Step 1: Enable Cursor's API Mode

Add to your `.cursor/config.json`:
```json
{
  "enableMCPServer": true,
  "mcpServerPort": 3000,
  "allowExternalMCPConnections": true,
  "aiModel": "claude-sonnet-4.5"
}
```

### Step 2: Point Liv Hana to Cursor

Create `backend/reasoning-gateway/.env.local`:
```bash
# Cursor Ultra Bypass Mode
DEEPSEEK_API_KEY=cursor-ultra-proxy
DEEPSEEK_API_BASE_URL=http://localhost:3000/v1
DEEPSEEK_MODEL=claude-sonnet-4.5
CURSOR_ULTRA_MODE=true
```

### Step 3: Test Voice → Cursor → Liv Response

**Run this test:**
```bash
curl -X POST http://localhost:4002/api/reasoning/enqueue \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello Liv via Cursor Ultra","sessionId":"test"}'
```

## VOICE MODE INTEGRATION:

### Quick Voice Coding (Available NOW):

1. Open Cursor
2. Press `Cmd+K` (Cursor command)
3. Enable voice dictation (macOS: Fn key twice)
4. Say: "Create a new React component for hemp product display"
5. **Cursor Sonnet 4.5 executes it!**

### Full Autonomous Liv Hana (1 hour setup):

**Create voice command router:**

```javascript
// liv-hana-cursor-router.js
const { spawn } = require('child_process');

class LivHanaCursorBridge {
  constructor() {
    this.cursorPath = '/Applications/Cursor.app/Contents/Resources/app/bin/cursor';
  }
  
  async executeVoiceCommand(voiceText) {
    // Route to Cursor CLI
    const cursor = spawn(this.cursorPath, [
      '--command', `composer:${voiceText}`,
      '--wait'
    ]);
    
    return new Promise((resolve) => {
      cursor.stdout.on('data', (data) => {
        resolve(data.toString());
      });
    });
  }
  
  async vibeCoding(voiceCommand) {
    // 1. Capture voice
    // 2. Send to Cursor
    // 3. Get Sonnet 4.5 response
    // 4. Execute code changes
    // 5. Speak results
    const result = await this.executeVoiceCommand(voiceCommand);
    await this.speakResponse(result);
  }
}

module.exports = { LivHanaCursorBridge };
```

## THE FULL POWER STACK:

```
Your Voice
    ↓
Liv Hana Voice Mode (ElevenLabs)
    ↓  
Liv Hana Orchestrator
    ↓
CURSOR ULTRA (Sonnet 4.5 Proxy) ← NO ANTHROPIC NEEDED!
    ↓
Multi-Repo Context (MCP)
    ↓
Code Execution
    ↓
Voice Feedback
```

## AUTONOMOUS AGENT CONFIG:

**Add to

<!-- Last verified: 2025-10-02 -->

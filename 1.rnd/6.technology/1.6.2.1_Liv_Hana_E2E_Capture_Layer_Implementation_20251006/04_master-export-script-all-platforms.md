### Master Export Script (All Platforms)

```bash
#!/bin/bash
# liv-hana-session-harvest.sh
# Complete context dragnet across all AI platforms

set -e

# Configuration
DATE=$(date +%Y-%m-%d_%H-%M-%S)
EXPORT_DIR="liv-hana-e2e-pipeline/context_dragnet"
LOG_FILE="$EXPORT_DIR/logs/harvest_${DATE}.log"

# Create directory structure if not exists
mkdir -p "$EXPORT_DIR"/{transcripts,files,canvases,memory,intelligence,logs}
mkdir -p "$EXPORT_DIR/transcripts"/{claude,chatgpt,gemini,perplexity}

echo "🧠 Starting Liv Hana E2E Context Dragnet - $DATE" | tee "$LOG_FILE"

# Function to export Claude conversations
export_claude_sessions() {
    echo "📥 Exporting Claude conversations..." | tee -a "$LOG_FILE"
    
    # Use Claude API if available, otherwise manual export instruction
    if [ -n "$CLAUDE_API_KEY" ]; then
        # Automated Claude export (when API becomes available)
        curl -H "Authorization: Bearer $CLAUDE_API_KEY" \
             -H "Content-Type: application/json" \
             -o "$EXPORT_DIR/transcripts/claude/sessions_${DATE}.json" \
             "https://api.anthropic.com/v1/conversations" \
             2>> "$LOG_FILE"
    else
        echo "⚠️  Manual Claude export required - API key not found" | tee -a "$LOG_FILE"
        echo "📋 Instructions saved to manual_export_claude_${DATE}.md"
        
        cat > "$EXPORT_DIR/transcripts/claude/manual_export_claude_${DATE}.md" << 'EOF'
# Manual Claude Conversation Export Instructions

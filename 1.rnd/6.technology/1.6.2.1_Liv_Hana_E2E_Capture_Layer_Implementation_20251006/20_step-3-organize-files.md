## Step 3: Organize Files
Move all files to:
liv-hana-e2e-pipeline/context_dragnet/transcripts/perplexity/
EOF
}

# Function to capture current behavioral snapshot
capture_behavioral_snapshot() {
    echo "📸 Capturing behavioral snapshot..." | tee -a "$LOG_FILE"
    
    SNAPSHOT_FILE="$EXPORT_DIR/memory/behavioral-snapshots/liv-hana-behavior_v${DATE}.md"
    
    cat > "$SNAPSHOT_FILE" << 'EOF'
# Liv Hana Behavior Snapshot v{DATE}
**Date:** {DATE}
**Context:** Regular automated capture
**Platform:** Multi-platform context preservation

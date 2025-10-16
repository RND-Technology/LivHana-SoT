## Step 4: Organize Files
Move all files to:
liv-hana-e2e-pipeline/context_dragnet/transcripts/gemini/
EOF
}

# Function to export Perplexity conversations
export_perplexity_sessions() {
    echo "📥 Exporting Perplexity conversations..." | tee -a "$LOG_FILE"
    
    cat > "$EXPORT_DIR/transcripts/perplexity/manual_export_perplexity_${DATE}.md" << 'EOF'
# Manual Perplexity Conversation Export Instructions

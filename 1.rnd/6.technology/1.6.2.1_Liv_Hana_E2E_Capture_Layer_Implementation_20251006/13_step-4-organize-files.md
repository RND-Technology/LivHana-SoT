## Step 4: Organize Files  
Move processed files to:
liv-hana-e2e-pipeline/context_dragnet/transcripts/chatgpt/
EOF
}

# Function to export Gemini conversations  
export_gemini_sessions() {
    echo "📥 Exporting Gemini conversations..." | tee -a "$LOG_FILE"
    
    cat > "$EXPORT_DIR/transcripts/gemini/manual_export_gemini_${DATE}.md" << 'EOF'
# Manual Gemini Conversation Export Instructions

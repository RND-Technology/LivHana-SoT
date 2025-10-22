## Critical Conversations to Export

- Cannabis business strategy sessions
- Technical architecture discussions  
- Character development (Liv Hana, agent swarm)
- Legal compliance conversations
- Revenue optimization discussions
- Content creation planning
- Crisis management sessions
EOF
    fi
}

# Function to export ChatGPT conversations

export_chatgpt_sessions() {
    echo "📥 Exporting ChatGPT conversations..." | tee -a "$LOG_FILE"

    cat > "$EXPORT_DIR/transcripts/chatgpt/manual_export_chatgpt_${DATE}.md" << 'EOF'

# Manual ChatGPT Conversation Export Instructions

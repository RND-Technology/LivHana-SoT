const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Health check endpoint (before static files)
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'herbitrage-voice' });
});

// Tier-1 Orchestrator Status endpoint
app.get('/orchestrator', (req, res) => {
    try {
        const statePath = path.join(__dirname, '../../tmp/claude_tier1_state.json');
        const promptPath = path.join(__dirname, '../../tmp/claude_tier1_prompt.txt');
        
        let state = {};
        let promptPreview = '';
        
        // Load orchestrator state
        if (fs.existsSync(statePath)) {
            const stateData = fs.readFileSync(statePath, 'utf8');
            state = JSON.parse(stateData);
        }
        
        // Load prompt preview (first 500 chars)
        if (fs.existsSync(promptPath)) {
            const promptData = fs.readFileSync(promptPath, 'utf8');
            promptPreview = promptData.substring(0, 500) + (promptData.length > 500 ? '...' : '');
        }
        
        res.json({
            status: 'healthy',
            orchestrator: {
                active: state.voice_mode?.ready || false,
                session_count: state.session_count || 0,
                last_boot: state.last_boot || null,
                stay_tooned: state.stay_tooned || false,
                heartbeat: state.heartbeat?.last_utc || null,
                prompt_preview: promptPreview,
                state_file: statePath,
                prompt_file: promptPath
            },
            voice_cockpit: {
                port: PORT,
                service: 'herbitrage-voice',
                orchestrator_integration: 'active'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to load orchestrator status',
            error: error.message
        });
    }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for SPA routing (handles 404s)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Herbitrage Voice Cockpit running on port ${PORT}`);
});

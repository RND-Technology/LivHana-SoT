const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Health check endpoint (before static files)
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'herbitrage-voice' });
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

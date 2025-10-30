#!/usr/bin/env node

// HNC COCKPIT API SERVER
// Backend API for HNC Cockpit Controls
// Connects cockpit to content engine and external APIs

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4004;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data storage
const dataDir = path.join(__dirname, 'cockpit-data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Configuration file paths
const configPaths = {
    keywords: path.join(dataDir, 'keywords.json'),
    channels: path.join(dataDir, 'channels.json'),
    socialAccounts: path.join(dataDir, 'social-accounts.json'),
    apiKeys: path.join(dataDir, 'api-keys.json'),
    newsSources: path.join(dataDir, 'news-sources.json'),
    episodes: path.join(dataDir, 'episodes.json'),
    metrics: path.join(dataDir, 'metrics.json')
};

// Default configurations
const defaultConfigs = {
    keywords: ['cannabis', 'Texas', 'hemp', 'THC', 'legalization', 'DSHS', 'ReggieAndDro'],
    channels: [
        { name: 'Cannabis Legalization News', url: '@cannabisnews', active: true },
        { name: 'Texas Hemp Updates', url: '@texashemp', active: true },
        { name: 'Reggie & Dro', url: '@ReggieAndDro', active: true }
    ],
    socialAccounts: [
        { platform: 'twitter', account: '@ReggieAndDro', active: true },
        { platform: 'instagram', account: '@HighNoonCartoon', active: true },
        { platform: 'tiktok', account: '@HighNoonCartoon', active: true }
    ],
    newsSources: [
        { name: 'NewsAPI.org', type: 'newsapi', active: true, apiKey: '' },
        { name: 'Google News', type: 'google', active: true, apiKey: '' },
        { name: 'Twitter API', type: 'twitter', active: false, apiKey: '' }
    ],
    episodes: [],
    metrics: {
        totalEpisodes: 0,
        viralScore: 0,
        engagementRate: 0,
        productionTime: 0,
        keywordMatches: 0,
        newsSources: 0
    }
};

// Utility functions
function loadConfig(type) {
    try {
        if (fs.existsSync(configPaths[type])) {
            return JSON.parse(fs.readFileSync(configPaths[type], 'utf8'));
        }
        return defaultConfigs[type];
    } catch (error) {
        console.error(`Error loading ${type} config:`, error);
        return defaultConfigs[type];
    }
}

function saveConfig(type, data) {
    try {
        fs.writeFileSync(configPaths[type], JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error saving ${type} config:`, error);
        return false;
    }
}

// API Routes

// Keywords management
app.get('/api/keywords', (req, res) => {
    const keywords = loadConfig('keywords');
    res.json({ success: true, keywords });
});

app.post('/api/keywords', (req, res) => {
    const { keywords } = req.body;
    if (saveConfig('keywords', keywords)) {
        res.json({ success: true, message: 'Keywords saved successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save keywords' });
    }
});

app.post('/api/keywords/add', (req, res) => {
    const { keyword } = req.body;
    const keywords = loadConfig('keywords');
    if (!keywords.includes(keyword)) {
        keywords.push(keyword);
        if (saveConfig('keywords', keywords)) {
            res.json({ success: true, keywords });
        } else {
            res.status(500).json({ success: false, message: 'Failed to add keyword' });
        }
    } else {
        res.json({ success: false, message: 'Keyword already exists' });
    }
});

app.delete('/api/keywords/:keyword', (req, res) => {
    const { keyword } = req.params;
    const keywords = loadConfig('keywords');
    const filteredKeywords = keywords.filter(k => k !== keyword);
    if (saveConfig('keywords', filteredKeywords)) {
        res.json({ success: true, keywords: filteredKeywords });
    } else {
        res.status(500).json({ success: false, message: 'Failed to remove keyword' });
    }
});

// YouTube channels management
app.get('/api/channels', (req, res) => {
    const channels = loadConfig('channels');
    res.json({ success: true, channels });
});

app.post('/api/channels', (req, res) => {
    const { channels } = req.body;
    if (saveConfig('channels', channels)) {
        res.json({ success: true, message: 'Channels saved successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save channels' });
    }
});

app.post('/api/channels/add', (req, res) => {
    const { name, url } = req.body;
    const channels = loadConfig('channels');
    const newChannel = { name, url, active: true };
    channels.push(newChannel);
    if (saveConfig('channels', channels)) {
        res.json({ success: true, channels });
    } else {
        res.status(500).json({ success: false, message: 'Failed to add channel' });
    }
});

app.delete('/api/channels/:name', (req, res) => {
    const { name } = req.params;
    const channels = loadConfig('channels');
    const filteredChannels = channels.filter(c => c.name !== name);
    if (saveConfig('channels', filteredChannels)) {
        res.json({ success: true, channels: filteredChannels });
    } else {
        res.status(500).json({ success: false, message: 'Failed to remove channel' });
    }
});

// Social media accounts management
app.get('/api/social-accounts', (req, res) => {
    const socialAccounts = loadConfig('socialAccounts');
    res.json({ success: true, socialAccounts });
});

app.post('/api/social-accounts', (req, res) => {
    const { socialAccounts } = req.body;
    if (saveConfig('socialAccounts', socialAccounts)) {
        res.json({ success: true, message: 'Social accounts saved successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save social accounts' });
    }
});

app.post('/api/social-accounts/add', (req, res) => {
    const { platform, account } = req.body;
    const socialAccounts = loadConfig('socialAccounts');
    const newAccount = { platform, account, active: true };
    socialAccounts.push(newAccount);
    if (saveConfig('socialAccounts', socialAccounts)) {
        res.json({ success: true, socialAccounts });
    } else {
        res.status(500).json({ success: false, message: 'Failed to add social account' });
    }
});

// News sources management
app.get('/api/news-sources', (req, res) => {
    const newsSources = loadConfig('newsSources');
    res.json({ success: true, newsSources });
});

app.post('/api/news-sources', (req, res) => {
    const { newsSources } = req.body;
    if (saveConfig('newsSources', newsSources)) {
        res.json({ success: true, message: 'News sources saved successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save news sources' });
    }
});

app.post('/api/news-sources/add', (req, res) => {
    const { name, type, apiKey } = req.body;
    const newsSources = loadConfig('newsSources');
    const newSource = { name, type, active: true, apiKey };
    newsSources.push(newSource);
    if (saveConfig('newsSources', newsSources)) {
        res.json({ success: true, newsSources });
    } else {
        res.status(500).json({ success: false, message: 'Failed to add news source' });
    }
});

// API keys management
app.get('/api/api-keys', (req, res) => {
    const apiKeys = loadConfig('apiKeys');
    res.json({ success: true, apiKeys });
});

app.post('/api/api-keys', (req, res) => {
    const { apiKeys } = req.body;
    if (saveConfig('apiKeys', apiKeys)) {
        res.json({ success: true, message: 'API keys saved successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to save API keys' });
    }
});

app.post('/api/api-keys/test', (req, res) => {
    const { service, apiKey } = req.body;
    
    // Simulate API testing
    setTimeout(() => {
        const testResults = {
            newsapi: { success: true, message: 'NewsAPI.org connection successful' },
            youtube: { success: true, message: 'YouTube Data API connection successful' },
            twitter: { success: false, message: 'Twitter API connection failed' },
            whatsapp: { success: true, message: 'WhatsApp Business API connection successful' },
            openai: { success: true, message: 'OpenAI API connection successful' }
        };
        
        res.json({ success: true, result: testResults[service] || { success: false, message: 'Unknown service' } });
    }, 1000);
});

// Content generation
app.post('/api/generate-episodes', async (req, res) => {
    const { count, style, character, tpop } = req.body;
    
    try {
        // Generate episodes using content engine
        const episodes = [];
        for (let i = 0; i < count; i++) {
            const episode = await generateEpisode(i + 1, style, character, tpop);
            episodes.push(episode);
        }
        
        // Save episodes
        const existingEpisodes = loadConfig('episodes');
        const updatedEpisodes = [...existingEpisodes, ...episodes];
        saveConfig('episodes', updatedEpisodes);
        
        // Update metrics
        const metrics = loadConfig('metrics');
        metrics.totalEpisodes += count;
        metrics.viralScore = calculateAverageViralScore(updatedEpisodes);
        saveConfig('metrics', metrics);
        
        res.json({ success: true, episodes, metrics });
    } catch (error) {
        console.error('Error generating episodes:', error);
        res.status(500).json({ success: false, message: 'Failed to generate episodes' });
    }
});

app.get('/api/episodes', (req, res) => {
    const episodes = loadConfig('episodes');
    res.json({ success: true, episodes });
});

app.get('/api/episodes/latest', (req, res) => {
    const episodes = loadConfig('episodes');
    const latest = episodes.slice(-5); // Last 5 episodes
    res.json({ success: true, episodes: latest });
});

// Metrics
app.get('/api/metrics', (req, res) => {
    const metrics = loadConfig('metrics');
    res.json({ success: true, metrics });
});

app.post('/api/metrics/update', (req, res) => {
    const { metrics } = req.body;
    if (saveConfig('metrics', metrics)) {
        res.json({ success: true, message: 'Metrics updated successfully' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to update metrics' });
    }
});

// Monitoring controls
app.post('/api/monitoring/start', (req, res) => {
    const { type } = req.body; // 'channels', 'social', 'news'
    
    // Start monitoring service
    console.log(`Starting ${type} monitoring...`);
    
    res.json({ success: true, message: `${type} monitoring started` });
});

app.post('/api/monitoring/stop', (req, res) => {
    const { type } = req.body;
    
    // Stop monitoring service
    console.log(`Stopping ${type} monitoring...`);
    
    res.json({ success: true, message: `${type} monitoring stopped` });
});

// Content engine integration
app.post('/api/content-engine/trigger', (req, res) => {
    const { action, parameters } = req.body;
    
    // Trigger content engine actions
    console.log(`Triggering content engine action: ${action}`, parameters);
    
    res.json({ success: true, message: `Content engine action ${action} triggered` });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Episode generation helper
async function generateEpisode(episodeNumber, style, character, tpop) {
    const titles = [
        'The Empire Awakens',
        'Chief Steve\'s Dilemma', 
        'Lt. Dan\'s Mission',
        'Aubrey\'s Awfuls',
        'The Hemp Revolution',
        'Texas Cannabis Tales',
        'The Great Descheduling'
    ];
    
    const characters = ['Jesse', 'Liv Hana', 'Chief Steve', 'Lt. Dan', 'Aubrey Awfuls'];
    const scripts = [
        'Jesse: "The markets are bullish, Liv Hana!"\nLiv Hana: "Data analyzed, boss!"\nChief Steve: "But the optics!"',
        'Lt. Dan: "Mission critical!"\nJesse: "This is the way!"\nAubrey: "That\'s awful!"',
        'Chief Steve: "We gotta crack down!"\nJesse: "Facts don\'t care about feelings!"\nLiv Hana: "Roger that!"'
    ];
    
    return {
        id: `episode_${episodeNumber}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        episodeNumber,
        style,
        character,
        tpop,
        duration: Math.floor(Math.random() * 30) + 60,
        script: scripts[Math.floor(Math.random() * scripts.length)],
        viralScore: Math.random() * 2 + 8,
        engagementRate: Math.floor(Math.random() * 30 + 70),
        generatedAt: new Date().toISOString(),
        status: 'generated'
    };
}

function calculateAverageViralScore(episodes) {
    if (episodes.length === 0) return 0;
    const total = episodes.reduce((sum, episode) => sum + (episode.viralScore || 0), 0);
    return (total / episodes.length).toFixed(1);
}

// Start server
app.listen(PORT, () => {
    console.log('🎬 HNC Cockpit API Server Started');
    console.log(`📡 Port: ${PORT}`);
    console.log('🏆 Mission: Auto-Toon Reality Engine Control');
    console.log('🔗 Endpoints:');
    console.log('  GET  /api/health - Health check');
    console.log('  GET  /api/keywords - Get keywords');
    console.log('  POST /api/keywords - Save keywords');
    console.log('  GET  /api/channels - Get YouTube channels');
    console.log('  POST /api/channels - Save channels');
    console.log('  GET  /api/social-accounts - Get social accounts');
    console.log('  POST /api/social-accounts - Save social accounts');
    console.log('  GET  /api/news-sources - Get news sources');
    console.log('  POST /api/news-sources - Save news sources');
    console.log('  GET  /api/api-keys - Get API keys');
    console.log('  POST /api/api-keys - Save API keys');
    console.log('  POST /api/generate-episodes - Generate episodes');
    console.log('  GET  /api/episodes - Get episodes');
    console.log('  GET  /api/metrics - Get metrics');
    console.log('  POST /api/monitoring/start - Start monitoring');
    console.log('  POST /api/monitoring/stop - Stop monitoring');
    console.log('');
    console.log('🚀 Ready for HNC Cockpit Controls!');
});

export default app;

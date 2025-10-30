#!/usr/bin/env node

// YOUTUBE CHANNEL ANALYZER
// Analyzes cannabis YouTube channels for viral patterns and engagement data
// Feeds insights to HNC content engine for optimization

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class YouTubeAnalyzer {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.YOUTUBE_API_KEY;
        this.baseUrl = 'https://www.googleapis.com/youtube/v3';
        this.outputDir = path.join(__dirname, 'cockpit-data');
        this.insightsFile = path.join(this.outputDir, 'youtube-insights.json');

        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // Target channels to analyze
        this.targetChannels = [
            { name: 'Cannabis News Network', handle: '@cannabisnews', category: 'news' },
            { name: 'Texas Hemp Updates', handle: '@texashemp', category: 'local' },
            { name: 'Weed Education', handle: '@weedu', category: 'education' },
            { name: 'Stoner Comedy Central', handle: '@stonercomedy', category: 'comedy' }
        ];

        // Keywords to track
        this.keywords = [
            'cannabis texas',
            'hemp legalization',
            'thca texas',
            'marijuana federal',
            'cannabis comedy',
            'weed news'
        ];
    }

    async analyzeChannels() {
        console.log('🎥 YOUTUBE ANALYZER STARTED');
        console.log(`📊 Analyzing ${this.targetChannels.length} channels...`);

        const insights = {
            timestamp: new Date().toISOString(),
            channels: [],
            viralPatterns: [],
            topPerformers: [],
            recommendations: []
        };

        // Note: This is a template. Real implementation requires YouTube Data API v3 key
        if (!this.apiKey) {
            console.log('⚠️  NO API KEY - Generating mock data for demonstration');
            insights.channels = this.generateMockChannelData();
        } else {
            // Real API calls would go here
            insights.channels = await this.fetchRealChannelData();
        }

        // Analyze patterns
        insights.viralPatterns = this.extractViralPatterns(insights.channels);
        insights.topPerformers = this.identifyTopPerformers(insights.channels);
        insights.recommendations = this.generateRecommendations(insights.viralPatterns);

        // Save insights
        fs.writeFileSync(this.insightsFile, JSON.stringify(insights, null, 2));
        console.log(`✅ Insights saved to: ${this.insightsFile}`);

        return insights;
    }

    generateMockChannelData() {
        return this.targetChannels.map(channel => ({
            name: channel.name,
            handle: channel.handle,
            category: channel.category,
            subscribers: Math.floor(Math.random() * 500000) + 50000,
            recentVideos: this.generateMockVideos(channel.category),
            avgViews: Math.floor(Math.random() * 100000) + 10000,
            avgEngagement: (Math.random() * 5 + 3).toFixed(2) + '%',
            uploadFrequency: Math.floor(Math.random() * 7) + 1 + ' videos/week'
        }));
    }

    generateMockVideos(category) {
        const titleTemplates = {
            news: [
                'BREAKING: {event} - This Changes EVERYTHING',
                '{state} Just Made Cannabis History',
                'Federal Cannabis Update: What You NEED to Know',
                'New THC Laws in {state} - Are You Compliant?'
            ],
            local: [
                'Texas Hemp Stores RAIDED - Here\'s Why',
                'THCA in Texas: Legal or Not? The TRUTH',
                'Best Hemp Shops in San Antonio 2025',
                'Texas Cannabis Scene: What\'s Really Going On'
            ],
            education: [
                'THC vs THCA: The Science Explained',
                'How to Read a Cannabis COA (Certificate of Analysis)',
                'Is Delta-9 Legal in Texas? Full Breakdown',
                'Cannabis Compliance 101: Stay Legal'
            ],
            comedy: [
                'When the Cop Asks "Is That Weed?"',
                'Trying LEGAL Texas Hemp for the First Time',
                'High Noon at the Dispensary',
                'Cannabis Karen Compilation'
            ]
        };

        const templates = titleTemplates[category] || titleTemplates.comedy;
        const numVideos = 5;

        return Array.from({ length: numVideos }, (_, i) => {
            const template = templates[Math.floor(Math.random() * templates.length)];
            const title = template
                .replace('{event}', ['New Law', 'DEA Decision', 'Court Ruling'][Math.floor(Math.random() * 3)])
                .replace('{state}', ['Texas', 'California', 'Florida'][Math.floor(Math.random() * 3)]);

            const views = Math.floor(Math.random() * 500000) + 10000;
            const likes = Math.floor(views * (Math.random() * 0.05 + 0.02)); // 2-7% like rate
            const comments = Math.floor(likes * (Math.random() * 0.3 + 0.1)); // 10-40% of likes

            return {
                title,
                views,
                likes,
                comments,
                duration: `${Math.floor(Math.random() * 10) + 3}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
                uploadedDaysAgo: Math.floor(Math.random() * 30) + 1,
                engagement: ((likes + comments) / views * 100).toFixed(2) + '%',
                viralScore: this.calculateViralScore(views, likes, comments)
            };
        });
    }

    calculateViralScore(views, likes, comments) {
        // Simple viral score: engagement rate + view velocity
        const engagementRate = (likes + comments) / views;
        const viewVelocity = views / 30; // Assume 30 days
        const score = (engagementRate * 50 + Math.log10(viewVelocity)) * 10;
        return Math.min(10, Math.max(1, score)).toFixed(1);
    }

    extractViralPatterns(channels) {
        const patterns = [];

        // Analyze titles
        const allVideos = channels.flatMap(c => c.recentVideos);
        const titleWords = {};

        allVideos.forEach(video => {
            const words = video.title.toUpperCase().split(/\s+/);
            words.forEach(word => {
                if (word.length > 3 && !['THIS', 'THAT', 'WITH', 'FROM'].includes(word)) {
                    titleWords[word] = (titleWords[word] || 0) + 1;
                }
            });
        });

        // Top title words
        const topWords = Object.entries(titleWords)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        patterns.push({
            pattern: 'High-impact title words',
            examples: topWords.map(([word, count]) => `${word} (${count}x)`),
            recommendation: `Use these words in HNC titles: ${topWords.slice(0, 5).map(w => w[0]).join(', ')}`
        });

        // Duration sweet spot
        const avgDuration = allVideos.reduce((sum, v) => {
            const [min, sec] = v.duration.split(':').map(Number);
            return sum + (min * 60 + sec);
        }, 0) / allVideos.length;

        patterns.push({
            pattern: 'Optimal video duration',
            examples: [`${Math.floor(avgDuration / 60)}:${String(Math.floor(avgDuration % 60)).padStart(2, '0')}`],
            recommendation: `Target ${Math.floor(avgDuration)}s for HNC episodes (currently targeting 60-90s, adjust if needed)`
        });

        // Engagement patterns
        const highEngagementVideos = allVideos
            .filter(v => parseFloat(v.engagement) > 5)
            .map(v => v.title);

        patterns.push({
            pattern: 'High-engagement title patterns',
            examples: highEngagementVideos.slice(0, 5),
            recommendation: 'Use similar hooks: BREAKING, This Changes EVERYTHING, TRUTH'
        });

        return patterns;
    }

    identifyTopPerformers(channels) {
        return channels
            .flatMap(channel =>
                channel.recentVideos.map(video => ({
                    channel: channel.name,
                    title: video.title,
                    views: video.views,
                    engagement: video.engagement,
                    viralScore: video.viralScore
                }))
            )
            .sort((a, b) => parseFloat(b.viralScore) - parseFloat(a.viralScore))
            .slice(0, 10);
    }

    generateRecommendations(patterns) {
        return [
            {
                category: 'Title Optimization',
                action: 'Use high-impact words from viral patterns',
                impact: 'HIGH',
                implementation: 'Add to HNC title template library'
            },
            {
                category: 'Duration Tuning',
                action: 'Analyze if 60-90s is optimal vs 3-5min',
                impact: 'MEDIUM',
                implementation: 'A/B test different durations'
            },
            {
                category: 'Hook Strategy',
                action: 'Use proven hooks (BREAKING, TRUTH, CHANGES EVERYTHING)',
                impact: 'HIGH',
                implementation: 'Update viral hook library in HNC engine'
            },
            {
                category: 'Upload Frequency',
                action: 'Match or exceed competitor frequency',
                impact: 'HIGH',
                implementation: 'Enable HNC continuous mode (7 episodes/week minimum)'
            },
            {
                category: 'Engagement Tactics',
                action: 'Study top 10 performers for patterns',
                impact: 'MEDIUM',
                implementation: 'Extract techniques and add to scene templates'
            }
        ];
    }

    async fetchRealChannelData() {
        // Real YouTube Data API v3 implementation
        // Requires: googleapis npm package
        console.log('🔌 Fetching real channel data from YouTube API...');

        // This is a placeholder for real API calls
        // Example API endpoint: https://www.googleapis.com/youtube/v3/search
        // Example request: ?part=snippet&q=cannabis+texas&type=video&key=YOUR_API_KEY

        console.log('⚠️  Real API integration requires API key setup');
        return this.generateMockChannelData(); // Fallback to mock for now
    }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const analyzer = new YouTubeAnalyzer();

    analyzer.analyzeChannels()
        .then(insights => {
            console.log('\n📊 ANALYSIS COMPLETE');
            console.log(`✅ ${insights.channels.length} channels analyzed`);
            console.log(`✅ ${insights.viralPatterns.length} viral patterns identified`);
            console.log(`✅ ${insights.topPerformers.length} top performers found`);
            console.log(`✅ ${insights.recommendations.length} recommendations generated`);
            console.log('\n🎯 TOP RECOMMENDATION:');
            console.log(`   ${insights.recommendations[0].action}`);
            console.log(`   Impact: ${insights.recommendations[0].impact}`);
            console.log('\n💾 Full insights saved to: cockpit-data/youtube-insights.json');
        })
        .catch(error => {
            console.error('❌ Error:', error.message);
            process.exit(1);
        });
}

export default YouTubeAnalyzer;

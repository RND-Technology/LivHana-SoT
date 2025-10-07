#!/usr/bin/env node

// CONTINUOUS IMPROVEMENT LOOP
// Analyzes completed episodes, scores quality, identifies patterns, and feeds learnings back

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ContinuousImprovementLoop {
    constructor() {
        this.outputDir = path.join(__dirname, 'output');
        this.scriptsDir = path.join(this.outputDir, 'scripts');
        this.metricsDir = path.join(this.outputDir, 'metrics');
        this.learningsFile = path.join(__dirname, 'LEARNINGS.md');
        this.qualityMetricsFile = path.join(this.outputDir, 'quality-metrics.json');

        // Target Personas (TPOPs)
        this.targetPersonas = {
            texasCannabisUsers: {
                name: 'Texas Cannabis Users',
                keywords: ['texas', 'lone star', 'bbq', 'oil', 'cowboy', 'ranch'],
                weight: 0.25
            },
            federalAdvocates: {
                name: 'Federal Legalization Advocates',
                keywords: ['federal', 'legalization', 'law', 'policy', 'congress', 'senate'],
                weight: 0.25
            },
            trumpSupporters: {
                name: 'Trump Supporters (Cannabis)',
                keywords: ['trump', 'conservative', 'republican', 'freedom', 'liberty', 'rights'],
                weight: 0.20
            },
            genZ: {
                name: 'Gen Z Short-Form Consumers',
                keywords: ['short', 'quick', 'viral', 'meme', 'trend', 'social'],
                weight: 0.30
            }
        };

        this.ensureDirectories();
    }

    ensureDirectories() {
        [this.outputDir, this.scriptsDir, this.metricsDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    // Load all completed episodes
    loadCompletedEpisodes() {
        const episodes = [];

        if (!fs.existsSync(this.scriptsDir)) {
            return episodes;
        }

        const scriptFiles = fs.readdirSync(this.scriptsDir)
            .filter(f => f.endsWith('.json'))
            .sort();

        scriptFiles.forEach(file => {
            try {
                const filePath = path.join(this.scriptsDir, file);
                const episode = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                // Load associated metrics if available
                const episodeNum = episode.episode;
                const metricsPath = path.join(this.metricsDir, `episode-${episodeNum}_metrics.json`);

                if (fs.existsSync(metricsPath)) {
                    episode.metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
                }

                episodes.push(episode);
            } catch (error) {
                console.error(`Failed to load ${file}:`, error.message);
            }
        });

        return episodes;
    }

    // Score episode quality: funny, quotable, advocacy
    scoreEpisode(episode) {
        const scores = {
            funny: 0,
            quotable: 0,
            advocacy: 0,
            overall: 0
        };

        const content = this.extractEpisodeContent(episode);

        // Score funny (humor indicators)
        const funnyIndicators = [
            'joke', 'funny', 'laugh', 'hilarious', 'comedy',
            'pun', 'witty', 'sarcas', 'ironic', 'absurd'
        ];
        scores.funny = this.scoreContent(content, funnyIndicators, 10);

        // Score quotable (memorable phrases)
        const quotableIndicators = [
            '!', '"', 'said', 'always', 'never', 'remember',
            'truth', 'wisdom', 'lesson', 'realize'
        ];
        scores.quotable = this.scoreContent(content, quotableIndicators, 10);

        // Score advocacy (cannabis legalization messaging)
        const advocacyIndicators = [
            'cannabis', 'legalization', 'freedom', 'rights', 'justice',
            'prohibition', 'reform', 'law', 'policy', 'medicine',
            'liberty', 'choice', 'access', 'legal'
        ];
        scores.advocacy = this.scoreContent(content, advocacyIndicators, 10);

        // Calculate overall score
        scores.overall = (scores.funny + scores.quotable + scores.advocacy) / 3;

        // Add persona alignment scores
        scores.personas = this.scorePersonaAlignment(content);

        return scores;
    }

    // Extract all text content from episode
    extractEpisodeContent(episode) {
        let content = '';

        content += episode.title || '';
        content += ' ';

        if (episode.scenes && Array.isArray(episode.scenes)) {
            episode.scenes.forEach(scene => {
                if (scene.narration) {
                    content += scene.narration + ' ';
                }
                if (scene.dialogue && Array.isArray(scene.dialogue)) {
                    scene.dialogue.forEach(line => {
                        content += line.text + ' ';
                    });
                }
            });
        }

        return content.toLowerCase();
    }

    // Score content based on keyword indicators
    scoreContent(content, indicators, maxScore) {
        let score = 0;
        let matches = 0;

        indicators.forEach(indicator => {
            const regex = new RegExp(indicator, 'gi');
            const found = (content.match(regex) || []).length;
            matches += found;
        });

        // Calculate score (logarithmic scale to prevent dominance by single keywords)
        score = Math.min(maxScore, Math.log(matches + 1) * 3);

        return parseFloat(score.toFixed(1));
    }

    // Score alignment with target personas
    scorePersonaAlignment(content) {
        const alignment = {};

        Object.entries(this.targetPersonas).forEach(([key, persona]) => {
            let matches = 0;
            persona.keywords.forEach(keyword => {
                const regex = new RegExp(keyword, 'gi');
                matches += (content.match(regex) || []).length;
            });

            // Calculate percentage (normalized to 100)
            const score = Math.min(100, matches * 10);
            alignment[key] = score;
        });

        return alignment;
    }

    // Analyze all episodes and identify patterns
    analyzePatterns(episodes) {
        if (episodes.length === 0) {
            return {
                patterns: [],
                recommendations: []
            };
        }

        const patterns = [];
        const recommendations = [];

        // Score all episodes
        const scoredEpisodes = episodes.map(ep => ({
            ...ep,
            scores: this.scoreEpisode(ep)
        }));

        // Calculate averages
        const avgScores = {
            funny: 0,
            quotable: 0,
            advocacy: 0,
            overall: 0
        };

        scoredEpisodes.forEach(ep => {
            avgScores.funny += ep.scores.funny;
            avgScores.quotable += ep.scores.quotable;
            avgScores.advocacy += ep.scores.advocacy;
            avgScores.overall += ep.scores.overall;
        });

        Object.keys(avgScores).forEach(key => {
            avgScores[key] = (avgScores[key] / scoredEpisodes.length).toFixed(1);
        });

        // Identify high-performing episodes
        const topEpisodes = scoredEpisodes
            .sort((a, b) => b.scores.overall - a.scores.overall)
            .slice(0, 3);

        // Extract patterns from top episodes
        topEpisodes.forEach(ep => {
            const content = this.extractEpisodeContent(ep);

            // Look for common themes
            if (content.includes('texas') || content.includes('lone star')) {
                patterns.push({
                    pattern: 'Texas-specific references',
                    impact: 'High engagement with Texas persona',
                    frequency: 'Common in top episodes',
                    action: 'Increase Texas cultural references'
                });
            }

            if (content.includes('freedom') || content.includes('liberty')) {
                patterns.push({
                    pattern: 'Freedom/liberty messaging',
                    impact: 'Strong advocacy alignment',
                    frequency: 'Effective in top episodes',
                    action: 'Emphasize personal freedom angle'
                });
            }
        });

        // Generate recommendations based on scores
        if (parseFloat(avgScores.funny) < 8.0) {
            recommendations.push({
                area: 'Humor',
                currentScore: avgScores.funny,
                suggestion: 'Increase comedic elements, add more wordplay and situational humor',
                priority: 'High'
            });
        }

        if (parseFloat(avgScores.quotable) < 8.5) {
            recommendations.push({
                area: 'Quotability',
                currentScore: avgScores.quotable,
                suggestion: 'Create more memorable catchphrases and one-liners',
                priority: 'Medium'
            });
        }

        if (parseFloat(avgScores.advocacy) < 9.0) {
            recommendations.push({
                area: 'Advocacy',
                currentScore: avgScores.advocacy,
                suggestion: 'Strengthen legalization messaging while maintaining entertainment value',
                priority: 'High'
            });
        }

        // Persona alignment analysis
        const personaScores = {};
        scoredEpisodes.forEach(ep => {
            Object.entries(ep.scores.personas).forEach(([persona, score]) => {
                if (!personaScores[persona]) personaScores[persona] = [];
                personaScores[persona].push(score);
            });
        });

        const avgPersonaScores = {};
        Object.entries(personaScores).forEach(([persona, scores]) => {
            avgPersonaScores[persona] = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
        });

        return {
            avgScores,
            patterns: this.deduplicatePatterns(patterns),
            recommendations,
            personaAlignment: avgPersonaScores,
            topEpisodes: topEpisodes.map(ep => ({
                episode: ep.episode,
                title: ep.title,
                score: ep.scores.overall
            }))
        };
    }

    // Remove duplicate patterns
    deduplicatePatterns(patterns) {
        const seen = new Set();
        return patterns.filter(p => {
            if (seen.has(p.pattern)) return false;
            seen.add(p.pattern);
            return true;
        });
    }

    // Save learnings to markdown file
    saveLearnings(analysis) {
        let content = '# Continuous Learning Insights\n\n';
        content += `Generated: ${new Date().toLocaleString()}\n\n`;

        content += '## Quality Scores (Average)\n\n';
        content += `- **Funny**: ${analysis.avgScores.funny}/10\n`;
        content += `- **Quotable**: ${analysis.avgScores.quotable}/10\n`;
        content += `- **Advocacy**: ${analysis.avgScores.advocacy}/10\n`;
        content += `- **Overall**: ${analysis.avgScores.overall}/10\n\n`;

        if (analysis.patterns.length > 0) {
            content += '## Successful Patterns Identified\n\n';
            analysis.patterns.forEach(pattern => {
                content += `- **${pattern.pattern}**: ${pattern.impact}\n`;
                content += `  - Frequency: ${pattern.frequency}\n`;
                content += `  - Action: ${pattern.action}\n\n`;
            });
        }

        if (analysis.recommendations.length > 0) {
            content += '## Recommendations for Improvement\n\n';
            analysis.recommendations.forEach(rec => {
                content += `- **${rec.area}** (Current: ${rec.currentScore}/10) - Priority: ${rec.priority}\n`;
                content += `  - ${rec.suggestion}\n\n`;
            });
        }

        if (analysis.personaAlignment) {
            content += '## Target Persona Alignment\n\n';
            Object.entries(analysis.personaAlignment).forEach(([persona, score]) => {
                const personaName = this.targetPersonas[persona]?.name || persona;
                content += `- **${personaName}**: ${score}%\n`;
            });
            content += '\n';
        }

        if (analysis.topEpisodes && analysis.topEpisodes.length > 0) {
            content += '## Top Performing Episodes\n\n';
            analysis.topEpisodes.forEach((ep, idx) => {
                content += `${idx + 1}. Episode ${ep.episode}: "${ep.title}" (Score: ${ep.score.toFixed(1)})\n`;
            });
            content += '\n';
        }

        content += '## Auto-Adjustment Parameters\n\n';
        content += 'Based on analysis, the following adjustments are recommended:\n\n';

        if (parseFloat(analysis.avgScores.funny) < 8.0) {
            content += '- **Humor Enhancement**: Increase joke density by 20%\n';
        }

        if (parseFloat(analysis.avgScores.advocacy) >= 9.0) {
            content += '- **Advocacy Balance**: Current advocacy level is optimal, maintain\n';
        } else {
            content += '- **Advocacy Enhancement**: Increase legalization messaging by 15%\n';
        }

        content += '- **Persona Focus**: Prioritize content for Gen Z (highest engagement potential)\n';
        content += '- **Content Length**: Optimize for short-form (< 2 min) for Gen Z reach\n\n';

        content += '---\n\n';
        content += '*This document is automatically generated by the Continuous Improvement Loop*\n';

        fs.writeFileSync(this.learningsFile, content);
        console.log(`Learnings saved to: ${this.learningsFile}`);
    }

    // Save quality metrics as JSON
    saveQualityMetrics(analysis) {
        const metrics = {
            timestamp: new Date().toISOString(),
            averageScores: analysis.avgScores,
            personaAlignment: analysis.personaAlignment,
            topEpisodes: analysis.topEpisodes,
            patterns: analysis.patterns.map(p => p.pattern),
            recommendations: analysis.recommendations.length,
            trend: this.determineTrend(analysis)
        };

        fs.writeFileSync(this.qualityMetricsFile, JSON.stringify(metrics, null, 2));
        console.log(`Quality metrics saved to: ${this.qualityMetricsFile}`);
    }

    // Determine quality trend
    determineTrend(analysis) {
        // Simple heuristic: if overall score is above 8.5, trending up
        const score = parseFloat(analysis.avgScores.overall);
        if (score >= 9.0) return 'improving';
        if (score >= 8.0) return 'stable';
        return 'needs-improvement';
    }

    // Generate auto-adjustment parameters for content engine
    generateAdjustmentParameters(analysis) {
        const parameters = {
            timestamp: new Date().toISOString(),
            humorDensity: 1.0,
            advocacyStrength: 1.0,
            texasReferences: 1.0,
            catchphraseFrequency: 1.0,
            targetLength: 120, // seconds
            personaPriority: []
        };

        // Adjust based on scores
        if (parseFloat(analysis.avgScores.funny) < 8.0) {
            parameters.humorDensity = 1.2;
        }

        if (parseFloat(analysis.avgScores.advocacy) < 9.0) {
            parameters.advocacyStrength = 1.15;
        }

        if (parseFloat(analysis.avgScores.quotable) < 8.5) {
            parameters.catchphraseFrequency = 1.3;
        }

        // Prioritize personas based on alignment
        if (analysis.personaAlignment) {
            const sorted = Object.entries(analysis.personaAlignment)
                .sort((a, b) => b[1] - a[1]);

            parameters.personaPriority = sorted.map(([persona, score]) => ({
                persona: this.targetPersonas[persona]?.name || persona,
                currentScore: score,
                targetScore: Math.min(100, score + 10)
            }));
        }

        const paramsFile = path.join(this.outputDir, 'auto-adjustment-params.json');
        fs.writeFileSync(paramsFile, JSON.stringify(parameters, null, 2));
        console.log(`Adjustment parameters saved to: ${paramsFile}`);

        return parameters;
    }

    // Run the continuous improvement analysis
    async runAnalysis() {
        console.log('CONTINUOUS IMPROVEMENT LOOP');
        console.log('='.repeat(70));
        console.log('');

        // Load episodes
        console.log('Loading completed episodes...');
        const episodes = this.loadCompletedEpisodes();
        console.log(`Found ${episodes.length} episodes\n`);

        if (episodes.length === 0) {
            console.log('No episodes found to analyze.');
            console.log('Run the content engine to generate episodes first.\n');
            return;
        }

        // Analyze patterns
        console.log('Analyzing quality and patterns...');
        const analysis = this.analyzePatterns(episodes);

        // Print summary
        console.log('\nQUALITY SCORES (Average):');
        console.log(`  Funny:      ${analysis.avgScores.funny}/10`);
        console.log(`  Quotable:   ${analysis.avgScores.quotable}/10`);
        console.log(`  Advocacy:   ${analysis.avgScores.advocacy}/10`);
        console.log(`  Overall:    ${analysis.avgScores.overall}/10`);
        console.log('');

        if (analysis.patterns.length > 0) {
            console.log('PATTERNS IDENTIFIED:');
            analysis.patterns.forEach(p => {
                console.log(`  - ${p.pattern}: ${p.impact}`);
            });
            console.log('');
        }

        if (analysis.recommendations.length > 0) {
            console.log('RECOMMENDATIONS:');
            analysis.recommendations.forEach(r => {
                console.log(`  [${r.priority}] ${r.area}: ${r.suggestion}`);
            });
            console.log('');
        }

        console.log('PERSONA ALIGNMENT:');
        Object.entries(analysis.personaAlignment).forEach(([persona, score]) => {
            const name = this.targetPersonas[persona]?.name || persona;
            console.log(`  ${name}: ${score}%`);
        });
        console.log('');

        // Save learnings
        console.log('Saving learnings and adjustments...');
        this.saveLearnings(analysis);
        this.saveQualityMetrics(analysis);
        const params = this.generateAdjustmentParameters(analysis);

        console.log('');
        console.log('='.repeat(70));
        console.log('Analysis complete!\n');

        return analysis;
    }

    // Run continuous loop
    async runContinuous(intervalMinutes = 30) {
        console.log(`Starting continuous improvement loop (every ${intervalMinutes} minutes)...`);
        console.log('Press Ctrl+C to stop\n');

        // Run immediately
        await this.runAnalysis();

        // Then run at intervals
        setInterval(async () => {
            await this.runAnalysis();
        }, intervalMinutes * 60 * 1000);
    }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const loop = new ContinuousImprovementLoop();
    const command = process.argv[2];

    switch (command) {
        case 'once':
            loop.runAnalysis().then(() => {
                console.log('Single analysis complete.');
                process.exit(0);
            });
            break;

        case 'continuous':
            const interval = parseInt(process.argv[3]) || 30;
            loop.runContinuous(interval);
            break;

        default:
            console.log('Continuous Improvement Loop\n');
            console.log('Usage:');
            console.log('  ./continuous-improvement-loop.mjs once              - Run single analysis');
            console.log('  ./continuous-improvement-loop.mjs continuous [min]  - Run continuous loop');
            console.log('');
            console.log('Examples:');
            console.log('  ./continuous-improvement-loop.mjs once');
            console.log('  ./continuous-improvement-loop.mjs continuous 30     - Analyze every 30 minutes');
            console.log('');
            process.exit(0);
    }
}

export default ContinuousImprovementLoop;

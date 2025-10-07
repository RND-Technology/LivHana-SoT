#!/usr/bin/env node

// PRODUCTION MONITORING TOOL
// Analyzes production metrics and generates reports

import fs from 'fs';
import path from 'path';

class ProductionMonitor {
    constructor() {
        this.metricsDir = path.join(process.cwd(), 'output', 'metrics');
        this.logFile = path.join(process.cwd(), 'output', 'production-log.json');
    }

    // Load all metrics
    loadAllMetrics() {
        if (!fs.existsSync(this.metricsDir)) {
            return [];
        }

        const files = fs.readdirSync(this.metricsDir)
            .filter(f => f.endsWith('_metrics.json'))
            .sort();

        return files.map(file => {
            const filepath = path.join(this.metricsDir, file);
            return JSON.parse(fs.readFileSync(filepath, 'utf8'));
        });
    }

    // Load production log
    loadProductionLog() {
        if (!fs.existsSync(this.logFile)) {
            return [];
        }
        return JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
    }

    // Generate summary report
    generateSummary() {
        const metrics = this.loadAllMetrics();
        const log = this.loadProductionLog();

        if (metrics.length === 0) {
            console.log('No production metrics found.');
            return;
        }

        console.log('\n📊 PRODUCTION SUMMARY REPORT');
        console.log('═'.repeat(70));

        // Overall stats
        const totalEpisodes = metrics.length;
        const completedEpisodes = log.filter(l => l.status === 'completed').length;
        const failedEpisodes = log.filter(l => l.status === 'failed').length;

        console.log('\n📈 OVERALL STATISTICS');
        console.log('─'.repeat(70));
        console.log(`Total Episodes:      ${totalEpisodes}`);
        console.log(`Completed:           ${completedEpisodes} (${Math.round(completedEpisodes/totalEpisodes*100)}%)`);
        console.log(`Failed:              ${failedEpisodes}`);

        // Cost analysis
        const totalCost = metrics.reduce((sum, m) => sum + (m.costs?.total || 0), 0);
        const avgCost = totalCost / metrics.length;
        const minCost = Math.min(...metrics.map(m => m.costs?.total || 0));
        const maxCost = Math.max(...metrics.map(m => m.costs?.total || 0));

        console.log('\n💰 COST ANALYSIS');
        console.log('─'.repeat(70));
        console.log(`Total Cost:          $${totalCost.toFixed(2)}`);
        console.log(`Average per Episode: $${avgCost.toFixed(2)}`);
        console.log(`Min Cost:            $${minCost.toFixed(2)}`);
        console.log(`Max Cost:            $${maxCost.toFixed(2)}`);

        // Cost breakdown by service
        const costByService = {
            elevenLabs: 0,
            openai: 0,
            dId: 0,
            suno: 0,
            compute: 0,
            storage: 0
        };

        metrics.forEach(m => {
            if (m.costs?.breakdown) {
                Object.keys(costByService).forEach(service => {
                    costByService[service] += m.costs.breakdown[service] || 0;
                });
            }
        });

        console.log('\n📊 COST BREAKDOWN BY SERVICE');
        console.log('─'.repeat(70));
        Object.entries(costByService).forEach(([service, cost]) => {
            const percentage = (cost / totalCost * 100).toFixed(1);
            const bar = '█'.repeat(Math.floor(percentage / 2));
            console.log(`${service.padEnd(15)} $${cost.toFixed(2).padStart(6)}  ${percentage.padStart(5)}%  ${bar}`);
        });

        // API call statistics
        const apiCalls = {
            elevenLabs: 0,
            openai: 0,
            dId: 0,
            suno: 0
        };

        metrics.forEach(m => {
            if (m.metrics?.apiCalls) {
                Object.keys(apiCalls).forEach(service => {
                    apiCalls[service] += m.metrics.apiCalls[service] || 0;
                });
            }
        });

        const totalAPICalls = Object.values(apiCalls).reduce((a, b) => a + b, 0);

        console.log('\n🔌 API USAGE');
        console.log('─'.repeat(70));
        console.log(`Total API Calls:     ${totalAPICalls}`);
        Object.entries(apiCalls).forEach(([service, calls]) => {
            const percentage = (calls / totalAPICalls * 100).toFixed(1);
            console.log(`${service.padEnd(15)} ${String(calls).padStart(6)} calls  ${percentage.padStart(5)}%`);
        });

        // File generation statistics
        const filesGenerated = {
            audio: 0,
            images: 0,
            videos: 0
        };

        metrics.forEach(m => {
            if (m.metrics?.filesGenerated) {
                Object.keys(filesGenerated).forEach(type => {
                    filesGenerated[type] += m.metrics.filesGenerated[type] || 0;
                });
            }
        });

        console.log('\n📁 FILES GENERATED');
        console.log('─'.repeat(70));
        Object.entries(filesGenerated).forEach(([type, count]) => {
            console.log(`${type.padEnd(15)} ${count}`);
        });

        // Performance analysis
        if (log.length > 0) {
            const durations = log
                .filter(l => l.duration && l.status === 'completed')
                .map(l => parseFloat(l.duration.replace(' minutes', '')));

            if (durations.length > 0) {
                const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
                const minDuration = Math.min(...durations);
                const maxDuration = Math.max(...durations);

                console.log('\n⏱️  PERFORMANCE');
                console.log('─'.repeat(70));
                console.log(`Average Duration:    ${avgDuration.toFixed(2)} minutes`);
                console.log(`Fastest:             ${minDuration.toFixed(2)} minutes`);
                console.log(`Slowest:             ${maxDuration.toFixed(2)} minutes`);
            }
        }

        // Error analysis
        const errors = [];
        metrics.forEach(m => {
            if (m.metrics?.errors && m.metrics.errors.length > 0) {
                errors.push(...m.metrics.errors.map(e => ({
                    episode: m.episodeNumber,
                    ...e
                })));
            }
        });

        if (errors.length > 0) {
            console.log('\n⚠️  ERRORS');
            console.log('─'.repeat(70));
            console.log(`Total Errors:        ${errors.length}`);

            // Group by context
            const errorsByContext = {};
            errors.forEach(e => {
                errorsByContext[e.context] = (errorsByContext[e.context] || 0) + 1;
            });

            console.log('\nErrors by Context:');
            Object.entries(errorsByContext)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .forEach(([context, count]) => {
                    console.log(`  ${context.padEnd(40)} ${count}`);
                });
        }

        console.log('\n' + '═'.repeat(70));
        console.log('\n');
    }

    // Show latest episode details
    showLatest() {
        const metrics = this.loadAllMetrics();
        if (metrics.length === 0) {
            console.log('No episodes found.');
            return;
        }

        const latest = metrics[metrics.length - 1];

        console.log('\n📺 LATEST EPISODE');
        console.log('═'.repeat(70));
        console.log(`Episode:             ${latest.episodeNumber}`);
        console.log(`Timestamp:           ${latest.timestamp}`);
        console.log(`Total Cost:          $${latest.costs.total.toFixed(2)}`);

        console.log('\n💰 Cost Breakdown:');
        Object.entries(latest.costs.breakdown).forEach(([service, cost]) => {
            if (cost > 0) {
                console.log(`  ${service.padEnd(15)} $${cost.toFixed(2)}`);
            }
        });

        console.log('\n🔌 API Calls:');
        Object.entries(latest.metrics.apiCalls).forEach(([service, calls]) => {
            if (calls > 0) {
                console.log(`  ${service.padEnd(15)} ${calls}`);
            }
        });

        console.log('\n📁 Files Generated:');
        Object.entries(latest.metrics.filesGenerated).forEach(([type, count]) => {
            if (count > 0) {
                console.log(`  ${type.padEnd(15)} ${count}`);
            }
        });

        if (latest.metrics.errors && latest.metrics.errors.length > 0) {
            console.log('\n⚠️  Errors:');
            latest.metrics.errors.forEach((error, i) => {
                console.log(`  ${i + 1}. ${error.context}: ${error.message}`);
            });
        }

        console.log('\n' + '═'.repeat(70));
        console.log('\n');
    }

    // List all episodes
    listEpisodes() {
        const log = this.loadProductionLog();

        if (log.length === 0) {
            console.log('No episodes found.');
            return;
        }

        console.log('\n📋 ALL EPISODES');
        console.log('═'.repeat(70));
        console.log('Ep#  Status      Duration     Cost      Timestamp');
        console.log('─'.repeat(70));

        log.forEach(entry => {
            const ep = String(entry.episodeNumber).padStart(3);
            const status = entry.status === 'completed' ? '✓' : '✗';
            const duration = (entry.duration || 'N/A').padEnd(12);
            const cost = (entry.cost || 'N/A').padEnd(9);
            const timestamp = new Date(entry.timestamp).toLocaleString();

            console.log(`${ep}  ${status}          ${duration} ${cost} ${timestamp}`);
        });

        console.log('═'.repeat(70));
        console.log('\n');
    }

    // Show cost trends
    showCostTrends() {
        const metrics = this.loadAllMetrics();

        if (metrics.length === 0) {
            console.log('No data available.');
            return;
        }

        console.log('\n📈 COST TRENDS');
        console.log('═'.repeat(70));

        const maxCost = Math.max(...metrics.map(m => m.costs?.total || 0));

        metrics.forEach(m => {
            const ep = String(m.episodeNumber).padStart(3);
            const cost = m.costs?.total || 0;
            const barLength = Math.floor((cost / maxCost) * 50);
            const bar = '█'.repeat(barLength);

            console.log(`Ep ${ep}  $${cost.toFixed(2).padStart(5)}  ${bar}`);
        });

        console.log('═'.repeat(70));
        console.log('\n');
    }

    // Export report to JSON
    exportReport(outputFile) {
        const metrics = this.loadAllMetrics();
        const log = this.loadProductionLog();

        const report = {
            generatedAt: new Date().toISOString(),
            totalEpisodes: metrics.length,
            metrics,
            log,
            summary: {
                totalCost: metrics.reduce((sum, m) => sum + (m.costs?.total || 0), 0),
                totalAPICalls: metrics.reduce((sum, m) => {
                    return sum + Object.values(m.metrics?.apiCalls || {}).reduce((a, b) => a + b, 0);
                }, 0),
                completedEpisodes: log.filter(l => l.status === 'completed').length,
                failedEpisodes: log.filter(l => l.status === 'failed').length
            }
        };

        fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
        console.log(`\n✅ Report exported to: ${outputFile}\n`);
    }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const monitor = new ProductionMonitor();
    const command = process.argv[2];

    switch (command) {
        case 'summary':
            monitor.generateSummary();
            break;

        case 'latest':
            monitor.showLatest();
            break;

        case 'list':
            monitor.listEpisodes();
            break;

        case 'trends':
            monitor.showCostTrends();
            break;

        case 'export':
            const outputFile = process.argv[3] || 'production-report.json';
            monitor.exportReport(outputFile);
            break;

        default:
            console.log('Production Monitoring Tool\n');
            console.log('Usage:');
            console.log('  ./monitor-production.mjs summary   - Show comprehensive summary');
            console.log('  ./monitor-production.mjs latest    - Show latest episode details');
            console.log('  ./monitor-production.mjs list      - List all episodes');
            console.log('  ./monitor-production.mjs trends    - Show cost trends');
            console.log('  ./monitor-production.mjs export [file] - Export report to JSON');
            console.log('');
    }
}

export default ProductionMonitor;

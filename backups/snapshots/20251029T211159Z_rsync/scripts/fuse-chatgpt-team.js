#!/usr/bin/env node
/**
 * ChatGPT Team Workspace Ingestion Script
 * Extracts ALL conversations from ChatGPT Team export
 * No keyword filtering - processes everything
 * Generates structured analysis for cross-platform comparison
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Topic categorization keywords
const TOPIC_CATEGORIES = {
  architecture: ['architecture', 'design', 'structure', 'component', 'system', 'infrastructure', 'stack'],
  deployment: ['deploy', 'deployment', 'cloud run', 'cloudflare', 'hosting', 'production', 'staging'],
  integrations: ['integration', 'api', 'mcp', 'webhook', 'connector', 'sync', 'connect'],
  voice: ['voice', 'speech', 'elevenlabs', 'tts', 'stt', 'audio', 'voice mode'],
  agents: ['agent', 'agent builder', 'workflow', 'orchestration', 'reasoning'],
  business: ['business', 'strategy', 'revenue', 'customer', 'market', 'sales', 'membership'],
  compliance: ['compliance', 'regulation', 'legal', 'thc', 'age gate', '21+', 'legislative'],
  domains: ['domain', 'dns', 'routing', 'subdomain', 'reggie', 'high noon', 'terpwerk'],
  data: ['database', 'postgres', 'redis', 'storage', 'cache', 'data model'],
  rpm: ['rpm', 'planning', 'weekly plan', 'sprint', 'roadmap', 'timeline', 'milestone']
};

// Decision pattern detection
const DECISION_PATTERNS = [
  /we (should|will|need to|must) ([^.!?]{10,200})/gi,
  /let's (use|implement|create|build|deploy) ([^.!?]{10,200})/gi,
  /decided to ([^.!?]{10,200})/gi,
  /(going with|chose|selected|picking) ([^.!?]{10,200})/gi,
  /the (plan|approach|strategy) is to ([^.!?]{10,200})/gi,
  /recommended? (approach|solution|strategy|method):? ([^.!?]{10,200})/gi
];

// Recommendation pattern detection
const RECOMMENDATION_PATTERNS = [
  /i (recommend|suggest|advise|propose) ([^.!?]{10,200})/gi,
  /(best|better|ideal|optimal) (approach|solution|way|method|strategy) (is|would be) ([^.!?]{10,200})/gi,
  /you (should|could|might want to) ([^.!?]{10,200})/gi,
  /consider ([^.!?]{10,200})/gi
];

// Technical choice pattern detection
const TECHNICAL_PATTERNS = [
  /(use|using|implement|deploy|build with) ([\w\s-]+) (for|to|as) ([^.!?]{10,200})/gi,
  /([\w\s-]+) (integration|api|service|server|database|framework)/gi
];

/**
 * Parse ChatGPT Team export ZIP file
 */
async function parseChatGPTExport(zipPath) {
  console.log(`📦 Parsing ChatGPT Team export: ${zipPath}`);

  try {
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();

    const conversations = [];

    // Find and parse conversations.json
    for (const entry of zipEntries) {
      if (entry.entryName.includes('conversations.json') || entry.entryName.endsWith('.json')) {
        console.log(`   Found: ${entry.entryName}`);
        const data = entry.getData().toString('utf8');
        const parsed = JSON.parse(data);

        // Handle different export formats
        if (Array.isArray(parsed)) {
          conversations.push(...parsed);
        } else if (parsed.conversations) {
          conversations.push(...parsed.conversations);
        } else {
          conversations.push(parsed);
        }
      }
    }

    console.log(`✅ Parsed ${conversations.length} conversations from ZIP\n`);
    return conversations;
  } catch (err) {
    console.error(`❌ Error parsing ZIP: ${err.message}`);
    throw err;
  }
}

/**
 * Flatten conversation tree structure into linear message array
 */
function flattenConversation(conversation) {
  const messages = [];
  const mapping = conversation.mapping || {};

  // Find root message(s)
  const roots = Object.values(mapping).filter(node => !node.parent);

  // Traverse from each root
  function traverse(nodeId) {
    const node = mapping[nodeId];
    if (!node) return;

    // Add message if it exists
    if (node.message && node.message.content) {
      const parts = node.message.content.parts || [];
      const text = parts.join('\n');

      if (text.trim()) {
        messages.push({
          id: node.message.id,
          role: node.message.author?.role || 'unknown',
          content: text,
          timestamp: node.message.create_time || conversation.create_time
        });
      }
    }

    // Traverse children
    if (node.children) {
      node.children.forEach(childId => traverse(childId));
    }
  }

  roots.forEach(root => traverse(root.id));

  return messages;
}

/**
 * Categorize content by topic area
 */
function categorizeContent(text) {
  const categories = [];
  const lowerText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(TOPIC_CATEGORIES)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      categories.push(category);
    }
  }

  return categories.length > 0 ? categories : ['general'];
}

/**
 * Extract decisions from text
 */
function extractDecisions(text) {
  const decisions = [];

  DECISION_PATTERNS.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      const decision = match[0].replace(/\s+/g, ' ').trim();
      if (decision.length > 20) {
        decisions.push({
          type: 'decision',
          text: decision,
          confidence: 0.8
        });
      }
    });
  });

  return decisions;
}

/**
 * Extract recommendations from text
 */
function extractRecommendations(text) {
  const recommendations = [];

  RECOMMENDATION_PATTERNS.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      const recommendation = match[0].replace(/\s+/g, ' ').trim();
      if (recommendation.length > 20) {
        recommendations.push({
          type: 'recommendation',
          text: recommendation,
          confidence: 0.7
        });
      }
    });
  });

  return recommendations;
}

/**
 * Extract technical choices from text
 */
function extractTechnicalChoices(text) {
  const choices = [];

  TECHNICAL_PATTERNS.forEach(pattern => {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      const choice = match[0].replace(/\s+/g, ' ').trim();
      if (choice.length > 15) {
        choices.push({
          type: 'technical_choice',
          text: choice,
          confidence: 0.6
        });
      }
    });
  });

  return choices;
}

/**
 * Analyze a single conversation
 */
function analyzeConversation(conversation) {
  const messages = flattenConversation(conversation);
  const fullText = messages.map(m => m.content).join('\n\n');

  // Categorize by topic
  const categories = categorizeContent(fullText);

  // Extract insights
  const decisions = extractDecisions(fullText);
  const recommendations = extractRecommendations(fullText);
  const technicalChoices = extractTechnicalChoices(fullText);

  // Calculate conversation metadata
  const timestamps = messages.map(m => m.timestamp).filter(t => t);
  const firstTimestamp = Math.min(...timestamps);
  const lastTimestamp = Math.max(...timestamps);

  return {
    id: conversation.id || conversation.conversation_id,
    title: conversation.title || 'Untitled Conversation',
    categories,
    messageCount: messages.length,
    firstTimestamp,
    lastTimestamp,
    duration: lastTimestamp - firstTimestamp,
    decisions,
    recommendations,
    technicalChoices,
    messages: messages.map(m => ({
      role: m.role,
      content: m.content.substring(0, 500), // Truncate for storage
      timestamp: m.timestamp
    }))
  };
}

/**
 * Generate summary statistics
 */
function generateStatistics(analyses) {
  const stats = {
    totalConversations: analyses.length,
    totalMessages: analyses.reduce((sum, a) => sum + a.messageCount, 0),
    totalDecisions: analyses.reduce((sum, a) => sum + a.decisions.length, 0),
    totalRecommendations: analyses.reduce((sum, a) => sum + a.recommendations.length, 0),
    totalTechnicalChoices: analyses.reduce((sum, a) => sum + a.technicalChoices.length, 0),
    categoryCounts: {},
    timeRange: {
      earliest: Math.min(...analyses.map(a => a.firstTimestamp)),
      latest: Math.max(...analyses.map(a => a.lastTimestamp))
    }
  };

  // Count categories
  analyses.forEach(a => {
    a.categories.forEach(cat => {
      stats.categoryCounts[cat] = (stats.categoryCounts[cat] || 0) + 1;
    });
  });

  return stats;
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 ChatGPT Team Workspace Ingestion\n');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Check for export file
  const exportPath = path.join(ROOT_DIR, 'data', 'chatgpt-team-export.zip');
  const exportAltPath = path.join(ROOT_DIR, 'data', 'conversations.json');

  let conversations = [];

  try {
    await fs.access(exportPath);
    conversations = await parseChatGPTExport(exportPath);
  } catch {
    try {
      await fs.access(exportAltPath);
      console.log(`📄 Found direct JSON export: ${exportAltPath}`);
      const data = await fs.readFile(exportAltPath, 'utf8');
      const parsed = JSON.parse(data);
      conversations = Array.isArray(parsed) ? parsed : [parsed];
      console.log(`✅ Loaded ${conversations.length} conversations\n`);
    } catch {
      console.error('❌ No ChatGPT export found!');
      console.error('   Expected locations:');
      console.error(`   - ${exportPath}`);
      console.error(`   - ${exportAltPath}`);
      console.error('\n📖 See docs/CHAT_EXPORT_INSTRUCTIONS.md for export guide\n');
      process.exit(1);
    }
  }

  if (conversations.length === 0) {
    console.error('❌ No conversations found in export\n');
    process.exit(1);
  }

  // Analyze all conversations
  console.log('🧠 Analyzing conversations (no filtering - processing ALL)...\n');
  const analyses = conversations.map((conv, idx) => {
    if (idx % 10 === 0) {
      console.log(`   Processing: ${idx + 1}/${conversations.length}`);
    }
    return analyzeConversation(conv);
  });

  console.log(`\n✅ Analyzed ${analyses.length} conversations\n`);

  // Generate statistics
  const stats = generateStatistics(analyses);

  console.log('📊 STATISTICS:\n');
  console.log(`   Total Conversations: ${stats.totalConversations}`);
  console.log(`   Total Messages: ${stats.totalMessages}`);
  console.log(`   Decisions Extracted: ${stats.totalDecisions}`);
  console.log(`   Recommendations Extracted: ${stats.totalRecommendations}`);
  console.log(`   Technical Choices: ${stats.totalTechnicalChoices}`);
  console.log(`   Time Range: ${new Date(stats.timeRange.earliest * 1000).toLocaleDateString()} → ${new Date(stats.timeRange.latest * 1000).toLocaleDateString()}`);
  console.log('\n   Category Distribution:');
  Object.entries(stats.categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count} conversations`);
    });

  // Save output
  const output = {
    source: 'chatgpt_team',
    exportDate: new Date().toISOString(),
    statistics: stats,
    conversations: analyses
  };

  const outputPath = path.join(ROOT_DIR, 'data', 'chatgpt-analysis.json');
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2));

  console.log(`\n✅ Analysis saved to: ${outputPath}`);
  console.log('\n════════════════════════════════════════════════════════════════\n');
  console.log('📋 NEXT STEP: Run cross-platform decision matrix generator:');
  console.log('   node scripts/generate-decision-matrix.js\n');
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

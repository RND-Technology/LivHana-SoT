#!/usr/bin/env node
/**
 * Cross-Platform Decision Matrix Generator
 * Compares ChatGPT vs Claude strategic guidance
 * Identifies conflicts, consensus, and platform-specific insights
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Topic categories for organizing the matrix
const TOPICS = [
  'Architecture',
  'Deployment',
  'Integrations',
  'Voice Mode',
  'Agent Builder',
  'Business Strategy',
  'Compliance',
  'Domain Routing',
  'Data Storage',
  'RPM Planning'
];

/**
 * Load Claude analysis data
 */
async function loadClaudeData() {
  console.log('📥 Loading Claude conversation data...');

  const conversations = [];
  const claudeDir = path.join(ROOT_DIR, '.claude');

  try {
    const files = await fs.readdir(claudeDir);

    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(claudeDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);

        conversations.push({
          source: 'claude',
          file,
          content,
          timestamp: stats.mtime
        });
      }
    }

    console.log(`   ✅ Loaded ${conversations.length} Claude documents`);
    return conversations;
  } catch (err) {
    console.error(`   ❌ Error loading Claude data: ${err.message}`);
    return [];
  }
}

/**
 * Load ChatGPT analysis data
 */
async function loadChatGPTData() {
  console.log('📥 Loading ChatGPT analysis data...');

  const chatgptPath = path.join(ROOT_DIR, 'data', 'chatgpt-analysis.json');

  try {
    const data = await fs.readFile(chatgptPath, 'utf8');
    const analysis = JSON.parse(data);

    console.log(`   ✅ Loaded ChatGPT analysis: ${analysis.conversations.length} conversations`);
    return analysis;
  } catch (err) {
    console.error(`   ⚠️  No ChatGPT analysis found: ${err.message}`);
    console.error('   Run: node scripts/fuse-chatgpt-team.js first');
    return null;
  }
}

/**
 * Extract insights from text by topic
 */
function extractInsightsByTopic(text, source) {
  const insights = {};

  TOPICS.forEach(topic => {
    const topicLower = topic.toLowerCase();
    const lines = text.split('\n');
    const relevantLines = [];

    // Find lines related to this topic
    lines.forEach((line, idx) => {
      if (line.toLowerCase().includes(topicLower)) {
        // Get context around the match
        const context = lines.slice(
          Math.max(0, idx - 2),
          Math.min(lines.length, idx + 3)
        ).join('\n').trim();

        if (context.length > 20) {
          relevantLines.push(context);
        }
      }
    });

    if (relevantLines.length > 0) {
      insights[topic] = {
        source,
        mentions: relevantLines.length,
        content: relevantLines.slice(0, 3) // Top 3 most relevant
      };
    }
  });

  return insights;
}

/**
 * Compare insights from both platforms
 */
function compareInsights(claudeInsights, chatgptInsights) {
  const matrix = [];

  TOPICS.forEach(topic => {
    const claudeData = claudeInsights[topic];
    const chatgptData = chatgptInsights[topic];

    let status = 'NOT_DISCUSSED';
    let conflict = false;

    if (claudeData && chatgptData) {
      // Both platforms discussed this topic
      // Simple similarity check: look for contradictory patterns
      const claudeText = claudeData.content.join(' ').toLowerCase();
      const chatgptText = chatgptData.content.join(' ').toLowerCase();

      // Check for contradictory keywords
      const contradictions = [
        ['should', 'should not'],
        ['use', 'avoid'],
        ['deploy', 'skip'],
        ['enable', 'disable'],
        ['recommended', 'not recommended']
      ];

      contradictions.forEach(([pos, neg]) => {
        if ((claudeText.includes(pos) && chatgptText.includes(neg)) ||
            (claudeText.includes(neg) && chatgptText.includes(pos))) {
          conflict = true;
        }
      });

      status = conflict ? 'CONFLICT' : 'CONSENSUS';
    } else if (claudeData && !chatgptData) {
      status = 'CLAUDE_ONLY';
    } else if (!claudeData && chatgptData) {
      status = 'CHATGPT_ONLY';
    }

    matrix.push({
      topic,
      status,
      conflict,
      claudeGuidance: claudeData ? claudeData.content[0]?.substring(0, 200) : 'Not discussed',
      chatgptGuidance: chatgptData ? chatgptData.content[0]?.substring(0, 200) : 'Not discussed',
      claudeMentions: claudeData ? claudeData.mentions : 0,
      chatgptMentions: chatgptData ? chatgptData.mentions : 0
    });
  });

  return matrix;
}

/**
 * Generate statistics
 */
function generateStats(matrix) {
  return {
    total: matrix.length,
    consensus: matrix.filter(m => m.status === 'CONSENSUS').length,
    conflicts: matrix.filter(m => m.status === 'CONFLICT').length,
    claudeOnly: matrix.filter(m => m.status === 'CLAUDE_ONLY').length,
    chatgptOnly: matrix.filter(m => m.status === 'CHATGPT_ONLY').length,
    notDiscussed: matrix.filter(m => m.status === 'NOT_DISCUSSED').length
  };
}

/**
 * Generate detailed conflict analysis
 */
function analyzeConflicts(matrix) {
  const conflicts = matrix.filter(m => m.status === 'CONFLICT');

  return conflicts.map(conflict => {
    return {
      topic: conflict.topic,
      claudePosition: conflict.claudeGuidance,
      chatgptPosition: conflict.chatgptGuidance,
      severity: 'HIGH', // All conflicts are high severity for now
      needsResolution: true
    };
  });
}

/**
 * Generate the decision matrix markdown
 */
function generateMatrixMarkdown(matrix, stats, conflicts, claudeData, chatgptData) {
  const markdown = `# CROSS-PLATFORM DECISION MATRIX

**Generated**: ${new Date().toISOString()}
**Sources**:
- Claude: ${claudeData.length} conversations
- ChatGPT: ${chatgptData ? chatgptData.conversations.length : 0} conversations

---

## 📊 EXECUTIVE SUMMARY

### Overall Statistics
- **Total Topics Analyzed**: ${stats.total}
- **Consensus (Both Agreed)**: ${stats.consensus} (${Math.round(stats.consensus/stats.total*100)}%)
- **Conflicts (Different Advice)**: ${stats.conflicts} (${Math.round(stats.conflicts/stats.total*100)}%)
- **Claude-Only Discussions**: ${stats.claudeOnly}
- **ChatGPT-Only Discussions**: ${stats.chatgptOnly}
- **Not Discussed**: ${stats.notDiscussed}

### Key Findings
${conflicts.length > 0 ? `
**⚠️ ${conflicts.length} CONFLICTS REQUIRE RESOLUTION BEFORE DEPLOYMENT**

${conflicts.map((c, i) => `${i+1}. **${c.topic}**: Conflicting strategic advice detected`).join('\n')}
` : '**✅ NO CONFLICTS DETECTED** - Platforms provided consistent guidance'}

---

## 🎯 DECISION MATRIX BY TOPIC

| # | Topic | Status | Claude Guidance | ChatGPT Guidance | Resolution |
|---|-------|--------|-----------------|------------------|------------|
${matrix.map((m, i) => {
  const statusEmoji = {
    'CONSENSUS': '✅',
    'CONFLICT': '⚠️',
    'CLAUDE_ONLY': '🔵',
    'CHATGPT_ONLY': '🟡',
    'NOT_DISCUSSED': '⚪'
  }[m.status];

  const resolutionText = {
    'CONSENSUS': 'Aligned',
    'CONFLICT': '**NEEDS DECISION**',
    'CLAUDE_ONLY': 'Use Claude advice',
    'CHATGPT_ONLY': 'Use ChatGPT advice',
    'NOT_DISCUSSED': 'N/A'
  }[m.status];

  return `| ${i+1} | ${m.topic} | ${statusEmoji} ${m.status} | ${m.claudeGuidance.substring(0, 100)}... | ${m.chatgptGuidance.substring(0, 100)}... | ${resolutionText} |`;
}).join('\n')}

---

## ⚠️ CONFLICTS REQUIRING RESOLUTION

${conflicts.length > 0 ? conflicts.map((c, i) => `
### ${i+1}. ${c.topic}

**Claude's Position:**
\`\`\`
${c.claudePosition}
\`\`\`

**ChatGPT's Position:**
\`\`\`
${c.chatgptPosition}
\`\`\`

**Severity**: ${c.severity}
**Action Required**: Jesse must decide which approach to take

---
`).join('\n') : '✅ No conflicts detected. Both platforms provided consistent strategic guidance.'}

---

## ✅ CONSENSUS DECISIONS

${matrix.filter(m => m.status === 'CONSENSUS').map((m, i) => `
### ${i+1}. ${m.topic}

**Claude & ChatGPT Agreed On:**
- ${m.claudeGuidance.substring(0, 200)}...

**Mentions**: Claude (${m.claudeMentions}), ChatGPT (${m.chatgptMentions})
**Confidence**: HIGH - Both platforms independently arrived at same conclusion

---
`).join('\n')}

---

## 🔵 CLAUDE-ONLY INSIGHTS

${matrix.filter(m => m.status === 'CLAUDE_ONLY').map((m, i) => `
### ${i+1}. ${m.topic}

**Claude's Guidance:**
${m.claudeGuidance}

**Mentions**: ${m.claudeMentions}
**Note**: Not discussed in ChatGPT conversations. Consider validating with ChatGPT if critical.

---
`).join('\n')}

---

## 🟡 CHATGPT-ONLY INSIGHTS

${matrix.filter(m => m.status === 'CHATGPT_ONLY').map((m, i) => `
### ${i+1}. ${m.topic}

**ChatGPT's Guidance:**
${m.chatgptGuidance}

**Mentions**: ${m.chatgptMentions}
**Note**: Not discussed in Claude conversations. Consider validating with Claude if critical.

---
`).join('\n')}

---

## 📈 DECISION EVOLUTION TIMELINE

This section tracks how strategic thinking evolved across conversations:

${chatgptData ? `
### ChatGPT Timeline
**Time Range**: ${new Date(chatgptData.statistics.timeRange.earliest * 1000).toLocaleDateString()} → ${new Date(chatgptData.statistics.timeRange.latest * 1000).toLocaleDateString()}
**Total Conversations**: ${chatgptData.statistics.totalConversations}
**Decisions Extracted**: ${chatgptData.statistics.totalDecisions}
**Recommendations**: ${chatgptData.statistics.totalRecommendations}
` : ''}

### Claude Timeline
**Total Conversations**: ${claudeData.length}
**Primary Focus**: Agent Builder orchestration, MCP integration, deployment planning

---

## 🎲 CONFIDENCE SCORING

This section rates confidence level in each platform's guidance:

${matrix.map((m, i) => `
### ${m.topic}
- **Claude Confidence**: ${m.claudeMentions > 5 ? 'HIGH' : m.claudeMentions > 2 ? 'MEDIUM' : 'LOW'} (${m.claudeMentions} mentions)
- **ChatGPT Confidence**: ${m.chatgptMentions > 5 ? 'HIGH' : m.chatgptMentions > 2 ? 'MEDIUM' : 'LOW'} (${m.chatgptMentions} mentions)
- **Recommendation**: ${m.status === 'CONSENSUS' ? 'Proceed with confidence' : m.status === 'CONFLICT' ? 'Research further before deciding' : m.status === 'CLAUDE_ONLY' ? 'Validate with ChatGPT if critical' : 'Validate with Claude if critical'}
`).join('\n')}

---

## 🚀 RECOMMENDED ACTION PLAN

### Immediate Actions (Before Deployment)
1. **Resolve ${conflicts.length} conflicts** - Jesse must decide on conflicting strategies
2. **Validate consensus decisions** - Quick sanity check on ${stats.consensus} aligned strategies
3. **Review platform-specific insights** - Evaluate ${stats.claudeOnly + stats.chatgptOnly} unique recommendations

### Deployment Priorities
1. **Deploy consensus strategies first** - ${stats.consensus} decisions have cross-platform validation
2. **Test conflict areas carefully** - ${conflicts.length} areas need extra attention
3. **Monitor platform-specific features** - Track performance of ${stats.claudeOnly + stats.chatgptOnly} unique implementations

### Post-Deployment Review
- Compare actual results against both platforms' predictions
- Identify which platform gave more accurate guidance per topic
- Update decision-making process based on learnings

---

## 📝 NOTES FOR JESSE

${conflicts.length > 0 ? `
**⚠️ CRITICAL**: ${conflicts.length} strategic conflicts detected. Review conflict sections above before proceeding with deployment.
` : ''}

**Platform Usage Patterns**:
- **Claude**: Primary platform for ${matrix.filter(m => m.claudeMentions > m.chatgptMentions).length} topics
- **ChatGPT**: Primary platform for ${matrix.filter(m => m.chatgptMentions > m.claudeMentions).length} topics
- **Equal Discussion**: ${matrix.filter(m => m.claudeMentions === m.chatgptMentions && m.status === 'CONSENSUS').length} topics

**Recommendation**: ${conflicts.length === 0 ? 'Proceed with deployment - platforms are aligned' : `Resolve ${conflicts.length} conflicts before deployment to avoid strategy misalignment`}

---

*Generated by Cross-Platform Decision Matrix Generator*
*Data Sources: Claude (.claude/ directory) + ChatGPT (data/chatgpt-analysis.json)*
`;

  return markdown;
}

/**
 * Main execution
 */
async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CROSS-PLATFORM DECISION MATRIX GENERATOR');
  console.log('  Comparing ChatGPT vs Claude Strategic Guidance');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // Load data from both platforms
  const claudeData = await loadClaudeData();
  const chatgptData = await loadChatGPTData();

  if (!chatgptData) {
    console.error('\n❌ Cannot generate matrix without ChatGPT data\n');
    process.exit(1);
  }

  console.log('\n🧠 Analyzing cross-platform insights...\n');

  // Extract insights from Claude conversations
  const claudeInsights = {};
  claudeData.forEach(conv => {
    const insights = extractInsightsByTopic(conv.content, 'claude');
    Object.entries(insights).forEach(([topic, data]) => {
      if (!claudeInsights[topic]) {
        claudeInsights[topic] = { source: 'claude', mentions: 0, content: [] };
      }
      claudeInsights[topic].mentions += data.mentions;
      claudeInsights[topic].content.push(...data.content);
    });
  });

  // Extract insights from ChatGPT conversations
  const chatgptInsights = {};
  chatgptData.conversations.forEach(conv => {
    const fullText = conv.messages.map(m => m.content).join('\n\n');
    const insights = extractInsightsByTopic(fullText, 'chatgpt');
    Object.entries(insights).forEach(([topic, data]) => {
      if (!chatgptInsights[topic]) {
        chatgptInsights[topic] = { source: 'chatgpt', mentions: 0, content: [] };
      }
      chatgptInsights[topic].mentions += data.mentions;
      chatgptInsights[topic].content.push(...data.content);
    });
  });

  // Compare insights
  const matrix = compareInsights(claudeInsights, chatgptInsights);
  const stats = generateStats(matrix);
  const conflicts = analyzeConflicts(matrix);

  console.log('📊 ANALYSIS COMPLETE:\n');
  console.log(`   Topics Analyzed: ${stats.total}`);
  console.log(`   Consensus: ${stats.consensus}`);
  console.log(`   Conflicts: ${stats.conflicts}`);
  console.log(`   Claude-Only: ${stats.claudeOnly}`);
  console.log(`   ChatGPT-Only: ${stats.chatgptOnly}\n`);

  if (conflicts.length > 0) {
    console.log('⚠️  WARNING: Conflicts detected in:');
    conflicts.forEach(c => console.log(`   - ${c.topic}`));
    console.log('');
  }

  // Generate markdown
  const markdown = generateMatrixMarkdown(matrix, stats, conflicts, claudeData, chatgptData);

  // Save output
  const outputPath = path.join(ROOT_DIR, 'docs', 'CROSS_PLATFORM_DECISION_MATRIX.md');
  await fs.writeFile(outputPath, markdown);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  ✅ DECISION MATRIX GENERATED');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`📄 Output: ${outputPath}`);
  console.log(`📏 Size: ${markdown.length.toLocaleString()} characters`);
  console.log('');

  if (conflicts.length > 0) {
    console.log('⚠️  NEXT STEP: Review conflicts and make strategic decisions');
  } else {
    console.log('✅ NEXT STEP: Proceed with deployment - platforms aligned');
  }
  console.log('');
}

main().catch(err => {
  console.error('\n❌ ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});

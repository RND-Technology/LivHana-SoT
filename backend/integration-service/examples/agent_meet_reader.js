#!/usr/bin/env node
/**
 * Agent Meet Data Reader
 *
 * Example script for AI agents to read real-time Meet data
 *
 * Usage:
 *   node agent_meet_reader.js <session_id>
 *
 * Author: Liv Hana Tier-1
 * Date: October 28, 2025
 */

import fetch from 'node-fetch';

const API_BASE = process.env.MEET_API_BASE || 'http://localhost:3005/api/meet';

/**
 * Get recent transcripts for a session
 * @param {string} sessionId - Meet session UUID
 * @param {number} minutes - How many minutes back to fetch (default: 5)
 * @returns {Promise<Array>} Array of transcript objects
 */
async function getRecentTranscripts(sessionId, minutes = 5) {
  try {
    const url = `${API_BASE}/transcripts/recent/${sessionId}?minutes=${minutes}&final_only=true`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.transcripts || [];
  } catch (error) {
    console.error(`Error fetching transcripts: ${error.message}`);
    return [];
  }
}

/**
 * Get all active sessions
 * @returns {Promise<Array>} Array of active session objects
 */
async function getActiveSessions() {
  try {
    const url = `${API_BASE}/sessions/active`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.sessions || [];
  } catch (error) {
    console.error(`Error fetching active sessions: ${error.message}`);
    return [];
  }
}

/**
 * Submit agent analysis
 * @param {string} sessionId - Meet session UUID
 * @param {string} agentName - Agent name (Planning, Artifact, QA, Research, ExecMon)
 * @param {string} analysisType - Type of analysis (action_items, summary, sentiment, risks)
 * @param {string} analysisText - Human-readable analysis text
 * @param {Object} analysisJson - Structured analysis data
 * @param {Object} options - Additional options (priority, action_required, confidence_score)
 * @returns {Promise<Object>} Result with analysis_id
 */
async function submitAnalysis(sessionId, agentName, analysisType, analysisText, analysisJson = {}, options = {}) {
  try {
    const url = `${API_BASE}/analysis`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        agent_name: agentName,
        analysis_type: analysisType,
        analysis_text: analysisText,
        analysis_json: analysisJson,
        priority: options.priority || 'normal',
        action_required: options.action_required || false,
        confidence_score: options.confidence_score || null,
        related_transcript_ids: options.related_transcript_ids || [],
        metadata: options.metadata || {}
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error submitting analysis: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Get all analyses for a session
 * @param {string} sessionId - Meet session UUID
 * @param {Object} filters - Optional filters (agent_name, analysis_type, priority)
 * @returns {Promise<Array>} Array of analysis objects
 */
async function getAnalyses(sessionId, filters = {}) {
  try {
    const params = new URLSearchParams(filters);
    const url = `${API_BASE}/analysis/${sessionId}?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.analyses || [];
  } catch (error) {
    console.error(`Error fetching analyses: ${error.message}`);
    return [];
  }
}

/**
 * Extract action items from transcripts using simple keyword detection
 * @param {Array} transcripts - Array of transcript objects
 * @returns {Array} Array of detected action items
 */
function extractActionItems(transcripts) {
  const actionItems = [];
  const actionKeywords = [
    'need to', 'we should', 'action item', 'to do', 'follow up',
    'by end of day', 'by eod', 'by tomorrow', 'by next week',
    'send', 'schedule', 'update', 'review', 'prepare', 'deliver'
  ];

  transcripts.forEach(transcript => {
    const text = transcript.transcript_text.toLowerCase();
    const hasActionKeyword = actionKeywords.some(keyword => text.includes(keyword));

    if (hasActionKeyword) {
      actionItems.push({
        speaker: transcript.speaker_name,
        text: transcript.transcript_text,
        timestamp: transcript.timestamp_start,
        keywords: actionKeywords.filter(k => text.includes(k))
      });
    }
  });

  return actionItems;
}

/**
 * Main execution
 */
async function main() {
  const sessionId = process.argv[2];

  if (!sessionId) {
    console.log('Usage: node agent_meet_reader.js <session_id>');
    console.log('\nExample:');
    console.log('  node agent_meet_reader.js 123e4567-e89b-12d3-a456-426614174000');
    console.log('\nOr run without session_id to see all active sessions:');
    console.log('  node agent_meet_reader.js');

    // Show active sessions
    console.log('\n=== Active Sessions ===');
    const sessions = await getActiveSessions();
    if (sessions.length === 0) {
      console.log('No active sessions found.');
    } else {
      sessions.forEach(session => {
        console.log(`\nSession ID: ${session.session_id}`);
        console.log(`  Meet Code: ${session.meet_code}`);
        console.log(`  Host: ${session.host_name}`);
        console.log(`  Started: ${session.session_start}`);
        console.log(`  Participants: ${session.participant_count}`);
        console.log(`  Last Activity: ${session.latest_activity}`);
      });
    }

    process.exit(0);
  }

  console.log(`\n=== Agent Meet Reader ===`);
  console.log(`Session ID: ${sessionId}`);
  console.log(`Agent: Planning (example)`);
  console.log(`Timestamp: ${new Date().toISOString()}\n`);

  // Fetch recent transcripts
  console.log('Fetching recent transcripts (last 5 minutes)...');
  const transcripts = await getRecentTranscripts(sessionId, 5);

  if (transcripts.length === 0) {
    console.log('No transcripts found in the last 5 minutes.');
    process.exit(0);
  }

  console.log(`Found ${transcripts.length} transcripts\n`);

  // Display transcripts
  console.log('=== Recent Transcripts ===');
  transcripts.forEach((t, index) => {
    console.log(`\n[${index + 1}] ${t.speaker_name} (${t.timestamp_start})`);
    console.log(`    "${t.transcript_text}"`);
    if (t.confidence_score) {
      console.log(`    Confidence: ${(t.confidence_score * 100).toFixed(1)}%`);
    }
  });

  // Extract action items
  console.log('\n=== Detected Action Items ===');
  const actionItems = extractActionItems(transcripts);

  if (actionItems.length === 0) {
    console.log('No action items detected.');
  } else {
    actionItems.forEach((item, index) => {
      console.log(`\n[${index + 1}] Action detected from ${item.speaker}`);
      console.log(`    "${item.text}"`);
      console.log(`    Keywords: ${item.keywords.join(', ')}`);
      console.log(`    Timestamp: ${item.timestamp}`);
    });

    // Submit analysis to database
    console.log('\n=== Submitting Analysis ===');
    const analysisText = `Detected ${actionItems.length} action item(s) from recent meeting discussion.`;
    const analysisJson = {
      action_items: actionItems.map((item, i) => ({
        id: i + 1,
        speaker: item.speaker,
        text: item.text,
        timestamp: item.timestamp,
        keywords: item.keywords
      }))
    };

    const result = await submitAnalysis(
      sessionId,
      'Planning',
      'action_items',
      analysisText,
      analysisJson,
      {
        priority: actionItems.length > 3 ? 'high' : 'normal',
        action_required: actionItems.length > 0,
        confidence_score: 0.75
      }
    );

    if (result.success) {
      console.log(`✅ Analysis submitted successfully (ID: ${result.analysis_id})`);
    } else {
      console.log(`❌ Failed to submit analysis: ${result.error}`);
    }
  }

  console.log('\n=== Done ===\n');
}

// Export functions for use in other scripts
export {
  getRecentTranscripts,
  getActiveSessions,
  submitAnalysis,
  getAnalyses,
  extractActionItems
};

// Run main if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

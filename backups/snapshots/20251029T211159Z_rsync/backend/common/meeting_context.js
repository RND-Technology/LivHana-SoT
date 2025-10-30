/**
 * Meeting Context Integration for 5 Agents
 * Provides real-time access to Google Meet capture data from AlloyDB
 *
 * Usage:
 *   const { getActiveMeetingContext, searchMeetingTranscripts } = require('./backend/common/meeting_context');
 *
 *   // Get recent context from active meeting
 *   const context = await getActiveMeetingContext();
 *
 *   // Search across all meetings
 *   const results = await searchMeetingTranscripts('action items');
 */

const { Client } = require('pg');

// AlloyDB connection config
const ALLOYDB_CONFIG = {
  host: process.env.ALLOYDB_HOST || '172.18.113.2',
  port: parseInt(process.env.ALLOYDB_PORT || '5432'),
  user: process.env.ALLOYDB_USER || 'postgres',
  password: process.env.ALLOYDB_PASSWORD || 'x77BXLIf3dGhUwd9SWL1xOOzS',
  database: process.env.ALLOYDB_DATABASE || 'postgres',
  // Connection pooling
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

/**
 * Get active meeting context (last 10 minutes of live meetings)
 * Returns formatted transcript for agent consumption
 *
 * @returns {Promise<string>} Formatted transcript text
 */
async function getActiveMeetingContext() {
  const client = new Client(ALLOYDB_CONFIG);

  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        ms.id as session_id,
        ms.title,
        mt.transcript_text,
        mt.start_time,
        mp.participant_name,
        mp.participant_email
      FROM meeting_sessions ms
      JOIN meeting_transcripts mt ON ms.id = mt.session_id
      LEFT JOIN meeting_participants mp ON mt.speaker_id = mp.id
      WHERE ms.recording_status = 'live'
      AND mt.start_time >= NOW() - INTERVAL '10 minutes'
      AND mt.is_interim = FALSE
      ORDER BY mt.start_time DESC
      LIMIT 100
    `);

    if (result.rows.length === 0) {
      return "No active meetings currently.";
    }

    // Format for agent context
    const formattedContext = result.rows.map(row => {
      const timestamp = new Date(row.start_time).toLocaleTimeString();
      const speaker = row.participant_name || 'Unknown';
      return `[${timestamp}] ${speaker}: ${row.transcript_text}`;
    }).reverse().join('\n');

    return `Active Meeting: ${result.rows[0].title}\n\n${formattedContext}`;

  } catch (error) {
    console.error('❌ Error fetching active meeting context:', error.message);
    return `Error: ${error.message}`;
  } finally {
    await client.end();
  }
}

/**
 * Get context from specific session
 *
 * @param {string} sessionId - Meeting session UUID
 * @param {number} minutes - How many minutes of history to fetch (default: 10)
 * @returns {Promise<Object>} Session details with transcripts
 */
async function getSessionContext(sessionId, minutes = 10) {
  const client = new Client(ALLOYDB_CONFIG);

  try {
    await client.connect();

    // Get session details
    const sessionResult = await client.query(`
      SELECT
        id,
        title,
        host_email,
        session_start,
        recording_status
      FROM meeting_sessions
      WHERE id = $1
    `, [sessionId]);

    if (sessionResult.rows.length === 0) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const session = sessionResult.rows[0];

    // Get recent transcripts
    const transcriptResult = await client.query(`
      SELECT
        mt.transcript_text,
        mt.start_time,
        mt.confidence,
        mp.participant_name,
        mp.participant_email
      FROM meeting_transcripts mt
      LEFT JOIN meeting_participants mp ON mt.speaker_id = mp.id
      WHERE mt.session_id = $1
      AND mt.start_time >= NOW() - INTERVAL '${minutes} minutes'
      AND mt.is_interim = FALSE
      ORDER BY mt.start_time ASC
    `, [sessionId]);

    return {
      session: {
        id: session.id,
        title: session.title,
        host: session.host_email,
        started: session.session_start,
        status: session.recording_status
      },
      transcripts: transcriptResult.rows.map(row => ({
        speaker: row.participant_name || 'Unknown',
        email: row.participant_email,
        text: row.transcript_text,
        timestamp: row.start_time,
        confidence: parseFloat(row.confidence)
      }))
    };

  } finally {
    await client.end();
  }
}

/**
 * Search across all meeting transcripts
 * Uses PostgreSQL full-text search
 *
 * @param {string} query - Search query (supports AND, OR, NOT operators)
 * @param {number} limit - Max results to return (default: 50)
 * @returns {Promise<Array>} Search results with rank
 */
async function searchMeetingTranscripts(query, limit = 50) {
  const client = new Client(ALLOYDB_CONFIG);

  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        ms.id as session_id,
        ms.title as session_title,
        ms.session_start,
        mp.participant_name as speaker,
        mt.transcript_text as text,
        mt.start_time as timestamp,
        ts_rank(mt.search_vector, websearch_to_tsquery('english', $1)) as rank
      FROM meeting_transcripts mt
      JOIN meeting_sessions ms ON mt.session_id = ms.id
      LEFT JOIN meeting_participants mp ON mt.speaker_id = mp.id
      WHERE mt.search_vector @@ websearch_to_tsquery('english', $1)
      ORDER BY rank DESC, mt.start_time DESC
      LIMIT $2
    `, [query, limit]);

    return result.rows.map(row => ({
      sessionId: row.session_id,
      sessionTitle: row.session_title,
      sessionDate: row.session_start,
      speaker: row.speaker || 'Unknown',
      text: row.text,
      timestamp: row.timestamp,
      relevance: parseFloat(row.rank).toFixed(4)
    }));

  } finally {
    await client.end();
  }
}

/**
 * Get list of active (live) sessions
 *
 * @returns {Promise<Array>} Active sessions with participant counts
 */
async function getActiveSessions() {
  const client = new Client(ALLOYDB_CONFIG);

  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        ms.id,
        ms.title,
        ms.host_email,
        ms.session_start,
        COUNT(DISTINCT mp.id) as participant_count
      FROM meeting_sessions ms
      LEFT JOIN meeting_participants mp ON ms.id = mp.session_id
      WHERE ms.recording_status = 'live'
      GROUP BY ms.id, ms.title, ms.host_email, ms.session_start
      ORDER BY ms.session_start DESC
    `);

    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      host: row.host_email,
      started: row.session_start,
      participants: parseInt(row.participant_count)
    }));

  } finally {
    await client.end();
  }
}

/**
 * Extract action items from meeting using LLM
 * (For Planning agent integration)
 *
 * @param {string} sessionId - Meeting session UUID
 * @returns {Promise<Array>} Extracted action items
 */
async function extractActionItems(sessionId) {
  const context = await getSessionContext(sessionId, 60); // Last hour

  // Format transcript for LLM
  const transcript = context.transcripts
    .map(t => `${t.speaker}: ${t.text}`)
    .join('\n');

  // This would be called by Planning agent with Claude
  return {
    sessionId,
    transcript,
    prompt: `
Extract action items from this meeting transcript:

${transcript}

Return as JSON array:
[
  {"action": "...", "owner": "...", "due_date": "..."},
  ...
]
    `.trim()
  };
}

/**
 * Get meeting summary (for Research agent)
 *
 * @param {string} sessionId - Meeting session UUID
 * @returns {Promise<Object>} Meeting summary data
 */
async function getMeetingSummary(sessionId) {
  const client = new Client(ALLOYDB_CONFIG);

  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        ms.title,
        ms.session_start,
        ms.session_end,
        ms.total_duration_seconds,
        COUNT(DISTINCT mp.id) as participant_count,
        COUNT(DISTINCT mt.id) as transcript_count,
        COALESCE(STRING_AGG(DISTINCT mp.participant_name, ', '), 'None') as participants
      FROM meeting_sessions ms
      LEFT JOIN meeting_participants mp ON ms.id = mp.session_id
      LEFT JOIN meeting_transcripts mt ON ms.id = mt.session_id AND mt.is_interim = FALSE
      WHERE ms.id = $1
      GROUP BY ms.id, ms.title, ms.session_start, ms.session_end, ms.total_duration_seconds
    `, [sessionId]);

    if (result.rows.length === 0) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const summary = result.rows[0];

    return {
      title: summary.title,
      started: summary.session_start,
      ended: summary.session_end,
      duration: summary.total_duration_seconds
        ? `${Math.floor(summary.total_duration_seconds / 60)} minutes`
        : 'In progress',
      participants: summary.participants.split(', '),
      participantCount: parseInt(summary.participant_count),
      transcriptCount: parseInt(summary.transcript_count)
    };

  } finally {
    await client.end();
  }
}

module.exports = {
  getActiveMeetingContext,
  getSessionContext,
  searchMeetingTranscripts,
  getActiveSessions,
  extractActionItems,
  getMeetingSummary
};

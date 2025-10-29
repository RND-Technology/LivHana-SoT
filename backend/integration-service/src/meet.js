import express from 'express';
import { Pool } from 'pg';
import { createLogger } from '../common/logging/index.js';

const router = express.Router();
const logger = createLogger('meet-streaming');

// DB pool for AlloyDB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ============================================
// SESSION MANAGEMENT
// ============================================

// POST /api/meet/sessions/start - Start a new Meet session
router.post('/sessions/start', async (req, res) => {
  try {
    const {
      meet_code,
      meet_url,
      host_name,
      host_email,
      metadata = {}
    } = req.body;

    if (!meet_code || !meet_url) {
      return res.status(400).json({ error: 'meet_code and meet_url are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO meet_sessions (meet_code, meet_url, host_name, host_email, status, metadata, session_start)
       VALUES ($1, $2, $3, $4, 'active', $5, NOW())
       RETURNING id, meet_code, session_start, status`,
      [meet_code, meet_url, host_name, host_email, metadata]
    );

    const session = rows[0];
    logger.info(`Meet session started: ${session.id}`, { meet_code, host_name });

    res.json({
      success: true,
      session
    });
  } catch (error) {
    logger.error('Failed to start session:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// POST /api/meet/sessions/:id/end - End a Meet session
router.post('/sessions/:id/end', async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `UPDATE meet_sessions
       SET status = 'ended',
           session_end = NOW(),
           duration_seconds = EXTRACT(EPOCH FROM (NOW() - session_start))::INTEGER
       WHERE id = $1 AND status = 'active'
       RETURNING id, meet_code, session_start, session_end, duration_seconds`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or already ended' });
    }

    logger.info(`Meet session ended: ${id}`, { duration_seconds: rows[0].duration_seconds });

    res.json({
      success: true,
      session: rows[0]
    });
  } catch (error) {
    logger.error('Failed to end session:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// GET /api/meet/sessions/active - Get all active sessions
router.get('/sessions/active', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM get_active_sessions()`
    );

    res.json({
      success: true,
      sessions: rows
    });
  } catch (error) {
    logger.error('Failed to fetch active sessions:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// GET /api/meet/sessions/:id - Get session details
router.get('/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT * FROM meet_sessions WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      success: true,
      session: rows[0]
    });
  } catch (error) {
    logger.error('Failed to fetch session:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PARTICIPANT MANAGEMENT
// ============================================

// POST /api/meet/participants/join - Add participant to session
router.post('/participants/join', async (req, res) => {
  try {
    const {
      session_id,
      participant_name,
      participant_email,
      is_host = false,
      audio_enabled = true,
      video_enabled = true,
      metadata = {}
    } = req.body;

    if (!session_id || !participant_name) {
      return res.status(400).json({ error: 'session_id and participant_name are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO meet_participants (session_id, participant_name, participant_email, is_host, audio_enabled, video_enabled, metadata, join_time)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, participant_name, join_time`,
      [session_id, participant_name, participant_email, is_host, audio_enabled, video_enabled, metadata]
    );

    logger.info(`Participant joined: ${participant_name}`, { session_id });

    res.json({
      success: true,
      participant: rows[0]
    });
  } catch (error) {
    logger.error('Failed to add participant:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// POST /api/meet/participants/:id/leave - Participant leaves session
router.post('/participants/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `UPDATE meet_participants
       SET leave_time = NOW(),
           duration_seconds = EXTRACT(EPOCH FROM (NOW() - join_time))::INTEGER
       WHERE id = $1 AND leave_time IS NULL
       RETURNING id, participant_name, join_time, leave_time, duration_seconds`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found or already left' });
    }

    logger.info(`Participant left: ${rows[0].participant_name}`, { duration_seconds: rows[0].duration_seconds });

    res.json({
      success: true,
      participant: rows[0]
    });
  } catch (error) {
    logger.error('Failed to update participant:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// REAL-TIME TRANSCRIPT STREAMING
// ============================================

// POST /api/meet/transcripts/stream - Stream transcript chunk (CRITICAL FOR REAL-TIME)
router.post('/transcripts/stream', async (req, res) => {
  try {
    const {
      session_id,
      participant_id,
      speaker_name,
      transcript_text,
      transcript_html,
      timestamp_start,
      timestamp_end,
      duration_ms,
      confidence_score,
      language = 'en-US',
      is_final = true,
      sequence_number,
      metadata = {}
    } = req.body;

    if (!session_id || !transcript_text || !timestamp_start) {
      return res.status(400).json({ error: 'session_id, transcript_text, and timestamp_start are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO meet_transcripts (
        session_id, participant_id, speaker_name, transcript_text, transcript_html,
        timestamp_start, timestamp_end, duration_ms, confidence_score, language,
        is_final, sequence_number, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, speaker_name, transcript_text, timestamp_start, is_final`,
      [
        session_id, participant_id, speaker_name, transcript_text, transcript_html,
        timestamp_start, timestamp_end, duration_ms, confidence_score, language,
        is_final, sequence_number, metadata
      ]
    );

    // Fast response for streaming
    res.json({
      success: true,
      transcript_id: rows[0].id,
      timestamp: rows[0].timestamp_start
    });
  } catch (error) {
    logger.error('Failed to stream transcript:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// GET /api/meet/transcripts/recent/:session_id - Get recent transcripts (for agents)
router.get('/transcripts/recent/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    const { minutes = 5, final_only = true } = req.query;

    let query = `
      SELECT
        id,
        speaker_name,
        transcript_text,
        timestamp_start,
        confidence_score,
        is_final
      FROM meet_transcripts
      WHERE session_id = $1
        AND timestamp_start >= NOW() - INTERVAL '${parseInt(minutes)} minutes'
    `;

    if (final_only === 'true') {
      query += ` AND is_final = TRUE`;
    }

    query += ` ORDER BY timestamp_start DESC`;

    const { rows } = await pool.query(query, [session_id]);

    res.json({
      success: true,
      transcripts: rows,
      count: rows.length
    });
  } catch (error) {
    logger.error('Failed to fetch recent transcripts:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SCREEN CAPTURES
// ============================================

// POST /api/meet/screen-captures - Add screen capture
router.post('/screen-captures', async (req, res) => {
  try {
    const {
      session_id,
      participant_id,
      capture_type,
      storage_path,
      thumbnail_path,
      width,
      height,
      file_size_bytes,
      ocr_text,
      detected_objects,
      presenter_name,
      metadata = {}
    } = req.body;

    if (!session_id || !capture_type || !storage_path) {
      return res.status(400).json({ error: 'session_id, capture_type, and storage_path are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO meet_screen_captures (
        session_id, participant_id, capture_type, storage_path, thumbnail_path,
        width, height, file_size_bytes, ocr_text, detected_objects, presenter_name, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id, capture_timestamp, storage_path`,
      [
        session_id, participant_id, capture_type, storage_path, thumbnail_path,
        width, height, file_size_bytes, ocr_text, detected_objects, presenter_name, metadata
      ]
    );

    res.json({
      success: true,
      capture_id: rows[0].id,
      timestamp: rows[0].capture_timestamp
    });
  } catch (error) {
    logger.error('Failed to save screen capture:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// CHAT MESSAGES
// ============================================

// POST /api/meet/chat - Add chat message
router.post('/chat', async (req, res) => {
  try {
    const {
      session_id,
      participant_id,
      sender_name,
      sender_email,
      message_text,
      message_html,
      is_private = false,
      recipient_name,
      attachments,
      metadata = {}
    } = req.body;

    if (!session_id || !sender_name || !message_text) {
      return res.status(400).json({ error: 'session_id, sender_name, and message_text are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO meet_chat_messages (
        session_id, participant_id, sender_name, sender_email, message_text,
        message_html, is_private, recipient_name, attachments, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, sender_name, message_text, timestamp`,
      [
        session_id, participant_id, sender_name, sender_email, message_text,
        message_html, is_private, recipient_name, attachments, metadata
      ]
    );

    res.json({
      success: true,
      message_id: rows[0].id,
      timestamp: rows[0].timestamp
    });
  } catch (error) {
    logger.error('Failed to save chat message:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EVENTS
// ============================================

// POST /api/meet/events - Log event
router.post('/events', async (req, res) => {
  try {
    const {
      session_id,
      event_type,
      participant_id,
      event_data,
      severity = 'info'
    } = req.body;

    if (!session_id || !event_type || !event_data) {
      return res.status(400).json({ error: 'session_id, event_type, and event_data are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO meet_events (session_id, event_type, participant_id, event_data, severity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, event_type, event_timestamp`,
      [session_id, event_type, participant_id, event_data, severity]
    );

    res.json({
      success: true,
      event_id: rows[0].id,
      timestamp: rows[0].event_timestamp
    });
  } catch (error) {
    logger.error('Failed to log event:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// AGENT ANALYSIS ENDPOINTS
// ============================================

// POST /api/meet/analysis - Submit agent analysis
router.post('/analysis', async (req, res) => {
  try {
    const {
      session_id,
      agent_name,
      analysis_type,
      analysis_text,
      analysis_json,
      confidence_score,
      priority = 'normal',
      action_required = false,
      related_transcript_ids = [],
      metadata = {}
    } = req.body;

    if (!session_id || !agent_name || !analysis_type || !analysis_text) {
      return res.status(400).json({
        error: 'session_id, agent_name, analysis_type, and analysis_text are required'
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO meet_agent_analysis (
        session_id, agent_name, analysis_type, analysis_text, analysis_json,
        confidence_score, priority, action_required, related_transcript_ids, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, agent_name, analysis_type, analysis_timestamp`,
      [
        session_id, agent_name, analysis_type, analysis_text, analysis_json,
        confidence_score, priority, action_required, related_transcript_ids, metadata
      ]
    );

    logger.info(`Agent analysis recorded: ${agent_name}`, {
      session_id,
      analysis_type,
      priority
    });

    res.json({
      success: true,
      analysis_id: rows[0].id,
      timestamp: rows[0].analysis_timestamp
    });
  } catch (error) {
    logger.error('Failed to save agent analysis:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// GET /api/meet/analysis/:session_id - Get all analysis for session
router.get('/analysis/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    const { agent_name, analysis_type, priority } = req.query;

    let query = `SELECT * FROM meet_agent_analysis WHERE session_id = $1`;
    const params = [session_id];
    let paramIndex = 2;

    if (agent_name) {
      query += ` AND agent_name = $${paramIndex}`;
      params.push(agent_name);
      paramIndex++;
    }

    if (analysis_type) {
      query += ` AND analysis_type = $${paramIndex}`;
      params.push(analysis_type);
      paramIndex++;
    }

    if (priority) {
      query += ` AND priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    query += ` ORDER BY analysis_timestamp DESC`;

    const { rows } = await pool.query(query, params);

    res.json({
      success: true,
      analyses: rows,
      count: rows.length
    });
  } catch (error) {
    logger.error('Failed to fetch agent analysis:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

router.get('/health', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW() as db_time');
    res.json({
      status: 'healthy',
      database: 'connected',
      db_time: rows[0].db_time,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;

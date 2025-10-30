-- ============================================
-- REAL-TIME MEETING CAPTURE SCHEMA - ALLOYDB
-- ============================================
-- Database: postgres (default)
-- Version: 1.0
-- Date: October 28, 2025
-- Owner: Jesse Niesen (CEO)
-- Purpose: Google Meet real-time capture → AlloyDB
-- ============================================

-- ============================================
-- MEETING SESSIONS TABLE
-- ============================================
CREATE TABLE meeting_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meet_url TEXT NOT NULL,
    session_start TIMESTAMP DEFAULT NOW(),
    session_end TIMESTAMP,
    title VARCHAR(500),
    host_email VARCHAR(255),
    recording_status VARCHAR(50) DEFAULT 'live', -- live, ended, processing, completed
    video_storage_path TEXT, -- gs://livhana-rpm-datalake/meetings/video/{id}/recording.mp4
    audio_storage_path TEXT, -- gs://livhana-rpm-datalake/meetings/audio/{id}/audio.wav
    total_duration_seconds INTEGER DEFAULT 0,
    total_participants INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB -- {recording_quality: "hd", captions_enabled: true, ...}
);

-- ============================================
-- MEETING PARTICIPANTS TABLE
-- ============================================
CREATE TABLE meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    participant_email VARCHAR(255),
    participant_name VARCHAR(255),
    join_time TIMESTAMP NOT NULL,
    leave_time TIMESTAMP,
    speaking_time_seconds INTEGER DEFAULT 0, -- total speaking duration
    camera_on_duration_seconds INTEGER DEFAULT 0,
    screen_share_duration_seconds INTEGER DEFAULT 0,
    metadata JSONB, -- {mic_enabled: true, camera_enabled: false, role: "host"}
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MEETING TRANSCRIPTS TABLE (REAL-TIME)
-- ============================================
CREATE TABLE meeting_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    speaker_id UUID REFERENCES meeting_participants(id),
    transcript_text TEXT NOT NULL,
    confidence DECIMAL(5,4), -- 0.0000 to 1.0000 (speech recognition confidence)
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_seconds DECIMAL(8,3), -- speaking duration for this segment
    is_interim BOOLEAN DEFAULT FALSE, -- real-time (true) vs finalized (false)
    language VARCHAR(10) DEFAULT 'en-US',
    created_at TIMESTAMP DEFAULT NOW(),

    -- Full-text search support
    search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', transcript_text)) STORED
);

-- ============================================
-- MEETING FRAMES TABLE (SCREEN CAPTURE)
-- ============================================
CREATE TABLE meeting_frames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    frame_number INTEGER NOT NULL,
    frame_timestamp TIMESTAMP NOT NULL,
    frame_storage_path TEXT, -- gs://livhana-rpm-datalake/meetings/frames/{session_id}/frame_{number}.jpg
    ocr_text TEXT, -- extracted text from screen via OCR
    detected_objects JSONB, -- CV analysis: {"faces": 3, "documents": 1, "charts": 2}
    frame_type VARCHAR(50), -- presentation, screen_share, camera_view
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(session_id, frame_number)
);

-- ============================================
-- MEETING ACTIONS TABLE (EVENTS)
-- ============================================
CREATE TABLE meeting_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL, -- screen_share_start, chat_message, hand_raised, poll_created
    actor_id UUID REFERENCES meeting_participants(id),
    action_timestamp TIMESTAMP NOT NULL,
    action_data JSONB, -- {message: "...", file_url: "...", poll_question: "..."}
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MEETING ANALYSIS TABLE (AI-GENERATED)
-- ============================================
CREATE TABLE meeting_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES meeting_sessions(id) ON DELETE CASCADE,
    analysis_type VARCHAR(100) NOT NULL, -- summary, action_items, decisions, sentiment
    analysis_content TEXT NOT NULL,
    confidence_score DECIMAL(5,4),
    generated_at TIMESTAMP DEFAULT NOW(),
    generated_by VARCHAR(100), -- planning, research, qa agent name
    metadata JSONB, -- {model: "claude-3-opus", tokens_used: 5000}
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MEETING SEARCH VIEW (AGENT QUERIES)
-- ============================================
CREATE VIEW meeting_search_view AS
SELECT
    ms.id AS session_id,
    ms.title AS session_title,
    ms.session_start,
    ms.recording_status,
    mp.participant_name,
    mp.participant_email,
    mt.transcript_text,
    mt.start_time AS transcript_time,
    mt.confidence,
    mt.search_vector
FROM meeting_sessions ms
JOIN meeting_transcripts mt ON ms.id = mt.session_id
JOIN meeting_participants mp ON mt.speaker_id = mp.id
WHERE ms.recording_status IN ('live', 'ended')
ORDER BY mt.start_time DESC;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Session queries
CREATE INDEX idx_meeting_sessions_status ON meeting_sessions(recording_status);
CREATE INDEX idx_meeting_sessions_start ON meeting_sessions(session_start DESC);
CREATE INDEX idx_meeting_sessions_host ON meeting_sessions(host_email);

-- Participant queries
CREATE INDEX idx_meeting_participants_session ON meeting_participants(session_id);
CREATE INDEX idx_meeting_participants_email ON meeting_participants(participant_email);
CREATE INDEX idx_meeting_participants_join ON meeting_participants(join_time DESC);

-- Transcript queries (CRITICAL FOR AGENTS)
CREATE INDEX idx_meeting_transcripts_session ON meeting_transcripts(session_id, start_time DESC);
CREATE INDEX idx_meeting_transcripts_speaker ON meeting_transcripts(speaker_id);
CREATE INDEX idx_meeting_transcripts_time ON meeting_transcripts(start_time DESC);
CREATE INDEX idx_meeting_transcripts_interim ON meeting_transcripts(is_interim);

-- Full-text search index (GIN index for tsvector)
CREATE INDEX idx_meeting_transcripts_search ON meeting_transcripts USING GIN(search_vector);

-- Frame queries
CREATE INDEX idx_meeting_frames_session ON meeting_frames(session_id, frame_timestamp);
CREATE INDEX idx_meeting_frames_type ON meeting_frames(frame_type);

-- Action queries
CREATE INDEX idx_meeting_actions_session ON meeting_actions(session_id, action_timestamp);
CREATE INDEX idx_meeting_actions_type ON meeting_actions(action_type);
CREATE INDEX idx_meeting_actions_actor ON meeting_actions(actor_id);

-- Analysis queries
CREATE INDEX idx_meeting_analysis_session ON meeting_analysis(session_id);
CREATE INDEX idx_meeting_analysis_type ON meeting_analysis(analysis_type);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================

-- Update meeting_sessions updated_at on any change
CREATE TRIGGER update_meeting_sessions_updated_at
    BEFORE UPDATE ON meeting_sessions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Auto-calculate session duration when ended
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_end IS NOT NULL AND OLD.session_end IS NULL THEN
        NEW.total_duration_seconds := EXTRACT(EPOCH FROM (NEW.session_end - NEW.session_start))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_meeting_duration
    BEFORE UPDATE ON meeting_sessions
    FOR EACH ROW
    EXECUTE PROCEDURE calculate_session_duration();

-- Auto-calculate participant speaking time
CREATE OR REPLACE FUNCTION update_participant_speaking_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.duration_seconds IS NOT NULL THEN
        UPDATE meeting_participants
        SET speaking_time_seconds = speaking_time_seconds + NEW.duration_seconds
        WHERE id = NEW.speaker_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_speaking_time
    AFTER INSERT ON meeting_transcripts
    FOR EACH ROW
    EXECUTE PROCEDURE update_participant_speaking_time();

-- ============================================
-- HELPER FUNCTIONS FOR AGENTS
-- ============================================

-- Get recent transcripts for a session (last N minutes)
CREATE OR REPLACE FUNCTION get_recent_transcripts(
    p_session_id UUID,
    p_minutes INTEGER DEFAULT 10
)
RETURNS TABLE (
    speaker_name VARCHAR,
    speaker_email VARCHAR,
    transcript TEXT,
    timestamp TIMESTAMP,
    confidence DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        mp.participant_name,
        mp.participant_email,
        mt.transcript_text,
        mt.start_time,
        mt.confidence
    FROM meeting_transcripts mt
    JOIN meeting_participants mp ON mt.speaker_id = mp.id
    WHERE mt.session_id = p_session_id
    AND mt.start_time >= NOW() - INTERVAL '1 minute' * p_minutes
    AND mt.is_interim = FALSE
    ORDER BY mt.start_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Full-text search across all meetings
CREATE OR REPLACE FUNCTION search_meetings(
    p_search_query TEXT,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    session_id UUID,
    session_title VARCHAR,
    speaker_name VARCHAR,
    transcript TEXT,
    timestamp TIMESTAMP,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ms.id,
        ms.title,
        mp.participant_name,
        mt.transcript_text,
        mt.start_time,
        ts_rank(mt.search_vector, websearch_to_tsquery('english', p_search_query)) AS rank
    FROM meeting_transcripts mt
    JOIN meeting_sessions ms ON mt.session_id = ms.id
    JOIN meeting_participants mp ON mt.speaker_id = mp.id
    WHERE mt.search_vector @@ websearch_to_tsquery('english', p_search_query)
    ORDER BY rank DESC, mt.start_time DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get active (live) sessions
CREATE OR REPLACE FUNCTION get_active_sessions()
RETURNS TABLE (
    session_id UUID,
    title VARCHAR,
    host_email VARCHAR,
    started_at TIMESTAMP,
    participant_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ms.id,
        ms.title,
        ms.host_email,
        ms.session_start,
        COUNT(DISTINCT mp.id) AS participant_count
    FROM meeting_sessions ms
    LEFT JOIN meeting_participants mp ON ms.id = mp.session_id
    WHERE ms.recording_status = 'live'
    GROUP BY ms.id, ms.title, ms.host_email, ms.session_start
    ORDER BY ms.session_start DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATA LIFECYCLE POLICIES
-- ============================================

-- Archive old sessions (move to cold storage after 30 days)
CREATE OR REPLACE FUNCTION archive_old_sessions()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    UPDATE meeting_sessions
    SET recording_status = 'archived',
        metadata = metadata || jsonb_build_object('archived_at', NOW())
    WHERE recording_status = 'completed'
    AND session_start < NOW() - INTERVAL '30 days'
    AND recording_status != 'archived';

    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (FOR TESTING)
-- ============================================

-- Insert sample session (DO NOT RUN IN PRODUCTION)
-- INSERT INTO meeting_sessions (meet_url, title, host_email, recording_status)
-- VALUES (
--     'https://meet.google.com/test-session',
--     'Test Meeting - RPM Planning',
--     'jesse@livhana.com',
--     'live'
-- );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these after schema creation to verify:

-- List all meeting tables
-- SELECT schemaname, tablename FROM pg_tables
-- WHERE tablename LIKE 'meeting%'
-- ORDER BY tablename;

-- Check indexes
-- SELECT indexname, tablename FROM pg_indexes
-- WHERE tablename LIKE 'meeting%'
-- ORDER BY tablename, indexname;

-- Test full-text search
-- SELECT * FROM search_meetings('action items', 10);

-- Get active sessions
-- SELECT * FROM get_active_sessions();

-- ============================================
-- GRANT PERMISSIONS (for service accounts)
-- ============================================

-- GRANT SELECT, INSERT, UPDATE ON meeting_sessions TO meet_capture_service;
-- GRANT SELECT, INSERT, UPDATE ON meeting_participants TO meet_capture_service;
-- GRANT SELECT, INSERT ON meeting_transcripts TO meet_capture_service;
-- GRANT SELECT, INSERT ON meeting_frames TO meet_capture_service;
-- GRANT SELECT, INSERT ON meeting_actions TO meet_capture_service;
-- GRANT SELECT, INSERT, UPDATE ON meeting_analysis TO rpm_agent_service;

-- Agents get read-only access
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO planning_agent;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO research_agent;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO artifact_agent;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO qa_agent;

-- ============================================
-- END OF SCHEMA
-- ============================================

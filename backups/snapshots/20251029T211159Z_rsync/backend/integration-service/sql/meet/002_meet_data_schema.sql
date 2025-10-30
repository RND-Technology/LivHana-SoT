-- ============================================
-- GOOGLE MEET DATA STREAMING - ALLOYDB SCHEMA
-- ============================================
-- Database: postgres (default)
-- Version: 1.0
-- Date: October 28, 2025
-- Owner: Jesse Niesen (CEO)
-- Purpose: Real-time capture of Google Meet sessions for AI agent analysis
-- ============================================

-- ============================================
-- MEET SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meet_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meet_code VARCHAR(20) NOT NULL, -- e.g. "abc-defg-hij"
    meet_url TEXT NOT NULL,
    session_start TIMESTAMP NOT NULL DEFAULT NOW(),
    session_end TIMESTAMP,
    duration_seconds INTEGER,
    host_name VARCHAR(255),
    host_email VARCHAR(255),
    participant_count INTEGER DEFAULT 0,
    recording_available BOOLEAN DEFAULT FALSE,
    recording_url TEXT,
    status VARCHAR(50) DEFAULT 'active', -- active, ended, error
    metadata JSONB, -- custom fields, meeting type, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MEET PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meet_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES meet_sessions(id) ON DELETE CASCADE,
    participant_name VARCHAR(255),
    participant_email VARCHAR(255),
    join_time TIMESTAMP NOT NULL DEFAULT NOW(),
    leave_time TIMESTAMP,
    duration_seconds INTEGER,
    is_host BOOLEAN DEFAULT FALSE,
    is_presenting BOOLEAN DEFAULT FALSE,
    audio_enabled BOOLEAN DEFAULT TRUE,
    video_enabled BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MEET TRANSCRIPTS TABLE (Real-time streaming)
-- ============================================
CREATE TABLE IF NOT EXISTS meet_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES meet_sessions(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES meet_participants(id) ON DELETE SET NULL,
    speaker_name VARCHAR(255),
    transcript_text TEXT NOT NULL,
    transcript_html TEXT, -- formatted with timestamps, speaker names
    timestamp_start TIMESTAMP NOT NULL,
    timestamp_end TIMESTAMP,
    duration_ms INTEGER,
    confidence_score DECIMAL(5,4), -- 0.0000 to 1.0000
    language VARCHAR(10) DEFAULT 'en-US',
    is_final BOOLEAN DEFAULT TRUE, -- false for interim results
    sequence_number INTEGER, -- order within session
    metadata JSONB, -- sentiment, keywords, entities
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MEET SCREEN CAPTURES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meet_screen_captures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES meet_sessions(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES meet_participants(id) ON DELETE SET NULL,
    capture_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    capture_type VARCHAR(50) NOT NULL, -- screenshot, video_frame, slide
    storage_path TEXT NOT NULL, -- gs://bucket/path/to/image.png
    thumbnail_path TEXT,
    width INTEGER,
    height INTEGER,
    file_size_bytes BIGINT,
    ocr_text TEXT, -- extracted text from image
    detected_objects JSONB, -- AI vision analysis
    presenter_name VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MEET VIDEO SEGMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meet_video_segments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES meet_sessions(id) ON DELETE CASCADE,
    segment_start TIMESTAMP NOT NULL,
    segment_end TIMESTAMP NOT NULL,
    duration_seconds INTEGER,
    storage_path TEXT NOT NULL, -- gs://bucket/path/to/video.mp4
    file_size_bytes BIGINT,
    resolution VARCHAR(20), -- 720p, 1080p, etc.
    codec VARCHAR(50),
    bitrate_kbps INTEGER,
    thumbnail_path TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MEET CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS meet_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES meet_sessions(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES meet_participants(id) ON DELETE SET NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255),
    message_text TEXT NOT NULL,
    message_html TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    is_private BOOLEAN DEFAULT FALSE,
    recipient_name VARCHAR(255), -- for private messages
    attachments JSONB, -- array of file references
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MEET EVENTS TABLE (General event tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS meet_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES meet_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- recording_started, screen_share_started, etc.
    event_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    participant_id UUID REFERENCES meet_participants(id) ON DELETE SET NULL,
    event_data JSONB NOT NULL, -- flexible event details
    severity VARCHAR(20) DEFAULT 'info', -- info, warning, error
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- AGENT ANALYSIS TABLE (AI insights from agents)
-- ============================================
CREATE TABLE IF NOT EXISTS meet_agent_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES meet_sessions(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL, -- Planning, Artifact, QA, Research, ExecMon
    analysis_type VARCHAR(100) NOT NULL, -- sentiment, action_items, summary, risks
    analysis_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    analysis_text TEXT NOT NULL,
    analysis_json JSONB, -- structured data
    confidence_score DECIMAL(5,4),
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, critical
    action_required BOOLEAN DEFAULT FALSE,
    related_transcript_ids UUID[], -- array of transcript IDs analyzed
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_meet_sessions_meet_code ON meet_sessions(meet_code);
CREATE INDEX IF NOT EXISTS idx_meet_sessions_start ON meet_sessions(session_start DESC);
CREATE INDEX IF NOT EXISTS idx_meet_sessions_status ON meet_sessions(status);
CREATE INDEX IF NOT EXISTS idx_meet_sessions_host_email ON meet_sessions(host_email);

-- Participant indexes
CREATE INDEX IF NOT EXISTS idx_meet_participants_session ON meet_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_meet_participants_email ON meet_participants(participant_email);
CREATE INDEX IF NOT EXISTS idx_meet_participants_join_time ON meet_participants(join_time DESC);

-- Transcript indexes (critical for real-time queries)
CREATE INDEX IF NOT EXISTS idx_meet_transcripts_session ON meet_transcripts(session_id);
CREATE INDEX IF NOT EXISTS idx_meet_transcripts_timestamp ON meet_transcripts(timestamp_start DESC);
CREATE INDEX IF NOT EXISTS idx_meet_transcripts_speaker ON meet_transcripts(speaker_name);
CREATE INDEX IF NOT EXISTS idx_meet_transcripts_is_final ON meet_transcripts(is_final);
CREATE INDEX IF NOT EXISTS idx_meet_transcripts_sequence ON meet_transcripts(session_id, sequence_number);

-- Screen capture indexes
CREATE INDEX IF NOT EXISTS idx_meet_screen_captures_session ON meet_screen_captures(session_id);
CREATE INDEX IF NOT EXISTS idx_meet_screen_captures_timestamp ON meet_screen_captures(capture_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_meet_screen_captures_type ON meet_screen_captures(capture_type);

-- Video segment indexes
CREATE INDEX IF NOT EXISTS idx_meet_video_segments_session ON meet_video_segments(session_id);
CREATE INDEX IF NOT EXISTS idx_meet_video_segments_start ON meet_video_segments(segment_start DESC);

-- Chat message indexes
CREATE INDEX IF NOT EXISTS idx_meet_chat_messages_session ON meet_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_meet_chat_messages_timestamp ON meet_chat_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_meet_chat_messages_sender ON meet_chat_messages(sender_email);

-- Event indexes
CREATE INDEX IF NOT EXISTS idx_meet_events_session ON meet_events(session_id);
CREATE INDEX IF NOT EXISTS idx_meet_events_type ON meet_events(event_type);
CREATE INDEX IF NOT EXISTS idx_meet_events_timestamp ON meet_events(event_timestamp DESC);

-- Agent analysis indexes
CREATE INDEX IF NOT EXISTS idx_meet_agent_analysis_session ON meet_agent_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_meet_agent_analysis_agent ON meet_agent_analysis(agent_name);
CREATE INDEX IF NOT EXISTS idx_meet_agent_analysis_type ON meet_agent_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_meet_agent_analysis_timestamp ON meet_agent_analysis(analysis_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_meet_agent_analysis_priority ON meet_agent_analysis(priority);

-- Full-text search indexes for transcripts and chat
CREATE INDEX IF NOT EXISTS idx_meet_transcripts_text_search ON meet_transcripts USING gin(to_tsvector('english', transcript_text));
CREATE INDEX IF NOT EXISTS idx_meet_chat_messages_text_search ON meet_chat_messages USING gin(to_tsvector('english', message_text));

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================
CREATE OR REPLACE FUNCTION update_meet_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_meet_sessions_updated_at
    BEFORE UPDATE ON meet_sessions
    FOR EACH ROW EXECUTE PROCEDURE update_meet_updated_at_column();

CREATE TRIGGER update_meet_participants_updated_at
    BEFORE UPDATE ON meet_participants
    FOR EACH ROW EXECUTE PROCEDURE update_meet_updated_at_column();

-- ============================================
-- MATERIALIZED VIEW FOR AGENT DASHBOARD
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS meet_sessions_summary AS
SELECT
    ms.id,
    ms.meet_code,
    ms.session_start,
    ms.session_end,
    ms.host_name,
    ms.host_email,
    ms.status,
    COUNT(DISTINCT mp.id) as total_participants,
    COUNT(DISTINCT mt.id) as total_transcript_segments,
    COUNT(DISTINCT msc.id) as total_screen_captures,
    COUNT(DISTINCT mcm.id) as total_chat_messages,
    MAX(mt.timestamp_start) as last_transcript_timestamp,
    COUNT(DISTINCT maa.id) as total_agent_analyses
FROM meet_sessions ms
LEFT JOIN meet_participants mp ON ms.id = mp.session_id
LEFT JOIN meet_transcripts mt ON ms.id = mt.session_id
LEFT JOIN meet_screen_captures msc ON ms.id = msc.session_id
LEFT JOIN meet_chat_messages mcm ON ms.id = mcm.session_id
LEFT JOIN meet_agent_analysis maa ON ms.id = maa.session_id
GROUP BY ms.id, ms.meet_code, ms.session_start, ms.session_end,
         ms.host_name, ms.host_email, ms.status;

-- Index for materialized view
CREATE INDEX IF NOT EXISTS idx_meet_sessions_summary_start ON meet_sessions_summary(session_start DESC);
CREATE INDEX IF NOT EXISTS idx_meet_sessions_summary_status ON meet_sessions_summary(status);

-- ============================================
-- HELPER FUNCTIONS FOR AGENTS
-- ============================================

-- Get latest transcripts for a session (last N minutes)
CREATE OR REPLACE FUNCTION get_recent_transcripts(
    p_session_id UUID,
    p_minutes INTEGER DEFAULT 5
)
RETURNS TABLE (
    speaker_name VARCHAR(255),
    transcript_text TEXT,
    timestamp_start TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        mt.speaker_name,
        mt.transcript_text,
        mt.timestamp_start
    FROM meet_transcripts mt
    WHERE mt.session_id = p_session_id
      AND mt.is_final = TRUE
      AND mt.timestamp_start >= NOW() - (p_minutes || ' minutes')::INTERVAL
    ORDER BY mt.timestamp_start DESC;
END;
$$ LANGUAGE plpgsql;

-- Get active sessions
CREATE OR REPLACE FUNCTION get_active_sessions()
RETURNS TABLE (
    session_id UUID,
    meet_code VARCHAR(20),
    host_name VARCHAR(255),
    session_start TIMESTAMP,
    participant_count BIGINT,
    latest_activity TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ms.id,
        ms.meet_code,
        ms.host_name,
        ms.session_start,
        COUNT(DISTINCT mp.id) as participant_count,
        MAX(GREATEST(
            COALESCE(mt.timestamp_start, ms.session_start),
            COALESCE(mcm.timestamp, ms.session_start)
        )) as latest_activity
    FROM meet_sessions ms
    LEFT JOIN meet_participants mp ON ms.id = mp.session_id
    LEFT JOIN meet_transcripts mt ON ms.id = mt.session_id
    LEFT JOIN meet_chat_messages mcm ON ms.id = mcm.session_id
    WHERE ms.status = 'active'
    GROUP BY ms.id, ms.meet_code, ms.host_name, ms.session_start
    ORDER BY latest_activity DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- GRANT PERMISSIONS (for service accounts)
-- ============================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO meet_service_account;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO meet_service_account;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO meet_service_account;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'meet_%' ORDER BY tablename;
-- SELECT * FROM get_active_sessions();
-- REFRESH MATERIALIZED VIEW meet_sessions_summary;
-- SELECT * FROM meet_sessions_summary ORDER BY session_start DESC LIMIT 10;

-- ============================================
-- END OF MEET DATA SCHEMA
-- ============================================

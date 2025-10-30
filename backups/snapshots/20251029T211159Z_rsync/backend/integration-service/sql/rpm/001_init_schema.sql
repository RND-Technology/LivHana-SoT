-- ============================================
-- RPM CLOUD INFRASTRUCTURE - ALLOYDB SCHEMA
-- ============================================
-- Database: postgres (default)
-- Version: 1.0
-- Date: October 28, 2025
-- Owner: Jesse Niesen (CEO)
-- ============================================

-- ============================================
-- RPM WEEKLY PLANS TABLE
-- ============================================
CREATE TABLE rpm_weekly_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_start_date DATE NOT NULL UNIQUE,
    week_end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, archived
    classification VARCHAR(100), -- e.g. "TIER 1 ABSOLUTE STANDARD"
    owner VARCHAR(255) NOT NULL, -- Jesse CEO, team member
    version VARCHAR(50),
    completion_rate DECIMAL(5,2), -- percentage of actions completed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB -- flexible for custom fields
);

-- ============================================
-- RESULTS (What we're committed to achieving)
-- ============================================
CREATE TABLE rpm_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekly_plan_id UUID REFERENCES rpm_weekly_plans(id) ON DELETE CASCADE,
    result_code VARCHAR(100) NOT NULL, -- R1, R2, R3, etc.
    result_text TEXT NOT NULL,
    purpose TEXT NOT NULL, -- WHY this matters (compelling reason)
    priority INTEGER DEFAULT 0, -- 1=highest, 2=high, 3=medium, etc.
    category VARCHAR(100), -- ARCH, DEV, DOCS, PLAN, etc.
    status VARCHAR(50) DEFAULT 'in_progress', -- not_started, in_progress, blocked, completed
    completion_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(weekly_plan_id, result_code)
);

-- ============================================
-- ACTION ITEMS (Massive Action Plan)
-- ============================================
CREATE TABLE rpm_action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID REFERENCES rpm_results(id) ON DELETE CASCADE,
    action_code VARCHAR(100) NOT NULL, -- ARCH-BOOT-001a, etc.
    action_text TEXT NOT NULL,
    owner VARCHAR(255), -- Agent name or "Jesse"
    due_date TIMESTAMP,
    funnel_stage VARCHAR(50) DEFAULT 'top', -- top, middle, bottom
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, blocked, completed
    completion_date TIMESTAMP,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    dependencies JSONB, -- array of action_code strings
    blocker_description TEXT,
    verification_criteria TEXT,
    evidence_path TEXT, -- cloud storage path to evidence
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(action_code)
);

-- ============================================
-- AGENT STATUS & HEALTH
-- ============================================
CREATE TABLE agent_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL, -- active, idle, error, offline
    health_score INTEGER DEFAULT 100, -- 0-100
    last_heartbeat TIMESTAMP DEFAULT NOW(),
    current_action_id UUID REFERENCES rpm_action_items(id),
    session_start TIMESTAMP,
    total_actions_completed INTEGER DEFAULT 0,
    total_hours_worked DECIMAL(8,2) DEFAULT 0,
    error_log TEXT,
    metadata JSONB -- cpu, memory, process_id, etc.
);

-- ============================================
-- DELIVERABLES (Songs, code, docs, etc.)
-- ============================================
CREATE TABLE deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_item_id UUID REFERENCES rpm_action_items(id),
    deliverable_type VARCHAR(100) NOT NULL, -- song, code, document, album, video
    title TEXT NOT NULL,
    description TEXT,
    cloud_storage_path TEXT NOT NULL, -- gs://bucket/path/to/file
    status VARCHAR(50) DEFAULT 'draft', -- draft, review, approved, published
    revenue_target DECIMAL(12,2),
    revenue_actual DECIMAL(12,2),
    metadata JSONB, -- genre, duration, file_size, artist, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

-- ============================================
-- RPM DNA PERIODS (Time periodization tracking)
-- ============================================
CREATE TABLE rpm_dna_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly, quarterly
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    total_actions INTEGER DEFAULT 0,
    completed_actions INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2), -- percentage
    velocity_score DECIMAL(8,2), -- actions per day
    revenue_target DECIMAL(12,2),
    revenue_actual DECIMAL(12,2),
    jesse_completion_rate DECIMAL(5,2), -- Jesse's personal completion rate
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(period_type, period_start)
);

-- ============================================
-- SUNO SONG CATALOG (386+ songs)
-- ============================================
CREATE TABLE suno_songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id VARCHAR(255) UNIQUE NOT NULL, -- Suno generated ID
    title VARCHAR(500) NOT NULL,
    genre VARCHAR(200),
    bpm INTEGER,
    key VARCHAR(50),
    groove VARCHAR(100),
    duration_seconds INTEGER,
    cloud_storage_path TEXT, -- gs://livhana-rpm-datalake/deliverables/songs/raw/
    album_assignment VARCHAR(255), -- "21 album release", etc.
    lyrics TEXT,
    prompt_used TEXT,
    status VARCHAR(50) DEFAULT 'generated', -- generated, reviewed, mastered, released
    revenue_target DECIMAL(12,2),
    revenue_actual DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW(),
    released_at TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_weekly_plans_date ON rpm_weekly_plans(week_start_date DESC);
CREATE INDEX idx_weekly_plans_status ON rpm_weekly_plans(status);

CREATE INDEX idx_results_status ON rpm_results(status);
CREATE INDEX idx_results_priority ON rpm_results(priority);
CREATE INDEX idx_results_category ON rpm_results(category);

CREATE INDEX idx_action_items_status ON rpm_action_items(status);
CREATE INDEX idx_action_items_owner ON rpm_action_items(owner);
CREATE INDEX idx_action_items_due_date ON rpm_action_items(due_date);
CREATE INDEX idx_action_items_funnel_stage ON rpm_action_items(funnel_stage);

CREATE INDEX idx_agent_status_name ON agent_status(agent_name);
CREATE INDEX idx_agent_status_last_heartbeat ON agent_status(last_heartbeat DESC);

CREATE INDEX idx_deliverables_type ON deliverables(deliverable_type);
CREATE INDEX idx_deliverables_status ON deliverables(status);

CREATE INDEX idx_suno_songs_album ON suno_songs(album_assignment);
CREATE INDEX idx_suno_songs_status ON suno_songs(status);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rpm_weekly_plans_updated_at BEFORE UPDATE ON rpm_weekly_plans FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_rpm_results_updated_at BEFORE UPDATE ON rpm_results FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_rpm_action_items_updated_at BEFORE UPDATE ON rpm_action_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- GRANT PERMISSIONS (if needed for service accounts)
-- ============================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO rpm_service_account;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after schema creation to verify:
-- SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT schemaname, tablename, n_live_tup as row_count FROM pg_stat_user_tables ORDER BY tablename;

-- ============================================
-- END OF SCHEMA
-- ============================================

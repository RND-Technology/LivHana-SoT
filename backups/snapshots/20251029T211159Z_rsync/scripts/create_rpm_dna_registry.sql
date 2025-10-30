-- ============================================
-- RPM DNA REGISTRY TABLE
-- Linear → RPM → Cockpit Integration
-- ============================================
-- Purpose: Master metadata index for all RPM DNA codes
-- Owner: Jesse Niesen (CEO)
-- Date: 2025-10-27
-- Classification: TIER 1 ABSOLUTE STANDARD
-- ============================================

-- Drop table if exists (for clean re-deployment)
DROP TABLE IF EXISTS rpm_dna_registry CASCADE;

-- Create main table
CREATE TABLE rpm_dna_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- RPM DNA Core Metadata
    dna_code VARCHAR(100) NOT NULL UNIQUE, -- ARCH-CLOUD-001
    classification VARCHAR(100), -- TIER_1_ABSOLUTE_STANDARD, TIER_2_HIGH_PRIORITY, TIER_3_STANDARD
    title TEXT NOT NULL,
    description TEXT,

    -- Ownership & Team
    owner VARCHAR(255) NOT NULL, -- Jesse Niesen, Andrew Aparicio, etc.
    team VARCHAR(255)[], -- [Artifacts, Planning, QA]

    -- Categorization
    project VARCHAR(100), -- CLOUD, VERIFF, AGENT, REGGIEDRO, etc.
    type VARCHAR(50), -- ARCH, DEV, COORD, QA, DOC, DELIVER, RESEARCH, SCRIPT
    status VARCHAR(50) DEFAULT 'TODO', -- TODO, IN_PROGRESS, BLOCKED, DONE, ARCHIVED
    priority VARCHAR(20), -- P0, P1, P2, P3

    -- Timestamps
    date_created TIMESTAMP DEFAULT NOW(),
    date_updated TIMESTAMP DEFAULT NOW(),
    date_completed TIMESTAMP,

    -- Integration Points
    linear_issue VARCHAR(100), -- LH-123 (Linear issue ID)
    git_commit_sha VARCHAR(255), -- Latest commit hash
    file_path TEXT, -- /docs/architecture/ARCH-CLOUD-001.md

    -- Relationships
    parent_dna VARCHAR(100), -- ARCH-CLOUD-001 (parent task)
    child_dna VARCHAR(100)[], -- [ARCH-CLOUD-001a, ARCH-CLOUD-001b]
    dependencies VARCHAR(100)[], -- [DEV-CLOUD-001, DEV-CLOUD-003]

    -- Search & Filtering
    tags VARCHAR(100)[], -- [architecture, alloydb, bigquery, rpm-cockpit]

    -- Business Metrics
    revenue_impact VARCHAR(255), -- $100K+, $50K-100K, $10K-50K, $0-10K
    estimated_hours DECIMAL(8,2), -- 4.5
    actual_hours DECIMAL(8,2), -- 5.0

    -- Flexible JSON for custom fields
    metadata JSONB,

    -- Foreign key constraint (parent-child relationship)
    CONSTRAINT fk_parent FOREIGN KEY (parent_dna)
        REFERENCES rpm_dna_registry(dna_code)
        ON DELETE SET NULL
);

-- ============================================
-- INDEXES FOR FAST QUERIES
-- ============================================

-- Primary lookup by DNA code (exact match, <10ms)
CREATE INDEX idx_dna_code ON rpm_dna_registry(dna_code);

-- Team member filtering (<50ms)
CREATE INDEX idx_owner ON rpm_dna_registry(owner);
CREATE INDEX idx_team ON rpm_dna_registry USING GIN(team);

-- Project & type filtering (<100ms)
CREATE INDEX idx_project ON rpm_dna_registry(project);
CREATE INDEX idx_type ON rpm_dna_registry(type);
CREATE INDEX idx_status ON rpm_dna_registry(status);
CREATE INDEX idx_priority ON rpm_dna_registry(priority);

-- Tag-based search (<100ms with GIN)
CREATE INDEX idx_tags ON rpm_dna_registry USING GIN(tags);

-- Linear issue lookup
CREATE INDEX idx_linear_issue ON rpm_dna_registry(linear_issue);

-- Date-based queries (recent tasks)
CREATE INDEX idx_date_updated ON rpm_dna_registry(date_updated DESC);
CREATE INDEX idx_date_created ON rpm_dna_registry(date_created DESC);

-- Full-text search (fallback, <500ms)
CREATE INDEX idx_title_search ON rpm_dna_registry
    USING GIN(to_tsvector('english', title));
CREATE INDEX idx_description_search ON rpm_dna_registry
    USING GIN(to_tsvector('english', description));

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function: Auto-update date_updated timestamp
CREATE OR REPLACE FUNCTION update_date_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update date_updated on every UPDATE
CREATE TRIGGER trigger_update_date_updated
BEFORE UPDATE ON rpm_dna_registry
FOR EACH ROW
EXECUTE FUNCTION update_date_updated();

-- Function: Auto-set date_completed when status = DONE
CREATE OR REPLACE FUNCTION update_date_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'DONE' AND OLD.status != 'DONE' THEN
        NEW.date_completed = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Set date_completed when status changes to DONE
CREATE TRIGGER trigger_update_date_completed
BEFORE UPDATE ON rpm_dna_registry
FOR EACH ROW
EXECUTE FUNCTION update_date_completed();

-- ============================================
-- SAMPLE DATA (For Testing)
-- ============================================

INSERT INTO rpm_dna_registry (
    dna_code,
    classification,
    title,
    description,
    owner,
    team,
    project,
    type,
    status,
    priority,
    linear_issue,
    tags,
    revenue_impact,
    estimated_hours,
    file_path
) VALUES
(
    'ARCH-CLOUD-001',
    'TIER_1_ABSOLUTE_STANDARD',
    'AlloyDB + BigQuery + Cloud Storage Architecture',
    'Design cloud architecture for RPM weekly planning system with AlloyDB (transactional), BigQuery (analytics), and Cloud Storage (data lake).',
    'Jesse Niesen',
    ARRAY['Artifacts', 'Planning', 'QA'],
    'CLOUD',
    'ARCH',
    'DONE',
    'P0',
    'LH-123',
    ARRAY['architecture', 'alloydb', 'bigquery', 'cloud-storage', 'rpm-cockpit'],
    '$0-5K_annual_infrastructure',
    6.0,
    '/docs/architecture/ARCH-CLOUD-001-AlloyDB-BigQuery-CloudStorage-Architecture-20251027.md'
),
(
    'ARCH-LINEAR-001',
    'TIER_1_ABSOLUTE_STANDARD',
    'Linear → RPM → Cockpit Integration Architecture',
    'Design unified metadata system with RPM DNA codes embedded in every file for instant search/retrieval and real-time cockpit dashboards.',
    'Jesse Niesen',
    ARRAY['Artifacts', 'Planning'],
    'LINEAR',
    'ARCH',
    'DONE',
    'P0',
    'LH-124',
    ARRAY['architecture', 'linear', 'rpm-dna', 'metadata', 'cockpit-integration'],
    '$75K_annual_time_savings',
    8.0,
    '/docs/architecture/LINEAR_RPM_INTEGRATION_ARCHITECTURE.md'
),
(
    'DEV-VERIFF-001',
    'TIER_1_ABSOLUTE_STANDARD',
    'Veriff Biometric ID Integration - API Implementation',
    'Integrate Veriff biometric age verification for ReggieAndDro.com checkout to unlock $100K+ blocked revenue.',
    'Andrew Aparicio',
    ARRAY['Artifacts', 'QA'],
    'VERIFF',
    'DEV',
    'IN_PROGRESS',
    'P0',
    'LH-125',
    ARRAY['veriff', 'biometric-id', 'age-verification', 'reggiedro', 'revenue-recovery'],
    '$100K_revenue_unlock',
    12.0,
    '/backend/veriff-integration/DEV-VERIFF-001-API-Implementation.ts'
),
(
    'COORD-AGENT-001',
    'TIER_1_ABSOLUTE_STANDARD',
    'Agent Builder 17-Node Workflow Coordination Plan',
    'Design coordination plan for deploying 17-node Agent Builder workflow with MCP Broker, TRUTH Pipeline, and Compliance Service integration.',
    'Jesse Niesen',
    ARRAY['Planning', 'Artifacts'],
    'AGENT',
    'COORD',
    'TODO',
    'P1',
    'LH-126',
    ARRAY['agent-builder', 'mcp-broker', 'truth-pipeline', 'coordination'],
    '$50K_annual_automation_value',
    4.0,
    '/docs/planning/COORD-AGENT-001-17Node-Workflow-Plan.md'
);

-- ============================================
-- VALIDATION QUERIES (Run after setup)
-- ============================================

-- Query 1: Verify sample data inserted
SELECT dna_code, title, owner, status, project
FROM rpm_dna_registry
ORDER BY date_created DESC;

-- Query 2: Test exact DNA match (should be <10ms)
EXPLAIN ANALYZE
SELECT * FROM rpm_dna_registry WHERE dna_code = 'ARCH-CLOUD-001';

-- Query 3: Test owner filter (should be <50ms)
EXPLAIN ANALYZE
SELECT * FROM rpm_dna_registry WHERE owner = 'Jesse Niesen';

-- Query 4: Test project filter (should be <100ms)
EXPLAIN ANALYZE
SELECT * FROM rpm_dna_registry WHERE project = 'CLOUD';

-- Query 5: Test tag search (should be <100ms)
EXPLAIN ANALYZE
SELECT * FROM rpm_dna_registry WHERE tags @> ARRAY['architecture'];

-- Query 6: Test full-text search (should be <500ms)
EXPLAIN ANALYZE
SELECT * FROM rpm_dna_registry
WHERE to_tsvector('english', title) @@ plainto_tsquery('english', 'AlloyDB');

-- ============================================
-- INTEGRITY CHECK QUERIES
-- ============================================

-- Check for orphaned child_dna references
SELECT dna_code, child_dna
FROM rpm_dna_registry
WHERE child_dna IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM rpm_dna_registry r2
    WHERE r2.dna_code = ANY(rpm_dna_registry.child_dna)
  );

-- Check for orphaned parent_dna references
SELECT dna_code, parent_dna
FROM rpm_dna_registry
WHERE parent_dna IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM rpm_dna_registry r2
    WHERE r2.dna_code = rpm_dna_registry.parent_dna
  );

-- Check for circular dependencies (potential infinite loops)
WITH RECURSIVE dep_chain AS (
  SELECT dna_code, dependencies, 1 AS depth
  FROM rpm_dna_registry
  WHERE dependencies IS NOT NULL

  UNION ALL

  SELECT r.dna_code, r.dependencies, dc.depth + 1
  FROM rpm_dna_registry r
  JOIN dep_chain dc ON r.dna_code = ANY(dc.dependencies)
  WHERE dc.depth < 10
)
SELECT dna_code, depth
FROM dep_chain
WHERE depth > 5
ORDER BY depth DESC;

-- ============================================
-- COCKPIT QUERY EXAMPLES
-- ============================================

-- Jesse's CEO Cockpit (ARCH, COORD, DELIVER tasks)
SELECT dna_code, title, status, priority, revenue_impact
FROM rpm_dna_registry
WHERE owner = 'Jesse Niesen'
   OR 'Jesse' = ANY(team)
   OR type IN ('ARCH', 'COORD', 'DELIVER')
ORDER BY
  CASE status
    WHEN 'TODO' THEN 1
    WHEN 'IN_PROGRESS' THEN 2
    WHEN 'BLOCKED' THEN 3
    WHEN 'DONE' THEN 4
  END,
  CASE priority
    WHEN 'P0' THEN 1
    WHEN 'P1' THEN 2
    WHEN 'P2' THEN 3
    WHEN 'P3' THEN 4
  END,
  date_updated DESC;

-- Andrew's Systems Cockpit (DEV, QA, ARCH-CLOUD tasks)
SELECT dna_code, title, status, priority, estimated_hours
FROM rpm_dna_registry
WHERE owner = 'Andrew Aparicio'
   OR type IN ('DEV', 'QA', 'ARCH')
   OR project IN ('CLOUD', 'INFRA')
ORDER BY status, priority, date_updated DESC;

-- Christopher's Operations Cockpit (REGGIEDRO, COMPLIANCE, DOC tasks)
SELECT dna_code, title, status, priority, tags
FROM rpm_dna_registry
WHERE owner = 'Christopher Rocha'
   OR project = 'REGGIEDRO'
   OR type = 'DOC'
ORDER BY status, priority, date_updated DESC;

-- Charlie's Product Cockpit (INVENTORY, PROCUREMENT tasks)
SELECT dna_code, title, status, priority, tags
FROM rpm_dna_registry
WHERE owner = 'Charlie Day'
   OR project = 'REGGIEDRO'
   OR 'inventory' = ANY(tags)
ORDER BY status, priority, date_updated DESC;

-- ============================================
-- SUCCESS CONFIRMATION
-- ============================================

-- Count total records
SELECT COUNT(*) AS total_records FROM rpm_dna_registry;

-- Count by status
SELECT status, COUNT(*) AS count
FROM rpm_dna_registry
GROUP BY status
ORDER BY count DESC;

-- Count by project
SELECT project, COUNT(*) AS count
FROM rpm_dna_registry
GROUP BY project
ORDER BY count DESC;

-- Count by owner
SELECT owner, COUNT(*) AS count
FROM rpm_dna_registry
GROUP BY owner
ORDER BY count DESC;

-- ============================================
-- END OF SETUP SCRIPT
-- ============================================

-- Print success message
DO $$
BEGIN
    RAISE NOTICE '✅ RPM DNA Registry table created successfully';
    RAISE NOTICE '✅ 4 sample records inserted';
    RAISE NOTICE '✅ All indexes created for fast queries';
    RAISE NOTICE '✅ Triggers configured (auto-update timestamps)';
    RAISE NOTICE '✅ Ready for Linear integration';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Deploy Linear webhook handler (Cloud Function)';
    RAISE NOTICE '2. Configure Linear custom fields (rpm_dna, rpm_classification, etc.)';
    RAISE NOTICE '3. Test end-to-end: Linear issue → AlloyDB → File creation';
END $$;
